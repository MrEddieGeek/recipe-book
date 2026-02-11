import { NextRequest } from 'next/server';
import { RecipeService } from '@/lib/services/recipe-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const source = searchParams.get('source') || 'all';

  const options = { query, maxResults: 20 };

  try {
    let recipes;
    switch (source) {
      case 'manual':
        recipes = await RecipeService.searchManualRecipes(options);
        break;
      case 'api':
        recipes = await RecipeService.searchApiRecipes(options);
        break;
      case 'all':
      default:
        recipes = await RecipeService.searchAllSources(options);
        break;
    }
    return Response.json(recipes);
  } catch (error) {
    console.error('Search error:', error);
    return Response.json([], { status: 500 });
  }
}
