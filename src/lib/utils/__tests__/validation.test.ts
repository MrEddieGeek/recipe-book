import { describe, it, expect } from 'vitest';
import {
  RecipeFormSchema,
  AiRecipeResponseSchema,
  VideoExtractionSchema,
  MealPlanCreateSchema,
  ShoppingListNameSchema,
} from '../validation';

describe('RecipeFormSchema', () => {
  const validRecipe = {
    title: 'Test Recipe',
    ingredients: [{ item: 'Salt', amount: '1', unit: 'tsp' }],
    instructions: [{ step: 1, description: 'Add salt' }],
    tags: ['test'],
  };

  it('accepts a valid recipe', () => {
    const result = RecipeFormSchema.safeParse(validRecipe);
    expect(result.success).toBe(true);
  });

  it('requires a title', () => {
    const result = RecipeFormSchema.safeParse({ ...validRecipe, title: '' });
    expect(result.success).toBe(false);
  });

  it('requires at least one ingredient', () => {
    const result = RecipeFormSchema.safeParse({ ...validRecipe, ingredients: [] });
    expect(result.success).toBe(false);
  });

  it('requires at least one instruction', () => {
    const result = RecipeFormSchema.safeParse({ ...validRecipe, instructions: [] });
    expect(result.success).toBe(false);
  });

  it('accepts optional nutrition fields', () => {
    const result = RecipeFormSchema.safeParse({
      ...validRecipe,
      caloriesPerServing: 350,
      proteinGrams: 25.5,
      carbsGrams: 40,
      fatGrams: 12,
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional categoryId', () => {
    const result = RecipeFormSchema.safeParse({
      ...validRecipe,
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty categoryId', () => {
    const result = RecipeFormSchema.safeParse({
      ...validRecipe,
      categoryId: '',
    });
    expect(result.success).toBe(true);
  });
});

describe('AiRecipeResponseSchema', () => {
  it('parses a minimal AI response', () => {
    const result = AiRecipeResponseSchema.safeParse({ title: 'AI Recipe' });
    expect(result.success).toBe(true);
    expect(result.data?.ingredients).toEqual([]);
    expect(result.data?.instructions).toEqual([]);
    expect(result.data?.tags).toEqual([]);
  });

  it('parses nutrition fields', () => {
    const result = AiRecipeResponseSchema.safeParse({
      title: 'Recipe',
      caloriesPerServing: 400,
      proteinGrams: 30,
    });
    expect(result.success).toBe(true);
    expect(result.data?.caloriesPerServing).toBe(400);
  });
});

describe('VideoExtractionSchema', () => {
  it('accepts a valid URL', () => {
    const result = VideoExtractionSchema.safeParse({
      url: 'https://www.youtube.com/watch?v=abc123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid URL', () => {
    const result = VideoExtractionSchema.safeParse({ url: 'not-a-url' });
    expect(result.success).toBe(false);
  });
});

describe('MealPlanCreateSchema', () => {
  it('validates a meal plan entry', () => {
    const result = MealPlanCreateSchema.safeParse({
      recipeId: 'test-id',
      date: '2024-01-15',
      mealType: 'lunch',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid date format', () => {
    const result = MealPlanCreateSchema.safeParse({
      recipeId: 'test-id',
      date: '01/15/2024',
      mealType: 'lunch',
    });
    expect(result.success).toBe(false);
  });
});

describe('ShoppingListNameSchema', () => {
  it('trims whitespace', () => {
    const result = ShoppingListNameSchema.safeParse({ name: '  My List  ' });
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('My List');
  });

  it('rejects empty name', () => {
    const result = ShoppingListNameSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });
});
