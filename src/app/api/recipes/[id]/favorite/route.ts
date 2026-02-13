import { NextRequest } from 'next/server';
import { RecipeService } from '@/lib/services/recipe-service';
import { checkRateLimit } from '@/lib/utils/rate-limit';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const rl = checkRateLimit('recipe-favorite');
  if (rl) return rl;

  const { id } = await params;
  try {
    const isFavorited = await RecipeService.toggleFavorite(id);
    return Response.json({ isFavorited });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al cambiar favorito';
    return Response.json({ error: msg }, { status: 500 });
  }
}
