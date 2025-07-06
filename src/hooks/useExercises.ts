import { useQuery } from '@tanstack/react-query';
import { exerciseApi, routineApi } from '@/lib/exerciseApi';
import { ExerciseFilters } from '@/types/exercise';

// Exercise hooks
export const useExercises = (filters?: ExerciseFilters) => {
  return useQuery({
    queryKey: ['exercises', filters],
    queryFn: () => exerciseApi.getExercises(filters),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useExercise = (id: string) => {
  return useQuery({
    queryKey: ['exercise', id],
    queryFn: () => exerciseApi.getExercise(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useMuscleGroups = () => {
  return useQuery({
    queryKey: ['muscle-groups'],
    queryFn: () => exerciseApi.getMuscleGroups(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Routine hooks
export const useRoutines = () => {
  return useQuery({
    queryKey: ['routines'],
    queryFn: () => routineApi.getRoutines(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRoutineWithDetails = (id: string) => {
  return useQuery({
    queryKey: ['routine', id],
    queryFn: () => routineApi.getRoutineWithDetails(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 