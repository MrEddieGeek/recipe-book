import { NextRequest } from 'next/server';
import { RecipeService } from '@/lib/services/recipe-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const recipe = await RecipeService.createManualRecipe(body);
    return Response.json(recipe);
  } catch (error) {
    console.error('Create recipe error:', error);
    return Response.json({ error: 'Failed to create recipe' }, { status: 500 });
  }
}
