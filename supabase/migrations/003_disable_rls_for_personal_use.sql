-- Disable RLS for personal use (no authentication required)
-- WARNING: Only use this for personal/private deployments!

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own manual recipes" ON recipes;
DROP POLICY IF EXISTS "Users can create manual recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update their own manual recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete their own manual recipes" ON recipes;
DROP POLICY IF EXISTS "Anyone can view API/AI recipes" ON recipes;

-- Create permissive policies for personal use
CREATE POLICY "Allow all access to recipes for personal use"
  ON recipes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: You can also completely disable RLS if this is truly personal
-- ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
