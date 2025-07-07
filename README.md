# Fitness Tracker App

A modern fitness tracking application built with React, Vite, TypeScript, and Supabase. Track your measurements, set goals, and visualize your progress over time.

## Features

- 🔐 User authentication with Supabase Auth
- 📊 Measurement tracking (weight, body measurements)
- 🎯 Goal setting and progress tracking
- 📈 Interactive charts and visualizations
- 🌙 Dark mode support
- 📱 Responsive design
- ⚡ Fast development with Vite

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Charts**: Chart.js with react-chartjs-2
- **State Management**: React Context + TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Set up Supabase:
- Create a new Supabase project
- Run the SQL setup script from `supabase-setup.sql` in your Supabase SQL editor
- Copy your project URL and anon key to the `.env` file

5. Start the development server:
```bash
npm run dev
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add environment variables in Vercel:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
4. Deploy!

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Database Schema

The app uses the following tables:
- `profiles`: User profiles and preferences
- `measurements`: Body measurements and weight tracking
- `goals`: User fitness goals

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License # Renpho Data Feature - Ready for Import
