-- =====================================================
-- DEBUG RLS ISSUE - TEMPORARILY DISABLE ALL RLS
-- This will help identify which table is causing the problem
-- =====================================================

-- STEP 1: Disable RLS on ALL tables to test
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE challenges DISABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE followers DISABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE saved_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE clubs DISABLE ROW LEVEL SECURITY;
ALTER TABLE club_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE club_challenges DISABLE ROW LEVEL SECURITY;

-- STEP 2: Check if there are any other tables with RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE rowsecurity = true;

-- STEP 3: Show all current policies (should be none after disabling)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

DO $$
BEGIN
  RAISE NOTICE '=== RLS DISABLED ON ALL TABLES FOR DEBUGGING ===';
  RAISE NOTICE 'Try creating a session now. If it works, the issue was RLS.';
  RAISE NOTICE 'If it still fails, the issue is elsewhere (data validation, constraints, etc.)';
  RAISE NOTICE 'Check the query results above to see which tables had RLS enabled.';
END $$;