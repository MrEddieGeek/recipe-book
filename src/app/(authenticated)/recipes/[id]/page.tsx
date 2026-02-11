import { notFound } from 'next/navigation';
import Link from 'next/link';
import { RecipeService } from '@/lib/services/recipe-service';
import RecipeDetail from '@/components/recipe/RecipeDetail';
import Button from '@/components/ui/Button';
import DeleteRecipeButton from '@/components/recipe/DeleteRecipeButton';

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;

  // Fetch recipe
  const recipe = await RecipeService.getRecipeById(id, 'manual');

  if (!recipe) {
    notFound();
  }

  // Personal use - always show edit/delete buttons
  const isOwner = true;

  return (
    <div>
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/recipes">
          <Button variant="ghost" size="sm">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Recipes
          </Button>
        </Link>

        {isOwner && (
          <div className="flex gap-2">
            <Link href={`/recipes/${id}/edit`}>
              <Button variant="secondary" size="sm">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </Button>
            </Link>
            <DeleteRecipeButton recipeId={id} recipeTitle={recipe.title} />
          </div>
        )}
      </div>

      {/* Recipe Content */}
      <RecipeDetail recipe={recipe} />
    </div>
  );
}
