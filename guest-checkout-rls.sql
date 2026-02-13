-- Enable guest checkout by allowing public INSERT on orders, customers, and order_items
-- Run this in Supabase SQL Editor

-- Allow public to insert customers (for guest checkout)
CREATE POLICY "Public can create customers" ON customers
    FOR INSERT WITH CHECK (true);

-- Allow public to insert orders (for guest checkout)
CREATE POLICY "Public can create orders" ON orders
    FOR INSERT WITH CHECK (true);

-- Allow public to insert order_items (for guest checkout)
CREATE POLICY "Public can create order_items" ON order_items
    FOR INSERT WITH CHECK (true);
