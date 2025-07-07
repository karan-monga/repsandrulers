-- Fix RLS Policies for Routines Table
-- This script fixes the RLS policies to ensure proper user_id assignment

-- Drop existing policies for routines table
DROP POLICY IF EXISTS "Users can view own routines" ON routines;
DROP POLICY IF EXISTS "Users can insert own routines" ON routines;
DROP POLICY IF EXISTS "Users can update own routines" ON routines;
DROP POLICY IF EXISTS "Users can delete own routines" ON routines;

-- Recreate policies with proper user_id handling
CREATE POLICY "Users can view own routines" ON routines
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routines" ON routines
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines" ON routines
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routines" ON routines
    FOR DELETE USING (auth.uid() = user_id);

-- Also fix routine_days policies to ensure they work properly
DROP POLICY IF EXISTS "Users can view own routine days" ON routine_days;
DROP POLICY IF EXISTS "Users can insert own routine days" ON routine_days;
DROP POLICY IF EXISTS "Users can update own routine days" ON routine_days;
DROP POLICY IF EXISTS "Users can delete own routine days" ON routine_days;

CREATE POLICY "Users can view own routine days" ON routine_days
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM routines 
            WHERE routines.id = routine_days.routine_id 
            AND routines.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own routine days" ON routine_days
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM routines 
            WHERE routines.id = routine_days.routine_id 
            AND routines.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own routine days" ON routine_days
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM routines 
            WHERE routines.id = routine_days.routine_id 
            AND routines.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own routine days" ON routine_days
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM routines 
            WHERE routines.id = routine_days.routine_id 
            AND routines.user_id = auth.uid()
        )
    );

-- Fix routine_exercises policies
DROP POLICY IF EXISTS "Users can view own routine exercises" ON routine_exercises;
DROP POLICY IF EXISTS "Users can insert own routine exercises" ON routine_exercises;
DROP POLICY IF EXISTS "Users can update own routine exercises" ON routine_exercises;
DROP POLICY IF EXISTS "Users can delete own routine exercises" ON routine_exercises;

CREATE POLICY "Users can view own routine exercises" ON routine_exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM routine_days 
            JOIN routines ON routines.id = routine_days.routine_id
            WHERE routine_days.id = routine_exercises.routine_day_id 
            AND routines.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own routine exercises" ON routine_exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM routine_days 
            JOIN routines ON routines.id = routine_days.routine_id
            WHERE routine_days.id = routine_exercises.routine_day_id 
            AND routines.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own routine exercises" ON routine_exercises
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM routine_days 
            JOIN routines ON routines.id = routine_days.routine_id
            WHERE routine_days.id = routine_exercises.routine_day_id 
            AND routines.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own routine exercises" ON routine_exercises
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM routine_days 
            JOIN routines ON routines.id = routine_days.routine_id
            WHERE routine_days.id = routine_exercises.routine_day_id 
            AND routines.user_id = auth.uid()
        )
    );

-- Verify RLS is enabled on all tables
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY; 