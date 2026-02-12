'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Recipe } from '@/lib/adapters/types';

interface SaveToMyRecipesButtonProps {
  recipe: Recipe;
}

export default function SaveToMyRecipesButton({ recipe }: SaveToMyRecipesButtonProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: recipe.title,
          description: recipe.description,
          imageUrl: recipe.imageUrl,
          prepTimeMinutes: recipe.prepTimeMinutes,
          cookTimeMinutes: recipe.cookTimeMinutes,
          servings: recipe.servings,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          tags: recipe.tags,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(data.error || 'Error al guardar');
      }

      setSaved(true);
      const savedRecipe = await res.json();
      setTimeout(() => router.push(`/recipes/${savedRecipe.id}`), 500);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar la receta. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button
      onClick={handleSave}
      disabled={saving || saved}
      variant={saved ? 'secondary' : 'primary'}
      size="sm"
    >
      {saved ? (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          ¡Guardada!
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          {saving ? 'Guardando...' : 'Guardar en Mis Recetas'}
        </>
      )}
    </Button>
  );
}
