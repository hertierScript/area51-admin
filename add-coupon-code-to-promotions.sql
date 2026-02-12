-- Add coupon code column to promotions table
-- Run this in Supabase SQL Editor

-- Add code column to promotions table
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS code VARCHAR(50);

-- Update existing promotions with coupon codes
-- Example: Update promotion to have a code
UPDATE promotions SET code = 'AREA51' WHERE name ILIKE '%area%';
UPDATE promotions SET code = 'FIRST20' WHERE name ILIKE '%first%';
UPDATE promotions SET code = 'WEEKEND15' WHERE name ILIKE '%weekend%';

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);

-- Allow NULL for code since not all promotions need a code
ALTER TABLE promotions ALTER COLUMN code DROP NOT NULL;

-- Enable RLS on code column
-- Note: RLS should already be enabled on the table from the schema
