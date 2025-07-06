import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { Dashboard } from './components/dashboard/Dashboard';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

function AppContent() {
  const { user, loading } = useAuth();

  console.log('AppContent render - user:', user, 'loading:', loading);

  if (loading) {
    console.log('Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  console.log('Loading complete, showing main content');
  return user ? <Dashboard /> : <AuthScreen />;
}

function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;