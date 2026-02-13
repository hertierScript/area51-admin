-- Add customer_phone and customer_address columns to orders table
-- Run this in Supabase SQL Editor

-- Step 1: Add columns if they don't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT;

-- Step 2: Update existing orders with customer info from customers table
UPDATE orders o
SET 
  customer_phone = c.phone,
  customer_address = c.address
FROM customers c
WHERE o.customer_id = c.id AND o.customer_phone IS NULL;

-- Step 3: Verify the columns were added
SELECT id, customer_name, customer_phone, customer_address FROM orders LIMIT 5;
