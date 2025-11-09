import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { getSTID } from './hooks/useSessionTracking';
import { initializeInteractionTracking } from './utilities/interactionTracker';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Initialize session tracking (generate STID if not exists)
if (typeof window !== 'undefined') {
  getSTID();

  // Initialize interaction tracking with delegated event listeners
  initializeInteractionTracking();

  // Set up global error handler for uncaught errors
  window.addEventListener('error', (event) => {
    // Error reporting will be handled by error boundaries and the reportCreate utility
    console.error('Uncaught error:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <React.StrictMode>
      <AuthProvider>
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </AuthProvider>
    </React.StrictMode>
  </GoogleOAuthProvider>
);
