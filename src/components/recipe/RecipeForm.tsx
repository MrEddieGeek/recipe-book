'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { Recipe, Ingredient, Instruction } from '@/lib/adapters/types';
import { RecipeFormSchema } from '@/lib/utils/validation';

interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (data: any) => Promise<void>;
  submitLabel?: string;
}

export default function RecipeForm({
  recipe,
  onSubmit,
  submitLabel = 'Save Recipe',
}: RecipeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [title, setTitle] = useState(recipe?.title || '');
  const [description, setDescription] = useState(recipe?.description || '');
  const [imageUrl, setImageUrl] = useState(recipe?.imageUrl || '');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(
    recipe?.prepTimeMinutes || 0
  );
  const [cookTimeMinutes, setCookTimeMinutes] = useState(
    recipe?.cookTimeMinutes || 0
  );
  const [servings, setServings] = useState(recipe?.servings || 4);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients || [{ item: '', amount: '', unit: '' }]
  );
  const [instructions, setInstructions] = useState<Instruction[]>(
    recipe?.instructions || [{ step: 1, description: '' }]
  );
  const [tags, setTags] = useState(recipe?.tags.join(', ') || '');

  // Ingredient handlers
  const addIngredient = () => {
    setIngredients([...ingredients, { item: '', amount: '', unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  // Instruction handlers
  const addInstruction = () => {
    setInstructions([
      ...instructions,
      { step: instructions.length + 1, description: '' },
    ]);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const updated = instructions
        .filter((_, i) => i !== index)
        .map((inst, i) => ({ ...inst, step: i + 1 }));
      setInstructions(updated);
    }
  };

  const updateInstruction = (index: number, description: string) => {
    const updated = [...instructions];
    updated[index] = { ...updated[index], description };
    setInstructions(updated);
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Parse tags
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);

      // Build form data
      const formData = {
        title,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        prepTimeMinutes: prepTimeMinutes || undefined,
        cookTimeMinutes: cookTimeMinutes || undefined,
        servings: servings || undefined,
        ingredients,
        instructions,
        tags: parsedTags,
      };

      // Validate
      const validated = RecipeFormSchema.parse(formData);

      // Submit
      await onSubmit(validated);
    } catch (err: any) {
      if (err.errors) {
        // Zod validation error
        setError(err.errors[0].message);
      } else {
        setError(err.message || 'An error occurred');
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>

        <Input
          label="Recipe Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Spaghetti Carbonara"
          required
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of your recipe..."
          rows={3}
        />

        <Input
          label="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          helperText="Optional: Enter a URL to a recipe image"
        />
      </div>

      {/* Times & Servings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Prep Time (minutes)"
            type="number"
            value={prepTimeMinutes}
            onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
            min="0"
          />

          <Input
            label="Cook Time (minutes)"
            type="number"
            value={cookTimeMinutes}
            onChange={(e) => setCookTimeMinutes(Number(e.target.value))}
            min="0"
          />

          <Input
            label="Servings"
            type="number"
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            min="1"
          />
        </div>

        <Input
          label="Tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., Italian, Pasta, Quick"
          helperText="Separate tags with commas"
        />
      </div>

      {/* Ingredients */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Ingredients</h2>
          <Button type="button" onClick={addIngredient} size="sm" variant="secondary">
            Add Ingredient
          </Button>
        </div>

        <div className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Ingredient"
                value={ingredient.item}
                onChange={(e) =>
                  updateIngredient(index, 'item', e.target.value)
                }
                className="flex-1"
                required
              />
              <Input
                placeholder="Amount"
                value={ingredient.amount}
                onChange={(e) =>
                  updateIngredient(index, 'amount', e.target.value)
                }
                className="w-24"
                required
              />
              <Input
                placeholder="Unit"
                value={ingredient.unit}
                onChange={(e) =>
                  updateIngredient(index, 'unit', e.target.value)
                }
                className="w-24"
                required
              />
              <Button
                type="button"
                onClick={() => removeIngredient(index)}
                variant="danger"
                size="sm"
                disabled={ingredients.length === 1}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Instructions</h2>
          <Button type="button" onClick={addInstruction} size="sm" variant="secondary">
            Add Step
          </Button>
        </div>

        <div className="space-y-3">
          {instructions.map((instruction, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-semibold mt-2">
                {instruction.step}
              </div>
              <Textarea
                placeholder="Describe this step..."
                value={instruction.description}
                onChange={(e) => updateInstruction(index, e.target.value)}
                rows={2}
                required
              />
              <Button
                type="button"
                onClick={() => removeInstruction(index)}
                variant="danger"
                size="sm"
                disabled={instructions.length === 1}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="button"
          onClick={() => router.back()}
          variant="secondary"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
