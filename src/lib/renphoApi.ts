import { supabase } from './supabase';
import { RenphoMeasurement, RenphoFilters, RenphoStats, RenphoCSVRow } from '@/types/renpho';

export const renphoApi = {
  // Get all Renpho measurements with optional filters
  async getMeasurements(filters?: RenphoFilters): Promise<RenphoMeasurement[]> {
    let query = supabase
      .from('renpho_measurements')
      .select('*')
      .order('time_of_measurement', { ascending: false });

    if (filters?.dateRange?.start) {
      query = query.gte('time_of_measurement', filters.dateRange.start);
    }

    if (filters?.dateRange?.end) {
      query = query.lte('time_of_measurement', filters.dateRange.end);
    }

    if (filters?.minWeight) {
      query = query.gte('weight_lb', filters.minWeight);
    }

    if (filters?.maxWeight) {
      query = query.lte('weight_lb', filters.maxWeight);
    }

    if (filters?.minBodyFat) {
      query = query.gte('body_fat_percent', filters.minBodyFat);
    }

    if (filters?.maxBodyFat) {
      query = query.lte('body_fat_percent', filters.maxBodyFat);
    }

    if (filters?.minMuscleMass) {
      query = query.gte('muscle_mass_lb', filters.minMuscleMass);
    }

    if (filters?.maxMuscleMass) {
      query = query.lte('muscle_mass_lb', filters.maxMuscleMass);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get latest measurement
  async getLatestMeasurement(): Promise<RenphoMeasurement | null> {
    const { data, error } = await supabase
      .from('renpho_measurements')
      .select('*')
      .order('time_of_measurement', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  },

  // Get measurements for charting (ordered by time)
  async getMeasurementsForChart(filters?: RenphoFilters): Promise<RenphoMeasurement[]> {
    let query = supabase
      .from('renpho_measurements')
      .select('*')
      .order('time_of_measurement', { ascending: true });

    if (filters?.dateRange?.start) {
      query = query.gte('time_of_measurement', filters.dateRange.start);
    }

    if (filters?.dateRange?.end) {
      query = query.lte('time_of_measurement', filters.dateRange.end);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Calculate statistics
  async getStats(filters?: RenphoFilters): Promise<RenphoStats> {
    const measurements = await this.getMeasurementsForChart(filters);
    
    if (measurements.length === 0) {
      return {
        totalMeasurements: 0,
        dateRange: { first: '', last: '' },
        averages: {
          weight_lb: 0,
          bmi: 0,
          body_fat_percent: 0,
          muscle_mass_lb: 0,
          body_water_percent: 0,
          bmr_kcal: 0,
          metabolic_age: 0,
          fat_free_body_weight_lb: 0,
          subcutaneous_fat_percent: 0,
          visceral_fat: 0,
          skeletal_muscle_percent: 0,
          bone_mass_lb: 0,
          protein_percent: 0,
        },
        trends: {
          weight_lb: 0,
          body_fat_percent: 0,
          muscle_mass_lb: 0,
        },
      };
    }

    // Calculate averages
    const validMeasurements = measurements.filter(m => m.weight_lb > 0);
    const averages = {
      weight_lb: validMeasurements.reduce((sum, m) => sum + m.weight_lb, 0) / validMeasurements.length,
      bmi: measurements.filter(m => m.bmi).reduce((sum, m) => sum + (m.bmi || 0), 0) / measurements.filter(m => m.bmi).length || 0,
      body_fat_percent: measurements.filter(m => m.body_fat_percent).reduce((sum, m) => sum + (m.body_fat_percent || 0), 0) / measurements.filter(m => m.body_fat_percent).length || 0,
      muscle_mass_lb: measurements.filter(m => m.muscle_mass_lb).reduce((sum, m) => sum + (m.muscle_mass_lb || 0), 0) / measurements.filter(m => m.muscle_mass_lb).length || 0,
      body_water_percent: measurements.filter(m => m.body_water_percent).reduce((sum, m) => sum + (m.body_water_percent || 0), 0) / measurements.filter(m => m.body_water_percent).length || 0,
      bmr_kcal: measurements.filter(m => m.bmr_kcal).reduce((sum, m) => sum + (m.bmr_kcal || 0), 0) / measurements.filter(m => m.bmr_kcal).length || 0,
      metabolic_age: measurements.filter(m => m.metabolic_age).reduce((sum, m) => sum + (m.metabolic_age || 0), 0) / measurements.filter(m => m.metabolic_age).length || 0,
      fat_free_body_weight_lb: measurements.filter(m => m.fat_free_body_weight_lb).reduce((sum, m) => sum + (m.fat_free_body_weight_lb || 0), 0) / measurements.filter(m => m.fat_free_body_weight_lb).length || 0,
      subcutaneous_fat_percent: measurements.filter(m => m.subcutaneous_fat_percent).reduce((sum, m) => sum + (m.subcutaneous_fat_percent || 0), 0) / measurements.filter(m => m.subcutaneous_fat_percent).length || 0,
      visceral_fat: measurements.filter(m => m.visceral_fat).reduce((sum, m) => sum + (m.visceral_fat || 0), 0) / measurements.filter(m => m.visceral_fat).length || 0,
      skeletal_muscle_percent: measurements.filter(m => m.skeletal_muscle_percent).reduce((sum, m) => sum + (m.skeletal_muscle_percent || 0), 0) / measurements.filter(m => m.skeletal_muscle_percent).length || 0,
      bone_mass_lb: measurements.filter(m => m.bone_mass_lb).reduce((sum, m) => sum + (m.bone_mass_lb || 0), 0) / measurements.filter(m => m.bone_mass_lb).length || 0,
      protein_percent: measurements.filter(m => m.protein_percent).reduce((sum, m) => sum + (m.protein_percent || 0), 0) / measurements.filter(m => m.protein_percent).length || 0,
    };

    // Calculate trends (change from first to last measurement)
    const first = measurements[0];
    const last = measurements[measurements.length - 1];
    const trends = {
      weight_lb: last.weight_lb - first.weight_lb,
      body_fat_percent: (last.body_fat_percent || 0) - (first.body_fat_percent || 0),
      muscle_mass_lb: (last.muscle_mass_lb || 0) - (first.muscle_mass_lb || 0),
    };

    return {
      totalMeasurements: measurements.length,
      dateRange: {
        first: first.time_of_measurement,
        last: last.time_of_measurement,
      },
      averages,
      trends,
    };
  },

  // Import CSV data
  async importCSVData(csvData: RenphoCSVRow[]): Promise<number> {
    const measurements = csvData.map(row => ({
      time_of_measurement: new Date(row['Time of Measurement']).toISOString(),
      weight_lb: parseFloat(row['Weight(lb)']) || 0,
      bmi: parseFloat(row['BMI']) || null,
      body_fat_percent: parseFloat(row['Body Fat(%)']) || null,
      fat_free_body_weight_lb: parseFloat(row['Fat-free Body Weight(lb)']) || null,
      subcutaneous_fat_percent: parseFloat(row['Subcutaneous Fat(%)']) || null,
      visceral_fat: parseFloat(row['Visceral Fat']) || null,
      body_water_percent: parseFloat(row['Body Water(%)']) || null,
      skeletal_muscle_percent: parseFloat(row['Skeletal Muscle(%)']) || null,
      muscle_mass_lb: parseFloat(row['Muscle Mass(lb)']) || null,
      bone_mass_lb: parseFloat(row['Bone Mass(lb)']) || null,
      protein_percent: parseFloat(row['Protein(%)']) || null,
      bmr_kcal: parseInt(row['BMR(kcal)']) || null,
      metabolic_age: parseInt(row['Metabolic Age']) || null,
    }));

    // Insert in batches
    const batchSize = 50;
    let totalInserted = 0;

    for (let i = 0; i < measurements.length; i += batchSize) {
      const batch = measurements.slice(i, i + batchSize);
      const { error } = await supabase
        .from('renpho_measurements')
        .insert(batch);

      if (error) throw error;
      totalInserted += batch.length;
    }

    return totalInserted;
  },

  // Delete measurement
  async deleteMeasurement(id: string): Promise<void> {
    const { error } = await supabase
      .from('renpho_measurements')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Clear all measurements
  async clearAllMeasurements(): Promise<void> {
    const { error } = await supabase
      .from('renpho_measurements')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) throw error;
  },
}; 