import { NextRequest } from 'next/server';
import { MealPlanService } from '@/lib/services/meal-plan-service';
import { ShoppingListService } from '@/lib/services/shopping-list-service';

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate, listName } = await request.json();

    if (!startDate || !endDate || !listName) {
      return Response.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Get all ingredients from the week
    const ingredients = await MealPlanService.getWeekIngredients(startDate, endDate);

    if (ingredients.length === 0) {
      return Response.json({ error: 'No hay comidas planificadas esta semana' }, { status: 400 });
    }

    // Create a new shopping list
    const list = await ShoppingListService.createList(listName);

    // Add all ingredients
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
    const msg = error instanceof Error ? error.message : 'Error al generar lista';
    return Response.json({ error: msg }, { status: 500 });
  }
}
