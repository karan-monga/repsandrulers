-- Temporarily disable the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- This will prevent the trigger from interfering with signup
-- The profile will be created manually in the application code 