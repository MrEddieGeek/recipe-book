'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeService } from '@/lib/services/recipe-service';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface DeleteRecipeButtonProps {
  recipeId: string;
  recipeTitle: string;
}

export default function DeleteRecipeButton({
  recipeId,
  recipeTitle,
}: DeleteRecipeButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await RecipeService.deleteManualRecipe(recipeId);
      router.push('/recipes');
      router.refresh();
    } catch (error) {
      console.error('Error al eliminar receta:', error);
      alert('Error al eliminar la receta');
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="danger"
        size="sm"
      >
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Eliminar
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Eliminar Receta"
        footer={
          <>
            <Button
              onClick={() => setIsOpen(false)}
              variant="secondary"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              variant="danger"
              disabled={loading}
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          ¿Estás seguro de que quieres eliminar <strong>{recipeTitle}</strong>? Esta
          acción no se puede deshacer.
        </p>
      </Modal>
    </>
  );
}
