-- Add favorites column to recipes table
ALTER TABLE recipes ADD COLUMN is_favorited BOOLEAN DEFAULT false;
