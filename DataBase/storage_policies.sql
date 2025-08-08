-- =====================================================
-- SUPABASE STORAGE POLICIES FOR IMAGE UPLOADS
-- Run this if image uploads are failing
-- =====================================================

-- Create storage bucket if it doesn't exist (this might need to be done in the dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('plate-up', 'plate-up', true);

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to upload their own images
CREATE POLICY "Users can upload their own images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'plate-up' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy to allow users to view all images (public bucket)
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'plate-up');

-- Policy to allow users to update/delete their own images
CREATE POLICY "Users can update their own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'plate-up' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'plate-up' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DO $$
BEGIN
  RAISE NOTICE '=== STORAGE POLICIES CREATED ===';
  RAISE NOTICE 'Users can now upload images to the plate-up bucket.';
  RAISE NOTICE 'Make sure the plate-up bucket exists and is public.';
END $$;