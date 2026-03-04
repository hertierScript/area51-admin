-- Migration for deployed database - Run this in Supabase SQL Editor
-- This adds columns that may be missing from the deployed database

-- Add customer columns to orders table if they don't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT;

-- If columns already exist but are NULL, update existing orders with customer info
UPDATE orders o
SET 
    customer_name = COALESCE(o.customer_name, c.name),
    customer_phone = COALESCE(o.customer_phone, c.phone),
    customer_address = COALESCE(o.customer_address, c.address)
FROM customers c
WHERE o.customer_id = c.id
AND (o.customer_name IS NULL OR o.customer_phone IS NULL OR o.customer_address IS NULL);

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('customer_name', 'customer_phone', 'customer_address')
ORDER BY column_name;
