// Manual recipe adapter - Full CRUD implementation with Supabase

import { createClient } from '@supabase/supabase-js';
import { RecipeAdapter } from './base-adapter';
import {
  Recipe,
  RecipeSearchOptions,
  DatabaseRecipe,
  databaseRecipeToRecipe,
  recipeToDatabaseRecipe,
} from './types';

export class ManualRecipeAdapter extends RecipeAdapter {
  readonly sourceType = 'manual' as const;
  private supabase;

  constructor() {
    super();
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async getRecipeById(id: string): Promise<Recipe | null> {
    const { data, error } = await this.supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .eq('source_type', 'manual')
      .single();

    if (error || !data) {
      console.error('Error fetching recipe:', error);
      return null;
    }

    return databaseRecipeToRecipe(data as DatabaseRecipe);
  }

  async searchRecipes(options: RecipeSearchOptions): Promise<Recipe[]> {
    let query = this.supabase
      .from('recipes')
      .select('*')
      .eq('source_type', 'manual')
      .order('created_at', { ascending: false });

    // Filter by user if specified
    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      query = query.overlaps('tags', options.tags);
    }

    // Search by title/description
    if (options.query) {
      query = query.or(
        `title.ilike.%${options.query}%,description.ilike.%${options.query}%`
      );
    }

    // Limit results
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
    // Get the current user
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated to create recipes');
    }

    const dbRecipe = recipeToDatabaseRecipe(recipe, user.id, 'manual');

    const { data, error } = await this.supabase
      .from('recipes')
      .insert(dbRecipe)
      .select()
      .single();

    if (error || !data) {
      console.error('Error saving recipe:', error);
      throw new Error('Failed to save recipe');
    }

    return databaseRecipeToRecipe(data as DatabaseRecipe);
  }

  async updateRecipe(
    id: string,
    recipe: Partial<Omit<Recipe, 'id' | 'source' | 'createdAt' | 'updatedAt'>>
  ): Promise<Recipe> {
    // Get the current user
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated to update recipes');
    }

    // Build update object
    const updateData: Partial<DatabaseRecipe> = {};
    if (recipe.title !== undefined) updateData.title = recipe.title;
    if (recipe.description !== undefined)
      updateData.description = recipe.description || null;
    if (recipe.imageUrl !== undefined)
      updateData.image_url = recipe.imageUrl || null;
    if (recipe.prepTimeMinutes !== undefined)
      updateData.prep_time_minutes = recipe.prepTimeMinutes || null;
    if (recipe.cookTimeMinutes !== undefined)
      updateData.cook_time_minutes = recipe.cookTimeMinutes || null;
    if (recipe.servings !== undefined)
      updateData.servings = recipe.servings || null;
    if (recipe.ingredients !== undefined)
      updateData.ingredients = recipe.ingredients;
    if (recipe.instructions !== undefined)
      updateData.instructions = recipe.instructions;
    if (recipe.tags !== undefined) updateData.tags = recipe.tags;

    const { data, error } = await this.supabase
      .from('recipes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('source_type', 'manual')
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating recipe:', error);
      throw new Error('Failed to update recipe');
    }

    return databaseRecipeToRecipe(data as DatabaseRecipe);
  }

  async deleteRecipe(id: string): Promise<void> {
    // Get the current user
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated to delete recipes');
    }

    const { error } = await this.supabase
      .from('recipes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('source_type', 'manual');

    if (error) {
      console.error('Error deleting recipe:', error);
      throw new Error('Failed to delete recipe');
    }
  }
}
