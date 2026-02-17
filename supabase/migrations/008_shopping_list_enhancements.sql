-- 008: Shopping list enhancements
-- Run this in Supabase SQL Editor

-- Add sort_order for drag-drop reordering
ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Add price tracking
ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

-- Add share token for sharing lists
ALTER TABLE shopping_lists ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;
