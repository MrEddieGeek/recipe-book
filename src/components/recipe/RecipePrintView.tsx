import { Recipe } from '@/lib/adapters/types';

interface RecipePrintViewProps {
  recipe: Recipe;
}

export default function RecipePrintView({ recipe }: RecipePrintViewProps) {
  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  return (
    <div className="print-recipe max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>

      {recipe.description && (
        <p className="text-gray-600 mb-4 italic">{recipe.description}</p>
      )}

      {/* Meta */}
      <div className="flex gap-6 text-sm text-gray-600 mb-6 border-b pb-4">
        {recipe.prepTimeMinutes && recipe.prepTimeMinutes > 0 && (
          <span>Preparación: {recipe.prepTimeMinutes} min</span>
        )}
        {recipe.cookTimeMinutes && recipe.cookTimeMinutes > 0 && (
          <span>Cocción: {recipe.cookTimeMinutes} min</span>
        )}
        {totalTime > 0 && <span>Total: {totalTime} min</span>}
        {recipe.servings && <span>Porciones: {recipe.servings}</span>}
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Ingredients */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Ingredientes</h2>
          <ul className="space-y-1.5">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="inline-block w-3 h-3 mt-1 border border-gray-400 rounded-sm flex-shrink-0"></span>
                <span>
                  {ing.amount} {ing.unit} {ing.item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Instrucciones</h2>
          <ol className="space-y-3">
            {recipe.instructions.map((inst) => (
              <li key={inst.step} className="text-sm">
                <span className="font-bold mr-2">{inst.step}.</span>
                {inst.description}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {recipe.tags.length > 0 && (
        <div className="mt-6 pt-4 border-t text-sm text-gray-500">
          Etiquetas: {recipe.tags.join(', ')}
        </div>
      )}
    </div>
  );
}
