// Zod validation schemas

import { z } from 'zod';

export const IngredientSchema = z.object({
  item: z.string().min(1, 'Ingredient name is required'),
  amount: z.string().min(1, 'Amount is required'),
  unit: z.string().min(1, 'Unit is required'),
});

export const InstructionSchema = z.object({
  step: z.number().int().positive(),
  description: z.string().min(1, 'Instruction description is required'),
});

export const RecipeFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  prepTimeMinutes: z.number().int().positive().optional().or(z.literal(0)),
  cookTimeMinutes: z.number().int().positive().optional().or(z.literal(0)),
  servings: z.number().int().positive().optional().or(z.literal(0)),
  ingredients: z
    .array(IngredientSchema)
    .min(1, 'At least one ingredient is required'),
  instructions: z
    .array(InstructionSchema)
    .min(1, 'At least one instruction is required'),
  tags: z.array(z.string()),
});

export type RecipeFormData = z.infer<typeof RecipeFormSchema>;
