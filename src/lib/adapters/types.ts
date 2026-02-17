// Core recipe types for the adapter pattern

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  tags: string[];
  categoryId?: string;
  caloriesPerServing?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  source: RecipeSource;
  isFavorited?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Ingredient {
  item: string;
  amount: string;
  unit: string;
}

export interface Instruction {
  step: number;
  description: string;
}

export interface RecipeSource {
  type: 'manual' | 'api' | 'ai';
  id: string;
  name?: string; // e.g., "TheMealDB", "Claude AI", "Manual"
}

export interface RecipeSearchOptions {
  query?: string;
  tags?: string[];
  maxResults?: number;
  userId?: string; // For filtering user's own recipes
}

// Database types (from Supabase)
export interface DatabaseRecipe {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  source_type: 'manual' | 'api' | 'ai';
  source_id: string | null;
  category_id: string | null;
  calories_per_serving: number | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
  ingredients: Ingredient[];
  instructions: Instruction[];
  tags: string[];
  is_favorited: boolean;
  created_at: string;
  updated_at: string;
}

// Conversion utilities
export function databaseRecipeToRecipe(dbRecipe: DatabaseRecipe): Recipe {
  return {
    id: dbRecipe.id,
    title: dbRecipe.title,
    description: dbRecipe.description || undefined,
    imageUrl: dbRecipe.image_url || undefined,
    prepTimeMinutes: dbRecipe.prep_time_minutes || undefined,
    cookTimeMinutes: dbRecipe.cook_time_minutes || undefined,
    servings: dbRecipe.servings || undefined,
    ingredients: dbRecipe.ingredients || [],
    instructions: dbRecipe.instructions || [],
    tags: dbRecipe.tags || [],
    categoryId: dbRecipe.category_id || undefined,
    caloriesPerServing: dbRecipe.calories_per_serving || undefined,
    proteinGrams: dbRecipe.protein_grams || undefined,
    carbsGrams: dbRecipe.carbs_grams || undefined,
    fatGrams: dbRecipe.fat_grams || undefined,
    source: {
      type: dbRecipe.source_type,
      id: dbRecipe.source_id || dbRecipe.id,
      name: getSourceName(dbRecipe.source_type),
    },
    isFavorited: dbRecipe.is_favorited,
    createdAt: new Date(dbRecipe.created_at),
    updatedAt: new Date(dbRecipe.updated_at),
  };
}

export function recipeToDatabaseRecipe(
  recipe: Omit<Recipe, 'id' | 'source' | 'createdAt' | 'updatedAt'>,
  userId: string | null,
  sourceType: 'manual' | 'api' | 'ai'
): Omit<DatabaseRecipe, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    title: recipe.title,
    description: recipe.description || null,
    image_url: recipe.imageUrl || null,
    prep_time_minutes: recipe.prepTimeMinutes || null,
    cook_time_minutes: recipe.cookTimeMinutes || null,
    servings: recipe.servings || null,
    source_type: sourceType,
    source_id: null,
    category_id: (recipe as any).categoryId || null,
    calories_per_serving: (recipe as any).caloriesPerServing || null,
    protein_grams: (recipe as any).proteinGrams || null,
    carbs_grams: (recipe as any).carbsGrams || null,
    fat_grams: (recipe as any).fatGrams || null,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    tags: recipe.tags,
    is_favorited: false,
  };
}

function getSourceName(sourceType: 'manual' | 'api' | 'ai'): string {
  switch (sourceType) {
    case 'manual':
      return 'Manual';
    case 'api':
      return 'TheMealDB';
    case 'ai':
      return 'OpenAI';
  }
}
