import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RecipeService } from '@/lib/services/recipe-service';
import RecipeFormWrapper from './RecipeFormWrapper';

interface EditRecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch recipe
  const recipe = await RecipeService.getRecipeById(id, 'manual');

  if (!recipe) {
    notFound();
  }

  // Check if user owns this recipe
  const { data: dbRecipe } = await supabase
    .from('recipes')
    .select('user_id')
    .eq('id', id)
    .single();

  if (dbRecipe?.user_id !== user?.id) {
    redirect('/recipes');
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Recipe</h1>
      <RecipeFormWrapper recipe={recipe} />
    </div>
  );
}
