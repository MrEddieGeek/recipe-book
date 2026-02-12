import { NextRequest } from 'next/server';
import { MealPlanService } from '@/lib/services/meal-plan-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return Response.json({ error: 'startDate and endDate required' }, { status: 400 });
  }

  const meals = await MealPlanService.getMealsForRange(startDate, endDate);
  return Response.json(meals);
}

export async function POST(request: NextRequest) {
  try {
    const { recipeId, date, mealType, servings } = await request.json();

    if (!recipeId || !date || !mealType) {
      return Response.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const meal = await MealPlanService.addMeal(recipeId, date, mealType, servings);
    return Response.json(meal);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al agregar';
    return Response.json({ error: msg }, { status: 500 });
  }
}
