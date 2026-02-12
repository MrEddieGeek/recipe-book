import Link from 'next/link';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import RecipeSourceBadge from './RecipeSourceBadge';
import { Recipe } from '@/lib/adapters/types';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime =
    (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <Card variant="hover" padding="none">
        {/* Image */}
        <div className="relative w-full h-48 bg-gray-200">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Source Badge */}
          <div className="absolute top-2 right-2">
            <RecipeSourceBadge
              sourceType={recipe.source.type}
              sourceName={recipe.source.name}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {recipe.title}
          </h3>

          {recipe.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {recipe.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {totalTime > 0 && (
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{totalTime} min</span>
              </div>
            )}

            {recipe.servings && (
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>{recipe.servings} porciones</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {recipe.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                >
                  {tag}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className="text-xs px-2 py-1 text-gray-500">
                  +{recipe.tags.length - 3} más
                </span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
