import { NextRequest } from 'next/server';
import { ShoppingListService } from '@/lib/services/shopping-list-service';
import { ShoppingListNameSchema } from '@/lib/utils/validation';
import { checkRateLimit, checkBodySize } from '@/lib/utils/rate-limit';

export async function GET() {
  const rl = checkRateLimit('shopping-lists-get');
  if (rl) return rl;

  const lists = await ShoppingListService.getLists();
  return Response.json(lists);
}

export async function POST(request: NextRequest) {
  const rl = checkRateLimit('shopping-lists-create');
  if (rl) return rl;
  const bs = checkBodySize(request.headers.get('content-length'));
  if (bs) return bs;

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
