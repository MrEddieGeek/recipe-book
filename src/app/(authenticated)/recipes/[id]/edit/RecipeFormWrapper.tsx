'use client';

import { useRouter, useParams } from 'next/navigation';
import { RecipeService } from '@/lib/services/recipe-service';
import RecipeForm from '@/components/recipe/RecipeForm';
import { Recipe } from '@/lib/adapters/types';

interface RecipeFormWrapperProps {
  recipe: Recipe;
}

export default function RecipeFormWrapper({ recipe }: RecipeFormWrapperProps) {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const handleSubmit = async (data: any) => {
    try {
      await RecipeService.updateManualRecipe(id, data);
      router.push(`/recipes/${id}`);
      router.refresh();
    } catch (error) {
      throw error;
    }
  };

  return (
    <RecipeForm recipe={recipe} onSubmit={handleSubmit} submitLabel="Actualizar Receta" />
  );
}
