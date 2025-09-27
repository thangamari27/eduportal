// App.tsx (Simplified)
import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ApplicationProvider } from './contexts/ApplicationContext';
import AppContent from './AppContent'; // Import the new component

function App() {
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  return (
    <AuthProvider>
      <ApplicationProvider token={getAuthToken() || undefined}>
        <AppContent />
      </ApplicationProvider>
    </AuthProvider>
  );
}

export default App;