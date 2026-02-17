import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!).trim();
  return createClient(url, key);
}

export interface MealTemplate {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface MealTemplateItem {
  id: string;
  template_id: string;
  recipe_id: string;
  day_offset: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  servings: number;
  recipe?: { id: string; title: string };
}

export interface MealTemplateWithItems extends MealTemplate {
  items: MealTemplateItem[];
}

export class MealTemplateService {
  static async getAll(): Promise<MealTemplate[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('meal_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
    return data || [];
  }

  static async getWithItems(id: string): Promise<MealTemplateWithItems | null> {
    const supabase = getSupabase();
    const { data: template, error } = await supabase
      .from('meal_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !template) return null;

    const { data: items } = await supabase
      .from('meal_template_items')
      .select('*, recipe:recipes(id, title)')
      .eq('template_id', id)
      .order('day_offset')
      .order('meal_type');

    return { ...template, items: (items || []) as MealTemplateItem[] };
  }

  static async create(name: string, description?: string): Promise<MealTemplate> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('meal_templates')
      .insert({ name, description: description || null, user_id: null })
      .select()
      .single();

    if (error || !data) throw new Error(`Error al crear plantilla: ${error?.message}`);
    return data;
  }

  static async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('meal_templates')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar plantilla: ${error.message}`);
  }

  /** Save current week's meals as a template */
  static async saveFromWeek(
    name: string,
    meals: Array<{ recipe_id: string; date: string; meal_type: string; servings: number }>,
    weekStartDate: string
  ): Promise<MealTemplate> {
    const template = await this.create(name);
    const supabase = getSupabase();

    const startDate = new Date(weekStartDate + 'T12:00:00');
    const items = meals.map((m) => {
      const mealDate = new Date(m.date + 'T12:00:00');
      const dayOffset = Math.round((mealDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        template_id: template.id,
        recipe_id: m.recipe_id,
        day_offset: Math.max(0, Math.min(6, dayOffset)),
        meal_type: m.meal_type,
        servings: m.servings,
      };
    });

    if (items.length > 0) {
      const { error } = await supabase
        .from('meal_template_items')
        .insert(items);

      if (error) {
        console.error('Error saving template items:', error);
      }
    }

    return template;
  }

  /** Apply a template to a week starting at the given date */
  static async applyToWeek(templateId: string, weekStartDate: string): Promise<number> {
    const template = await this.getWithItems(templateId);
    if (!template) throw new Error('Plantilla no encontrada');

    const supabase = getSupabase();
    const startDate = new Date(weekStartDate + 'T12:00:00');

    const meals = template.items.map((item) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + item.day_offset);
      return {
        recipe_id: item.recipe_id,
        date: date.toISOString().split('T')[0],
        meal_type: item.meal_type,
        servings: item.servings,
        user_id: null,
      };
    });

    if (meals.length > 0) {
      const { error } = await supabase
        .from('meal_plans')
        .insert(meals);

      if (error) throw new Error(`Error al aplicar plantilla: ${error.message}`);
    }

    return meals.length;
  }
}
