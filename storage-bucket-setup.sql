-- Create storage bucket for menu images
-- Run this in Supabase SQL Editor

-- Insert the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create policies for the bucket
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
USING (bucket_id = 'menu-images');

-- Allow public read access to files
CREATE POLICY "Public can view menu-images"
ON storage.objects FOR SELECT
TO public
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
GRANT ALL ON ALL FUNCTIONS IN SCHEMA storage TO postgres, service_role;

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
