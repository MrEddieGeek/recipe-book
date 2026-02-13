'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Recipe } from '@/lib/adapters/types';

interface ShoppingList {
  id: string;
  name: string;
  created_at: string;
}

interface AddToShoppingListButtonProps {
  recipe: Recipe;
}

export default function AddToShoppingListButton({ recipe }: AddToShoppingListButtonProps) {
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch('/api/shopping-lists')
        .then((r) => r.json())
        .then((data) => setLists(data))
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleAddToList = async (listId: string) => {
    setAdding(true);
    try {
      const res = await fetch(`/api/shopping-lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: recipe.ingredients,
          recipeId: recipe.id,
        }),
      });
      if (res.ok) {
        const listName = lists.find((l) => l.id === listId)?.name || '';
        setSuccess(`Ingredientes agregados a "${listName}"`);
        setTimeout(() => {
          setSuccess('');
          setOpen(false);
        }, 2000);
      }
    } catch {
      alert('Error al agregar ingredientes');
    } finally {
      setAdding(false);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newListName.trim()) return;
    setAdding(true);
    try {
      const createRes = await fetch('/api/shopping-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName.trim() }),
      });
      if (createRes.ok) {
        const list = await createRes.json();
        setLists([list, ...lists]);
        setNewListName('');
        await handleAddToList(list.id);
      }
    } catch {
      alert('Error al crear la lista');
    } finally {
      setAdding(false);
    }
  };

  if (recipe.ingredients.length === 0) return null;

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(!open)}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Lista de Compras
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-4">
            {success ? (
              <div className="flex items-center gap-2 text-green-600 py-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">{success}</span>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Agregar {recipe.ingredients.length} ingrediente(s) a:
                </p>

                {/* Existing lists */}
                {loading ? (
                  <p className="text-sm text-gray-500 py-2">Cargando...</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-1 mb-3">
                    {lists.map((list) => (
                      <button
                        key={list.id}
                        onClick={() => handleAddToList(list.id)}
                        disabled={adding}
                        className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 dark:text-gray-200 transition-colors disabled:opacity-50"
                      >
                        {list.name}
                      </button>
                    ))}
                    {lists.length === 0 && (
                      <p className="text-sm text-gray-400 py-1">No hay listas</p>
                    )}
                  </div>
                )}

                {/* Create new list */}
                <div className="border-t dark:border-gray-700 pt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">O crear nueva lista:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAdd()}
                      placeholder="Nombre..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      size="sm"
                      onClick={handleCreateAndAdd}
                      disabled={adding || !newListName.trim()}
                    >
                      Crear
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
