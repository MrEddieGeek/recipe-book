import { NextRequest } from 'next/server';
import { ShoppingListService } from '@/lib/services/shopping-list-service';
import { checkRateLimit } from '@/lib/utils/rate-limit';
import { z } from 'zod';

const ReorderSchema = z.object({
  itemIds: z.array(z.string().uuid()).min(1).max(500),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const rl = checkRateLimit('shopping-list-reorder');
  if (rl) return rl;

  const { id } = await params;

  try {
    const body = await request.json();
    const { itemIds } = ReorderSchema.parse(body);
    await ShoppingListService.reorderItems(id, itemIds);
    return Response.json({ success: true });
  } catch (error) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return Response.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    const msg = error instanceof Error ? error.message : 'Error al reordenar';
    return Response.json({ error: msg }, { status: 500 });
  }
}
