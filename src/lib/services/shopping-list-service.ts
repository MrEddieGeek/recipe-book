import { createClient } from '@supabase/supabase-js';
import { Ingredient } from '../adapters/types';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!).trim();
  return createClient(url, key);
}

export interface ShoppingList {
  id: string;
  name: string;
  created_at: string;
  items?: ShoppingListItem[];
}

export interface ShoppingListItem {
  id: string;
  shopping_list_id: string;
  item: string;
  amount: string | null;
  unit: string | null;
  checked: boolean;
  recipe_id: string | null;
  created_at: string;
}

export class ShoppingListService {
  /** Get all shopping lists (without items) */
  static async getLists(): Promise<ShoppingList[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shopping lists:', error);
      return [];
    }
    return data || [];
  }

  /** Get a single shopping list with its items */
  static async getListWithItems(id: string): Promise<ShoppingList | null> {
    const supabase = getSupabase();
    const { data: list, error: listError } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('id', id)
      .single();

    if (listError || !list) return null;

    const { data: items } = await supabase
      .from('shopping_list_items')
      .select('*')
      .eq('shopping_list_id', id)
      .order('created_at', { ascending: true });

    return { ...list, items: items || [] };
  }

  /** Create a new shopping list */
  static async createList(name: string): Promise<ShoppingList> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('shopping_lists')
      .insert({ name, user_id: null })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Error al crear lista: ${error?.message}`);
    }
    return data;
  }

  /** Delete a shopping list (cascade deletes items) */
  static async deleteList(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar lista: ${error.message}`);
    }
  }

  /** Add a single item to a list */
  static async addItem(
    listId: string,
    item: string,
    amount?: string,
    unit?: string
  ): Promise<ShoppingListItem> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('shopping_list_items')
      .insert({
        shopping_list_id: listId,
        item,
        amount: amount || null,
        unit: unit || null,
        checked: false,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Error al agregar artículo: ${error?.message}`);
    }
    return data;
  }

  /** Add all ingredients from a recipe to a list */
  static async addIngredientsFromRecipe(
    listId: string,
    ingredients: Ingredient[],
    recipeId?: string
  ): Promise<ShoppingListItem[]> {
    const supabase = getSupabase();
    const rows = ingredients.map((ing) => ({
      shopping_list_id: listId,
      item: ing.item,
      amount: ing.amount || null,
      unit: ing.unit || null,
      checked: false,
      recipe_id: recipeId || null,
    }));

    const { data, error } = await supabase
      .from('shopping_list_items')
      .insert(rows)
      .select();

    if (error) {
      throw new Error(`Error al agregar ingredientes: ${error.message}`);
    }
    return data || [];
  }

  /** Toggle checked status of an item */
  static async toggleItem(itemId: string, checked: boolean): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('shopping_list_items')
      .update({ checked })
      .eq('id', itemId);

    if (error) {
      throw new Error(`Error al actualizar artículo: ${error.message}`);
    }
  }

  /** Delete an item */
  static async deleteItem(itemId: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw new Error(`Error al eliminar artículo: ${error.message}`);
    }
  }

  /** Delete all checked items from a list */
  static async clearCheckedItems(listId: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('shopping_list_id', listId)
      .eq('checked', true);

    if (error) {
      throw new Error(`Error al limpiar artículos: ${error.message}`);
    }
  }
}
