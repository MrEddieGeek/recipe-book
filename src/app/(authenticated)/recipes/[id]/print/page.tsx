import { notFound } from 'next/navigation';
import { RecipeService } from '@/lib/services/recipe-service';
import RecipePrintView from '@/components/recipe/RecipePrintView';

interface PrintPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrintRecipePage({ params }: PrintPageProps) {
  const { id } = await params;
  const recipe = await RecipeService.getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  return <RecipePrintView recipe={recipe} />;
}
