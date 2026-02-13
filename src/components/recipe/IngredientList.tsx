import { Ingredient } from '@/lib/adapters/types';

interface IngredientListProps {
  ingredients: Ingredient[];
}

export default function IngredientList({ ingredients }: IngredientListProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Ingredientes</h2>
      <ul className="space-y-2">
        {ingredients.map((ingredient, index) => (
          <li
            key={index}
            className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium">
              {index + 1}
            </div>
            <div className="flex-1">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {ingredient.item}
              </span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">
                {ingredient.amount} {ingredient.unit}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
