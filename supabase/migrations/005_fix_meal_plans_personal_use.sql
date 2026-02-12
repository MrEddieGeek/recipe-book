-- Fix meal_plans table for personal use (no auth)
-- Make user_id nullable and add permissive RLS policies

-- Make user_id nullable
ALTER TABLE meal_plans ALTER COLUMN user_id DROP NOT NULL;

-- Enable RLS if not already
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all access to meal_plans" ON meal_plans;

-- Add permissive policy
CREATE POLICY "Allow all access to meal_plans"
  ON meal_plans FOR ALL
  USING (true) WITH CHECK (true);
