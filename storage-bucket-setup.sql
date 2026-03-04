-- Create storage bucket for menu images
-- Run this in Supabase SQL Editor

-- First, delete existing bucket if it exists to recreate with correct settings
DELETE FROM storage.buckets WHERE id = 'menu-images';

-- Insert the storage bucket with public access
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,  -- Make bucket public
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can upload to menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete from menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can view menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can view all menu-images" ON storage.objects;

-- Allow service role to upload files
CREATE POLICY "Service role can upload to menu-images"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'menu-images');

-- Allow service role to update files
CREATE POLICY "Service role can update menu-images"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'menu-images')
WITH CHECK (bucket_id = 'menu-images');

-- Allow service role to delete files
CREATE POLICY "Service role can delete from menu-images"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'menu-images')
WITH CHECK (bucket_id = 'menu-images');

-- Allow public read access to files (using anon role for public access)
CREATE POLICY "Public can view menu-images"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'menu-images');

-- Allow authenticated users to view files
CREATE POLICY "Authenticated can view menu-images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'menu-images');

-- Allow service role to view all files
CREATE POLICY "Service role can view all menu-images"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'menu-images');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA storage TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO postgres, service_role;
GRANT ALL ON FUNCTIONS IN SCHEMA storage TO postgres, service_role;

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
