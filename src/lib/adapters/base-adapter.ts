// Abstract base class for recipe adapters

import { Recipe, RecipeSearchOptions } from './types';

export abstract class RecipeAdapter {
  abstract readonly sourceType: 'manual' | 'api' | 'ai';

  /**
   * Get a single recipe by ID
   */
  abstract getRecipeById(id: string): Promise<Recipe | null>;

  /**
   * Search for recipes with optional filters
   */
  abstract searchRecipes(options: RecipeSearchOptions): Promise<Recipe[]>;

  /**
   * Save a new recipe (only implemented by manual adapter)
   */
  async saveRecipe?(
    recipe: Omit<Recipe, 'id' | 'source' | 'createdAt' | 'updatedAt'>
  ): Promise<Recipe> {
    throw new Error(`saveRecipe not implemented for ${this.sourceType} adapter`);
  }

  /**
   * Update an existing recipe (only implemented by manual adapter)
   */
  async updateRecipe?(
    id: string,
    recipe: Partial<Omit<Recipe, 'id' | 'source' | 'createdAt' | 'updatedAt'>>
  ): Promise<Recipe> {
    throw new Error(`updateRecipe not implemented for ${this.sourceType} adapter`);
  }

  /**
   * Delete a recipe (only implemented by manual adapter)
   */
  async deleteRecipe?(id: string): Promise<void> {
    throw new Error(`deleteRecipe not implemented for ${this.sourceType} adapter`);
  }
}
