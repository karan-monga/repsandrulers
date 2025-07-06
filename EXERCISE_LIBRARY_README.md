# Exercise Library & Routines Feature

This document describes the implementation of the Exercise Library and My Routines features for the Reps & Rulers fitness tracking app.

## 🎯 Overview

The Exercise Library & Routines feature adds a comprehensive exercise management system to the existing measurement-tracking app, allowing users to:

- Browse a curated catalog of exercises organized by Push/Pull/Legs splits
- Search and filter exercises by name, muscle group, and split type
- View detailed exercise information including technique notes and video links
- Create and manage workout routines with day-based organization
- Add exercises to routines with customizable sets, reps, and rest intervals

## 🏗️ Architecture

### Database Schema

The feature introduces four new tables to the existing Supabase database:

1. **exercises** - Stores exercise information and metadata
2. **routines** - User-created workout routines
3. **routine_days** - Days within routines (Monday-Sunday)
4. **routine_exercises** - Exercises assigned to specific routine days

### Key Features

- **Row Level Security (RLS)** - Ensures users can only access their own routines
- **Caching** - React Query provides efficient data caching with 15-minute stale time
- **Type Safety** - Full TypeScript support with comprehensive type definitions
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🚀 Getting Started

### 1. Database Setup

Run the SQL schema in your Supabase database:

```sql
-- Execute the contents of database_schema.sql
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Import Sample Exercise Data

```bash
npm run import-exercises
```

This will import the sample PPL program from `sample_exercises.csv`.

### 4. Start Development Server

```bash
npm run dev
```

## 📁 File Structure

```
src/
├── components/
│   ├── exercises/
│   │   ├── ExerciseCard.tsx          # Exercise display card
│   │   ├── ExerciseModal.tsx         # Detailed exercise view
│   │   └── LibraryPage.tsx           # Main library page
│   └── routines/
│       └── RoutinePicker.tsx         # Routine selection modal
├── hooks/
│   └── useExercises.ts               # React Query hooks
├── lib/
│   └── exerciseApi.ts                # API service functions
├── types/
│   └── exercise.ts                   # TypeScript interfaces
└── scripts/
    └── import-exercises.js           # CSV import script
```

## 🎨 UI Components

### ExerciseCard
- Displays exercise information in a card format
- Shows exercise image, name, muscle group, and split type
- Hover overlay with "Add to Routine" button
- Click to view detailed information

### ExerciseModal
- Full-screen modal with comprehensive exercise details
- Technique notes and video links
- Substitution exercises list
- Direct "Add to Routine" functionality

### LibraryPage
- Search and filter functionality
- Split type tabs (All, Push, Pull, Legs, Custom)
- Muscle group filter dropdown
- Responsive grid layout

### RoutinePicker
- Modal for selecting existing routines
- Create new routine functionality
- Automatic routine day creation based on exercise split type

## 🔧 API Endpoints

The feature uses Supabase's built-in REST API with the following operations:

### Exercises
- `GET /exercises` - List exercises with optional filters
- `GET /exercises/:id` - Get specific exercise details

### Routines
- `GET /routines` - List user's routines
- `POST /routines` - Create new routine
- `PATCH /routines/:id` - Update routine name
- `DELETE /routines/:id` - Delete routine

### Routine Days
- `POST /routines/:id/days` - Add day to routine
- `PATCH /routine_days/:id` - Update routine day
- `DELETE /routine_days/:id` - Delete routine day

### Routine Exercises
- `POST /routine_days/:id/exercises` - Add exercise to day
- `PATCH /routine_exercises/:id` - Update exercise parameters
- `DELETE /routine_exercises/:id` - Remove exercise from day

## 🎯 User Flows

### Browse and Add Exercise
1. Navigate to "Exercise Library" in sidebar
2. Use search and filters to find exercises
3. Click exercise card to view details
4. Click "Add to Routine" button
5. Select existing routine or create new one
6. Exercise is automatically added to appropriate day

### Create Routine
1. Add any exercise to routine (creates routine automatically)
2. Or use "My Routines" page (coming soon)
3. Customize exercise parameters (sets, reps, rest)
4. Organize exercises by day and split type

## 🔒 Security

- **Row Level Security (RLS)** ensures users can only access their own data
- **Exercise Library** is read-only for all authenticated users
- **Routine Management** is restricted to the routine owner
- **Admin-only** exercise creation and modification

## 🎨 Styling

The feature follows the existing app's design system:

- **Dark Mode Support** - Consistent with app theme
- **Tailwind CSS** - Utility-first styling approach
- **Responsive Design** - Mobile-first approach
- **Accessibility** - Proper ARIA labels and keyboard navigation

## 🚧 Future Enhancements

### Phase 2 Features (Planned)
- **Routine Builder UI** - Drag-and-drop exercise reordering
- **Workout Logging** - Track actual sets, reps, and weights
- **Progress Tracking** - Charts and analytics for routine performance
- **Exercise Substitutions** - Smart substitution recommendations
- **Routine Templates** - Pre-built routine sharing

### Phase 3 Features (Future)
- **Media Upload** - Custom exercise images and videos
- **Routine Marketplace** - Share and sell routines
- **Advanced Analytics** - Detailed performance insights
- **Mobile App** - Native mobile experience

## 🐛 Troubleshooting

### Common Issues

1. **Exercises not loading**
   - Check Supabase connection
   - Verify RLS policies are enabled
   - Ensure exercises table exists

2. **Routine creation fails**
   - Verify user authentication
   - Check RLS policies for routines table
   - Ensure proper user_id assignment

3. **Import script errors**
   - Verify environment variables
   - Check CSV file format
   - Ensure database schema is created

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'exercise-library');
```

## 📝 Contributing

When adding new features:

1. Follow existing TypeScript patterns
2. Add proper error handling
3. Include loading states
4. Test with dark/light themes
5. Ensure mobile responsiveness
6. Add comprehensive documentation

## 📄 License

This feature is part of the Reps & Rulers app and follows the same licensing terms. 