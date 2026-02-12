'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import RecipeCard from '@/components/recipe/RecipeCard';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { Recipe } from '@/lib/adapters/types';

type SourceTab = 'manual' | 'discover';

export default function RecipesPage() {
  const [activeTab, setActiveTab] = useState<SourceTab>('manual');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const source = activeTab === 'manual' ? 'manual' : 'api';
      const params = new URLSearchParams({ source });
      if (debouncedQuery) params.set('q', debouncedQuery);

      const res = await fetch(`/api/recipes/search?${params}`);
      if (res.ok) {
        setRecipes(await res.json());
      }
    } catch (error) {
      console.error('Error al buscar recetas:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedQuery]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Recetas</h1>
        <div className="flex gap-2">
          <Link href="/recipes/generate">
            <Button variant="secondary" size="sm">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              IA
            </Button>
          </Link>
          <Link href="/recipes/new">
            <Button>
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'manual'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Mis Recetas
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'discover'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Descubrir
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder={activeTab === 'manual' ? 'Buscar en mis recetas...' : 'Buscar recetas en línea...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <svg
              className="w-16 h-16 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {activeTab === 'manual' ? 'Aún no hay recetas' : 'No se encontraron recetas'}
          </h2>
          <p className="text-gray-600 mb-6">
            {activeTab === 'manual'
              ? '¡Crea tu primera receta para comenzar!'
              : debouncedQuery
                ? 'Prueba con otro término de búsqueda.'
                : 'Busca una receta para descubrir algo nuevo.'}
          </p>
          {activeTab === 'manual' && (
            <Link href="/recipes/new">
              <Button>Crear Receta</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
