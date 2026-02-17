import { NextRequest } from 'next/server';
import { Recipe } from '@/lib/adapters/types';
import { VideoExtractionSchema, AiRecipeResponseSchema } from '@/lib/utils/validation';
import { checkRateLimit, RATE_LIMITS } from '@/lib/utils/rate-limit';

export const maxDuration = 60;

const VIDEO_EXTRACTION_PROMPT = `Eres un chef profesional. Analiza este video de cocina y extrae la receta completa.

DEBES responder SOLO con un objeto JSON válido (sin markdown, sin explicación, sin bloques de código) siguiendo esta estructura exacta:

{
  "title": "Título de la Receta",
  "description": "Una descripción corta y apetitosa del plato (1-2 oraciones).",
  "prepTimeMinutes": 15,
  "cookTimeMinutes": 30,
  "servings": 4,
  "ingredients": [
    {"item": "nombre del ingrediente", "amount": "1", "unit": "taza"}
  ],
  "instructions": [
    {"step": 1, "description": "Instrucción clara para este paso."}
  ],
  "tags": ["etiqueta1", "etiqueta2"]
}

Reglas:
- Extrae TODOS los ingredientes mostrados o mencionados en el video con cantidades precisas.
- Describe cada paso de la preparación en orden.
- Si no puedes determinar cantidades exactas, usa estimaciones razonables.
- TODO el contenido debe estar en ESPAÑOL.
- Responde SOLO con el objeto JSON, nada más.`;

function detectPlatform(url: string): 'youtube' | 'tiktok' | 'instagram' | 'other' {
  const hostname = new URL(url).hostname.toLowerCase();
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
  if (hostname.includes('tiktok.com')) return 'tiktok';
  if (hostname.includes('instagram.com')) return 'instagram';
  return 'other';
}

async function resolveVideoUrl(url: string, platform: string): Promise<string | null> {
  if (platform === 'youtube') {
    return url;
  }

  if (platform === 'tiktok' || platform === 'instagram') {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RecipeExtractor/1.0)',
        },
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeout);

      const html = await res.text();
      const ogVideoMatch = html.match(/<meta\s+(?:property|name)="og:video(?::url)?"\s+content="([^"]+)"/i)
        || html.match(/content="([^"]+)"\s+(?:property|name)="og:video(?::url)?"/i);

      if (ogVideoMatch?.[1]) {
        return ogVideoMatch[1].replace(/&amp;/g, '&');
      }
    } catch {
      // Fall through to null
    }
    return null;
  }

  return null;
}

export async function POST(request: NextRequest) {
  const rl = checkRateLimit('extract-video', RATE_LIMITS.EXTRACT_VIDEO);
  if (rl) return rl;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'AI no configurada. Agrega GEMINI_API_KEY a las variables de entorno.' },
      { status: 503 }
    );
  }

  const contentType = request.headers.get('content-type') || '';

  let videoPart: Record<string, unknown>;
  let platform = 'other';

  if (contentType.includes('multipart/form-data')) {
    // File upload path
    const formData = await request.formData();
    const file = formData.get('video') as File | null;

    if (!file || !file.type.startsWith('video/')) {
      return Response.json({ error: 'Se requiere un archivo de video válido.' }, { status: 400 });
    }

    if (file.size > 100 * 1024 * 1024) {
      return Response.json({ error: 'El video no debe superar los 100MB.' }, { status: 413 });
    }

    // Upload to Gemini File API
    const uploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey.trim()}`;
    const bytes = await file.arrayBuffer();

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': file.type,
        'X-Goog-Upload-Protocol': 'raw',
      },
      body: bytes,
    });

    if (!uploadRes.ok) {
      console.error('Gemini file upload error:', await uploadRes.text());
      return Response.json({ error: 'Error al subir el video.' }, { status: 502 });
    }

    const uploadData = await uploadRes.json();
    const fileUri = uploadData.file?.uri;
    if (!fileUri) {
      return Response.json({ error: 'Error al procesar el video subido.' }, { status: 502 });
    }

    videoPart = { file_data: { file_uri: fileUri, mime_type: file.type } };
  } else {
    // URL path
    let body;
    try {
      body = VideoExtractionSchema.parse(await request.json());
    } catch {
      return Response.json({ error: 'URL de video inválida.' }, { status: 400 });
    }

    platform = detectPlatform(body.url);
    let videoUrl = body.url;

    if (platform === 'tiktok' || platform === 'instagram') {
      const resolved = await resolveVideoUrl(body.url, platform);
      if (resolved) {
        videoUrl = resolved;
      } else {
        return Response.json(
          { error: `No se pudo resolver el video de ${platform}. Intenta subir el video directamente.`, needsUpload: true },
          { status: 422 }
        );
      }
    }

    videoPart = { file_data: { file_uri: videoUrl } };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55_000);

    let response: globalThis.Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{
              parts: [
                videoPart,
                { text: VIDEO_EXTRACTION_PROMPT },
              ],
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048,
              responseMimeType: 'application/json',
            },
          }),
        }
      );
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === 'AbortError') {
        return Response.json({ error: 'El análisis del video tardó demasiado. Intenta con un video más corto.' }, { status: 504 });
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Gemini API error:', response.status, errBody);
      return Response.json(
        { error: 'Error al analizar el video. Intenta de nuevo.' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return Response.json({ error: 'No se pudo extraer una receta del video.' }, { status: 502 });
    }

    const jsonStr = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const rawData = JSON.parse(jsonStr);
    const recipeData = AiRecipeResponseSchema.parse(rawData);

    const recipe: Recipe = {
      id: `ai-video-${Date.now()}`,
      title: recipeData.title,
      description: recipeData.description,
      prepTimeMinutes: recipeData.prepTimeMinutes,
      cookTimeMinutes: recipeData.cookTimeMinutes,
      servings: recipeData.servings,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      tags: recipeData.tags,
      source: {
        type: 'ai',
        id: `ai-video-${Date.now()}`,
        name: 'Gemini AI (Video)',
      },
    };

    return Response.json({ recipe, platform });
  } catch (error) {
    console.error('Video extraction error:', error);
    return Response.json(
      { error: 'Error al procesar el video. La respuesta de IA no pudo ser interpretada.' },
      { status: 500 }
    );
  }
}
