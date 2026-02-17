-- 010: Recipe nutrition columns
-- Run this in Supabase SQL Editor

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS calories_per_serving INTEGER;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS protein_grams DECIMAL(6,1);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS carbs_grams DECIMAL(6,1);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS fat_grams DECIMAL(6,1);
