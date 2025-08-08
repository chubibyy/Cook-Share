-- =====================================================
-- COMPLETE RLS POLICIES RESET AND RECREATION
-- CookShare - Comprehensive Security Implementation
-- =====================================================

-- ===== STEP 1: DROP ALL EXISTING POLICIES =====
-- Users table policies
DROP POLICY IF EXISTS "Users can read any profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Allow user creation" ON users;
DROP POLICY IF EXISTS "Allow authenticated user creation" ON users;

-- Cooking sessions table policies
DROP POLICY IF EXISTS "Public can view all sessions" ON cooking_sessions;
DROP POLICY IF EXISTS "Users can insert their own session" ON cooking_sessions;
DROP POLICY IF EXISTS "Users can update their own session" ON cooking_sessions;
DROP POLICY IF EXISTS "Users can delete their own session" ON cooking_sessions;

-- Challenges table policies
DROP POLICY IF EXISTS "Everyone can view challenges" ON challenges;
DROP POLICY IF EXISTS "Users can insert their own challenge" ON challenges;
DROP POLICY IF EXISTS "Users can update their own challenges" ON challenges;
DROP POLICY IF EXISTS "Users can delete their own challenges" ON challenges;

-- Challenge participants table policies
DROP POLICY IF EXISTS "Public can see challenge participation" ON challenge_participants;
DROP POLICY IF EXISTS "Users can insert their own participation" ON challenge_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON challenge_participants;

-- Social features policies
DROP POLICY IF EXISTS "Public can view followers" ON followers;
DROP POLICY IF EXISTS "Users can follow" ON followers;
DROP POLICY IF EXISTS "Users can unfollow" ON followers;

DROP POLICY IF EXISTS "Public can view requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can send requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can cancel requests" ON friend_requests;

-- Interaction policies
DROP POLICY IF EXISTS "Public can view likes" ON likes;
DROP POLICY IF EXISTS "Users can like" ON likes;
DROP POLICY IF EXISTS "Users can unlike" ON likes;

DROP POLICY IF EXISTS "Public can view saved sessions" ON saved_sessions;
DROP POLICY IF EXISTS "Users can save sessions" ON saved_sessions;
DROP POLICY IF EXISTS "Users can unsave sessions" ON saved_sessions;

DROP POLICY IF EXISTS "Public can view comments" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- Notification policies
DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;

-- Message policies
DROP POLICY IF EXISTS "Users can read their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update received messages" ON messages;

-- Club policies
DROP POLICY IF EXISTS "Public can view clubs" ON clubs;
DROP POLICY IF EXISTS "Users can create clubs" ON clubs;
DROP POLICY IF EXISTS "Club owner can update club" ON clubs;
DROP POLICY IF EXISTS "Club owner can delete club" ON clubs;

DROP POLICY IF EXISTS "Users can view club memberships" ON club_members;
DROP POLICY IF EXISTS "Users can join a club" ON club_members;
DROP POLICY IF EXISTS "Users can leave a club" ON club_members;

DROP POLICY IF EXISTS "Public can view club challenges" ON club_challenges;
DROP POLICY IF EXISTS "Club owner can assign challenge to club" ON club_challenges;

-- ===== STEP 2: ENSURE RLS IS ENABLED =====
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

-- ===== STEP 3: CREATE COMPREHENSIVE RLS POLICIES =====

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================
-- Anyone can view public user profiles
CREATE POLICY "anyone_can_view_public_profiles" ON users
  FOR SELECT USING (
    is_private = false OR 
    auth.uid() = id OR
    auth.uid() IN (
      SELECT follower_id FROM followers WHERE followed_id = users.id
    )
  );

-- Users can insert their own profile during signup
CREATE POLICY "users_can_create_own_profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_can_update_own_profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "users_can_delete_own_profile" ON users
  FOR DELETE USING (auth.uid() = id);

-- =====================================================
-- COOKING SESSIONS TABLE POLICIES
-- =====================================================
-- Anyone can view public cooking sessions
CREATE POLICY "anyone_can_view_public_sessions" ON cooking_sessions
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      -- Public sessions from public users
      EXISTS (SELECT 1 FROM users WHERE users.id = cooking_sessions.user_id AND users.is_private = false)
      OR
      -- Own sessions
      auth.uid() = user_id
      OR
      -- Sessions from users they follow
      EXISTS (
        SELECT 1 FROM followers 
        WHERE follower_id = auth.uid() AND followed_id = cooking_sessions.user_id
      )
      OR
      -- Club sessions for club members
      (
        club_id IS NOT NULL AND 
        EXISTS (
          SELECT 1 FROM club_members 
          WHERE club_id = cooking_sessions.club_id AND user_id = auth.uid()
        )
      )
    )
  );

