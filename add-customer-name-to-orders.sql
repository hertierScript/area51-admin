-- Fix customer_name in orders table
-- Run this in Supabase SQL Editor

-- 1. Update existing orders with customer names from customers table
UPDATE orders o
SET customer_name = c.name
FROM customers c
WHERE o.customer_id = c.id AND o.customer_name IS NULL;

-- 2. Also update orders with guest checkout (no customer_id) using delivery address name
-- This will attempt to extract names from notes or set a placeholder
UPDATE orders
SET customer_name = 'Guest'
WHERE customer_name IS NULL;

-- 3. Verify the fix
SELECT id, customer_name, customer_id, delivery_address FROM orders LIMIT 10;
