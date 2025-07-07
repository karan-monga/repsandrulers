-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS height DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2);

-- Update the profiles table schema to match what the app expects
-- This adds the height and weight columns that are referenced in the AuthContext 