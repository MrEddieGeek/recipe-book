-- 007: Recipe categories
-- Run this in Supabase SQL Editor

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  icon TEXT NOT NULL DEFAULT 'utensils',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Disable RLS for personal use
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Add category_id to recipes
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Seed default categories
INSERT INTO categories (name, color, icon) VALUES
  ('Desayuno', '#F59E0B', 'sunrise'),
  ('Almuerzo', '#10B981', 'sun'),
  ('Cena', '#6366F1', 'moon'),
  ('Postre', '#EC4899', 'cake'),
  ('Snack', '#F97316', 'cookie'),
  ('Bebida', '#06B6D4', 'cup')
ON CONFLICT (name) DO NOTHING;
