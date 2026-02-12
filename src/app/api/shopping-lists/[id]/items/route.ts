import { NextRequest } from 'next/server';
import { ShoppingListService } from '@/lib/services/shopping-list-service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const body = await request.json();

    // Add from recipe ingredients
    if (body.ingredients && Array.isArray(body.ingredients)) {
      const items = await ShoppingListService.addIngredientsFromRecipe(
        id,
        body.ingredients,
        body.recipeId
      );
      return Response.json(items);
    }

    // Add single item
    if (body.item) {
      const item = await ShoppingListService.addItem(
        id,
        body.item,
        body.amount,
        body.unit
      );
      return Response.json(item);
    }

    return Response.json({ error: 'Datos inválidos' }, { status: 400 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al agregar';
    return Response.json({ error: msg }, { status: 500 });
  }
}
