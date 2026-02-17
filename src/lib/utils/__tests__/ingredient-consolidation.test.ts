import { describe, it, expect } from 'vitest';
import { consolidateIngredients } from '../ingredient-consolidation';

describe('consolidateIngredients', () => {
  it('consolidates identical ingredients', () => {
    const result = consolidateIngredients([
      { item: 'Harina', amount: '2', unit: 'tazas' },
      { item: 'Harina', amount: '1', unit: 'tazas' },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe('3');
    expect(result[0].item).toBe('Harina');
  });

  it('keeps different ingredients separate', () => {
    const result = consolidateIngredients([
      { item: 'Sal', amount: '1', unit: 'cucharadita' },
      { item: 'Pimienta', amount: '1', unit: 'cucharadita' },
    ]);
    expect(result).toHaveLength(2);
  });

  it('handles case-insensitive matching', () => {
    const result = consolidateIngredients([
      { item: 'Tomate', amount: '2', unit: 'unidad' },
      { item: 'tomate', amount: '3', unit: 'unidad' },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe('5');
  });

  it('handles fractional amounts', () => {
    const result = consolidateIngredients([
      { item: 'Leche', amount: '1/2', unit: 'taza' },
      { item: 'Leche', amount: '1/2', unit: 'taza' },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe('1');
  });

  it('separates same ingredient with different incompatible units', () => {
    const result = consolidateIngredients([
      { item: 'Mantequilla', amount: '100', unit: 'gramos' },
      { item: 'Mantequilla', amount: '2', unit: 'cucharadas' },
    ]);
    expect(result).toHaveLength(2);
  });

  it('returns empty array for empty input', () => {
    const result = consolidateIngredients([]);
    expect(result).toHaveLength(0);
  });

  it('handles unit aliases (g vs gramos)', () => {
    const result = consolidateIngredients([
      { item: 'Azúcar', amount: '100', unit: 'g' },
      { item: 'Azúcar', amount: '50', unit: 'gramos' },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe('150');
  });
});
