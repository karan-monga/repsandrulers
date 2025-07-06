'use client';

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Exercise } from '@/types/exercise';
import { routineApi } from '@/lib/exerciseApi';
import { X, Plus, Check } from 'lucide-react';

interface RoutinePickerProps {
  exercise: Exercise;
  isOpen: boolean;
  onClose: () => void;
  onExerciseAdded: () => void;
}

export function RoutinePicker({ exercise, isOpen, onClose, onExerciseAdded }: RoutinePickerProps) {
  const [newRoutineName, setNewRoutineName] = useState('');
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>('');
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const queryClient = useQueryClient();

  // Get routines
  const { data: routines = [] } = useQuery({
    queryKey: ['routines'],
    queryFn: () => routineApi.getRoutines(),
  });

  // Create routine mutation
  const createRoutineMutation = useMutation({
    mutationFn: (name: string) => routineApi.createRoutine({ name }),
    onSuccess: (newRoutine) => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      setSelectedRoutineId(newRoutine.id);
      setShowCreateForm(false);
      setIsCreatingRoutine(false);
      setNewRoutineName('');
    },
  });

  // Add exercise to routine mutation
  const addExerciseMutation = useMutation({
    mutationFn: async ({ routineId, exerciseId }: { routineId: string; exerciseId: string }) => {
      // First, we need to get or create a routine day
      const routine = await routineApi.getRoutineWithDetails(routineId);
      let routineDay = routine.days.find(day => day.split_type === exercise.split_type);
      
      if (!routineDay) {
        // Create a new day for this split type
        const newDay = await routineApi.addRoutineDay(routineId, {
          weekday: 'Mon', // Default to Monday, user can change later
          split_type: exercise.split_type,
        });
        routineDay = { ...newDay, exercises: [] };
      }

      // Add exercise to the routine day
      return routineApi.addExerciseToRoutineDay(routineDay!.id, {
        exercise_id: exerciseId,
        set_count: exercise.default_sets,
        rep_range: exercise.default_reps,
        rest_interval: exercise.rest_interval,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      onExerciseAdded();
      onClose();
    },
  });

  const handleCreateRoutine = async () => {
    if (!newRoutineName.trim()) return;
    
    setIsCreatingRoutine(true);
    try {
      await createRoutineMutation.mutateAsync(newRoutineName);
    } catch (error) {
      console.error('Error creating routine:', error);
      setIsCreatingRoutine(false);
    }
  };

  const handleAddToRoutine = async () => {
    if (!selectedRoutineId) return;
    
    try {
      await addExerciseMutation.mutateAsync({
        routineId: selectedRoutineId,
        exerciseId: exercise.id,
      });
    } catch (error) {
      console.error('Error adding exercise to routine:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#171717] rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2e2e2e]">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add to Routine
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {exercise.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select a routine to add this exercise to
            </p>
          </div>

          {/* Existing Routines */}
          {routines.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Your Routines</h4>
              {routines.map((routine) => (
                <button
                  key={routine.id}
                  onClick={() => setSelectedRoutineId(routine.id)}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${
                    selectedRoutineId === routine.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-[#2e2e2e] hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {routine.name}
                    </span>
                    {selectedRoutineId === routine.id && (
                      <Check className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Create New Routine */}
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-[#2e2e2e] rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Routine</span>
            </button>
          ) : (
            <div className="space-y-3 p-4 border border-gray-200 dark:border-[#2e2e2e] rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white">Create New Routine</h4>
              <input
                type="text"
                value={newRoutineName}
                onChange={(e) => setNewRoutineName(e.target.value)}
                placeholder="Enter routine name"
                className="input w-full"
                disabled={isCreatingRoutine}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateRoutine}
                  disabled={!newRoutineName.trim() || isCreatingRoutine}
                  className="btn-primary flex-1"
                >
                  {isCreatingRoutine ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewRoutineName('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-[#2e2e2e]">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleAddToRoutine}
            disabled={!selectedRoutineId || addExerciseMutation.isPending}
            className="btn-primary"
          >
            {addExerciseMutation.isPending ? 'Adding...' : 'Add to Routine'}
          </button>
        </div>
      </div>
    </div>
  );
} 