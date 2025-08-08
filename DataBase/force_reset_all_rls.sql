-- =====================================================
-- FORCE RESET ALL RLS POLICIES - NUCLEAR OPTION
-- This will completely wipe and recreate all RLS policies
-- =====================================================

-- ===== STEP 1: DISABLE RLS TEMPORARILY =====
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

-- ===== STEP 2: FORCE DROP ALL POSSIBLE POLICIES =====
-- Use IF EXISTS to avoid errors, drop any policy that might exist

-- Users table - all possible policy names
DROP POLICY IF EXISTS "Users can read any profile" ON users CASCADE;
DROP POLICY IF EXISTS "Users can update their own profile" ON users CASCADE;
DROP POLICY IF EXISTS "Users can delete their own profile" ON users CASCADE;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users CASCADE;
DROP POLICY IF EXISTS "Allow user creation" ON users CASCADE;
DROP POLICY IF EXISTS "Allow authenticated user creation" ON users CASCADE;
DROP POLICY IF EXISTS "users_can_create_own_profile" ON users CASCADE;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON users CASCADE;
DROP POLICY IF EXISTS "users_can_delete_own_profile" ON users CASCADE;
DROP POLICY IF EXISTS "anyone_can_view_public_profiles" ON users CASCADE;

-- Cooking sessions - all possible policy names
DROP POLICY IF EXISTS "Public can view all sessions" ON cooking_sessions CASCADE;
DROP POLICY IF EXISTS "Users can insert their own session" ON cooking_sessions CASCADE;
DROP POLICY IF EXISTS "Users can update their own session" ON cooking_sessions CASCADE;
DROP POLICY IF EXISTS "Users can delete their own session" ON cooking_sessions CASCADE;
DROP POLICY IF EXISTS "anyone_can_view_public_sessions" ON cooking_sessions CASCADE;
DROP POLICY IF EXISTS "users_can_create_own_sessions" ON cooking_sessions CASCADE;
DROP POLICY IF EXISTS "users_can_update_own_sessions" ON cooking_sessions CASCADE;
DROP POLICY IF EXISTS "users_can_delete_own_sessions" ON cooking_sessions CASCADE;

-- Challenges - all possible policy names
DROP POLICY IF EXISTS "Everyone can view challenges" ON challenges CASCADE;
DROP POLICY IF EXISTS "Users can insert their own challenge" ON challenges CASCADE;
DROP POLICY IF EXISTS "Users can update their own challenges" ON challenges CASCADE;
DROP POLICY IF EXISTS "Users can delete their own challenges" ON challenges CASCADE;
DROP POLICY IF EXISTS "anyone_can_view_active_challenges" ON challenges CASCADE;
DROP POLICY IF EXISTS "users_can_create_challenges" ON challenges CASCADE;
DROP POLICY IF EXISTS "creators_can_update_challenges" ON challenges CASCADE;
DROP POLICY IF EXISTS "creators_can_delete_challenges" ON challenges CASCADE;

-- Challenge participants - all possible policy names
DROP POLICY IF EXISTS "Public can see challenge participation" ON challenge_participants CASCADE;
DROP POLICY IF EXISTS "Users can insert their own participation" ON challenge_participants CASCADE;
DROP POLICY IF EXISTS "Users can update their own participation" ON challenge_participants CASCADE;
DROP POLICY IF EXISTS "users_can_view_challenge_participation" ON challenge_participants CASCADE;
DROP POLICY IF EXISTS "users_can_participate_in_challenges" ON challenge_participants CASCADE;
DROP POLICY IF EXISTS "users_can_update_own_participation" ON challenge_participants CASCADE;
DROP POLICY IF EXISTS "users_can_delete_own_participation" ON challenge_participants CASCADE;

-- Followers - all possible policy names
DROP POLICY IF EXISTS "Public can view followers" ON followers CASCADE;
DROP POLICY IF EXISTS "Users can follow" ON followers CASCADE;
DROP POLICY IF EXISTS "Users can unfollow" ON followers CASCADE;
DROP POLICY IF EXISTS "users_can_view_follow_relationships" ON followers CASCADE;
DROP POLICY IF EXISTS "users_can_follow_others" ON followers CASCADE;
DROP POLICY IF EXISTS "users_can_unfollow_others" ON followers CASCADE;

-- Friend requests - all possible policy names
DROP POLICY IF EXISTS "Public can view requests" ON friend_requests CASCADE;
DROP POLICY IF EXISTS "Users can send requests" ON friend_requests CASCADE;
DROP POLICY IF EXISTS "Users can cancel requests" ON friend_requests CASCADE;
DROP POLICY IF EXISTS "users_can_view_relevant_friend_requests" ON friend_requests CASCADE;
DROP POLICY IF EXISTS "users_can_send_friend_requests" ON friend_requests CASCADE;
DROP POLICY IF EXISTS "users_can_manage_friend_requests" ON friend_requests CASCADE;
DROP POLICY IF EXISTS "users_can_delete_friend_requests" ON friend_requests CASCADE;

-- Likes - all possible policy names
DROP POLICY IF EXISTS "Public can view likes" ON likes CASCADE;
DROP POLICY IF EXISTS "Users can like" ON likes CASCADE;
DROP POLICY IF EXISTS "Users can unlike" ON likes CASCADE;
DROP POLICY IF EXISTS "users_can_view_likes" ON likes CASCADE;
DROP POLICY IF EXISTS "users_can_like_sessions" ON likes CASCADE;
DROP POLICY IF EXISTS "users_can_unlike_sessions" ON likes CASCADE;

