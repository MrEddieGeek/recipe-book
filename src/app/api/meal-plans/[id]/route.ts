import { NextRequest } from 'next/server';
import { MealPlanService } from '@/lib/services/meal-plan-service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    await MealPlanService.removeMeal(id);
    return Response.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al eliminar';
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const { servings } = await request.json();
    await MealPlanService.updateServings(id, servings);
    return Response.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al actualizar';
    return Response.json({ error: msg }, { status: 500 });
  }
}
