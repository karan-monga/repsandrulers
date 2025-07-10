import OpenAI from 'openai';
import { exerciseApi } from './exerciseApi';
import { Exercise, SplitType } from '@/types/exercise';

export interface WorkoutGeneratorRequest {
  goal: 'muscle_building' | 'strength' | 'weight_loss' | 'endurance' | 'general_fitness';
  experience: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number;
  equipment: string[];
  focusAreas?: string[];
  timePerWorkout?: number;
  splitType?: SplitType;
}

export interface GeneratedWorkout {
  name: string;
  description: string;
  days: WorkoutDay[];
  totalDuration: number;
  difficulty: string;
  notes: string[];
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: WorkoutExercise[];
  estimatedDuration: number;
}

export interface WorkoutExercise {
  exercise: Exercise;
  sets: number;
  reps: string;
  restTime: string;
  notes?: string;
}

// Initialize OpenAI client only if API key is available
let openai: OpenAI | null = null;

try {
  if (import.meta.env.VITE_OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }
} catch (error) {
  console.warn('Failed to initialize OpenAI client:', error);
}

export const workoutGeneratorApi = {
  async generateWorkout(request: WorkoutGeneratorRequest): Promise<GeneratedWorkout> {
    try {
      // Get available exercises from the database
      const allExercises = await exerciseApi.getExercises();
      
      // Filter exercises based on equipment availability
      const availableExercises = allExercises.filter(exercise => {
        // For now, assume all exercises are available
        // In the future, we can add equipment filtering logic
        return true;
      });

      // Check if OpenAI API key is available
      if (!import.meta.env.VITE_OPENAI_API_KEY || !openai) {
        console.warn('OpenAI API key not found, using simulated workout generation');
        return this.simulateWorkoutGeneration(request, availableExercises);
      }

      // Create a comprehensive prompt for workout generation
      const prompt = `Generate a personalized workout routine based on these requirements:

User Requirements:
- Goal: ${request.goal}
- Experience Level: ${request.experience}
- Days per week: ${request.daysPerWeek}
- Available equipment: ${request.equipment.join(', ')}
- Focus areas: ${request.focusAreas?.join(', ') || 'General'}
- Time per workout: ${request.timePerWorkout || 60} minutes
- Split type preference: ${request.splitType || 'Any'}

Available Exercises (${availableExercises.length} total):
${availableExercises.map(ex => 
  `- ${ex.name} (${ex.primary_muscle}, ${ex.split_type}, ${ex.default_sets} sets, ${ex.default_reps} reps)`
).slice(0, 50).join('\n')}

Please create a complete workout routine in this JSON format:
{
  "name": "Workout Name",
  "description": "Brief description of the workout",
  "days": [
    {
      "day": "Day 1",
      "focus": "Push",
      "exercises": [
        {
          "exerciseName": "Exercise Name",
          "sets": 3,
          "reps": "8-12",
          "restTime": "90s",
          "notes": "Optional notes"
        }
      ],
      "estimatedDuration": 45
    }
  ],
  "totalDuration": 180,
  "difficulty": "Beginner/Intermediate/Advanced",
  "notes": ["Note 1", "Note 2"]
}

Guidelines:
1. Match exercises to user's equipment availability
2. Consider experience level for exercise selection and volume
3. Balance muscle groups appropriately
4. Include proper warm-up and cool-down recommendations
5. Provide realistic rest times and set/rep schemes
6. Focus on the user's specific goal
7. Ensure total workout time matches user's availability

Return only valid JSON.`;

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a certified personal trainer and fitness expert. Create personalized workout routines that are safe, effective, and tailored to the user's specific needs and equipment."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      try {
        const generatedWorkout = JSON.parse(response);
        
        // Map exercise names back to actual exercise objects
        const mappedWorkout = await this.mapExerciseNamesToObjects(generatedWorkout, availableExercises);
        
        return mappedWorkout;
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        console.log('Raw response:', response);
        // Fallback to simulated response if parsing fails
        return this.simulateWorkoutGeneration(request, availableExercises);
      }
      
    } catch (error) {
      console.error('Error generating workout:', error);
      // Fallback to simulated response
      const allExercises = await exerciseApi.getExercises();
      return this.simulateWorkoutGeneration(request, allExercises);
    }
  },

  async mapExerciseNamesToObjects(generatedWorkout: any, availableExercises: Exercise[]): Promise<GeneratedWorkout> {
    const mappedDays = await Promise.all(generatedWorkout.days.map(async (day: any) => {
      const mappedExercises = await Promise.all(day.exercises.map(async (exerciseData: any) => {
        // Find the exercise by name (case-insensitive)
        const exercise = availableExercises.find(ex => 
          ex.name.toLowerCase().includes(exerciseData.exerciseName.toLowerCase()) ||
          exerciseData.exerciseName.toLowerCase().includes(ex.name.toLowerCase())
        );

        if (!exercise) {
          // If exact match not found, use a similar exercise from the same muscle group
          const similarExercise = availableExercises.find(ex => 
            ex.primary_muscle.toLowerCase().includes(exerciseData.exerciseName.toLowerCase()) ||
            ex.split_type === day.focus
          );

          if (similarExercise) {
            return {
              exercise: similarExercise,
              sets: exerciseData.sets || 3,
              reps: exerciseData.reps || '8-12',
              restTime: exerciseData.restTime || '90s',
              notes: exerciseData.notes
            };
          }
        }

        return {
          exercise: exercise || availableExercises[0], // Fallback to first exercise
          sets: exerciseData.sets || 3,
          reps: exerciseData.reps || '8-12',
          restTime: exerciseData.restTime || '90s',
          notes: exerciseData.notes
        };
      }));

      return {
        day: day.day,
        focus: day.focus,
        exercises: mappedExercises,
        estimatedDuration: day.estimatedDuration || 45
      };
    }));

    return {
      name: generatedWorkout.name,
      description: generatedWorkout.description,
      days: mappedDays,
      totalDuration: generatedWorkout.totalDuration,
      difficulty: generatedWorkout.difficulty,
      notes: generatedWorkout.notes || []
    };
  },

  // Simulate workout generation for development/testing
  simulateWorkoutGeneration(request: WorkoutGeneratorRequest, availableExercises: Exercise[]): GeneratedWorkout {
    const pushExercises = availableExercises.filter(ex => ex.split_type === 'Push').slice(0, 4);
    const pullExercises = availableExercises.filter(ex => ex.split_type === 'Pull').slice(0, 4);
    const legExercises = availableExercises.filter(ex => ex.split_type === 'Legs').slice(0, 4);

    const days: WorkoutDay[] = [];

    if (request.daysPerWeek >= 3) {
      // Push day
      if (pushExercises.length > 0) {
        days.push({
          day: 'Day 1',
          focus: 'Push',
          exercises: pushExercises.map(ex => ({
            exercise: ex,
            sets: request.experience === 'beginner' ? 3 : 4,
            reps: request.goal === 'strength' ? '5-8' : '8-12',
            restTime: '90s',
            notes: undefined
          })),
          estimatedDuration: 45
        });
      }

      // Pull day
      if (pullExercises.length > 0) {
        days.push({
          day: 'Day 2',
          focus: 'Pull',
          exercises: pullExercises.map(ex => ({
            exercise: ex,
            sets: request.experience === 'beginner' ? 3 : 4,
            reps: request.goal === 'strength' ? '5-8' : '8-12',
            restTime: '90s',
            notes: undefined
          })),
          estimatedDuration: 45
        });
      }

      // Legs day
      if (legExercises.length > 0) {
        days.push({
          day: 'Day 3',
          focus: 'Legs',
          exercises: legExercises.map(ex => ({
            exercise: ex,
            sets: request.experience === 'beginner' ? 3 : 4,
            reps: request.goal === 'strength' ? '5-8' : '8-12',
            restTime: '90s',
            notes: undefined
          })),
          estimatedDuration: 45
        });
      }
    }

    return {
      name: `${request.goal.replace('_', ' ').toUpperCase()} ${request.experience.toUpperCase()} ROUTINE`,
      description: `A ${request.daysPerWeek}-day ${request.experience} workout routine focused on ${request.goal.replace('_', ' ')}.`,
      days,
      totalDuration: days.length * 45,
      difficulty: request.experience,
      notes: [
        'Perform each exercise with proper form',
        'Rest between sets as indicated',
        'Progressive overload: gradually increase weight or reps',
        'Listen to your body and adjust intensity as needed'
      ]
    };
  }
}; 