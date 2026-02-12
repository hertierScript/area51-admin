-- Fix RLS policies for orders and order_items tables
-- Run this in Supabase SQL Editor

-- ============================================
-- ORDERS TABLE POLICIES
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Service role can manage orders" ON orders;
DROP POLICY IF EXISTS "Public can view orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

-- Allow authenticated users to INSERT orders (create new orders)
CREATE POLICY "Authenticated users can create orders" ON orders
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to SELECT all orders (admin dashboard)
CREATE POLICY "Authenticated users can view all orders" ON orders
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to UPDATE orders (admin dashboard)
CREATE POLICY "Authenticated users can update orders" ON orders
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow service_role to manage all orders
CREATE POLICY "Service role can manage orders" ON orders
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- ORDER_ITEMS TABLE POLICIES
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Service role can manage order_items" ON order_items;
DROP POLICY IF EXISTS "Public can view order_items" ON order_items;
DROP POLICY IF EXISTS "Authenticated users can create order items" ON order_items;
DROP POLICY IF EXISTS "Users can view order items for own orders" ON order_items;

-- Allow authenticated users to INSERT order_items (create order items)
CREATE POLICY "Authenticated users can create order items" ON order_items
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to SELECT all order_items (admin dashboard)
CREATE POLICY "Authenticated users can view all order items" ON order_items
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to UPDATE order_items (admin dashboard)
CREATE POLICY "Authenticated users can update order items" ON order_items
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow service_role to manage all order_items
CREATE POLICY "Service role can manage order_items" ON order_items
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE ON order_items TO authenticated;
GRANT ALL ON orders TO service_role;
GRANT ALL ON order_items TO service_role;

-- ============================================
-- VERIFY POLICIES
-- ============================================

SELECT 
  tablename,
  policyname as policy_name,
  cmd
FROM pg_policies
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, cmd;
