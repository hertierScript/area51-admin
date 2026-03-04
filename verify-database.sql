-- Verify database structure for checkout to work

-- 1. Check orders table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY column_name;

-- 2. Check order_items table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'order_items'
ORDER BY column_name;

-- 3. Check if there are any orders in the table
SELECT COUNT(*) as order_count FROM orders;

-- 4. Test if we can insert into orders (this will fail if RLS blocks it)
-- Run this to check RLS policies:
SELECT * FROM pg_policies WHERE tablename = 'orders';
SELECT * FROM pg_policies WHERE tablename = 'order_items';
