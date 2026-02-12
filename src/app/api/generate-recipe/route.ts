// Server-side API route for AI recipe generation
// Uses xAI (Grok) API — OpenAI-compatible format
// Keeps XAI_API_KEY secret (never sent to the browser)

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Recipe } from '@/lib/adapters/types';

const RequestSchema = z.object({
  prompt: z.string().min(3).max(500),
});

const SYSTEM_PROMPT = `You are a professional chef and recipe writer. Generate a recipe based on the user's request.

You MUST respond with ONLY a valid JSON object (no markdown, no explanation) following this exact structure:

{
  "title": "Recipe Title",
  "description": "A short, appetizing description of the dish (1-2 sentences).",
  "prepTimeMinutes": 15,
  "cookTimeMinutes": 30,
  "servings": 4,
  "ingredients": [
    {"item": "ingredient name", "amount": "1", "unit": "cup"}
  ],
  "instructions": [
    {"step": 1, "description": "Clear instruction for this step."}
  ],
  "tags": ["tag1", "tag2"]
}

Rules:
- Keep ingredient amounts realistic and precise.
- Instructions should be clear, concise, numbered steps.
- Include 5-15 ingredients and 4-10 instruction steps.
- Tags should include cuisine type, meal type, dietary info, and key ingredients.
- Respond with ONLY the JSON object, nothing else.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'AI recipe generation is not configured. Add XAI_API_KEY to your environment variables.' },
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
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-3-mini-fast',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: body.prompt },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('xAI API error:', response.status, errBody);
      return Response.json(
        { error: 'Failed to generate recipe. Please try again.' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      return Response.json({ error: 'Empty response from AI.' }, { status: 502 });
    }

    // Strip markdown code fences if present
    const jsonStr = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    // Parse the JSON from the response
    const recipeData = JSON.parse(jsonStr);

    // Build a proper Recipe object
    const recipe: Recipe = {
      id: `ai-${Date.now()}`,
      title: recipeData.title,
      description: recipeData.description,
      prepTimeMinutes: recipeData.prepTimeMinutes,
      cookTimeMinutes: recipeData.cookTimeMinutes,
      servings: recipeData.servings,
      ingredients: recipeData.ingredients || [],
      instructions: recipeData.instructions || [],
      tags: recipeData.tags || [],
      source: {
        type: 'ai',
        id: `ai-${Date.now()}`,
        name: 'Grok AI',
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
