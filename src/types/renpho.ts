export interface RenphoMeasurement {
  id: string;
  user_id: string;
  time_of_measurement: string;
  weight_lb: number;
  bmi: number | null;
  body_fat_percent: number | null;
  fat_free_body_weight_lb: number | null;
  subcutaneous_fat_percent: number | null;
  visceral_fat: number | null;
  body_water_percent: number | null;
  skeletal_muscle_percent: number | null;
  muscle_mass_lb: number | null;
  bone_mass_lb: number | null;
  protein_percent: number | null;
  bmr_kcal: number | null;
  metabolic_age: number | null;
  created_at: string;
  updated_at: string;
}

export interface RenphoFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  minWeight?: number;
  maxWeight?: number;
  minBodyFat?: number;
  maxBodyFat?: number;
  minMuscleMass?: number;
  maxMuscleMass?: number;
}

export interface RenphoStats {
  totalMeasurements: number;
  dateRange: {
    first: string;
    last: string;
  };
  averages: {
    weight_lb: number;
    bmi: number;
    body_fat_percent: number;
    muscle_mass_lb: number;
    body_water_percent: number;
    bmr_kcal: number;
    metabolic_age: number;
  };
  trends: {
    weight_lb: number;
    body_fat_percent: number;
    muscle_mass_lb: number;
  };
}

export interface RenphoCSVRow {
  'Time of Measurement': string;
  'Weight(lb)': string;
  'BMI': string;
  'Body Fat(%)': string;
  'Fat-free Body Weight(lb)': string;
  'Subcutaneous Fat(%)': string;
  'Visceral Fat': string;
  'Body Water(%)': string;
  'Skeletal Muscle(%)': string;
  'Muscle Mass(lb)': string;
  'Bone Mass(lb)': string;
  'Protein(%)': string;
  'BMR(kcal)': string;
  'Metabolic Age': string;
} 