-- Saved sessions - all possible policy names
DROP POLICY IF EXISTS "Public can view saved sessions" ON saved_sessions CASCADE;
DROP POLICY IF EXISTS "Users can save sessions" ON saved_sessions CASCADE;
DROP POLICY IF EXISTS "Users can unsave sessions" ON saved_sessions CASCADE;
DROP POLICY IF EXISTS "users_can_view_own_saved_sessions" ON saved_sessions CASCADE;
DROP POLICY IF EXISTS "users_can_save_sessions" ON saved_sessions CASCADE;
DROP POLICY IF EXISTS "users_can_unsave_sessions" ON saved_sessions CASCADE;

-- Comments - all possible policy names
DROP POLICY IF EXISTS "Public can view comments" ON comments CASCADE;
DROP POLICY IF EXISTS "Users can insert comments" ON comments CASCADE;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments CASCADE;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments CASCADE;
DROP POLICY IF EXISTS "users_can_view_comments" ON comments CASCADE;
DROP POLICY IF EXISTS "users_can_comment_on_sessions" ON comments CASCADE;
DROP POLICY IF EXISTS "users_can_update_own_comments" ON comments CASCADE;
DROP POLICY IF EXISTS "users_can_delete_own_comments" ON comments CASCADE;

-- Notifications - all possible policy names
DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications CASCADE;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications CASCADE;
DROP POLICY IF EXISTS "users_can_view_own_notifications" ON notifications CASCADE;
DROP POLICY IF EXISTS "system_can_create_notifications" ON notifications CASCADE;
DROP POLICY IF EXISTS "users_can_update_own_notifications" ON notifications CASCADE;
DROP POLICY IF EXISTS "users_can_delete_own_notifications" ON notifications CASCADE;

-- Messages - all possible policy names
DROP POLICY IF EXISTS "Users can read their own messages" ON messages CASCADE;
DROP POLICY IF EXISTS "Users can send messages" ON messages CASCADE;
DROP POLICY IF EXISTS "Users can update received messages" ON messages CASCADE;
DROP POLICY IF EXISTS "users_can_view_their_messages" ON messages CASCADE;
DROP POLICY IF EXISTS "users_can_send_messages" ON messages CASCADE;
DROP POLICY IF EXISTS "users_can_update_received_messages" ON messages CASCADE;
DROP POLICY IF EXISTS "users_can_delete_their_messages" ON messages CASCADE;

-- Clubs - all possible policy names
DROP POLICY IF EXISTS "Public can view clubs" ON clubs CASCADE;
DROP POLICY IF EXISTS "Users can create clubs" ON clubs CASCADE;
DROP POLICY IF EXISTS "Club owner can update club" ON clubs CASCADE;
DROP POLICY IF EXISTS "Club owner can delete club" ON clubs CASCADE;
DROP POLICY IF EXISTS "users_can_view_public_clubs_and_own_clubs" ON clubs CASCADE;
DROP POLICY IF EXISTS "users_can_create_clubs" ON clubs CASCADE;
DROP POLICY IF EXISTS "club_owners_can_update_clubs" ON clubs CASCADE;
DROP POLICY IF EXISTS "club_owners_can_delete_clubs" ON clubs CASCADE;

-- Club members - all possible policy names
DROP POLICY IF EXISTS "Users can view club memberships" ON club_members CASCADE;
DROP POLICY IF EXISTS "Users can join a club" ON club_members CASCADE;
DROP POLICY IF EXISTS "Users can leave a club" ON club_members CASCADE;
DROP POLICY IF EXISTS "users_can_view_club_memberships" ON club_members CASCADE;
DROP POLICY IF EXISTS "users_can_join_clubs" ON club_members CASCADE;
DROP POLICY IF EXISTS "users_and_owners_can_manage_memberships" ON club_members CASCADE;
DROP POLICY IF EXISTS "users_can_leave_clubs" ON club_members CASCADE;

-- Club challenges - all possible policy names
DROP POLICY IF EXISTS "Public can view club challenges" ON club_challenges CASCADE;
DROP POLICY IF EXISTS "Club owner can assign challenge to club" ON club_challenges CASCADE;
DROP POLICY IF EXISTS "club_members_can_view_club_challenges" ON club_challenges CASCADE;
DROP POLICY IF EXISTS "club_owners_can_assign_challenges" ON club_challenges CASCADE;
DROP POLICY IF EXISTS "club_owners_can_remove_challenges" ON club_challenges CASCADE;

-- ===== STEP 3: DROP ANY EXISTING FUNCTIONS =====
DROP FUNCTION IF EXISTS is_authenticated() CASCADE;
DROP FUNCTION IF EXISTS is_club_member(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_club_owner(UUID) CASCADE;

-- ===== CONFIRMATION MESSAGE =====
DO $$
BEGIN
  RAISE NOTICE '=== ALL RLS POLICIES AND FUNCTIONS HAVE BEEN COMPLETELY REMOVED ===';
  RAISE NOTICE 'Tables are now in a clean state with RLS disabled.';
  RAISE NOTICE 'You can now run the complete_rls_reset.sql script safely.';
END $$;