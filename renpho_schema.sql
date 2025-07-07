-- Renpho Data Schema
-- Stores body composition data from Renpho smart scales

-- Renpho measurements table
CREATE TABLE renpho_measurements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    time_of_measurement TIMESTAMP WITH TIME ZONE NOT NULL,
    weight_lb DECIMAL(5,2) NOT NULL,
    bmi DECIMAL(4,2),
    body_fat_percent DECIMAL(4,2),
    fat_free_body_weight_lb DECIMAL(5,2),
    subcutaneous_fat_percent DECIMAL(4,2),
    visceral_fat DECIMAL(4,2),
    body_water_percent DECIMAL(4,2),
    skeletal_muscle_percent DECIMAL(4,2),
    muscle_mass_lb DECIMAL(5,2),
    bone_mass_lb DECIMAL(4,2),
    protein_percent DECIMAL(4,2),
    bmr_kcal INTEGER,
    metabolic_age INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_renpho_measurements_user_id ON renpho_measurements(user_id);
CREATE INDEX idx_renpho_measurements_time ON renpho_measurements(time_of_measurement);
CREATE INDEX idx_renpho_measurements_weight ON renpho_measurements(weight_lb);

-- Row Level Security (RLS)
ALTER TABLE renpho_measurements ENABLE ROW LEVEL SECURITY;

-- Users can only access their own Renpho data
CREATE POLICY "Users can view own renpho measurements" ON renpho_measurements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own renpho measurements" ON renpho_measurements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own renpho measurements" ON renpho_measurements
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own renpho measurements" ON renpho_measurements
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_renpho_measurements_updated_at BEFORE UPDATE ON renpho_measurements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 