-- Authenticated users can create their own sessions
CREATE POLICY "users_can_create_own_sessions" ON cooking_sessions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL AND
    -- If club_id is specified, user must be a member of that club
    (
      club_id IS NULL OR 
      EXISTS (
        SELECT 1 FROM club_members 
        WHERE club_id = cooking_sessions.club_id AND user_id = auth.uid()
      )
    )
  );

-- Users can update their own sessions
CREATE POLICY "users_can_update_own_sessions" ON cooking_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "users_can_delete_own_sessions" ON cooking_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- CHALLENGES TABLE POLICIES
-- =====================================================
-- Everyone can view active challenges
CREATE POLICY "anyone_can_view_active_challenges" ON challenges
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    (end_date IS NULL OR end_date >= CURRENT_DATE)
  );

-- Authenticated users can create challenges (future: might restrict to admins)
CREATE POLICY "users_can_create_challenges" ON challenges
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    auth.uid() IS NOT NULL
  );

-- Challenge creators can update their challenges
CREATE POLICY "creators_can_update_challenges" ON challenges
  FOR UPDATE USING (auth.uid() = created_by);

-- Challenge creators can delete their challenges
CREATE POLICY "creators_can_delete_challenges" ON challenges
  FOR DELETE USING (auth.uid() = created_by);

-- =====================================================
-- CHALLENGE PARTICIPANTS TABLE POLICIES
-- =====================================================
-- Users can view challenge participation
CREATE POLICY "users_can_view_challenge_participation" ON challenge_participants
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = user_id OR  -- Own participation
      EXISTS (SELECT 1 FROM challenges WHERE challenges.id = challenge_participants.challenge_id)  -- Challenge exists
    )
  );

-- Users can participate in challenges
CREATE POLICY "users_can_participate_in_challenges" ON challenge_participants
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM challenges 
      WHERE challenges.id = challenge_participants.challenge_id 
      AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    )
  );

-- Users can update their own participation
CREATE POLICY "users_can_update_own_participation" ON challenge_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own participation
CREATE POLICY "users_can_delete_own_participation" ON challenge_participants
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- SOCIAL FEATURES POLICIES
-- =====================================================
-- FOLLOWERS TABLE
CREATE POLICY "users_can_view_follow_relationships" ON followers
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = follower_id OR  -- Own following list
      auth.uid() = followed_id OR  -- Own followers list
      -- Public profiles
      EXISTS (SELECT 1 FROM users WHERE users.id = followed_id AND users.is_private = false)
    )
  );

CREATE POLICY "users_can_follow_others" ON followers
  FOR INSERT WITH CHECK (
    auth.uid() = follower_id AND
    auth.uid() IS NOT NULL AND
    follower_id != followed_id  -- Can't follow yourself
  );

CREATE POLICY "users_can_unfollow_others" ON followers
  FOR DELETE USING (auth.uid() = follower_id);

-- FRIEND REQUESTS TABLE
CREATE POLICY "users_can_view_relevant_friend_requests" ON friend_requests
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = sender_id OR
      auth.uid() = receiver_id
    )
  );

CREATE POLICY "users_can_send_friend_requests" ON friend_requests
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IS NOT NULL AND
    sender_id != receiver_id  -- Can't send request to yourself
  );

CREATE POLICY "users_can_manage_friend_requests" ON friend_requests
  FOR UPDATE USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "users_can_delete_friend_requests" ON friend_requests
  FOR DELETE USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- =====================================================
-- INTERACTION POLICIES (LIKES, COMMENTS, SAVES)
-- =====================================================
-- LIKES TABLE
CREATE POLICY "users_can_view_likes" ON likes
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM cooking_sessions 
      WHERE cooking_sessions.id = likes.session_id
    )
  );

CREATE POLICY "users_can_like_sessions" ON likes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM cooking_sessions 
      WHERE cooking_sessions.id = likes.session_id
    )
  );

CREATE POLICY "users_can_unlike_sessions" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS TABLE  
CREATE POLICY "users_can_view_comments" ON comments
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM cooking_sessions 
      WHERE cooking_sessions.id = comments.session_id
    )
  );

CREATE POLICY "users_can_comment_on_sessions" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM cooking_sessions 
      WHERE cooking_sessions.id = comments.session_id
    )
  );

