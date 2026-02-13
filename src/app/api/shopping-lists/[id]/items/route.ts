import { NextRequest } from 'next/server';
import { ShoppingListService } from '@/lib/services/shopping-list-service';
import { ShoppingListItemSchema, ShoppingListIngredientsSchema } from '@/lib/utils/validation';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const body = await request.json();

    // Add from recipe ingredients
    if (body.ingredients && Array.isArray(body.ingredients)) {
      const validated = ShoppingListIngredientsSchema.parse(body);
      const items = await ShoppingListService.addIngredientsFromRecipe(
        id,
        validated.ingredients,
        validated.recipeId
      );
      return Response.json(items);
    }

    // Add single item
    if (body.item) {
      const validated = ShoppingListItemSchema.parse(body);
      const item = await ShoppingListService.addItem(
        id,
        validated.item,
        validated.amount,
        validated.unit
      );
      return Response.json(item);
    }

    return Response.json({ error: 'Datos inválidos' }, { status: 400 });
  } catch (error) {
    if (error && typeof error === 'object' && 'issues' in error) {
      return Response.json({ error: 'Datos de artículo inválidos' }, { status: 400 });
    }
    console.error('Add shopping list item error:', error);
    return Response.json({ error: 'Error al agregar' }, { status: 500 });
  }
}
