import { NextRequest } from 'next/server';
import { MealPlanService } from '@/lib/services/meal-plan-service';
import { MealPlanCreateSchema, MealPlanDateRangeSchema } from '@/lib/utils/validation';
import { checkRateLimit, checkBodySize } from '@/lib/utils/rate-limit';

export async function GET(request: NextRequest) {
  const rl = checkRateLimit('meal-plans-get');
  if (rl) return rl;

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
    const validated = MealPlanDateRangeSchema.parse({ startDate, endDate });
    const meals = await MealPlanService.getMealsForRange(validated.startDate, validated.endDate);
    return Response.json(meals);
  } catch (error) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return Response.json({ error: 'Fechas inválidas (YYYY-MM-DD)' }, { status: 400 });
    }
    console.error('Get meal plans error:', error);
    return Response.json({ error: 'Error al obtener planes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const rl = checkRateLimit('meal-plans-create');
  if (rl) return rl;
  const bs = checkBodySize(request.headers.get('content-length'));
  if (bs) return bs;

  try {
    const body = await request.json();
    const validated = MealPlanCreateSchema.parse(body);
    const meal = await MealPlanService.addMeal(
      validated.recipeId,
      validated.date,
      validated.mealType,
      validated.servings
    );
    return Response.json(meal);
  } catch (error) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return Response.json({ error: 'Datos incompletos o inválidos' }, { status: 400 });
    }
    console.error('Add meal plan error:', error);
    return Response.json({ error: 'Error al agregar comida' }, { status: 500 });
  }
}
