'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import RecipeDetail from '@/components/recipe/RecipeDetail';
import { Recipe } from '@/lib/adapters/types';

type Platform = 'youtube' | 'tiktok' | 'instagram' | 'other';

function detectPlatform(url: string): Platform {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
    if (hostname.includes('tiktok.com')) return 'tiktok';
    if (hostname.includes('instagram.com')) return 'instagram';
  } catch {
    // invalid URL
  }
  return 'other';
}

const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  other: 'Otro',
};

const PLATFORM_COLORS: Record<Platform, string> = {
  youtube: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  tiktok: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  instagram: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  other: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

export default function FromVideoPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<Platform>('other');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [needsUpload, setNeedsUpload] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [saving, setSaving] = useState(false);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError('');
    setNeedsUpload(false);
    if (value.trim()) {
      setPlatform(detectPlatform(value.trim()));
    } else {
      setPlatform('other');
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    if (text) {
      // Let the onChange handle it after paste
      setTimeout(() => {
        setPlatform(detectPlatform(text.trim()));
      }, 0);
    }
  };

  const handleExtractFromUrl = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setGeneratedRecipe(null);
    setLoadingMessage('Analizando video...');

    try {
      setTimeout(() => {
        if (loading) setLoadingMessage('Extrayendo receta...');
      }, 5000);

      const res = await fetch('/api/extract-recipe-from-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error al extraer receta' }));
        if (data.needsUpload) {
          setNeedsUpload(true);
        }
        throw new Error(data.error);
      }

      const data = await res.json();
      setGeneratedRecipe(data.recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Por favor selecciona un archivo de video válido.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('El video no debe superar los 100MB.');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedRecipe(null);
    setLoadingMessage('Subiendo video...');

    try {
      const formData = new FormData();
      formData.append('video', file);

      setTimeout(() => {
        if (loading) setLoadingMessage('Analizando video...');
      }, 3000);

      setTimeout(() => {
        if (loading) setLoadingMessage('Extrayendo receta...');
      }, 10000);

      const res = await fetch('/api/extract-recipe-from-video', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error al extraer receta' }));
        throw new Error(data.error);
      }

      const data = await res.json();
      setGeneratedRecipe(data.recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
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

      if (!res.ok) throw new Error('Error al guardar');

      const saved = await res.json();
      router.push(`/recipes/${saved.id}`);
    } catch {
      setError('Error al guardar la receta. Inténtalo de nuevo.');
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
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Recetas
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Extraer Receta de Video</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Pega un enlace de video de cocina y la IA extraerá la receta completa.
        </p>
      </div>

      {/* Input Section */}
      {!generatedRecipe && (
        <div className="space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL del Video
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                onPaste={handlePaste}
                placeholder="https://www.youtube.com/watch?v=... o enlace de TikTok/Instagram"
                disabled={loading}
                className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              {platform !== 'other' && url.trim() && (
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-full font-medium ${PLATFORM_COLORS[platform]}`}>
                  {PLATFORM_LABELS[platform]}
                </span>
              )}
            </div>
          </div>

          {/* Platform hints */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span> YouTube / Shorts
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-700 dark:bg-gray-400 rounded-full"></span> TikTok
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span> Instagram Reels
            </span>
          </div>

          {/* Extract Button */}
          <Button
            onClick={handleExtractFromUrl}
            disabled={loading || !url.trim()}
            className="w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                {loadingMessage || 'Procesando...'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Extraer Receta
              </span>
            )}
          </Button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 dark:bg-gray-900 px-3 text-gray-500">o sube un archivo</span>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {needsUpload
                  ? 'No se pudo resolver el video. Sube el archivo directamente.'
                  : 'Haz clic para seleccionar un video (max 100MB)'}
              </p>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Generated Recipe */}
      {generatedRecipe && (
        <div>
          <div className="flex gap-3 mb-6">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar en Mis Recetas'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setGeneratedRecipe(null);
                setError('');
                setUrl('');
                setPlatform('other');
              }}
            >
              Extraer Otra
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <RecipeDetail recipe={generatedRecipe} />
        </div>
      )}
    </div>
  );
}
