import { useEffect } from 'react';
import { useAuth } from './hooks';
import AppRoutes from './AppRoutes';
import { ErrorBoundary } from './components/core/ErrorBoundary';

function App() {
  const { initializeAuthState } = useAuth();

  useEffect(() => {
    // Initialize auth state from localStorage on app startup
    initializeAuthState();
  }, [initializeAuthState]);

  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}

export default App;
