-- Exercise Library & Routines Schema
-- Based on PRD requirements

-- Create ENUM types
CREATE TYPE split_type AS ENUM ('Push', 'Pull', 'Legs', 'Custom');
CREATE TYPE weekday_type AS ENUM ('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun');

-- Exercises table
CREATE TABLE exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    primary_muscle VARCHAR(100) NOT NULL,
    split_type split_type NOT NULL,
    default_sets INTEGER DEFAULT 3,
    default_reps VARCHAR(50) DEFAULT '8-12',
    rest_interval VARCHAR(50) DEFAULT '90s',
    link_url TEXT,
    substitution_ids INTEGER[] DEFAULT '{}',
    image_url TEXT,
    notes TEXT,
    source VARCHAR(50) DEFAULT 'science_based_ppl_v1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Routines table
CREATE TABLE routines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Routine days table
CREATE TABLE routine_days (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
    weekday weekday_type NOT NULL,
    split_type split_type NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Routine exercises table
CREATE TABLE routine_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    routine_day_id UUID REFERENCES routine_days(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    set_count INTEGER DEFAULT 3,
    rep_range VARCHAR(50) DEFAULT '8-12',
    rest_interval VARCHAR(50) DEFAULT '90s',
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_exercises_split_type ON exercises(split_type);
CREATE INDEX idx_exercises_primary_muscle ON exercises(primary_muscle);
CREATE INDEX idx_routines_user_id ON routines(user_id);
CREATE INDEX idx_routine_days_routine_id ON routine_days(routine_id);
CREATE INDEX idx_routine_exercises_routine_day_id ON routine_exercises(routine_day_id);
CREATE INDEX idx_routine_exercises_position ON routine_exercises(position);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;

-- Exercises: Read-only for all authenticated users, admin-only for write operations
CREATE POLICY "Exercises are viewable by everyone" ON exercises
    FOR SELECT USING (true);

CREATE POLICY "Exercises are insertable by admin only" ON exercises
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Exercises are updatable by admin only" ON exercises
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Exercises are deletable by admin only" ON exercises
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Routines: User can only access their own routines
CREATE POLICY "Users can view own routines" ON routines
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routines" ON routines
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines" ON routines
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routines" ON routines
    FOR DELETE USING (auth.uid() = user_id);

-- Routine days: User can only access their own routine days
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

-- Routine exercises: User can only access their own routine exercises
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON routines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routine_days_updated_at BEFORE UPDATE ON routine_days
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routine_exercises_updated_at BEFORE UPDATE ON routine_exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 