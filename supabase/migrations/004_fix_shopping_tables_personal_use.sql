-- Fix shopping tables for personal use (no authentication)
-- Make user_id nullable and disable RLS

-- Make user_id nullable on shopping_lists
ALTER TABLE shopping_lists ALTER COLUMN user_id DROP NOT NULL;

-- Disable RLS on shopping tables
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all access to shopping_lists for personal use"
  ON shopping_lists
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to shopping_list_items for personal use"
  ON shopping_list_items
  FOR ALL
  USING (true)
  WITH CHECK (true);
