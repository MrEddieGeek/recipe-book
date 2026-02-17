import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Recipe } from '@/lib/adapters/types';
import { AiRecipeResponseSchema } from '@/lib/utils/validation';
import { checkRateLimit, RATE_LIMITS } from '@/lib/utils/rate-limit';

const RequestSchema = z.object({
  url: z.string().url().max(2000),
});

const IMPORT_PROMPT = `Eres un chef profesional. Analiza el contenido de esta página web de receta y extrae la receta completa.

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
- Extrae TODOS los ingredientes con cantidades precisas.
- Describe cada paso de la preparación en orden.
- TODO el contenido debe estar en ESPAÑOL. Traduce si está en otro idioma.
- Responde SOLO con el objeto JSON, nada más.`;

export async function POST(request: NextRequest) {
  const rl = checkRateLimit('import-recipe', RATE_LIMITS.GENERATE_RECIPE);
  if (rl) return rl;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'AI no configurada. Agrega GEMINI_API_KEY.' },
      { status: 503 }
    );
  }

  let body;
  try {
    body = RequestSchema.parse(await request.json());
  } catch {
    return Response.json({ error: 'URL inválida.' }, { status: 400 });
  }

  try {
    // Fetch page HTML
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    let html: string;
    try {
      const pageRes = await fetch(body.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RecipeImporter/1.0)' },
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeout);

      if (!pageRes.ok) {
        return Response.json({ error: 'No se pudo acceder a la URL.' }, { status: 422 });
      }
      html = await pageRes.text();
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === 'AbortError') {
        return Response.json({ error: 'La página tardó demasiado en responder.' }, { status: 504 });
      }
      return Response.json({ error: 'No se pudo acceder a la URL.' }, { status: 422 });
    }

    // Strip scripts/styles and truncate
    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 50_000);

    if (cleaned.length < 100) {
      return Response.json({ error: 'La página no parece contener una receta.' }, { status: 422 });
    }

    // Send to Gemini
    const geminiController = new AbortController();
    const geminiTimeout = setTimeout(() => geminiController.abort(), 30_000);

    let response: globalThis.Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: geminiController.signal,
          body: JSON.stringify({
            system_instruction: { parts: [{ text: IMPORT_PROMPT }] },
            contents: [{ parts: [{ text: `URL: ${body.url}\n\nContenido de la página:\n${cleaned}` }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048,
              responseMimeType: 'application/json',
            },
          }),
        }
      );
    } catch (err) {
      clearTimeout(geminiTimeout);
      if (err instanceof DOMException && err.name === 'AbortError') {
        return Response.json({ error: 'La extracción tardó demasiado.' }, { status: 504 });
      }
      throw err;
    } finally {
      clearTimeout(geminiTimeout);
    }

    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text());
      return Response.json({ error: 'Error al procesar la receta.' }, { status: 502 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return Response.json({ error: 'No se pudo extraer una receta.' }, { status: 502 });
    }

    const jsonStr = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const rawData = JSON.parse(jsonStr);
    const recipeData = AiRecipeResponseSchema.parse(rawData);

    const recipe: Recipe = {
      id: `ai-import-${Date.now()}`,
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
        id: `ai-import-${Date.now()}`,
        name: 'Importada (Web)',
      },
    };

    return Response.json(recipe);
  } catch (error) {
    console.error('Import recipe error:', error);
    return Response.json(
      { error: 'Error al importar la receta.' },
      { status: 500 }
    );
  }
}
