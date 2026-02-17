'use client';

import Image from 'next/image';

interface MealRecipe {
  id: string;
  title: string;
  image_url: string | null;
}

interface MealPlan {
  id: string;
  recipe_id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  servings: number;
  recipe: MealRecipe;
}

interface MonthlyCalendarProps {
  year: number;
  month: number; // 0-indexed
  meals: MealPlan[];
  onRemoveMeal: (id: string) => void;
  onAddMeal: (date: string, mealType: 'breakfast' | 'lunch' | 'dinner') => void;
}

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function MonthlyCalendar({ year, month, meals, onRemoveMeal, onAddMeal }: MonthlyCalendarProps) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday-based week offset
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const totalDays = lastDay.getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(startOffset).fill(null);

  for (let d = 1; d <= totalDays; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const todayStr = formatDate(new Date());

  const getMealsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return meals.filter((m) => m.date === dateStr);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {DAY_NAMES.map((name) => (
              <th key={name} className="p-2 text-xs text-gray-500 font-medium text-center">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((day, di) => {
                if (day === null) {
                  return <td key={di} className="p-1 border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30" />;
                }

                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = dateStr === todayStr;
                const dayMeals = getMealsForDay(day);

                return (
                  <td
                    key={di}
                    className={`p-1 align-top border border-gray-100 dark:border-gray-700 min-w-[100px] ${
                      isToday ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="min-h-[60px]">
                      <div className={`text-xs font-medium mb-1 ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                        {day}
                      </div>
                      {dayMeals.slice(0, 3).map((meal) => (
                        <div
                          key={meal.id}
                          className="group relative flex items-center gap-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-1 mb-0.5 text-[10px]"
                        >
                          {meal.recipe?.image_url && (
                            <Image
                              src={meal.recipe.image_url}
                              alt=""
                              width={16}
                              height={16}
                              className="rounded object-cover w-4 h-4 flex-shrink-0"
                            />
                          )}
                          <span className="truncate text-gray-700 dark:text-gray-300">
                            {meal.recipe?.title || 'Receta'}
                          </span>
                          <button
                            onClick={() => onRemoveMeal(meal.id)}
                            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white rounded-full text-[8px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100"
                          >
                            x
                          </button>
                        </div>
                      ))}
                      {dayMeals.length > 3 && (
                        <div className="text-[10px] text-gray-400">
                          +{dayMeals.length - 3} más
                        </div>
                      )}
                      <button
                        onClick={() => onAddMeal(dateStr, 'lunch')}
                        className="w-full p-0.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors flex items-center justify-center"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
}
