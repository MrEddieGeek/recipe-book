// High-level recipe service - orchestrates adapters

import { RecipeAdapterFactory } from '../adapters/adapter-factory';
import { ManualRecipeAdapter } from '../adapters/manual-adapter';
import { Recipe, RecipeSearchOptions } from '../adapters/types';

export class RecipeService {
  /**
   * Get a recipe by ID, routing to the correct adapter based on ID prefix
   */
  static async getRecipeById(id: string): Promise<Recipe | null> {
    if (id.startsWith('mealdb-')) {
      return RecipeAdapterFactory.getAdapter('api').getRecipeById(id);
    }
    // default to manual (UUID format)
    return RecipeAdapterFactory.getAdapter('manual').getRecipeById(id);
  }

  /**
   * Search manual recipes only
   */
  static async searchManualRecipes(options: RecipeSearchOptions): Promise<Recipe[]> {
    return RecipeAdapterFactory.getAdapter('manual').searchRecipes(options);
  }

  /**
   * Search TheMealDB API recipes
   */
  static async searchApiRecipes(options: RecipeSearchOptions): Promise<Recipe[]> {
    return RecipeAdapterFactory.getAdapter('api').searchRecipes(options);
  }

  /**
   * Search all browsable sources in parallel
   */
  static async searchAllSources(options: RecipeSearchOptions): Promise<Recipe[]> {
    const adapters = RecipeAdapterFactory.getBrowsableAdapters();
    const results = await Promise.allSettled(
      adapters.map((a) => a.searchRecipes(options))
    );

    const recipes: Recipe[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        recipes.push(...result.value);
      }
    }
    return recipes;
  }

  /**
   * Create a new manual recipe
   */
  static async createManualRecipe(
    recipe: Omit<Recipe, 'id' | 'source' | 'createdAt' | 'updatedAt'>
  ): Promise<Recipe> {
    const adapter = RecipeAdapterFactory.getAdapter('manual');
    return adapter.saveRecipe!(recipe);
  }

  /**
   * Update an existing manual recipe
   */
  static async updateManualRecipe(
    id: string,
    recipe: Partial<Omit<Recipe, 'id' | 'source' | 'createdAt' | 'updatedAt'>>
  ): Promise<Recipe> {
    const adapter = RecipeAdapterFactory.getAdapter('manual');
    return adapter.updateRecipe!(id, recipe);
  }

  /**
   * Delete a manual recipe
   */
  static async deleteManualRecipe(id: string): Promise<void> {
    const adapter = RecipeAdapterFactory.getAdapter('manual');
    return adapter.deleteRecipe!(id);
  }

  /**
   * Toggle favorite status on a manual recipe
   */
  static async toggleFavorite(id: string): Promise<boolean> {
    const adapter = RecipeAdapterFactory.getAdapter('manual') as ManualRecipeAdapter;
    return adapter.toggleFavorite(id);
  }

  /**
   * Get all favorited recipes
   */
  static async getFavorites(): Promise<Recipe[]> {
    const adapter = RecipeAdapterFactory.getAdapter('manual') as ManualRecipeAdapter;
    return adapter.getFavorites();
  }

  /**
   * Save an external recipe (API/AI) as a manual recipe for your collection
   */
  static async saveToMyRecipes(
    recipe: Omit<Recipe, 'id' | 'source' | 'createdAt' | 'updatedAt'>
  ): Promise<Recipe> {
    return this.createManualRecipe(recipe);
  }
}
