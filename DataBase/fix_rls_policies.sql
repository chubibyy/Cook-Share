-- Missing INSERT policy for users table
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Also add a more permissive policy for user creation during signup
-- This allows the system to create user profiles
CREATE POLICY "Allow user creation" ON users FOR INSERT WITH CHECK (true);