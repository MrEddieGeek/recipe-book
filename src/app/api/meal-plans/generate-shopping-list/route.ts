import { NextRequest } from 'next/server';
import { MealPlanService } from '@/lib/services/meal-plan-service';
import { ShoppingListService } from '@/lib/services/shopping-list-service';
import { GenerateShoppingListSchema } from '@/lib/utils/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = GenerateShoppingListSchema.parse(body);

    const ingredients = await MealPlanService.getWeekIngredients(
      validated.startDate,
      validated.endDate
    );

    if (ingredients.length === 0) {
      return Response.json({ error: 'No hay comidas planificadas esta semana' }, { status: 400 });
    }

    const list = await ShoppingListService.createList(validated.listName);

    await ShoppingListService.addIngredientsFromRecipe(
      list.id,
      ingredients.map((ing) => ({
        item: ing.item,
        amount: ing.amount,
        unit: ing.unit,
      }))
    );

    return Response.json({ listId: list.id, itemCount: ingredients.length });
  } catch (error) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return Response.json({ error: 'Datos incompletos o inválidos' }, { status: 400 });
    }
    console.error('Generate shopping list error:', error);
    return Response.json({ error: 'Error al generar lista' }, { status: 500 });
  }
}
