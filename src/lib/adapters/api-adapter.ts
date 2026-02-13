// API recipe adapter - TheMealDB integration
// Free API: https://www.themealdb.com/api.php

import { RecipeAdapter } from './base-adapter';
import { Recipe, Ingredient, Instruction, RecipeSearchOptions } from './types';

const MEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1';

interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string;
  strSource: string;
  [key: string]: string | null;
}

function extractIngredients(meal: MealDBMeal): Ingredient[] {
  const ingredients: Ingredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const item = meal[`strIngredient${i}`]?.trim();
    const measure = meal[`strMeasure${i}`]?.trim();
    if (item && item !== '') {
      // Split measure into amount and unit where possible
      const measureStr = measure || '';
      const match = measureStr.match(/^([\d/.¼½¾⅓⅔⅛\s]+)\s*(.*)$/);
      ingredients.push({
        item,
        amount: match ? match[1].trim() : measureStr,
        unit: match ? match[2].trim() || 'al gusto' : 'al gusto',
      });
    }
  }
  return ingredients;
}

function parseInstructions(text: string): Instruction[] {
  // TheMealDB instructions are a single block of text.
  // Split by newlines or numbered steps.
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Remove step numbering like "1.", "Step 1:", "STEP 1:" etc.
  return lines.map((description, i) => ({
    step: i + 1,
    description: description.replace(/^(step\s*)?\d+[.):\s]*/i, '').trim(),
  }));
}

function mealToRecipe(meal: MealDBMeal): Recipe {
  const tags: string[] = [];
  if (meal.strTags) {
    tags.push(...meal.strTags.split(',').map((t) => t.trim()).filter(Boolean));
  }
  if (meal.strCategory) tags.push(meal.strCategory);
  if (meal.strArea) tags.push(meal.strArea);

  return {
    id: `mealdb-${meal.idMeal}`,
    title: meal.strMeal,
    description: `Plato de ${meal.strCategory} — Cocina ${meal.strArea}`,
    imageUrl: meal.strMealThumb,
    ingredients: extractIngredients(meal),
    instructions: parseInstructions(meal.strInstructions),
    tags: [...new Set(tags)], // deduplicate
    source: {
      type: 'api',
      id: meal.idMeal,
      name: 'TheMealDB',
    },
  };
}

export class ApiRecipeAdapter extends RecipeAdapter {
  readonly sourceType = 'api' as const;

  async getRecipeById(id: string): Promise<Recipe | null> {
    // Strip the "mealdb-" prefix if present
    const mealId = id.replace('mealdb-', '');

    // Validate ID is numeric to prevent injection
    if (!/^\d+$/.test(mealId)) {
      return null;
    }

    try {
      const res = await fetch(`${MEALDB_BASE}/lookup.php?i=${mealId}`, {
        next: { revalidate: 3600 }, // cache for 1 hour
      });
      const json = await res.json();

      if (!json.meals || json.meals.length === 0) return null;
      return mealToRecipe(json.meals[0]);
    } catch (error) {
      console.error('TheMealDB lookup error:', error);
      return null;
    }
  }

  async searchRecipes(options: RecipeSearchOptions): Promise<Recipe[]> {
    const results: Recipe[] = [];

    try {
      if (options.query) {
        // Search by name
        const res = await fetch(
          `${MEALDB_BASE}/search.php?s=${encodeURIComponent(options.query)}`,
          { next: { revalidate: 3600 } }
        );
        const json = await res.json();
        if (json.meals) {
          results.push(...json.meals.map(mealToRecipe));
        }
      } else {
        // No query — return a random selection
        const fetches = Array.from({ length: 8 }, () =>
          fetch(`${MEALDB_BASE}/random.php`, { cache: 'no-store' })
            .then((r) => r.json())
            .then((j) => (j.meals ? mealToRecipe(j.meals[0]) : null))
            .catch(() => null)
        );
        const randomMeals = await Promise.all(fetches);
        results.push(...randomMeals.filter((m): m is Recipe => m !== null));
      }
    } catch (error) {
      console.error('TheMealDB search error:', error);
    }

    // Filter by tags if specified
    if (options.tags && options.tags.length > 0) {
      const lowerTags = options.tags.map((t) => t.toLowerCase());
      return results.filter((r) =>
        r.tags.some((t) => lowerTags.includes(t.toLowerCase()))
      );
    }

    const limit = options.maxResults || 20;
    return results.slice(0, limit);
  }

  /**
   * Fetch all available categories from TheMealDB
   */
  async getCategories(): Promise<string[]> {
    try {
      const res = await fetch(`${MEALDB_BASE}/list.php?c=list`, {
        next: { revalidate: 86400 }, // cache for 24h
      });
      const json = await res.json();
      return json.meals?.map((m: { strCategory: string }) => m.strCategory) || [];
    } catch {
      return [];
    }
  }

  /**
   * Fetch all available areas/cuisines
   */
  async getAreas(): Promise<string[]> {
    try {
      const res = await fetch(`${MEALDB_BASE}/list.php?a=list`, {
        next: { revalidate: 86400 },
      });
      const json = await res.json();
      return json.meals?.map((m: { strArea: string }) => m.strArea) || [];
    } catch {
      return [];
    }
  }

  /**
   * Search by category (e.g. "Chicken", "Seafood")
   */
  async searchByCategory(category: string): Promise<Recipe[]> {
    try {
      const res = await fetch(
        `${MEALDB_BASE}/filter.php?c=${encodeURIComponent(category)}`,
        { next: { revalidate: 3600 } }
      );
      const json = await res.json();
      if (!json.meals) return [];

      // filter.php only returns id, name, thumb — fetch full details
      const detailed = await Promise.all(
        json.meals.slice(0, 12).map((m: { idMeal: string }) =>
          this.getRecipeById(m.idMeal)
        )
      );
      return detailed.filter((r): r is Recipe => r !== null);
    } catch (error) {
      console.error('TheMealDB category search error:', error);
      return [];
    }
  }
}
