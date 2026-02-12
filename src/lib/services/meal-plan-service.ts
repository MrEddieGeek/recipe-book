import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!).trim();
  return createClient(url, key);
}

export interface MealPlan {
  id: string;
  recipe_id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  servings: number;
  created_at: string;
}

export interface MealPlanWithRecipe extends MealPlan {
  recipe: {
    id: string;
    title: string;
    image_url: string | null;
    ingredients: Array<{ item: string; amount: string; unit: string }>;
  };
}

export class MealPlanService {
  /** Get all meals for a date range */
  static async getMealsForRange(startDate: string, endDate: string): Promise<MealPlanWithRecipe[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('meal_plans')
      .select(`
        *,
        recipe:recipes(id, title, image_url, ingredients)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching meal plans:', error);
      return [];
    }
    return (data || []) as MealPlanWithRecipe[];
  }

  /** Add a meal to the plan */
  static async addMeal(
    recipeId: string,
    date: string,
    mealType: 'breakfast' | 'lunch' | 'dinner',
    servings: number = 1
  ): Promise<MealPlan> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('meal_plans')
      .insert({
        recipe_id: recipeId,
        date,
        meal_type: mealType,
        servings,
        user_id: null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Error al agregar comida: ${error?.message}`);
    }
    return data;
  }

  /** Remove a meal from the plan */
  static async removeMeal(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar comida: ${error.message}`);
    }
  }

  /** Update servings for a meal */
  static async updateServings(id: string, servings: number): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('meal_plans')
      .update({ servings })
      .eq('id', id);

    if (error) {
      throw new Error(`Error al actualizar porciones: ${error.message}`);
    }
  }

  /** Get all ingredients from a week's meals for shopping list generation */
  static async getWeekIngredients(startDate: string, endDate: string): Promise<
    Array<{ item: string; amount: string; unit: string; recipeTitle: string }>
  > {
    const meals = await this.getMealsForRange(startDate, endDate);
    const ingredients: Array<{ item: string; amount: string; unit: string; recipeTitle: string }> = [];

    for (const meal of meals) {
      if (meal.recipe?.ingredients) {
        for (const ing of meal.recipe.ingredients) {
          ingredients.push({
            item: ing.item,
            amount: ing.amount || '',
            unit: ing.unit || '',
            recipeTitle: meal.recipe.title,
          });
        }
      }
    }

    return ingredients;
  }
}
