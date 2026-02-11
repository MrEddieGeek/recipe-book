// High-level recipe service - orchestrates adapters

import { RecipeAdapterFactory } from '../adapters/adapter-factory';
import { Recipe, RecipeSearchOptions } from '../adapters/types';

export class RecipeService {
  /**
   * Get a recipe by ID from a specific source
   */
  static async getRecipeById(
    id: string,
    sourceType: 'manual' | 'api' | 'ai'
  ): Promise<Recipe | null> {
    const adapter = RecipeAdapterFactory.getAdapter(sourceType);
    return adapter.getRecipeById(id);
  }

  /**
   * Search manual recipes only
   */
  static async searchManualRecipes(
    options: RecipeSearchOptions
  ): Promise<Recipe[]> {
    const adapter = RecipeAdapterFactory.getAdapter('manual');
    return adapter.searchRecipes(options);
  }

  /**
   * Search all enabled recipe sources (Phase 2)
   * Returns recipes grouped by source
   */
  static async searchAllSources(options: RecipeSearchOptions): Promise<{
    manual: Recipe[];
    api: Recipe[];
    ai: Recipe[];
  }> {
    const adapters = RecipeAdapterFactory.getAllAdapters();
    const results = await Promise.allSettled(
      adapters.map((adapter) => adapter.searchRecipes(options))
    );

    const manual: Recipe[] = [];
    const api: Recipe[] = [];
    const ai: Recipe[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const adapter = adapters[index];
        switch (adapter.sourceType) {
          case 'manual':
            manual.push(...result.value);
            break;
          case 'api':
            api.push(...result.value);
            break;
          case 'ai':
            ai.push(...result.value);
            break;
        }
      } else {
        console.error(
          `Error fetching from ${adapters[index].sourceType}:`,
          result.reason
        );
      }
    });

    return { manual, api, ai };
  }

  /**
   * Create a new manual recipe
   */
  static async createManualRecipe(
    recipe: Omit<Recipe, 'id' | 'source' | 'createdAt' | 'updatedAt'>
  ): Promise<Recipe> {
    const adapter = RecipeAdapterFactory.getAdapter('manual');
    if (!adapter.saveRecipe) {
      throw new Error('Manual adapter does not support saving recipes');
    }
    return adapter.saveRecipe(recipe);
  }

  /**
   * Update an existing manual recipe
   */
  static async updateManualRecipe(
    id: string,
    recipe: Partial<Omit<Recipe, 'id' | 'source' | 'createdAt' | 'updatedAt'>>
  ): Promise<Recipe> {
    const adapter = RecipeAdapterFactory.getAdapter('manual');
    if (!adapter.updateRecipe) {
      throw new Error('Manual adapter does not support updating recipes');
    }
    return adapter.updateRecipe(id, recipe);
  }

  /**
   * Delete a manual recipe
   */
  static async deleteManualRecipe(id: string): Promise<void> {
    const adapter = RecipeAdapterFactory.getAdapter('manual');
    if (!adapter.deleteRecipe) {
      throw new Error('Manual adapter does not support deleting recipes');
    }
    return adapter.deleteRecipe(id);
  }

  /**
   * Get all recipes (combined from all sources)
   */
  static async getAllRecipes(maxResults?: number): Promise<Recipe[]> {
    const results = await this.searchAllSources({ maxResults });
    return [...results.manual, ...results.api, ...results.ai];
  }

  /**
   * Upload recipe image to Supabase Storage
   */
  static async uploadRecipeImage(file: File): Promise<string> {
    // This will be implemented with actual Supabase client when needed
    // For now, return a placeholder
    throw new Error('Image upload not yet implemented');
  }
}
