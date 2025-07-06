'use client';

import { useState } from 'react';
import { Exercise, SplitType } from '@/types/exercise';
import { Plus, ExternalLink, Dumbbell } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
  onAddToRoutine: (exercise: Exercise) => void;
}

const splitTypeColors: Record<SplitType, string> = {
  Push: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  Pull: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  Legs: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  Custom: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
};

export function ExerciseCard({ exercise, onAddToRoutine }: ExerciseCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="card hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Exercise Image */}
      <div className="relative h-48 bg-gray-100 dark:bg-[#262626] rounded-t-lg overflow-hidden mb-4">
        {exercise.image_url ? (
          <img
            src={exercise.image_url}
            alt={exercise.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Dumbbell className="w-16 h-16 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        
        {/* Overlay with Add button */}
        <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToRoutine(exercise);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Routine</span>
          </button>
        </div>
      </div>

      {/* Exercise Info */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {exercise.name}
          </h3>
          {exercise.link_url && (
            <a
              href={exercise.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${splitTypeColors[exercise.split_type]}`}>
            {exercise.split_type}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {exercise.primary_muscle}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{exercise.default_sets} sets</span>
          <span>{exercise.default_reps} reps</span>
          <span>{exercise.rest_interval} rest</span>
        </div>
      </div>
    </div>
  );
} 