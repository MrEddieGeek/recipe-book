import { NextRequest } from 'next/server';
import { ShoppingListService } from '@/lib/services/shopping-list-service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const list = await ShoppingListService.getListWithItems(id);
  if (!list) {
    return Response.json({ error: 'Lista no encontrada' }, { status: 404 });
  }
  return Response.json(list);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    await ShoppingListService.deleteList(id);
    return Response.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al eliminar';
    return Response.json({ error: msg }, { status: 500 });
  }
}
