import { NextRequest } from 'next/server';
import { ShoppingListService } from '@/lib/services/shopping-list-service';

export async function GET() {
  const lists = await ShoppingListService.getLists();
  return Response.json(lists);
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name?.trim()) {
      return Response.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }
    const list = await ShoppingListService.createList(name.trim());
    return Response.json(list);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al crear lista';
    return Response.json({ error: msg }, { status: 500 });
  }
}