CREATE POLICY "users_can_update_own_comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- SAVED SESSIONS TABLE
CREATE POLICY "users_can_view_own_saved_sessions" ON saved_sessions
  FOR SELECT USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM cooking_sessions 
      WHERE cooking_sessions.id = saved_sessions.session_id
    )
  );

CREATE POLICY "users_can_save_sessions" ON saved_sessions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM cooking_sessions 
      WHERE cooking_sessions.id = saved_sessions.session_id
    )
  );

CREATE POLICY "users_can_unsave_sessions" ON saved_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- NOTIFICATION POLICIES
-- =====================================================
CREATE POLICY "users_can_view_own_notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "system_can_create_notifications" ON notifications
  FOR INSERT WITH CHECK (
    -- Allow system to create notifications for any user
    user_id IS NOT NULL
  );

CREATE POLICY "users_can_update_own_notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- MESSAGING POLICIES
-- =====================================================
CREATE POLICY "users_can_view_their_messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "users_can_send_messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IS NOT NULL AND
    sender_id != receiver_id  -- Can't message yourself
  );

CREATE POLICY "users_can_update_received_messages" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

CREATE POLICY "users_can_delete_their_messages" ON messages
  FOR DELETE USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- =====================================================
-- CLUB POLICIES
-- =====================================================
-- CLUBS TABLE
CREATE POLICY "users_can_view_public_clubs_and_own_clubs" ON clubs
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_private = false OR  -- Public clubs
      auth.uid() = created_by OR  -- Own clubs
      EXISTS (  -- Member of club
        SELECT 1 FROM club_members 
        WHERE club_id = clubs.id AND user_id = auth.uid()
      )
    )
  );

CREATE POLICY "users_can_create_clubs" ON clubs
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "club_owners_can_update_clubs" ON clubs
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "club_owners_can_delete_clubs" ON clubs
  FOR DELETE USING (auth.uid() = created_by);

-- CLUB MEMBERS TABLE
CREATE POLICY "users_can_view_club_memberships" ON club_members
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = user_id OR  -- Own memberships
      EXISTS (  -- Member of the same club
        SELECT 1 FROM club_members cm2 
        WHERE cm2.club_id = club_members.club_id AND cm2.user_id = auth.uid()
      ) OR
      EXISTS (  -- Club owner
        SELECT 1 FROM clubs 
        WHERE clubs.id = club_members.club_id AND clubs.created_by = auth.uid()
      )
    )
  );

CREATE POLICY "users_can_join_clubs" ON club_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM clubs 
      WHERE clubs.id = club_members.club_id 
      AND (is_private = false OR created_by = auth.uid())
    )
  );

CREATE POLICY "users_and_owners_can_manage_memberships" ON club_members
  FOR UPDATE USING (
    auth.uid() = user_id OR  -- Own membership
    EXISTS (  -- Club owner
      SELECT 1 FROM clubs 
      WHERE clubs.id = club_members.club_id AND clubs.created_by = auth.uid()
    )
  );

CREATE POLICY "users_can_leave_clubs" ON club_members
  FOR DELETE USING (
    auth.uid() = user_id OR  -- Leave own club
    EXISTS (  -- Club owner can remove members
      SELECT 1 FROM clubs 
      WHERE clubs.id = club_members.club_id AND clubs.created_by = auth.uid()
    )
  );

-- CLUB CHALLENGES TABLE
CREATE POLICY "club_members_can_view_club_challenges" ON club_challenges
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM club_members 
      WHERE club_id = club_challenges.club_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "club_owners_can_assign_challenges" ON club_challenges
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM clubs 
      WHERE clubs.id = club_challenges.club_id AND clubs.created_by = auth.uid()
    )
  );

CREATE POLICY "club_owners_can_remove_challenges" ON club_challenges
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM clubs 
      WHERE clubs.id = club_challenges.club_id AND clubs.created_by = auth.uid()
    )
  );

-- =====================================================
-- ADDITIONAL SECURITY ENHANCEMENTS
-- =====================================================

-- Create function to check if user is authenticated (for future use)
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is club member (for future use)
CREATE OR REPLACE FUNCTION is_club_member(club_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM club_members 
    WHERE club_id = club_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is club owner (for future use)
CREATE OR REPLACE FUNCTION is_club_owner(club_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM clubs 
    WHERE id = club_uuid AND created_by = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'RLS POLICIES RESET AND RECREATION COMPLETED SUCCESSFULLY!';
  RAISE NOTICE 'All tables now have comprehensive security policies.';
  RAISE NOTICE 'Features supported: Public/Private profiles, Clubs, Challenges, Social interactions, Messaging';
  RAISE NOTICE 'Future-proof: Helper functions created for complex permission checks';
END $$;