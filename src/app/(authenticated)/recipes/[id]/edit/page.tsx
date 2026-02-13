import { notFound } from 'next/navigation';
import { RecipeService } from '@/lib/services/recipe-service';
import RecipeFormWrapper from './RecipeFormWrapper';

interface EditRecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params;

  const recipe = await RecipeService.getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Editar Receta</h1>
      <RecipeFormWrapper recipe={recipe} />
    </div>
  );
}
