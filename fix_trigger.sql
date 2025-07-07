-- Fix the trigger function to properly handle user creation
-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a new function that bypasses RLS
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Temporarily disable RLS for this operation
  ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
  
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Re-enable RLS
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Re-enable RLS even if there's an error
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger again
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 