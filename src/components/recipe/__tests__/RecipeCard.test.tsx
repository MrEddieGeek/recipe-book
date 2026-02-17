import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecipeCard from '../RecipeCard';
import { Recipe } from '@/lib/adapters/types';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock FavoriteButton
vi.mock('../FavoriteButton', () => ({
  default: () => <button>favorite</button>,
}));

const mockRecipe: Recipe = {
  id: 'test-1',
  title: 'Tacos al Pastor',
  description: 'Deliciosos tacos mexicanos',
  prepTimeMinutes: 20,
  cookTimeMinutes: 15,
  servings: 4,
  ingredients: [
    { item: 'Carne de cerdo', amount: '500', unit: 'g' },
  ],
  instructions: [
    { step: 1, description: 'Preparar la carne' },
  ],
  tags: ['Mexicana', 'Tacos'],
  source: { type: 'manual', id: 'test-1', name: 'Manual' },
};

describe('RecipeCard', () => {
  it('renders recipe title', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('Tacos al Pastor')).toBeDefined();
  });

  it('renders recipe description', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('Deliciosos tacos mexicanos')).toBeDefined();
  });

  it('renders tags', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('Mexicana')).toBeDefined();
    expect(screen.getByText('Tacos')).toBeDefined();
  });

  it('renders time information', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('35 min')).toBeDefined();
  });

  it('links to recipe detail page', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/recipes/test-1');
  });
});
