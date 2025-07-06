import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          unit_preference: 'metric' | 'imperial';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          unit_preference?: 'metric' | 'imperial';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          unit_preference?: 'metric' | 'imperial';
          created_at?: string;
          updated_at?: string;
        };
      };
      measurements: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          weight: number | null;
          height: number | null;
          chest: number | null;
          waist: number | null;
          hips: number | null;
          biceps: number | null;
          forearms: number | null;
          thighs: number | null;
          calves: number | null;
          left_thigh: number | null;
          right_thigh: number | null;
          left_calf: number | null;
          right_calf: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          weight?: number | null;
          height?: number | null;
          chest?: number | null;
          waist?: number | null;
          hips?: number | null;
          biceps?: number | null;
          forearms?: number | null;
          thighs?: number | null;
          calves?: number | null;
          left_thigh?: number | null;
          right_thigh?: number | null;
          left_calf?: number | null;
          right_calf?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          weight?: number | null;
          height?: number | null;
          chest?: number | null;
          waist?: number | null;
          hips?: number | null;
          biceps?: number | null;
          forearms?: number | null;
          thighs?: number | null;
          calves?: number | null;
          left_thigh?: number | null;
          right_thigh?: number | null;
          left_calf?: number | null;
          right_calf?: number | null;
          created_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          type: 'weight';
          target_value: number;
          current_value: number;
          start_date: string;
          target_date: string | null;
          milestones: any[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'weight';
          target_value: number;
          current_value: number;
          start_date: string;
          target_date?: string | null;
          milestones?: any[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'weight';
          target_value?: number;
          current_value?: number;
          start_date?: string;
          target_date?: string | null;
          milestones?: any[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
} 