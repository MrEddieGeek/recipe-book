// Zod validation schemas

import { z } from 'zod';

export const IngredientSchema = z.object({
  item: z.string().min(1, 'Ingredient name is required').max(200),
  amount: z.string().min(1, 'Amount is required').max(50),
  unit: z.string().min(1, 'Unit is required').max(50),
});

export const InstructionSchema = z.object({
  step: z.number().int().positive(),
  description: z.string().min(1, 'Instruction description is required').max(2000),
});

export const RecipeFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300, 'Title is too long'),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().max(2000).optional().or(z.literal('')),
  prepTimeMinutes: z.number().int().min(0).max(10000).optional().or(z.literal(0)),
  cookTimeMinutes: z.number().int().min(0).max(10000).optional().or(z.literal(0)),
  servings: z.number().int().min(0).max(1000).optional().or(z.literal(0)),
  ingredients: z
    .array(IngredientSchema)
    .min(1, 'At least one ingredient is required')
    .max(100),
  instructions: z
    .array(InstructionSchema)
    .min(1, 'At least one instruction is required')
    .max(100),
  tags: z.array(z.string().max(50)).max(30),
  categoryId: z.string().uuid().optional().or(z.literal('')),
  caloriesPerServing: z.number().int().min(0).max(50000).optional(),
  proteinGrams: z.number().min(0).max(5000).optional(),
  carbsGrams: z.number().min(0).max(5000).optional(),
  fatGrams: z.number().min(0).max(5000).optional(),
});

export type RecipeFormData = z.infer<typeof RecipeFormSchema>;

// AI recipe response validation
export const AiRecipeResponseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  prepTimeMinutes: z.number().optional(),
  cookTimeMinutes: z.number().optional(),
  servings: z.number().optional(),
  ingredients: z.array(z.object({
    item: z.string(),
    amount: z.string(),
    unit: z.string(),
  })).default([]),
  instructions: z.array(z.object({
    step: z.number(),
    description: z.string(),
  })).default([]),
  tags: z.array(z.string()).default([]),
  caloriesPerServing: z.number().optional(),
  proteinGrams: z.number().optional(),
  carbsGrams: z.number().optional(),
  fatGrams: z.number().optional(),
});

// Video extraction schema
export const VideoExtractionSchema = z.object({
  url: z.string().url().max(2000),
});

// Meal plan schemas
export const MealPlanCreateSchema = z.object({
  recipeId: z.string().min(1).max(500),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner']),
  servings: z.number().int().min(1).max(100).optional(),
});

export const MealPlanServingsSchema = z.object({
  servings: z.number().int().min(1).max(100),
});

export const MealPlanDateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const GenerateShoppingListSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  listName: z.string().min(1).max(255).transform(s => s.trim()),
});

// Shopping list schemas
export const ShoppingListNameSchema = z.object({
  name: z.string().min(1).max(255).transform(s => s.trim()),
});

export const ShoppingListItemSchema = z.object({
  item: z.string().min(1).max(300),
  amount: z.string().max(50).optional(),
  unit: z.string().max(50).optional(),
});

export const ShoppingListIngredientsSchema = z.object({
  ingredients: z.array(z.object({
    item: z.string().min(1).max(300),
    amount: z.string().max(50).default(''),
    unit: z.string().max(50).default(''),
  })).min(1).max(200),
  recipeId: z.string().max(500).optional(),
});
