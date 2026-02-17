'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import RecipeDetail from '@/components/recipe/RecipeDetail';
import { Recipe } from '@/lib/adapters/types';

export default function ImportRecipePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importedRecipe, setImportedRecipe] = useState<Recipe | null>(null);
  const [saving, setSaving] = useState(false);

  const handleImport = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setImportedRecipe(null);

    try {
      const res = await fetch('/api/import-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error al importar' }));
        throw new Error(data.error);
      }

      const recipe = await res.json();
      setImportedRecipe(recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!importedRecipe) return;

    setSaving(true);
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: importedRecipe.title,
          description: importedRecipe.description,
          prepTimeMinutes: importedRecipe.prepTimeMinutes,
          cookTimeMinutes: importedRecipe.cookTimeMinutes,
          servings: importedRecipe.servings,
          ingredients: importedRecipe.ingredients,
          instructions: importedRecipe.instructions,
          tags: importedRecipe.tags,
        }),
      });

      if (!res.ok) throw new Error('Error al guardar');

      const saved = await res.json();
      router.push(`/recipes/${saved.id}`);
    } catch {
      setError('Error al guardar la receta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/recipes')}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Recetas
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Importar Receta desde URL</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Pega el enlace de una página web con una receta y la IA la extraerá automáticamente.
        </p>
      </div>

      {!importedRecipe && (
        <div className="space-y-4">
          <div>
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              placeholder="https://ejemplo.com/receta-de-pollo"
              disabled={loading}
              className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button onClick={handleImport} disabled={loading || !url.trim()} className="w-full">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                Importando receta...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Importar Receta
              </span>
            )}
          </Button>
        </div>
      )}

      {importedRecipe && (
        <div>
          <div className="flex gap-3 mb-6">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar en Mis Recetas'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setImportedRecipe(null);
                setError('');
                setUrl('');
              }}
            >
              Importar Otra
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <RecipeDetail recipe={importedRecipe} />
        </div>
      )}
    </div>
  );
}
