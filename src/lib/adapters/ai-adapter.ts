// AI recipe adapter - Claude API integration (Phase 2)
// Currently a stub that throws "not implemented"

import { RecipeAdapter } from './base-adapter';
import { Recipe, RecipeSearchOptions } from './types';

export class AiRecipeAdapter extends RecipeAdapter {
  readonly sourceType = 'ai' as const;

  async getRecipeById(id: string): Promise<Recipe | null> {
    throw new Error('AI adapter not yet implemented (Phase 2)');
  }

  async searchRecipes(options: RecipeSearchOptions): Promise<Recipe[]> {
    throw new Error('AI adapter not yet implemented (Phase 2)');
  }

  // Future method for Phase 2
  async generateRecipe(prompt: string): Promise<Recipe> {
    throw new Error('AI adapter not yet implemented (Phase 2)');
  }
}

// Future implementation will:
// 1. Call Claude API with structured prompts
// 2. Validate output with Zod schemas
// 3. Save generated recipes to Supabase (source_type='ai')
// 4. Return recipes with source.type = 'ai'
