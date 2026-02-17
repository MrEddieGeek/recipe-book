import { NextRequest } from 'next/server';
import { ShoppingListService } from '@/lib/services/shopping-list-service';
import { checkRateLimit } from '@/lib/utils/rate-limit';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const rl = checkRateLimit('shopping-list-share');
  if (rl) return rl;

  const { id } = await params;

  try {
    const token = await ShoppingListService.generateShareToken(id);
    return Response.json({ token });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al compartir';
    return Response.json({ error: msg }, { status: 500 });
  }
}
