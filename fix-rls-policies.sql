-- Fix RLS policies for customers table to allow signup flow
-- Run this in Supabase SQL Editor

-- 1. First, let's see what RLS policies currently exist
SELECT 
  policyname as policy_name,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'customers';

-- 2. Enable RLS if not already enabled
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing restrictive policies (if any)
DROP POLICY IF EXISTS "Allow public insert for authenticated users" ON customers;
DROP POLICY IF EXISTS "Users can insert their own data" ON customers;
DROP POLICY IF EXISTS "Anyone can view customers" ON customers;

-- 4. Create proper policies for signup flow

-- Allow anyone to insert (for signup flow)
-- This is needed because we create customer records during signup
CREATE POLICY "Allow public signup insert" ON customers
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to view their own data
CREATE POLICY "Users can view own customer data" ON customers
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own customer data" ON customers
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Grant table permissions
GRANT SELECT, INSERT, UPDATE ON customers TO authenticated;
GRANT SELECT, INSERT ON customers TO anon;

-- 6. Verify the policies
SELECT 
  policyname as policy_name,
  cmd
FROM pg_policies
WHERE tablename = 'customers'
ORDER BY cmd;
