import { NextRequest } from 'next/server';
import { MealPlanService } from '@/lib/services/meal-plan-service';
import { MealPlanServingsSchema } from '@/lib/utils/validation';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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
