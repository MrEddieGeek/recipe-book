import { Ingredient } from '@/lib/adapters/types';

interface ConsolidatedIngredient extends Ingredient {
  originalItems: Ingredient[];
}

// Normalize ingredient name for grouping
function normalize(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    // Remove common suffixes/prefixes
    .replace(/\s*(fresco|fresca|picado|picada|rallado|rallada|molido|molida|en rodajas|en cubos|al gusto)\s*$/i, '')
    .trim();
}

// Check if two units are compatible for summing
function areUnitsCompatible(a: string, b: string): boolean {
  const normalize = (u: string) => u.toLowerCase().trim();
  const ua = normalize(a);
  const ub = normalize(b);

  if (ua === ub) return true;

  // Common unit aliases
  const aliases: Record<string, string[]> = {
    'taza': ['tazas', 'tz'],
    'cucharada': ['cucharadas', 'cda', 'cdas'],
    'cucharadita': ['cucharaditas', 'cdta', 'cdtas'],
    'gramo': ['gramos', 'g', 'gr'],
    'kilogramo': ['kilogramos', 'kg', 'kilo', 'kilos'],
    'litro': ['litros', 'l', 'lt'],
    'mililitro': ['mililitros', 'ml'],
    'unidad': ['unidades', 'pieza', 'piezas', 'und'],
  };

  for (const [, group] of Object.entries(aliases)) {
    const allForms = [Object.keys(aliases).find(k => aliases[k] === group)!, ...group];
    if (allForms.includes(ua) && allForms.includes(ub)) return true;
  }

  return false;
}

// Try to parse a numeric amount
function parseAmount(amount: string): number | null {
  const cleaned = amount.trim();
  // Handle fractions like "1/2"
  const fractionMatch = cleaned.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fractionMatch) {
    return parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]);
  }
  // Handle mixed like "1 1/2"
  const mixedMatch = cleaned.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixedMatch) {
    return parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
  }
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function formatAmount(num: number): string {
  if (Number.isInteger(num)) return num.toString();
  // Common fractions
  const fractions: [number, string][] = [
    [0.25, '1/4'], [0.33, '1/3'], [0.5, '1/2'],
    [0.66, '2/3'], [0.75, '3/4'],
  ];
  for (const [val, str] of fractions) {
    if (Math.abs(num - val) < 0.05) return str;
    if (num > 1) {
      const whole = Math.floor(num);
      const frac = num - whole;
      if (Math.abs(frac - val) < 0.05) return `${whole} ${str}`;
    }
  }
  return num.toFixed(1).replace(/\.0$/, '');
}

export function consolidateIngredients(ingredients: Ingredient[]): ConsolidatedIngredient[] {
  const groups = new Map<string, ConsolidatedIngredient>();

  for (const ing of ingredients) {
    const key = normalize(ing.item);
    const existing = groups.get(key);

    if (existing && areUnitsCompatible(existing.unit, ing.unit)) {
      const existingAmount = parseAmount(existing.amount);
      const newAmount = parseAmount(ing.amount);

      if (existingAmount !== null && newAmount !== null) {
        existing.amount = formatAmount(existingAmount + newAmount);
      } else {
        // Can't sum, just append
        existing.amount = `${existing.amount} + ${ing.amount}`;
      }
      existing.originalItems.push(ing);
    } else if (existing) {
      // Same ingredient, different unit — keep separate
      const altKey = `${key}_${ing.unit.toLowerCase()}`;
      const existingAlt = groups.get(altKey);
      if (existingAlt) {
        const ea = parseAmount(existingAlt.amount);
        const na = parseAmount(ing.amount);
        if (ea !== null && na !== null) {
          existingAlt.amount = formatAmount(ea + na);
        } else {
          existingAlt.amount = `${existingAlt.amount} + ${ing.amount}`;
        }
        existingAlt.originalItems.push(ing);
      } else {
        groups.set(altKey, { ...ing, originalItems: [ing] });
      }
    } else {
      groups.set(key, { ...ing, originalItems: [ing] });
    }
  }

  return Array.from(groups.values());
}
