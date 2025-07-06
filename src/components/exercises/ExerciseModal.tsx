'use client';

import { useState } from 'react';
import { Exercise, SplitType } from '@/types/exercise';
import { X, ExternalLink, Dumbbell, Plus } from 'lucide-react';

interface ExerciseModalProps {
  exercise: Exercise;
  isOpen: boolean;
  onClose: () => void;
  onAddToRoutine: (exercise: Exercise) => void;
}

const splitTypeColors: Record<SplitType, string> = {
  Push: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  Pull: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  Legs: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  Custom: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
};

export function ExerciseModal({ exercise, isOpen, onClose, onAddToRoutine }: ExerciseModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddToRoutine = () => {
    setIsLoading(true);
    onAddToRoutine(exercise);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#171717] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2e2e2e]">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Exercise Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Exercise Image */}
          <div className="relative h-64 bg-gray-100 dark:bg-[#262626] rounded-lg overflow-hidden">
            {exercise.image_url ? (
              <img
                src={exercise.image_url}
                alt={exercise.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Dumbbell className="w-20 h-20 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>

          {/* Exercise Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {exercise.name}
              </h3>
              {exercise.link_url && (
                <a
                  href={exercise.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Watch Demo</span>
                </a>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${splitTypeColors[exercise.split_type]}`}>
                {exercise.split_type}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Primary: {exercise.primary_muscle}
              </span>
            </div>

            {/* Default Parameters */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-[#262626] rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Sets</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {exercise.default_sets}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Reps</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {exercise.default_reps}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Rest</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {exercise.rest_interval}
                </p>
              </div>
            </div>

            {/* Notes */}
            {exercise.notes && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Technique Notes
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {exercise.notes}
                </p>
              </div>
            )}

            {/* Substitutions */}
            {exercise.substitution_ids && exercise.substitution_ids.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Substitutions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {exercise.substitution_ids.map((id, index) => (
                    <span
                      key={id}
                      className="px-3 py-1 bg-gray-100 dark:bg-[#262626] text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      Substitution {index + 1}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-[#2e2e2e]">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
          <button
            onClick={handleAddToRoutine}
            disabled={isLoading}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{isLoading ? 'Adding...' : 'Add to Routine'}</span>
          </button>
        </div>
      </div>
    </div>
  );
} 