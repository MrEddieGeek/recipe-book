import { NextRequest } from 'next/server';
import { RecipeService } from '@/lib/services/recipe-service';
import { RecipeFormSchema } from '@/lib/utils/validation';
import { checkRateLimit, checkBodySize } from '@/lib/utils/rate-limit';

export async function POST(request: NextRequest) {
  const rl = checkRateLimit('recipes-create');
  if (rl) return rl;
  const bs = checkBodySize(request.headers.get('content-length'));
  if (bs) return bs;

  try {
    const body = await request.json();
    const validated = RecipeFormSchema.parse(body);
    const recipe = await RecipeService.createManualRecipe(validated);
    return Response.json(recipe);
  } catch (error) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return Response.json({ error: 'Datos de receta inválidos' }, { status: 400 });
    }
    console.error('Create recipe error:', error);
    return Response.json({ error: 'Error al crear la receta' }, { status: 500 });
  }
}
