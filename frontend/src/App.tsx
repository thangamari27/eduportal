// App.tsx (Simplified)
import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ApplicationProvider } from './contexts/ApplicationContext';
import AppContent from './AppContent'; 
import { AdminProvider } from './contexts/AdminContext';

function App() {
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  return (
    <AuthProvider>
        <AdminProvider>
            <ApplicationProvider token={getAuthToken() || undefined}>
              <AppContent />
            </ApplicationProvider>
        </AdminProvider>
    </AuthProvider>
  );
}

export default App;