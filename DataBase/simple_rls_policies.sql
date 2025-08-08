-- =====================================================
-- SIMPLE RLS POLICIES - CLEAN IMPLEMENTATION
-- Run this AFTER running force_reset_all_rls.sql
-- =====================================================

-- ===== STEP 1: RE-ENABLE RLS =====
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_challenges ENABLE ROW LEVEL SECURITY;

-- ===== STEP 2: CREATE SIMPLE, WORKING POLICIES =====

-- =====================================================
-- USERS TABLE - Simple but functional
-- =====================================================
CREATE POLICY "allow_read_users" ON users FOR SELECT USING (true);
CREATE POLICY "allow_insert_users" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "allow_update_own_user" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "allow_delete_own_user" ON users FOR DELETE USING (auth.uid() = id);

-- =====================================================
-- COOKING SESSIONS TABLE - Core functionality
-- =====================================================
CREATE POLICY "allow_read_sessions" ON cooking_sessions FOR SELECT USING (true);
CREATE POLICY "allow_create_own_session" ON cooking_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "allow_update_own_session" ON cooking_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "allow_delete_own_session" ON cooking_sessions FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- CHALLENGES TABLE - Simple access
-- =====================================================
CREATE POLICY "allow_read_challenges" ON challenges FOR SELECT USING (true);
CREATE POLICY "allow_create_challenges" ON challenges FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "allow_update_own_challenges" ON challenges FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "allow_delete_own_challenges" ON challenges FOR DELETE USING (auth.uid() = created_by);

-- =====================================================
-- CHALLENGE PARTICIPANTS - Simple participation
-- =====================================================
CREATE POLICY "allow_read_participants" ON challenge_participants FOR SELECT USING (true);
CREATE POLICY "allow_create_participation" ON challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "allow_update_own_participation" ON challenge_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "allow_delete_own_participation" ON challenge_participants FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- SOCIAL FEATURES - Basic functionality
-- =====================================================
-- FOLLOWERS
CREATE POLICY "allow_read_followers" ON followers FOR SELECT USING (true);
CREATE POLICY "allow_create_follow" ON followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "allow_delete_follow" ON followers FOR DELETE USING (auth.uid() = follower_id);

-- FRIEND REQUESTS
CREATE POLICY "allow_read_friend_requests" ON friend_requests FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "allow_create_friend_request" ON friend_requests FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "allow_update_friend_request" ON friend_requests FOR UPDATE USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "allow_delete_friend_request" ON friend_requests FOR DELETE USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- =====================================================
-- INTERACTIONS - Likes, Comments, Saves
-- =====================================================
-- LIKES
CREATE POLICY "allow_read_likes" ON likes FOR SELECT USING (true);
CREATE POLICY "allow_create_like" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "allow_delete_like" ON likes FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS
CREATE POLICY "allow_read_comments" ON comments FOR SELECT USING (true);
CREATE POLICY "allow_create_comment" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "allow_update_own_comment" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "allow_delete_own_comment" ON comments FOR DELETE USING (auth.uid() = user_id);

-- SAVED SESSIONS
CREATE POLICY "allow_read_own_saves" ON saved_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "allow_create_save" ON saved_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "allow_delete_save" ON saved_sessions FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- NOTIFICATIONS - Personal only
-- =====================================================
CREATE POLICY "allow_read_own_notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "allow_create_notification" ON notifications FOR INSERT WITH CHECK (user_id IS NOT NULL);
CREATE POLICY "allow_update_own_notification" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "allow_delete_own_notification" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- MESSAGES - Private messaging
-- =====================================================
CREATE POLICY "allow_read_own_messages" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "allow_send_message" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "allow_update_received_message" ON messages FOR UPDATE USING (auth.uid() = receiver_id);
CREATE POLICY "allow_delete_own_message" ON messages FOR DELETE USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- =====================================================
-- CLUBS - Community features
-- =====================================================
-- CLUBS
CREATE POLICY "allow_read_clubs" ON clubs FOR SELECT USING (true);
CREATE POLICY "allow_create_club" ON clubs FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "allow_update_own_club" ON clubs FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "allow_delete_own_club" ON clubs FOR DELETE USING (auth.uid() = created_by);

-- CLUB MEMBERS
CREATE POLICY "allow_read_club_members" ON club_members FOR SELECT USING (true);
CREATE POLICY "allow_join_club" ON club_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "allow_update_membership" ON club_members FOR UPDATE USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM clubs WHERE clubs.id = club_members.club_id AND clubs.created_by = auth.uid())
);
CREATE POLICY "allow_leave_club" ON club_members FOR DELETE USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM clubs WHERE clubs.id = club_members.club_id AND clubs.created_by = auth.uid())
);

-- CLUB CHALLENGES
CREATE POLICY "allow_read_club_challenges" ON club_challenges FOR SELECT USING (true);
CREATE POLICY "allow_assign_club_challenge" ON club_challenges FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM clubs WHERE clubs.id = club_challenges.club_id AND clubs.created_by = auth.uid())
);
CREATE POLICY "allow_remove_club_challenge" ON club_challenges FOR DELETE USING (
  EXISTS (SELECT 1 FROM clubs WHERE clubs.id = club_challenges.club_id AND clubs.created_by = auth.uid())
);

-- ===== COMPLETION MESSAGE =====
DO $$
BEGIN
  RAISE NOTICE '=== SIMPLE RLS POLICIES CREATED SUCCESSFULLY ===';
  RAISE NOTICE 'All core features now have basic but functional security.';
  RAISE NOTICE 'Users can create sessions, challenges, join clubs, and interact socially.';
  RAISE NOTICE 'You can now test session creation - it should work!';
END $$;