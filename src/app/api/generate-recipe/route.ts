// Server-side API route for AI recipe generation
// Uses Google Gemini API
// Keeps GEMINI_API_KEY secret (never sent to the browser)

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Recipe } from '@/lib/adapters/types';
import { AiRecipeResponseSchema } from '@/lib/utils/validation';

const RequestSchema = z.object({
  prompt: z.string().min(3).max(500),
});

const SYSTEM_PROMPT = `Eres un chef profesional y escritor de recetas. Genera una receta basada en la solicitud del usuario.

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
- Las cantidades de ingredientes deben ser realistas y precisas.
- Las instrucciones deben ser pasos claros, concisos y numerados.
- Incluir 5-15 ingredientes y 4-10 pasos de instrucciones.
- Las etiquetas deben incluir tipo de cocina, tipo de comida, información dietética e ingredientes clave.
- TODO el contenido debe estar en ESPAÑOL.
- Responde SOLO con el objeto JSON, nada más.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'AI recipe generation is not configured. Add GEMINI_API_KEY to your environment variables.' },
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
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey.trim()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: body.prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Gemini API error:', response.status, errBody);
      return Response.json(
        { error: 'Failed to generate recipe. Please try again.' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return Response.json({ error: 'Empty response from AI.' }, { status: 502 });
    }

    // Strip markdown code fences if present
    const jsonStr = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    // Parse and validate the JSON from the response
    const rawData = JSON.parse(jsonStr);
    const recipeData = AiRecipeResponseSchema.parse(rawData);

    // Build a proper Recipe object
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
      source: {
        type: 'ai',
        id: `ai-${Date.now()}`,
        name: 'Gemini AI',
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
