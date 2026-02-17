// Server-side API route for AI recipe generation
// Uses OpenAI API (gpt-4o-mini)

import { NextRequest } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { Recipe } from '@/lib/adapters/types';
import { AiRecipeResponseSchema } from '@/lib/utils/validation';
import { checkRateLimit, checkBodySize, RATE_LIMITS } from '@/lib/utils/rate-limit';

const RequestSchema = z.object({
  prompt: z.string().min(3).max(500),
});

const SYSTEM_PROMPT = `Eres un chef profesional y escritor de recetas. Genera una receta basada en la solicitud del usuario.

DEBES responder SOLO con un objeto JSON válido siguiendo esta estructura exacta:

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
  "tags": ["etiqueta1", "etiqueta2"],
  "caloriesPerServing": 350,
  "proteinGrams": 25,
  "carbsGrams": 40,
  "fatGrams": 12
}

Reglas:
- Las cantidades de ingredientes deben ser realistas y precisas.
- Las instrucciones deben ser pasos claros, concisos y numerados.
- Incluir 5-15 ingredientes y 4-10 pasos de instrucciones.
- Las etiquetas deben incluir tipo de cocina, tipo de comida, información dietética e ingredientes clave.
- TODO el contenido debe estar en ESPAÑOL.
- Incluye una estimación nutricional por porción (calorías, proteína, carbohidratos, grasa).
- Responde SOLO con el objeto JSON, nada más.`;

export async function POST(request: NextRequest) {
  const rl = checkRateLimit('generate-recipe', RATE_LIMITS.GENERATE_RECIPE);
  if (rl) return rl;
  const bs = checkBodySize(request.headers.get('content-length'));
  if (bs) return bs;

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      { error: 'AI recipe generation is not configured. Add OPENAI_API_KEY to your environment variables.' },
      { status: 503 }
    );
  }

  let body;
  try {
    body = RequestSchema.parse(await request.json());
  } catch {
    return Response.json({ error: 'Invalid request. Provide a prompt between 3-500 characters.' }, { status: 400 });
  }

  try {
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: body.prompt },
      ],
    });

    const text = completion.choices[0]?.message?.content;

    if (!text) {
      return Response.json({ error: 'Empty response from AI.' }, { status: 502 });
    }

    const rawData = JSON.parse(text);
    const recipeData = AiRecipeResponseSchema.parse(rawData);

    const recipe: Recipe = {
      id: `ai-${Date.now()}`,
      title: recipeData.title,
      description: recipeData.description,
      prepTimeMinutes: recipeData.prepTimeMinutes,
      cookTimeMinutes: recipeData.cookTimeMinutes,
      servings: recipeData.servings,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      tags: recipeData.tags,
      caloriesPerServing: recipeData.caloriesPerServing,
      proteinGrams: recipeData.proteinGrams,
      carbsGrams: recipeData.carbsGrams,
      fatGrams: recipeData.fatGrams,
      source: {
        type: 'ai',
        id: `ai-${Date.now()}`,
        name: 'OpenAI',
      },
    };

    return Response.json(recipe);
  } catch (error) {
    console.error('Recipe generation error:', error);
    return Response.json(
      { error: 'Failed to generate recipe. The AI response could not be parsed.' },
      { status: 500 }
    );
  }
}
