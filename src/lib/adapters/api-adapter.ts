// API recipe adapter - TheMealDB integration (Phase 2)
// Currently a stub that throws "not implemented"

import { RecipeAdapter } from './base-adapter';
import { Recipe, RecipeSearchOptions } from './types';

export class ApiRecipeAdapter extends RecipeAdapter {
  readonly sourceType = 'api' as const;

  async getRecipeById(id: string): Promise<Recipe | null> {
    throw new Error('API adapter not yet implemented (Phase 2)');
  }

  async searchRecipes(options: RecipeSearchOptions): Promise<Recipe[]> {
    throw new Error('API adapter not yet implemented (Phase 2)');
  }
}

// Future implementation will:
// 1. Call TheMealDB API (https://www.themealdb.com/api.php)
// 2. Transform their recipe format to our Recipe interface
// 3. Cache results in Supabase to avoid rate limits
// 4. Return recipes with source.type = 'api'
