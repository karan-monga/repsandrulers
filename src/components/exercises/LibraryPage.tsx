'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useExercises, useMuscleGroups } from '@/hooks/useExercises';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseModal } from './ExerciseModal';
import { RoutinePicker } from '../routines/RoutinePicker';
import { Exercise, SplitType } from '@/types/exercise';

const splitTypes: { value: SplitType; label: string }[] = [
  { value: 'Push', label: 'Push' },
  { value: 'Pull', label: 'Pull' },
  { value: 'Legs', label: 'Legs' },
  { value: 'Custom', label: 'Custom' },
];

export function LibraryPage() {
  const [selectedSplit, setSelectedSplit] = useState<SplitType | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRoutinePicker, setShowRoutinePicker] = useState(false);

  // Fetch data
  const { data: exercises = [], isLoading } = useExercises({
    split_type: selectedSplit,
    search: searchTerm,
    muscle: selectedMuscle,
  });

  const { data: muscleGroups = [] } = useMuscleGroups();

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowModal(true);
  };

  const handleAddToRoutine = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowRoutinePicker(true);
  };

  const handleExerciseAdded = () => {
    // Could show a success notification here
    console.log('Exercise added to routine');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exercise Library</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse and search exercises for your workout routines
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search exercises or muscles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSplit(undefined)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !selectedSplit
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                : 'bg-gray-100 text-gray-700 dark:bg-[#262626] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2e2e2e]'
            }`}
          >
            All
          </button>
          {splitTypes.map((split) => (
            <button
              key={split.value}
              onClick={() => setSelectedSplit(split.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSplit === split.value
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-[#262626] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2e2e2e]'
              }`}
            >
              {split.label}
            </button>
          ))}
        </div>

        {/* Muscle Group Filter */}
        {muscleGroups.length > 0 && (
          <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              className="input"
            >
              <option value="">All Muscles</option>
              {muscleGroups.map((muscle) => (
                <option key={muscle} value={muscle}>
                  {muscle}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Loading exercises...</p>
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No exercises found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Exercise Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onAddToRoutine={handleAddToRoutine}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {selectedExercise && (
        <>
          <ExerciseModal
            exercise={selectedExercise}
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setSelectedExercise(null);
            }}
            onAddToRoutine={handleAddToRoutine}
          />
          <RoutinePicker
            exercise={selectedExercise}
            isOpen={showRoutinePicker}
            onClose={() => {
              setShowRoutinePicker(false);
              setSelectedExercise(null);
            }}
            onExerciseAdded={handleExerciseAdded}
          />
        </>
      )}
    </div>
  );
} 