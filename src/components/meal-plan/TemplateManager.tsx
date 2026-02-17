'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

interface MealTemplate {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface TemplateManagerProps {
  weekStartDate: string;
  meals: Array<{ recipe_id: string; date: string; meal_type: string; servings: number }>;
  onApplied: () => void;
  onClose: () => void;
}

export default function TemplateManager({ weekStartDate, meals, onApplied, onClose }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<MealTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [showSave, setShowSave] = useState(false);

  useEffect(() => {
    fetch('/api/meal-templates')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTemplates(data); })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveAsTemplate = async () => {
    if (!newName.trim() || meals.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch('/api/meal-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          weekStartDate,
          meals,
        }),
      });
      if (res.ok) {
        const template = await res.json();
        setTemplates([template, ...templates]);
        setNewName('');
        setShowSave(false);
      }
    } catch {
      alert('Error al guardar plantilla');
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async (templateId: string) => {
    setApplying(templateId);
    try {
      const res = await fetch(`/api/meal-templates/${templateId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStartDate }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Plantilla aplicada: ${data.applied} comidas agregadas`);
        onApplied();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al aplicar');
      }
    } catch {
      alert('Error al aplicar plantilla');
    } finally {
      setApplying(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta plantilla?')) return;
    await fetch(`/api/meal-templates/${id}`, { method: 'DELETE' });
    setTemplates(templates.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-xl rounded-t-xl max-h-[80vh] flex flex-col shadow-xl">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Plantillas de Comida</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Save current week */}
          {meals.length > 0 && (
            <div>
              {!showSave ? (
                <Button variant="secondary" size="sm" onClick={() => setShowSave(true)} className="w-full">
                  Guardar semana actual como plantilla
                </Button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveAsTemplate()}
                    placeholder="Nombre de la plantilla..."
                    autoFocus
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button size="sm" onClick={handleSaveAsTemplate} disabled={saving || !newName.trim()}>
                    {saving ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Templates list */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No hay plantillas guardadas
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(t.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApply(t.id)}
                      disabled={applying === t.id}
                    >
                      {applying === t.id ? 'Aplicando...' : 'Aplicar'}
                    </Button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
