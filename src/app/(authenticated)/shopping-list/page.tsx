'use client';

import { useState, useEffect, useCallback } from 'react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { ShoppingList, ShoppingListItem } from '@/lib/services/shopping-list-service';

export default function ShoppingListPage() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeList, setActiveList] = useState<(ShoppingList & { items: ShoppingListItem[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');
  const [creatingList, setCreatingList] = useState(false);
  const [showNewListInput, setShowNewListInput] = useState(false);
  const [newItemText, setNewItemText] = useState('');

  const fetchLists = useCallback(async () => {
    const res = await fetch('/api/shopping-lists');
    if (res.ok) setLists(await res.json());
    setLoading(false);
  }, []);

  const fetchListDetail = useCallback(async (id: string) => {
    const res = await fetch(`/api/shopping-lists/${id}`);
    if (res.ok) {
      const data = await res.json();
      setActiveList(data);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setCreatingList(true);
    try {
      const res = await fetch('/api/shopping-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName.trim() }),
      });
      if (res.ok) {
        const list = await res.json();
        setLists([list, ...lists]);
        setNewListName('');
        setShowNewListInput(false);
        setActiveList({ ...list, items: [] });
      }
    } catch {
      alert('Error al crear la lista');
    } finally {
      setCreatingList(false);
    }
  };

  const handleDeleteList = async (id: string) => {
    if (!confirm('¿Eliminar esta lista de compras?')) return;
    await fetch(`/api/shopping-lists/${id}`, { method: 'DELETE' });
    setLists(lists.filter((l) => l.id !== id));
    if (activeList?.id === id) setActiveList(null);
  };

  const handleToggleItem = async (itemId: string, checked: boolean) => {
    if (!activeList) return;
    // Optimistic update
    setActiveList({
      ...activeList,
      items: activeList.items.map((item) =>
        item.id === itemId ? { ...item, checked } : item
      ),
    });
    await fetch(`/api/shopping-lists/${activeList.id}/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checked }),
    });
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!activeList) return;
    setActiveList({
      ...activeList,
      items: activeList.items.filter((item) => item.id !== itemId),
    });
    await fetch(`/api/shopping-lists/${activeList.id}/items/${itemId}`, {
      method: 'DELETE',
    });
  };

  const handleAddItem = async () => {
    if (!activeList || !newItemText.trim()) return;
    const res = await fetch(`/api/shopping-lists/${activeList.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: newItemText.trim() }),
    });
    if (res.ok) {
      const item = await res.json();
      setActiveList({ ...activeList, items: [...activeList.items, item] });
      setNewItemText('');
    }
  };

  const handleClearChecked = async () => {
    if (!activeList) return;
    const checkedCount = activeList.items.filter((i) => i.checked).length;
    if (checkedCount === 0) return;
    if (!confirm(`¿Eliminar ${checkedCount} artículo(s) marcado(s)?`)) return;

    await fetch(`/api/shopping-lists/${activeList.id}/clear-checked`, {
      method: 'POST',
    });
    setActiveList({
      ...activeList,
      items: activeList.items.filter((item) => !item.checked),
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // Active list detail view
  if (activeList) {
    const unchecked = activeList.items.filter((i) => !i.checked);
    const checked = activeList.items.filter((i) => i.checked);

    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setActiveList(null)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
          {checked.length > 0 && (
            <Button variant="secondary" size="sm" onClick={handleClearChecked}>
              Limpiar marcados ({checked.length})
            </Button>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{activeList.name}</h1>

        {/* Add item */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            placeholder="Agregar artículo..."
            className="flex-1 px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={handleAddItem} disabled={!newItemText.trim()}>
            Agregar
          </Button>
        </div>

        {/* Items */}
        {activeList.items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Lista vacía. Agrega artículos o añade ingredientes desde una receta.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Unchecked items */}
            {unchecked.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 group"
              >
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => handleToggleItem(item.id, true)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-gray-900 dark:text-gray-100">{item.item}</span>
                  {(item.amount || item.unit) && (
                    <span className="text-gray-500 dark:text-gray-400 ml-2 text-sm">
                      {item.amount} {item.unit}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Checked items */}
            {checked.length > 0 && (
              <>
                <div className="pt-4 pb-2">
                  <span className="text-sm text-gray-400 font-medium">
                    Completados ({checked.length})
                  </span>
                </div>
                {checked.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg group"
                  >
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => handleToggleItem(item.id, false)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-400 line-through">{item.item}</span>
                      {(item.amount || item.unit) && (
                        <span className="text-gray-300 ml-2 text-sm line-through">
                          {item.amount} {item.unit}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // Lists overview
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Listas de Compras</h1>
        <Button onClick={() => setShowNewListInput(true)}>
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva
        </Button>
      </div>

      {/* New list input */}
      {showNewListInput && (
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
            placeholder="Nombre de la lista..."
            autoFocus
            className="flex-1 px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={handleCreateList} disabled={creatingList || !newListName.trim()}>
            {creatingList ? 'Creando...' : 'Crear'}
          </Button>
          <Button variant="secondary" onClick={() => { setShowNewListInput(false); setNewListName(''); }}>
            Cancelar
          </Button>
        </div>
      )}

      {/* Lists */}
      {lists.length === 0 && !showNewListInput ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Sin listas de compras</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Crea una lista para organizar tus compras.</p>
          <Button onClick={() => setShowNewListInput(true)}>Crear Lista</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <div
              key={list.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
              onClick={() => fetchListDetail(list.id)}
            >
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{list.name}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(list.created_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteList(list.id);
                  }}
                  className="text-gray-400 hover:text-red-500 p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
