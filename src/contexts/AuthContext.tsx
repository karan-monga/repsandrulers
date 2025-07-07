'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  unit_preference: 'metric' | 'imperial';
  height: number | null;
  weight: number | null;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  value: number;
  date?: string; // Optional target date
  reached: boolean;
  reachedAt?: string;
}

export interface WeightGoal {
  id: string;
  user_id: string;
  type: 'weight';
  target_value: number;
  current_value: number;
  start_date: string;
  target_date: string | null;
  milestones: Milestone[];
  created_at: string;
  updated_at: string;
}

export interface MeasurementEntry {
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
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  measurements: MeasurementEntry[];
  weightGoal: WeightGoal | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, unitPreference: 'metric' | 'imperial', height?: number, weight?: number) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;

  addMeasurement: (measurement: Omit<MeasurementEntry, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateMeasurement: (id: string, measurement: Partial<MeasurementEntry>) => Promise<void>;
  deleteMeasurement: (id: string) => Promise<void>;
  loadMeasurements: (userId?: string) => Promise<void>;
  importMeasurements: (measurements: Omit<MeasurementEntry, 'id' | 'user_id' | 'created_at'>[]) => Promise<void>;

  // Goal-related functions
  setWeightGoal: (goal: Omit<WeightGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateWeightGoal: (goal: Partial<WeightGoal>) => Promise<void>;
  deleteWeightGoal: () => Promise<void>;
  loadWeightGoal: (userId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementEntry[]>([]);
  const [weightGoal, setWeightGoalState] = useState<WeightGoal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up Supabase auth listener...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
        loadMeasurements();
        loadWeightGoal();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            console.log('Starting to load user data...');
            const startTime = Date.now();
            
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Loading timeout')), 3000)
            );
            
            const loadPromise = Promise.allSettled([
              loadUserProfile(session.user.id),
              loadMeasurements(session.user.id),
              loadWeightGoal(session.user.id)
            ]);
            
            await Promise.race([loadPromise, timeoutPromise]);
            const endTime = Date.now();
            console.log(`Finished loading user data in ${endTime - startTime}ms`);
          } catch (error) {
            console.error('Error loading user data:', error);
          }
        } else {
          setUserProfile(null);
          setMeasurements([]);
          setWeightGoalState(null);
        }
        console.log('Setting loading to false');
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading user profile for:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile...');
          try {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: user?.email || '',
                unit_preference: 'metric',
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
              // Set a default profile anyway so the app doesn't break
              setUserProfile({
                id: userId,
                email: user?.email || '',
                unit_preference: 'metric',
                height: null,
                weight: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
              return;
            }

            console.log('Profile created successfully:', newProfile);
            setUserProfile(newProfile);
            return;
          } catch (createError) {
            console.error('Error creating profile:', createError);
            // Set a default profile anyway so the app doesn't break
            setUserProfile({
              id: userId,
              email: user?.email || '',
              unit_preference: 'metric',
              height: null,
              weight: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            return;
          }
        }
        // For other errors, set a default profile
        setUserProfile({
          id: userId,
          email: user?.email || '',
          unit_preference: 'metric',
          height: null,
          weight: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        return;
      }

      console.log('User profile loaded:', data);
      setUserProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Set a default profile on any error
      setUserProfile({
        id: userId,
        email: user?.email || '',
        unit_preference: 'metric',
        height: null,
        weight: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  };

  const loadMeasurements = async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;
    
    try {
      console.log('Loading measurements for:', targetUserId);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Measurements loading timeout')), 5000)
      );
      
      const { data, error } = await Promise.race([
        supabase
          .from('measurements')
          .select('*')
          .eq('user_id', targetUserId)
          .order('date', { ascending: false }),
        timeoutPromise
      ]);

      if (error) {
        console.error('Error loading measurements:', error);
        setMeasurements([]);
        return;
      }

      console.log('Measurements loaded:', data?.length || 0);
      setMeasurements(data || []);
    } catch (error) {
      console.error('Error loading measurements:', error);
      setMeasurements([]);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, unitPreference: 'metric' | 'imperial', height?: number, weight?: number) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // Create profile manually if user was created successfully
    if (data.user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            unit_preference: unitPreference,
            height: height || null,
            weight: weight || null,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't throw error here - user is still created
        }
      } catch (err) {
        console.error('Error creating profile after signup:', err);
        // Don't throw error here - user is still created
      }
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      throw error;
    }

    // Reload profile
    await loadUserProfile(user.id);
  };

  const addMeasurement = async (measurement: Omit<MeasurementEntry, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) {
      throw new Error('You must be logged in to save measurements');
    }
    
    const { data, error } = await supabase
      .from('measurements')
      .insert({
        ...measurement,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    setMeasurements(prev => [data, ...prev]);
  };

  const updateMeasurement = async (id: string, measurement: Partial<MeasurementEntry>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('measurements')
      .update(measurement)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    setMeasurements(prev => 
      prev.map(m => m.id === id ? { ...m, ...measurement } : m)
    );
  };

  const deleteMeasurement = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('measurements')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    setMeasurements(prev => prev.filter(m => m.id !== id));
  };

  const loadWeightGoal = async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;
    
    try {
      console.log('Loading weight goal for:', targetUserId);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Weight goal loading timeout')), 2000)
      );
      
      const { data, error } = await Promise.race([
        supabase
          .from('goals')
          .select('*')
          .eq('user_id', targetUserId)
          .eq('type', 'weight')
          .single(),
        timeoutPromise
      ]);

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error loading weight goal:', error);
        return;
      }

      console.log('Weight goal loaded:', data);
      setWeightGoalState(data);
    } catch (error) {
      console.error('Error loading weight goal:', error);
    }
  };

  const importMeasurements = async (measurements: Omit<MeasurementEntry, 'id' | 'user_id' | 'created_at'>[]) => {
    if (!user) return;

    const { error } = await supabase
      .from('measurements')
      .insert(
        measurements.map(measurement => ({
          ...measurement,
          user_id: user.id,
        }))
      );

    if (error) {
      throw error;
    }

    // Reload measurements to get the new data
    await loadMeasurements();
  };

  const setWeightGoal = async (goal: Omit<WeightGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('goals')
      .upsert({
        ...goal,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    setWeightGoalState(data);
  };

  const updateWeightGoal = async (goal: Partial<WeightGoal>) => {
    if (!user || !weightGoal) return;
    
    const { error } = await supabase
      .from('goals')
      .update({
        ...goal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', weightGoal.id)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    setWeightGoalState(prev => prev ? { ...prev, ...goal } : null);
  };

  const deleteWeightGoal = async () => {
    if (!user || !weightGoal) return;
    
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', weightGoal.id)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    setWeightGoalState(null);
  };

  const value = {
    user,
    userProfile,
    measurements,
    weightGoal,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    updateProfile,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
    loadMeasurements,
    importMeasurements,
    setWeightGoal,
    updateWeightGoal,
    deleteWeightGoal,
    loadWeightGoal,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}