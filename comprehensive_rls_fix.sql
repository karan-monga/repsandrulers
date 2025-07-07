-- Comprehensive RLS Fix for Routines Table
-- This script completely rebuilds the RLS policies to fix the 403/42501 errors

-- First, let's check if the user is authenticated and get their ID
-- This helps debug the authentication issue
SELECT auth.uid() as current_user_id;

-- Disable RLS temporarily to check table structure
ALTER TABLE routines DISABLE ROW LEVEL SECURITY;
ALTER TABLE routine_days DISABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies for these tables
DROP POLICY IF EXISTS "Users can view own routines" ON routines;
DROP POLICY IF EXISTS "Users can insert own routines" ON routines;
DROP POLICY IF EXISTS "Users can update own routines" ON routines;
DROP POLICY IF EXISTS "Users can delete own routines" ON routines;

DROP POLICY IF EXISTS "Users can view own routine days" ON routine_days;
DROP POLICY IF EXISTS "Users can insert own routine days" ON routine_days;
DROP POLICY IF EXISTS "Users can update own routine days" ON routine_days;
DROP POLICY IF EXISTS "Users can delete own routine days" ON routine_days;

DROP POLICY IF EXISTS "Users can view own routine exercises" ON routine_exercises;
DROP POLICY IF EXISTS "Users can insert own routine exercises" ON routine_exercises;
DROP POLICY IF EXISTS "Users can update own routine exercises" ON routine_exercises;
DROP POLICY IF EXISTS "Users can delete own routine exercises" ON routine_exercises;

-- Create new, more permissive policies for routines
-- These policies are more explicit about authentication

-- Routines policies
CREATE POLICY "routines_select_policy" ON routines
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "routines_insert_policy" ON routines
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "routines_update_policy" ON routines
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "routines_delete_policy" ON routines
    FOR DELETE USING (auth.uid() = user_id);

-- Routine days policies
CREATE POLICY "routine_days_select_policy" ON routine_days
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM routines 
            WHERE routines.id = routine_days.routine_id 
            AND routines.user_id = auth.uid()
        )
    );

CREATE POLICY "routine_days_insert_policy" ON routine_days
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM routines 
            WHERE routines.id = routine_days.routine_id 
            AND routines.user_id = auth.uid()
        )
    );

CREATE POLICY "routine_days_update_policy" ON routine_days
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM routines 
            WHERE routines.id = routine_days.routine_id 
            AND routines.user_id = auth.uid()
        )
    );

CREATE POLICY "routine_days_delete_policy" ON routine_days
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM routines 
            WHERE routines.id = routine_days.routine_id 
            AND routines.user_id = auth.uid()
        )
    );

-- Routine exercises policies
CREATE POLICY "routine_exercises_select_policy" ON routine_exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM routine_days 
            JOIN routines ON routines.id = routine_days.routine_id
            WHERE routine_days.id = routine_exercises.routine_day_id 
            AND routines.user_id = auth.uid()
        )
    );

CREATE POLICY "routine_exercises_insert_policy" ON routine_exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM routine_days 
            JOIN routines ON routines.id = routine_days.routine_id
            WHERE routine_days.id = routine_exercises.routine_day_id 
            AND routines.user_id = auth.uid()
        )
    );

CREATE POLICY "routine_exercises_update_policy" ON routine_exercises
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM routine_days 
            JOIN routines ON routines.id = routine_days.routine_id
            WHERE routine_days.id = routine_exercises.routine_day_id 
            AND routines.user_id = auth.uid()
        )
    );

CREATE POLICY "routine_exercises_delete_policy" ON routine_exercises
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM routine_days 
            JOIN routines ON routines.id = routine_days.routine_id
            WHERE routine_days.id = routine_exercises.routine_day_id 
            AND routines.user_id = auth.uid()
        )
    );

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('routines', 'routine_days', 'routine_exercises')
ORDER BY tablename, policyname; 