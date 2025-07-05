# Supabase Setup Guide

## Database Setup

1. **Run the SQL script** in your Supabase project:
   - Go to your Supabase dashboard
   - Navigate to the SQL Editor
   - Copy and paste the contents of `supabase-setup.sql`
   - Run the script

2. **Enable Row Level Security (RLS)**:
   - The script automatically enables RLS on all tables
   - Policies are created to ensure users can only access their own data

3. **Verify the setup**:
   - Check that the following tables were created:
     - `profiles`
     - `measurements`
     - `goals`
   - Verify that RLS policies are in place

## Environment Variables

The app is already configured with your Supabase credentials:
- URL: `https://nflljrrxokrsedotzpmr.supabase.co`
- Anon Key: (configured in `src/lib/supabase.ts`)

## Features

### Authentication
- Email/password authentication
- Automatic profile creation on signup
- Session management

### Data Storage
- **Profiles**: User preferences (unit preference)
- **Measurements**: All measurement data with flat structure
- **Goals**: Weight goals with milestones

### Security
- Row Level Security (RLS) ensures data isolation
- Users can only access their own data
- Automatic user profile creation

## Migration from Firebase

The app has been migrated from Firebase to Supabase:
- ✅ Authentication system updated
- ✅ Database schema migrated
- ✅ Components updated for new data structure
- ✅ Build successful

## Next Steps

1. **Deploy to Vercel** (recommended):
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set up environment variables** in Vercel:
   - Add your Supabase URL and anon key as environment variables

3. **Test the application**:
   - Create a new account
   - Add measurements
   - Test all features

## Database Schema

### Profiles Table
```sql
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  unit_preference TEXT DEFAULT 'metric',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### Measurements Table
```sql
measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  chest DECIMAL(5,2),
  waist DECIMAL(5,2),
  hips DECIMAL(5,2),
  biceps DECIMAL(5,2),
  forearms DECIMAL(5,2),
  thighs DECIMAL(5,2),
  calves DECIMAL(5,2),
  left_thigh DECIMAL(5,2),
  right_thigh DECIMAL(5,2),
  left_calf DECIMAL(5,2),
  right_calf DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### Goals Table
```sql
goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'weight',
  target_value DECIMAL(5,2) NOT NULL,
  current_value DECIMAL(5,2) NOT NULL,
  start_date DATE NOT NULL,
  target_date DATE,
  milestones JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

## Troubleshooting

### Common Issues

1. **"Table doesn't exist" errors**:
   - Make sure you ran the SQL setup script
   - Check that you're in the correct Supabase project

2. **Authentication errors**:
   - Verify your Supabase URL and anon key
   - Check that email authentication is enabled in Supabase

3. **RLS errors**:
   - Ensure RLS policies are properly set up
   - Check that the user is authenticated

### Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your Supabase project settings
3. Ensure all environment variables are set correctly 