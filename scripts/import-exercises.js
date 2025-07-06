import fs from 'fs';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to determine split type from section
function getSplitType(section) {
  if (section.toLowerCase().includes('push')) return 'Push';
  if (section.toLowerCase().includes('pull')) return 'Pull';
  if (section.toLowerCase().includes('legs')) return 'Legs';
  return 'Custom';
}

// Function to import exercises
async function importExercises() {
  const exercises = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream('sample_exercises.csv')
      .pipe(csv())
      .on('data', (row) => {
        const exercise = {
          name: row['Exercise Name'],
          primary_muscle: row['Primary Muscle'],
          split_type: getSplitType(row['Section']),
          default_sets: parseInt(row['Sets']),
          default_reps: row['Reps'],
          rest_interval: row['Rest'],
          link_url: row['Link'] || null,
          notes: row['Notes'] || null,
          substitution_ids: [], // Will be populated later if needed
          image_url: null, // Will be added later
          source: 'science_based_ppl_v1'
        };
        exercises.push(exercise);
      })
      .on('end', async () => {
        try {
          console.log(`Importing ${exercises.length} exercises...`);
          
          // Insert exercises in batches
          const batchSize = 10;
          for (let i = 0; i < exercises.length; i += batchSize) {
            const batch = exercises.slice(i, i + batchSize);
            const { data, error } = await supabase
              .from('exercises')
              .insert(batch)
              .select();
            
            if (error) {
              console.error('Error inserting batch:', error);
              reject(error);
              return;
            }
            
            console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(exercises.length / batchSize)}`);
          }
          
          console.log('Exercise import completed successfully!');
          resolve();
        } catch (error) {
          console.error('Error during import:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
}

// Run the import
importExercises()
  .then(() => {
    console.log('Import script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import script failed:', error);
    process.exit(1);
  }); 