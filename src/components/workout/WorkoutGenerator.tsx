'use client';

import { useState } from 'react';
import { Brain, Dumbbell, Clock, Target, User, Sparkles, Plus, Save, Download } from 'lucide-react';
import { workoutGeneratorApi, GeneratedWorkout, WorkoutDay, WorkoutExercise } from '@/lib/workoutGeneratorApi';

const goals = [
  { value: 'muscle_building', label: 'Muscle Building', icon: Dumbbell },
  { value: 'strength', label: 'Strength', icon: Target },
  { value: 'weight_loss', label: 'Weight Loss', icon: Target },
  { value: 'endurance', label: 'Endurance', icon: Clock },
  { value: 'general_fitness', label: 'General Fitness', icon: User },
];

const experienceLevels = [
  { value: 'beginner', label: 'Beginner', description: 'New to working out' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
  { value: 'advanced', label: 'Advanced', description: 'Experienced lifter' },
];

const equipmentOptions = [
  'Dumbbells',
  'Barbell',
  'Pull-up bar',
  'Resistance bands',
  'Bench',
  'Squat rack',
  'Cable machine',
  'Bodyweight only',
];

const focusAreas = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Core',
  'Full body',
];

export function WorkoutGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    goal: 'muscle_building' | 'strength' | 'weight_loss' | 'endurance' | 'general_fitness';
    experience: 'beginner' | 'intermediate' | 'advanced';
    daysPerWeek: number;
    equipment: string[];
    focusAreas: string[];
    timePerWorkout: number;
  }>({
    goal: 'muscle_building',
    experience: 'beginner',
    daysPerWeek: 3,
    equipment: ['Dumbbells'],
    focusAreas: [],
    timePerWorkout: 60,
  });

  const handleEquipmentChange = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...prev.equipment, equipment]
    }));
  };

  const handleFocusAreaChange = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const generateWorkout = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedWorkout(null);

    try {
      const workout = await workoutGeneratorApi.generateWorkout({
        goal: formData.goal,
        experience: formData.experience,
        daysPerWeek: formData.daysPerWeek,
        equipment: formData.equipment,
        focusAreas: formData.focusAreas.length > 0 ? formData.focusAreas : undefined,
        timePerWorkout: formData.timePerWorkout,
      });

      setGeneratedWorkout(workout);
    } catch (err) {
      setError('Failed to generate workout. Please try again.');
      console.error('Error generating workout:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToRoutines = async () => {
    // TODO: Implement saving to user's routines
    console.log('Saving workout to routines:', generatedWorkout);
  };

  const exportWorkout = () => {
    if (!generatedWorkout) return;

    const workoutText = `
${generatedWorkout.name}
${generatedWorkout.description}

${generatedWorkout.days.map(day => `
${day.day} - ${day.focus} (${day.estimatedDuration} min)
${day.exercises.map(ex => 
  `• ${ex.exercise.name}: ${ex.sets} sets x ${ex.reps} reps (rest: ${ex.restTime})`
).join('\n')}
`).join('\n')}

Notes:
${generatedWorkout.notes.map(note => `• ${note}`).join('\n')}
    `.trim();

    const blob = new Blob([workoutText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedWorkout.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Workout Generator</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create personalized workout routines tailored to your goals and equipment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Workout Preferences
            </h3>

            {/* Goal */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                What's your primary goal?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goals.map((goal) => {
                  const IconComponent = goal.icon;
                  return (
                    <button
                      key={goal.value}
                      onClick={() => setFormData(prev => ({ ...prev, goal: goal.value as typeof prev.goal }))}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        formData.goal === goal.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {goal.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience Level */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Experience Level
              </label>
              <div className="space-y-2">
                {experienceLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setFormData(prev => ({ ...prev, experience: level.value as typeof prev.experience }))}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                      formData.experience === level.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {level.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {level.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Days per Week */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Days per Week: {formData.daysPerWeek}
              </label>
              <input
                type="range"
                min="2"
                max="6"
                value={formData.daysPerWeek}
                onChange={(e) => setFormData(prev => ({ ...prev, daysPerWeek: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
              </div>
            </div>

            {/* Equipment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Available Equipment
              </label>
              <div className="grid grid-cols-2 gap-2">
                {equipmentOptions.map((equipment) => (
                  <button
                    key={equipment}
                    onClick={() => handleEquipmentChange(equipment)}
                    className={`p-2 rounded-lg border text-sm transition-colors ${
                      formData.equipment.includes(equipment)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {equipment}
                  </button>
                ))}
              </div>
            </div>

            {/* Focus Areas */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Focus Areas (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {focusAreas.map((area) => (
                  <button
                    key={area}
                    onClick={() => handleFocusAreaChange(area)}
                    className={`p-2 rounded-lg border text-sm transition-colors ${
                      formData.focusAreas.includes(area)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Time per Workout */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time per Workout: {formData.timePerWorkout} minutes
              </label>
              <input
                type="range"
                min="30"
                max="120"
                step="15"
                value={formData.timePerWorkout}
                onChange={(e) => setFormData(prev => ({ ...prev, timePerWorkout: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>30</span>
                <span>45</span>
                <span>60</span>
                <span>75</span>
                <span>90</span>
                <span>105</span>
                <span>120</span>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateWorkout}
              disabled={isGenerating || formData.equipment.length === 0}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating Workout...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>Generate Workout</span>
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Generated Workout */}
        <div className="space-y-6">
          {generatedWorkout ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {generatedWorkout.name}
                  </h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={saveToRoutines}
                    className="btn-secondary flex items-center space-x-1 text-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={exportWorkout}
                    className="btn-secondary flex items-center space-x-1 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {generatedWorkout.description}
              </p>

              <div className="space-y-4">
                {generatedWorkout.days.map((day, dayIndex) => (
                  <div key={dayIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {day.day} - {day.focus}
                      </h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {day.estimatedDuration} min
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {day.exercises.map((exercise, exerciseIndex) => (
                        <div key={exerciseIndex} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {exercise.exercise.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {exercise.exercise.primary_muscle}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {exercise.sets} × {exercise.reps}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Rest: {exercise.restTime}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {generatedWorkout.notes.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Notes:</h4>
                  <ul className="space-y-1">
                    {generatedWorkout.notes.map((note, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start space-x-2">
                        <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <div className="text-center py-12">
                <Brain className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ready to Generate Your Workout
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Fill out your preferences on the left and click "Generate Workout" to create your personalized routine.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 