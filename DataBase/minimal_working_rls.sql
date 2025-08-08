-- =====================================================
-- MINIMAL WORKING RLS POLICIES
-- Only the essential policies needed for session creation to work
-- =====================================================

-- ===== STEP 1: ENABLE RLS ONLY ON ESSENTIAL TABLES =====
-- Start with just the tables needed for session creation
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_sessions ENABLE ROW LEVEL SECURITY;

-- ===== STEP 2: CREATE MINIMAL POLICIES FOR SESSION CREATION =====

-- USERS TABLE - Allow everything for now (we'll restrict later)
CREATE POLICY "users_all_access" ON users FOR ALL USING (true) WITH CHECK (true);

-- COOKING SESSIONS - Basic ownership policies  
CREATE POLICY "sessions_select_all" ON cooking_sessions FOR SELECT USING (true);
CREATE POLICY "sessions_insert_own" ON cooking_sessions FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
);
CREATE POLICY "sessions_update_own" ON cooking_sessions FOR UPDATE USING (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
);
CREATE POLICY "sessions_delete_own" ON cooking_sessions FOR DELETE USING (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
);

DO $$
BEGIN
  RAISE NOTICE '=== MINIMAL RLS POLICIES CREATED ===';
  RAISE NOTICE 'Only users and cooking_sessions tables have RLS enabled.';
  RAISE NOTICE 'All other tables remain without RLS for now.';
  RAISE NOTICE 'Try creating a session - it should work!';
END $$;