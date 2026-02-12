'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { Recipe, Ingredient, Instruction } from '@/lib/adapters/types';
import { RecipeFormSchema, RecipeFormData } from '@/lib/utils/validation';

interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  submitLabel?: string;
}

export default function RecipeForm({
  recipe,
  onSubmit,
  submitLabel = 'Guardar Receta',
}: RecipeFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [title, setTitle] = useState(recipe?.title || '');
  const [description, setDescription] = useState(recipe?.description || '');
  const [imageUrl, setImageUrl] = useState(recipe?.imageUrl || '');
  const [imagePreview, setImagePreview] = useState(recipe?.imageUrl || '');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(
    recipe?.prepTimeMinutes || 0
  );
  const [cookTimeMinutes, setCookTimeMinutes] = useState(
    recipe?.cookTimeMinutes || 0
  );
  const [servings, setServings] = useState(recipe?.servings || 4);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients || [{ item: '', amount: '', unit: '' }]
  );
  const [instructions, setInstructions] = useState<Instruction[]>(
    recipe?.instructions || [{ step: 1, description: '' }]
  );
  const [tags, setTags] = useState(recipe?.tags.join(', ') || '');

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB.');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to API
    setUploadingImage(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Error al subir imagen' }));
        throw new Error(data.error);
      }

      const { url } = await res.json();
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen.');
      setImagePreview(imageUrl); // Revert preview
    } finally {
      setUploadingImage(false);
    }
  };

  // Ingredient handlers
  const addIngredient = () => {
    setIngredients([...ingredients, { item: '', amount: '', unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  // Instruction handlers
  const addInstruction = () => {
    setInstructions([
      ...instructions,
      { step: instructions.length + 1, description: '' },
    ]);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const updated = instructions
        .filter((_, i) => i !== index)
        .map((inst, i) => ({ ...inst, step: i + 1 }));
      setInstructions(updated);
    }
  };

  const updateInstruction = (index: number, description: string) => {
    const updated = [...instructions];
    updated[index] = { ...updated[index], description };
    setInstructions(updated);
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);

      const formData = {
        title,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        prepTimeMinutes: prepTimeMinutes || undefined,
        cookTimeMinutes: cookTimeMinutes || undefined,
        servings: servings || undefined,
        ingredients,
        instructions,
        tags: parsedTags,
      };

      const validated = RecipeFormSchema.parse(formData);
      await onSubmit(validated);
    } catch (err: any) {
      if (err.errors) {
        setError(err.errors[0].message);
      } else {
        setError(err.message || 'Ocurrió un error');
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Información Básica</h2>

        <Input
          label="Título de la Receta"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ej., Spaghetti Carbonara"
          required
        />

        <Textarea
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Una breve descripción de tu receta..."
          rows={3}
        />

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foto de la Receta
          </label>

          {/* Preview */}
          {imagePreview && (
            <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={imagePreview}
                alt="Vista previa"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImageUrl('');
                  setImagePreview('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {uploadingImage ? 'Subiendo...' : 'Subir Foto'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Input
              placeholder="O pegar URL de imagen"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImagePreview(e.target.value);
              }}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Times & Servings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Detalles</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Preparación (minutos)"
            type="number"
            value={prepTimeMinutes}
            onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
            min="0"
          />

          <Input
            label="Cocción (minutos)"
            type="number"
            value={cookTimeMinutes}
            onChange={(e) => setCookTimeMinutes(Number(e.target.value))}
            min="0"
          />

          <Input
            label="Porciones"
            type="number"
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            min="1"
          />
        </div>

        <Input
          label="Etiquetas"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="ej., Italiana, Pasta, Rápida"
          helperText="Separa las etiquetas con comas"
        />
      </div>

      {/* Ingredients */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Ingredientes</h2>
          <Button type="button" onClick={addIngredient} size="sm" variant="secondary">
            Agregar Ingrediente
          </Button>
        </div>

        <div className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Ingrediente"
                value={ingredient.item}
                onChange={(e) =>
                  updateIngredient(index, 'item', e.target.value)
                }
                className="flex-1"
                required
              />
              <Input
                placeholder="Cantidad"
                value={ingredient.amount}
                onChange={(e) =>
                  updateIngredient(index, 'amount', e.target.value)
                }
                className="w-24"
                required
              />
              <Input
                placeholder="Unidad"
                value={ingredient.unit}
                onChange={(e) =>
                  updateIngredient(index, 'unit', e.target.value)
                }
                className="w-24"
                required
              />
              <Button
                type="button"
                onClick={() => removeIngredient(index)}
                variant="danger"
                size="sm"
                disabled={ingredients.length === 1}
              >
                <svg
                  className="w-5 h-5"
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
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Instrucciones</h2>
          <Button type="button" onClick={addInstruction} size="sm" variant="secondary">
            Agregar Paso
          </Button>
        </div>

        <div className="space-y-3">
          {instructions.map((instruction, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-semibold mt-2">
                {instruction.step}
              </div>
              <Textarea
                placeholder="Describe este paso..."
                value={instruction.description}
                onChange={(e) => updateInstruction(index, e.target.value)}
                rows={2}
                required
              />
              <Button
                type="button"
                onClick={() => removeInstruction(index)}
                variant="danger"
                size="sm"
                disabled={instructions.length === 1}
              >
                <svg
                  className="w-5 h-5"
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
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="button"
          onClick={() => router.back()}
          variant="secondary"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || uploadingImage} className="flex-1">
          {loading ? 'Guardando...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
