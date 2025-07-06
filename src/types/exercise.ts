export type SplitType = 'Push' | 'Pull' | 'Legs' | 'Custom';
export type WeekdayType = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface Exercise {
  id: string;
  name: string;
  primary_muscle: string;
  split_type: SplitType;
  default_sets: number;
  default_reps: string;
  rest_interval: string;
  link_url?: string;
  substitution_ids: number[];
  image_url?: string;
  notes?: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface RoutineDay {
  id: string;
  routine_id: string;
  weekday: WeekdayType;
  split_type: SplitType;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface RoutineExercise {
  id: string;
  routine_day_id: string;
  exercise_id: string;
  set_count: number;
  rep_range: string;
  rest_interval: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface RoutineWithDetails extends Routine {
  days: (RoutineDay & {
    exercises: (RoutineExercise & {
      exercise: Exercise;
    })[];
  })[];
}

export interface ExerciseFilters {
  split_type?: SplitType;
  search?: string;
  muscle?: string;
}

export interface CreateRoutineData {
  name: string;
}

export interface CreateRoutineDayData {
  weekday: WeekdayType;
  split_type: SplitType;
}

export interface AddExerciseToRoutineData {
  exercise_id: string;
  set_count?: number;
  rep_range?: string;
  rest_interval?: string;
}

export interface UpdateRoutineExerciseData {
  set_count?: number;
  rep_range?: string;
  rest_interval?: string;
  position?: number;
} 