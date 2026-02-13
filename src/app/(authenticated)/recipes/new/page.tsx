'use client';

import { useRouter } from 'next/navigation';
import { RecipeService } from '@/lib/services/recipe-service';
import RecipeForm from '@/components/recipe/RecipeForm';

export default function NewRecipePage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      const recipe = await RecipeService.createManualRecipe(data);
      router.push(`/recipes/${recipe.id}`);
      router.refresh();
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Crear Nueva Receta</h1>
      <RecipeForm onSubmit={handleSubmit} submitLabel="Crear Receta" />
    </div>
  );
}
