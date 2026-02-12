import { NextRequest } from 'next/server';
import { ShoppingListService } from '@/lib/services/shopping-list-service';

interface RouteParams {
  params: Promise<{ id: string; itemId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { itemId } = await params;
  try {
    const { checked } = await request.json();
    await ShoppingListService.toggleItem(itemId, checked);
    return Response.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al actualizar';
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { itemId } = await params;
  try {
    await ShoppingListService.deleteItem(itemId);
    return Response.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al eliminar';
    return Response.json({ error: msg }, { status: 500 });
  }
}
