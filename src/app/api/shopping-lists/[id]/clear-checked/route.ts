import { NextRequest } from 'next/server';
import { ShoppingListService } from '@/lib/services/shopping-list-service';
import { checkRateLimit } from '@/lib/utils/rate-limit';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const rl = checkRateLimit('shopping-list-clear-checked');
  if (rl) return rl;

  const { id } = await params;
  try {
    await ShoppingListService.clearCheckedItems(id);
    return Response.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al limpiar';
    return Response.json({ error: msg }, { status: 500 });
  }
}
