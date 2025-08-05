
-- === ENABLE RLS ===
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

-- === POLICIES ===

-- USERS
CREATE POLICY "Users can read any profile" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete their own profile" ON users FOR DELETE USING (auth.uid() = id);

-- COOKING_SESSIONS
CREATE POLICY "Public can view all sessions" ON cooking_sessions FOR SELECT USING (true);
CREATE POLICY "Users can insert their own session" ON cooking_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own session" ON cooking_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own session" ON cooking_sessions FOR DELETE USING (auth.uid() = user_id);

-- CHALLENGES
CREATE POLICY "Everyone can view challenges" ON challenges FOR SELECT USING (true);
CREATE POLICY "Users can insert their own challenge" ON challenges FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own challenges" ON challenges FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own challenges" ON challenges FOR DELETE USING (auth.uid() = created_by);

-- CHALLENGE_PARTICIPANTS
CREATE POLICY "Public can see challenge participation" ON challenge_participants FOR SELECT USING (true);
CREATE POLICY "Users can insert their own participation" ON challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own participation" ON challenge_participants FOR UPDATE USING (auth.uid() = user_id);

-- FOLLOWERS / FRIEND_REQUESTS / LIKES / SAVED_SESSIONS
CREATE POLICY "Public can view followers" ON followers FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON followers FOR DELETE USING (auth.uid() = follower_id);

CREATE POLICY "Public can view requests" ON friend_requests FOR SELECT USING (true);
CREATE POLICY "Users can send requests" ON friend_requests FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can cancel requests" ON friend_requests FOR DELETE USING (auth.uid() = sender_id);

CREATE POLICY "Public can view likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view saved sessions" ON saved_sessions FOR SELECT USING (true);
CREATE POLICY "Users can save sessions" ON saved_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave sessions" ON saved_sessions FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS
CREATE POLICY "Public can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE POLICY "Users can read their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- MESSAGES
CREATE POLICY "Users can read their own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update received messages" ON messages FOR UPDATE USING (auth.uid() = receiver_id);

-- CLUBS
CREATE POLICY "Public can view clubs" ON clubs FOR SELECT USING (true);
CREATE POLICY "Users can create clubs" ON clubs FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Club owner can update club" ON clubs FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Club owner can delete club" ON clubs FOR DELETE USING (auth.uid() = created_by);

-- CLUB_MEMBERS
CREATE POLICY "Users can view club memberships" ON club_members FOR SELECT USING (true);
CREATE POLICY "Users can join a club" ON club_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave a club" ON club_members FOR DELETE USING (auth.uid() = user_id);

-- CLUB_CHALLENGES
CREATE POLICY "Public can view club challenges" ON club_challenges FOR SELECT USING (true);
CREATE POLICY "Club owner can assign challenge to club" ON club_challenges FOR INSERT WITH CHECK (
  auth.uid() = (SELECT created_by FROM clubs WHERE clubs.id = club_challenges.club_id)
);
