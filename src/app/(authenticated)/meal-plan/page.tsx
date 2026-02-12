'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

interface MealRecipe {
  id: string;
  title: string;
  image_url: string | null;
  ingredients: Array<{ item: string; amount: string; unit: string }>;
}

interface MealPlan {
  id: string;
  recipe_id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  servings: number;
  recipe: MealRecipe;
}

interface SearchRecipe {
  id: string;
  title: string;
  imageUrl?: string;
  source: { type: string };
}

const MEAL_TYPES = [
  { key: 'breakfast' as const, label: 'Desayuno' },
  { key: 'lunch' as const, label: 'Almuerzo' },
  { key: 'dinner' as const, label: 'Cena' },
];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DAY_NAMES_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function MealPlanPage() {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Recipe picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDate, setPickerDate] = useState('');
  const [pickerMealType, setPickerMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchRecipe[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);

  // Shopping list generation
  const [generatingList, setGeneratingList] = useState(false);
  const [listSuccess, setListSuccess] = useState('');

  const weekEnd = addDays(weekStart, 6);

  const fetchMeals = useCallback(async () => {
    setLoading(true);
    const start = formatDate(weekStart);
    const end = formatDate(addDays(weekStart, 6));
    const res = await fetch(`/api/meal-plans?startDate=${start}&endDate=${end}`);
    if (res.ok) {
      setMeals(await res.json());
    }
    setLoading(false);
  }, [weekStart]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const openPicker = (date: string, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setPickerDate(date);
    setPickerMealType(mealType);
    setPickerOpen(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  const searchRecipes = async (query: string) => {
    setSearching(true);
    const res = await fetch(`/api/recipes/search?q=${encodeURIComponent(query)}&source=manual`);
    if (res.ok) {
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : data.manual || []);
    }
    setSearching(false);
  };

  useEffect(() => {
    if (!pickerOpen) return;
    const timer = setTimeout(() => {
      searchRecipes(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, pickerOpen]);

  const handleAddMeal = async (recipeId: string) => {
    setAdding(true);
    try {
      const res = await fetch('/api/meal-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId,
          date: pickerDate,
          mealType: pickerMealType,
        }),
      });
      if (res.ok) {
        setPickerOpen(false);
        await fetchMeals();
      }
    } catch {
      alert('Error al agregar comida');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMeal = async (mealId: string) => {
    if (!confirm('¿Eliminar esta comida del plan?')) return;
    await fetch(`/api/meal-plans/${mealId}`, { method: 'DELETE' });
    setMeals(meals.filter((m) => m.id !== mealId));
  };

  const handleGenerateShoppingList = async () => {
    const start = formatDate(weekStart);
    const end = formatDate(addDays(weekStart, 6));
    const startLabel = weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const endLabel = addDays(weekStart, 6).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const listName = `Semana ${startLabel} - ${endLabel}`;

    setGeneratingList(true);
    try {
      const res = await fetch('/api/meal-plans/generate-shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: start, endDate: end, listName }),
      });
      if (res.ok) {
        const data = await res.json();
        setListSuccess(`Lista creada con ${data.itemCount} artículos`);
        setTimeout(() => setListSuccess(''), 4000);
      } else {
        const data = await res.json();
        alert(data.error || 'Error al generar lista');
      }
    } catch {
      alert('Error al generar lista de compras');
    } finally {
      setGeneratingList(false);
    }
  };

  const prevWeek = () => setWeekStart(addDays(weekStart, -7));
  const nextWeek = () => setWeekStart(addDays(weekStart, 7));
  const goToday = () => setWeekStart(getMonday(new Date()));

  const getMealsForSlot = (date: string, mealType: string) =>
    meals.filter((m) => m.date === date && m.meal_type === mealType);

  const weekLabel = `${weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} — ${weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const totalMeals = meals.length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Planificación de Comidas</h1>
        <div className="flex items-center gap-2">
          {totalMeals > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGenerateShoppingList}
              disabled={generatingList}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {generatingList ? 'Generando...' : 'Generar Lista'}
            </Button>
          )}
        </div>
      </div>

      {listSuccess && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {listSuccess}
        </div>
      )}

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-lg border border-gray-200 p-3">
        <button onClick={prevWeek} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <p className="font-semibold text-gray-900">{weekLabel}</p>
          <button onClick={goToday} className="text-xs text-blue-600 hover:text-blue-800">
            Ir a hoy
          </button>
        </div>
        <button onClick={nextWeek} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Desktop Grid (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-20 p-2 text-xs text-gray-500 font-medium"></th>
                  {Array.from({ length: 7 }, (_, i) => {
                    const day = addDays(weekStart, i);
                    const isToday = formatDate(day) === formatDate(new Date());
                    return (
                      <th
                        key={i}
                        className={`p-2 text-center ${isToday ? 'bg-blue-50 rounded-t-lg' : ''}`}
                      >
                        <div className="text-xs text-gray-500 font-medium">{DAY_NAMES[i]}</div>
                        <div className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                          {day.getDate()}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {MEAL_TYPES.map((mt) => (
                  <tr key={mt.key}>
                    <td className="p-2 text-xs text-gray-500 font-medium align-top pt-3">
                      {mt.label}
                    </td>
                    {Array.from({ length: 7 }, (_, i) => {
                      const day = addDays(weekStart, i);
                      const dateStr = formatDate(day);
                      const isToday = dateStr === formatDate(new Date());
                      const slotMeals = getMealsForSlot(dateStr, mt.key);

                      return (
                        <td
                          key={i}
                          className={`p-1 align-top border border-gray-100 min-h-[80px] ${isToday ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className="min-h-[70px] space-y-1">
                            {slotMeals.map((meal) => (
                              <div
                                key={meal.id}
                                className="group relative bg-white rounded-md border border-gray-200 p-1.5 text-xs hover:shadow-sm transition-shadow"
                              >
                                <div className="flex items-center gap-1.5">
                                  {meal.recipe?.image_url && (
                                    <Image
                                      src={meal.recipe.image_url}
                                      alt=""
                                      width={28}
                                      height={28}
                                      className="rounded object-cover w-7 h-7 flex-shrink-0"
                                    />
                                  )}
                                  <span className="font-medium text-gray-800 line-clamp-2 leading-tight">
                                    {meal.recipe?.title || 'Receta'}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleRemoveMeal(meal.id)}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  x
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => openPicker(dateStr, mt.key)}
                              className="w-full p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors flex items-center justify-center"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (hidden on desktop) */}
          <div className="md:hidden space-y-4">
            {Array.from({ length: 7 }, (_, i) => {
              const day = addDays(weekStart, i);
              const dateStr = formatDate(day);
              const isToday = dateStr === formatDate(new Date());
              const dayMeals = meals.filter((m) => m.date === dateStr);

              return (
                <div
                  key={i}
                  className={`bg-white rounded-lg border ${isToday ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'}`}
                >
                  <div className={`px-4 py-2 border-b ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
                    <span className={`font-semibold ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
                      {DAY_NAMES_FULL[i]}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      {day.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                    {isToday && <span className="text-xs text-blue-600 ml-2 font-medium">Hoy</span>}
                  </div>
                  <div className="p-3 space-y-3">
                    {MEAL_TYPES.map((mt) => {
                      const slotMeals = dayMeals.filter((m) => m.meal_type === mt.key);
                      return (
                        <div key={mt.key}>
                          <div className="text-xs text-gray-500 font-medium mb-1">{mt.label}</div>
                          {slotMeals.map((meal) => (
                            <div
                              key={meal.id}
                              className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg mb-1 group"
                            >
                              {meal.recipe?.image_url && (
                                <Image
                                  src={meal.recipe.image_url}
                                  alt=""
                                  width={40}
                                  height={40}
                                  className="rounded object-cover w-10 h-10 flex-shrink-0"
                                />
                              )}
                              <span className="flex-1 text-sm font-medium text-gray-800">
                                {meal.recipe?.title || 'Receta'}
                              </span>
                              <button
                                onClick={() => handleRemoveMeal(meal.id)}
                                className="text-gray-300 hover:text-red-500 p-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => openPicker(dateStr, mt.key)}
                            className="w-full py-2 text-sm text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Agregar
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Recipe Picker Modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setPickerOpen(false)} />
          <div className="relative bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-xl max-h-[80vh] flex flex-col shadow-xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Agregar Receta</h2>
                <button
                  onClick={() => setPickerOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {(() => {
                  const d = new Date(pickerDate + 'T12:00:00');
                  const dayName = DAY_NAMES_FULL[d.getDay() === 0 ? 6 : d.getDay() - 1];
                  const mealLabel = MEAL_TYPES.find((m) => m.key === pickerMealType)?.label;
                  return `${dayName} — ${mealLabel}`;
                })()}
              </p>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar receta..."
                autoFocus
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-2">
              {searching ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {searchQuery ? 'Sin resultados' : 'Busca una receta para agregar'}
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => handleAddMeal(recipe.id)}
                      disabled={adding}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-left disabled:opacity-50"
                    >
                      {recipe.imageUrl ? (
                        <Image
                          src={recipe.imageUrl}
                          alt=""
                          width={48}
                          height={48}
                          className="rounded-lg object-cover w-12 h-12 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <span className="font-medium text-gray-800">{recipe.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
