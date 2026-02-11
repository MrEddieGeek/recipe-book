import { NextRequest } from 'next/server';
import { RecipeService } from '@/lib/services/recipe-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const recipe = await RecipeService.createManualRecipe(body);
    return Response.json(recipe);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create recipe';
    console.error('Create recipe error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
