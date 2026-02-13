// Manual recipe adapter - Full CRUD implementation with Supabase
// Personal use: no authentication, uses service role key to bypass RLS

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RecipeAdapter } from './base-adapter';
import {
  Recipe,
  RecipeSearchOptions,
  DatabaseRecipe,
  databaseRecipeToRecipe,
  recipeToDatabaseRecipe,
} from './types';

// Personal use: no user authentication, user_id is null to avoid FK constraint
const PERSONAL_USER_ID = null;

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!).trim();
  return createClient(url, key);
}

export class ManualRecipeAdapter extends RecipeAdapter {
  readonly sourceType = 'manual' as const;

  async getRecipeById(id: string): Promise<Recipe | null> {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return databaseRecipeToRecipe(data as DatabaseRecipe);
  }

  async searchRecipes(options: RecipeSearchOptions): Promise<Recipe[]> {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (options.tags && options.tags.length > 0) {
      query = query.overlaps('tags', options.tags);
    }

    if (options.query) {
      // Escape SQL LIKE wildcards to prevent wildcard injection
      const safeQuery = options.query.replace(/[%_\\]/g, '\\$&');
      query = query.or(
        `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`
      );
    }

    if (options.maxResults) {
      query = query.limit(options.maxResults);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error searching recipes:', error);
      return [];
    }

    return (data as DatabaseRecipe[]).map(databaseRecipeToRecipe);
  }

  async saveRecipe(
    recipe: Omit<Recipe, 'id' | 'source' | 'createdAt' | 'updatedAt'>
  ): Promise<Recipe> {
    const supabase = getSupabaseAdmin();
    const dbRecipe = recipeToDatabaseRecipe(recipe, PERSONAL_USER_ID, 'manual');

    const { data, error } = await supabase
      .from('recipes')
      .insert(dbRecipe)
      .select()
      .single();

    if (error || !data) {
      console.error('Error saving recipe:', error);
      throw new Error(`Failed to save recipe: ${error?.message}`);
    }

    return databaseRecipeToRecipe(data as DatabaseRecipe);
  }

  async updateRecipe(
    id: string,
    recipe: Partial<Omit<Recipe, 'id' | 'source' | 'createdAt' | 'updatedAt'>>
  ): Promise<Recipe> {
    const supabase = getSupabaseAdmin();

    const updateData: Record<string, unknown> = {};
    if (recipe.title !== undefined) updateData.title = recipe.title;
    if (recipe.description !== undefined) updateData.description = recipe.description || null;
    if (recipe.imageUrl !== undefined) updateData.image_url = recipe.imageUrl || null;
    if (recipe.prepTimeMinutes !== undefined) updateData.prep_time_minutes = recipe.prepTimeMinutes || null;
    if (recipe.cookTimeMinutes !== undefined) updateData.cook_time_minutes = recipe.cookTimeMinutes || null;
    if (recipe.servings !== undefined) updateData.servings = recipe.servings || null;
    if (recipe.ingredients !== undefined) updateData.ingredients = recipe.ingredients;
    if (recipe.instructions !== undefined) updateData.instructions = recipe.instructions;
    if (recipe.tags !== undefined) updateData.tags = recipe.tags;

    const { data, error } = await supabase
      .from('recipes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating recipe:', error);
      throw new Error(`Failed to update recipe: ${error?.message}`);
    }

    return databaseRecipeToRecipe(data as DatabaseRecipe);
  }

  async deleteRecipe(id: string): Promise<void> {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting recipe:', error);
      throw new Error(`Failed to delete recipe: ${error?.message}`);
    }
  }
}
