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
  static getAdapter(sourceType: 'manual'): ManualRecipeAdapter;
  static getAdapter(sourceType: 'api'): ApiRecipeAdapter;
  static getAdapter(sourceType: 'ai'): AiRecipeAdapter;
  static getAdapter(sourceType: 'manual' | 'api' | 'ai'): RecipeAdapter;
  static getAdapter(sourceType: 'manual' | 'api' | 'ai'): RecipeAdapter {
    switch (sourceType) {
      case 'manual':
        if (!manualAdapter) manualAdapter = new ManualRecipeAdapter();
        return manualAdapter;
      case 'api':
        if (!apiAdapter) apiAdapter = new ApiRecipeAdapter();
        return apiAdapter;
      case 'ai':
        if (!aiAdapter) aiAdapter = new AiRecipeAdapter();
        return aiAdapter;
      default:
        throw new Error(`Unknown source type: ${sourceType}`);
    }
  }

  /**
   * Get all browsable adapters (manual + api).
   * AI adapter is not browsable — it generates on demand.
   */
  static getBrowsableAdapters(): RecipeAdapter[] {
    return [this.getAdapter('manual'), this.getAdapter('api')];
  }

  static getEnabledSources(): Array<'manual' | 'api' | 'ai'> {
    return ['manual', 'api', 'ai'];
  }
}
