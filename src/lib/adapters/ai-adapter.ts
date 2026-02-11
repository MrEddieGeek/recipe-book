// AI recipe adapter - generates recipes via an API route that calls Claude
// The API route keeps the ANTHROPIC_API_KEY server-side only

import { RecipeAdapter } from './base-adapter';
import { Recipe, RecipeSearchOptions } from './types';

export class AiRecipeAdapter extends RecipeAdapter {
  readonly sourceType = 'ai' as const;

  async getRecipeById(id: string): Promise<Recipe | null> {
    // AI recipes are ephemeral — look up from saved recipes if cached
    return null;
  }

  async searchRecipes(options: RecipeSearchOptions): Promise<Recipe[]> {
    // AI doesn't support browsing; use generateRecipe instead
    return [];
  }

  /**
   * Generate a recipe from a text prompt.
   * This calls our own API route which in turn calls Claude.
   */
  async generateRecipe(prompt: string): Promise<Recipe> {
    const res = await fetch('/api/generate-recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || 'Failed to generate recipe');
    }

    return res.json();
  }
}
