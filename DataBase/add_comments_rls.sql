-- Add RLS policies for comments table if not already enabled
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow reading all comments (for public sessions)
CREATE POLICY "allow_read_comments" ON comments 
FOR SELECT USING (true);

-- Allow authenticated users to create comments
CREATE POLICY "allow_create_comments" ON comments 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "allow_update_own_comments" ON comments 
FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "allow_delete_own_comments" ON comments 
FOR DELETE USING (auth.uid() = user_id);

DO $$
BEGIN
  RAISE NOTICE 'Comments RLS policies added successfully!';
END $$;