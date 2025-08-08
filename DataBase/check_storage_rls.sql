-- =====================================================
-- CHECK AND DISABLE STORAGE RLS POLICIES
-- The error might be coming from Supabase Storage, not database tables
-- =====================================================

-- Check if there are any storage policies that might be blocking
-- Note: Storage policies are managed differently in Supabase

-- STEP 1: Check current bucket policies (if any exist)
SELECT * FROM storage.objects WHERE bucket_id = 'plate-up' LIMIT 5;

-- STEP 2: List all storage buckets
SELECT * FROM storage.buckets;

-- STEP 3: Show storage policies (this might not work in SQL editor, but worth trying)
SELECT * FROM storage.policies;

DO $$
BEGIN
  RAISE NOTICE '=== STORAGE DEBUG INFORMATION ===';
  RAISE NOTICE 'Check the results above for storage bucket configuration.';
  RAISE NOTICE 'If the plate-up bucket does not exist, you need to create it.';
  RAISE NOTICE 'If it exists but has restrictive policies, that could be the issue.';
END $$;