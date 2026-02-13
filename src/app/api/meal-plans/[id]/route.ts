import { NextRequest } from 'next/server';
import { MealPlanService } from '@/lib/services/meal-plan-service';
import { MealPlanServingsSchema } from '@/lib/utils/validation';
import { checkRateLimit, checkBodySize } from '@/lib/utils/rate-limit';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const rl = checkRateLimit('meal-plan-delete');
  if (rl) return rl;

  const { id } = await params;
  try {
    await MealPlanService.removeMeal(id);
    return Response.json({ ok: true });
  } catch (error) {
    console.error('Delete meal plan error:', error);
    return Response.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const rl2 = checkRateLimit('meal-plan-update');
  if (rl2) return rl2;
  const bs = checkBodySize(request.headers.get('content-length'));
  if (bs) return bs;

  const { id } = await params;
  try {
    const body = await request.json();
    const validated = MealPlanServingsSchema.parse(body);
    await MealPlanService.updateServings(id, validated.servings);
    return Response.json({ ok: true });
  } catch (error) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return Response.json({ error: 'Porciones inválidas' }, { status: 400 });
    }
    console.error('Update servings error:', error);
    return Response.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}
