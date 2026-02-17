import { NextRequest } from 'next/server';
import { ShoppingListService } from '@/lib/services/shopping-list-service';
import { checkRateLimit, checkBodySize } from '@/lib/utils/rate-limit';

interface RouteParams {
  params: Promise<{ id: string; itemId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const rl = checkRateLimit('shopping-list-item-toggle');
  if (rl) return rl;
  const bs = checkBodySize(request.headers.get('content-length'));
  if (bs) return bs;

  const { itemId } = await params;
  try {
    const body = await request.json();
    if ('checked' in body) {
      await ShoppingListService.toggleItem(itemId, body.checked);
    }
    if ('price' in body) {
      await ShoppingListService.updateItemPrice(itemId, body.price);
    }
    return Response.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al actualizar';
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const rl2 = checkRateLimit('shopping-list-item-delete');
  if (rl2) return rl2;

  const { itemId } = await params;
  try {
    await ShoppingListService.deleteItem(itemId);
    return Response.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al eliminar';
    return Response.json({ error: msg }, { status: 500 });
  }
}
