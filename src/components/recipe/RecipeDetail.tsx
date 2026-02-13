import Image from 'next/image';
import { Recipe } from '@/lib/adapters/types';
import RecipeSourceBadge from './RecipeSourceBadge';
import FavoriteButton from './FavoriteButton';
import IngredientList from './IngredientList';
import InstructionSteps from './InstructionSteps';

interface RecipeDetailProps {
  recipe: Recipe;
}

export default function RecipeDetail({ recipe }: RecipeDetailProps) {
  const totalTime =
    (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Image */}
      {recipe.imageUrl && (
        <div className="relative w-full h-64 sm:h-96 rounded-lg overflow-hidden mb-6">
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <RecipeSourceBadge
            sourceType={recipe.source.type}
            sourceName={recipe.source.name}
          />
          {recipe.source.type === 'manual' && (
            <FavoriteButton
              recipeId={recipe.id}
              initialFavorited={recipe.isFavorited}
              size="md"
            />
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          {recipe.title}
        </h1>

        {recipe.description && (
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{recipe.description}</p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-6 text-gray-700 dark:text-gray-300">
          {recipe.prepTimeMinutes && recipe.prepTimeMinutes > 0 && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Preparación</div>
                <div className="font-medium">{recipe.prepTimeMinutes} min</div>
              </div>
            </div>
          )}

          {recipe.cookTimeMinutes && recipe.cookTimeMinutes > 0 && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Cocción</div>
                <div className="font-medium">{recipe.cookTimeMinutes} min</div>
              </div>
            </div>
          )}

          {totalTime > 0 && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Tiempo Total</div>
                <div className="font-medium">{totalTime} min</div>
              </div>
            </div>
          )}

          {recipe.servings && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Porciones</div>
                <div className="font-medium">{recipe.servings}</div>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-2 gap-8">
        <IngredientList ingredients={recipe.ingredients} />
        <InstructionSteps instructions={recipe.instructions} />
      </div>
    </div>
  );
}
