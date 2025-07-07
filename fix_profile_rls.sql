-- Fix RLS policies for profiles table to allow profile creation during signup
-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new policy that allows profile creation for new users
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (
    -- Allow if the user is authenticated and the id matches
    (auth.uid() = id) OR
    -- Allow if the user exists in auth.users (for signup process)
    (EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id))
  );

-- This policy allows profile creation during the signup process
-- when the user exists in auth.users but might not be fully authenticated yet 