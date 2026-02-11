// Factory pattern for recipe adapters

import { RecipeAdapter } from './base-adapter';
import { ManualRecipeAdapter } from './manual-adapter';
import { ApiRecipeAdapter } from './api-adapter';
import { AiRecipeAdapter } from './ai-adapter';

// Singleton instances
let manualAdapter: ManualRecipeAdapter | null = null;
let apiAdapter: ApiRecipeAdapter | null = null;
let aiAdapter: AiRecipeAdapter | null = null;

export class RecipeAdapterFactory {
  /**
   * Get a specific adapter by source type
   */
  static getAdapter(sourceType: 'manual' | 'api' | 'ai'): RecipeAdapter {
    switch (sourceType) {
      case 'manual':
        if (!manualAdapter) {
          manualAdapter = new ManualRecipeAdapter();
        }
        return manualAdapter;

      case 'api':
        if (!apiAdapter) {
          apiAdapter = new ApiRecipeAdapter();
        }
        return apiAdapter;

      case 'ai':
        if (!aiAdapter) {
          aiAdapter = new AiRecipeAdapter();
        }
        return aiAdapter;

      default:
        throw new Error(`Unknown source type: ${sourceType}`);
    }
  }

  /**
   * Get all enabled adapters (for multi-source search in Phase 2)
   * Currently returns only manual adapter for Phase 1
   */
  static getAllAdapters(): RecipeAdapter[] {
    // Phase 1: Only manual recipes
    return [this.getAdapter('manual')];

    // Phase 2: Uncomment to enable all sources
    // return [
    //   this.getAdapter('manual'),
    //   this.getAdapter('api'),
    //   this.getAdapter('ai'),
    // ];
  }

  /**
   * Get enabled source types
   */
  static getEnabledSources(): Array<'manual' | 'api' | 'ai'> {
    // Phase 1: Only manual
    return ['manual'];

    // Phase 2: Uncomment to enable all sources
    // return ['manual', 'api', 'ai'];
  }
}
