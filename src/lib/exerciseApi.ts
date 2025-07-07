import { supabase } from './supabase';
import {
  Exercise,
  Routine,
  RoutineDay,
  RoutineExercise,
  RoutineWithDetails,
  ExerciseFilters,
  CreateRoutineData,
  CreateRoutineDayData,
  AddExerciseToRoutineData,
  UpdateRoutineExerciseData,
} from '@/types/exercise';

// Exercise API functions
export const exerciseApi = {
  // Get all exercises with optional filters
  async getExercises(filters?: ExerciseFilters): Promise<Exercise[]> {
    let query = supabase
      .from('exercises')
      .select('*')
      .order('name');

    if (filters?.split_type) {
      query = query.eq('split_type', filters.split_type);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,primary_muscle.ilike.%${filters.search}%`);
    }

    if (filters?.muscle) {
      query = query.eq('primary_muscle', filters.muscle);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get exercise by ID
  async getExercise(id: string): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get unique muscle groups
  async getMuscleGroups(): Promise<string[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('primary_muscle')
      .order('primary_muscle');

    if (error) throw error;
    return [...new Set(data?.map(ex => ex.primary_muscle) || [])];
  },
};

// Routine API functions
export const routineApi = {
  // Get all routines for current user
  async getRoutines(): Promise<Routine[]> {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get routine with full details
  async getRoutineWithDetails(id: string): Promise<RoutineWithDetails> {
    const { data, error } = await supabase
      .from('routines')
      .select(`
        *,
        days:routine_days(
          *,
          exercises:routine_exercises(
            *,
            exercise:exercises(*)
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new routine
  async createRoutine(data: CreateRoutineData): Promise<Routine> {
    const { data: routine, error } = await supabase
      .from('routines')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return routine;
  },

  // Update routine name
  async updateRoutine(id: string, data: { name: string }): Promise<Routine> {
    const { data: routine, error } = await supabase
      .from('routines')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return routine;
  },

  // Delete routine
  async deleteRoutine(id: string): Promise<void> {
    const { error } = await supabase
      .from('routines')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Add day to routine
  async addRoutineDay(routineId: string, data: CreateRoutineDayData): Promise<RoutineDay> {
    const { data: day, error } = await supabase
      .from('routine_days')
      .insert({
        routine_id: routineId,
        ...data,
        display_order: 0, // Will be set by the application
      })
      .select()
      .single();

    if (error) throw error;
    return day;
  },

  // Update routine day
  async updateRoutineDay(id: string, data: Partial<CreateRoutineDayData>): Promise<RoutineDay> {
    const { data: day, error } = await supabase
      .from('routine_days')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return day;
  },

  // Delete routine day
  async deleteRoutineDay(id: string): Promise<void> {
    const { error } = await supabase
      .from('routine_days')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Add exercise to routine day
  async addExerciseToRoutineDay(
    routineDayId: string,
    data: AddExerciseToRoutineData
  ): Promise<RoutineExercise> {
    // Get the current max position for this day
    const { data: maxPosition } = await supabase
      .from('routine_exercises')
      .select('position')
      .eq('routine_day_id', routineDayId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const position = (maxPosition?.position || 0) + 1;

    const { data: exercise, error } = await supabase
      .from('routine_exercises')
      .insert({
        routine_day_id: routineDayId,
        ...data,
        set_count: data.set_count || 3,
        rep_range: data.rep_range || '8-12',
        rest_interval: data.rest_interval || '90s',
        position,
      })
      .select()
      .single();

    if (error) throw error;
    return exercise;
  },

  // Update routine exercise
  async updateRoutineExercise(
    id: string,
    data: UpdateRoutineExerciseData
  ): Promise<RoutineExercise> {
    const { data: exercise, error } = await supabase
      .from('routine_exercises')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return exercise;
  },

  // Delete routine exercise
  async deleteRoutineExercise(id: string): Promise<void> {
    const { error } = await supabase
      .from('routine_exercises')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Reorder exercises in a routine day
  async reorderExercises(_routineDayId: string, exerciseIds: string[]): Promise<void> {
    const updates = exerciseIds.map((id, index) => ({
      id,
      position: index + 1,
    }));

    const { error } = await supabase
      .from('routine_exercises')
      .upsert(updates, { onConflict: 'id' });

    if (error) throw error;
  },
}; 