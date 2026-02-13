-- Fix customer_name in orders table
-- Run this in Supabase SQL Editor step by step

-- Step 1: Check if column exists and show current state
SELECT id, customer_name, customer_id, delivery_address FROM orders ORDER BY created_at DESC LIMIT 5;

-- Step 2: Update orders with customer names from customers table
UPDATE orders o
SET customer_name = c.name
FROM customers c
WHERE o.customer_id = c.id AND o.customer_name IS NULL;

-- Step 3: Verify the update
SELECT id, customer_name, customer_id FROM orders ORDER BY created_at DESC LIMIT 5;
