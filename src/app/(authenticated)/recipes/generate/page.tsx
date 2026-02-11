'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import RecipeDetail from '@/components/recipe/RecipeDetail';
import { Recipe } from '@/lib/adapters/types';

const SUGGESTIONS = [
  'A healthy chicken stir-fry with vegetables',
  'Quick pasta dinner under 30 minutes',
  'Vegetarian Mexican bowl',
  'French dessert with chocolate',
  'Easy meal prep lunch for the week',
  'Comfort food for a rainy day',
];

export default function GenerateRecipePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.length < 3) {
      setError('Please enter at least 3 characters.');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedRecipe(null);

    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to generate recipe' }));
        throw new Error(data.error);
      }

      const recipe = await res.json();
      setGeneratedRecipe(recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedRecipe) return;

    setSaving(true);
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedRecipe.title,
          description: generatedRecipe.description,
          prepTimeMinutes: generatedRecipe.prepTimeMinutes,
          cookTimeMinutes: generatedRecipe.cookTimeMinutes,
          servings: generatedRecipe.servings,
          ingredients: generatedRecipe.ingredients,
          instructions: generatedRecipe.instructions,
          tags: generatedRecipe.tags,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');

      const saved = await res.json();
      router.push(`/recipes/${saved.id}`);
    } catch {
      setError('Failed to save recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/recipes')}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Recipes
        </button>
        <h1 className="text-2xl font-bold text-gray-900">AI Recipe Generator</h1>
        <p className="text-gray-600 mt-1">
          Describe what you want to cook and AI will create a recipe for you.
        </p>
      </div>

      {/* Prompt Input */}
      {!generatedRecipe && (
        <div className="space-y-4">
          <div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the recipe you want... e.g. 'A healthy chicken stir-fry with vegetables'"
              rows={3}
              maxLength={500}
              disabled={loading}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>{prompt.length}/500</span>
            </div>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setPrompt(suggestion)}
                disabled={loading}
                className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading || prompt.length < 3}
            className="w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                Generating recipe...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Recipe
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Generated Recipe */}
      {generatedRecipe && (
        <div>
          {/* Action buttons */}
          <div className="flex gap-3 mb-6">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save to My Recipes'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setGeneratedRecipe(null);
                setError('');
              }}
            >
              Generate Another
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <RecipeDetail recipe={generatedRecipe} />
        </div>
      )}
    </div>
  );
}
