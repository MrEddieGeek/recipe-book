import { NextRequest } from 'next/server';
import { ShoppingListService } from '@/lib/services/shopping-list-service';
import { ShoppingListNameSchema } from '@/lib/utils/validation';

export async function GET() {
  const lists = await ShoppingListService.getLists();
  return Response.json(lists);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ShoppingListNameSchema.parse(body);
    const list = await ShoppingListService.createList(validated.name);
    return Response.json(list);
  } catch (error) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return Response.json({ error: 'Nombre inválido (1-255 caracteres)' }, { status: 400 });
    }
    console.error('Create shopping list error:', error);
    return Response.json({ error: 'Error al crear lista' }, { status: 500 });
  }
}
