'use client';

import '@/src/utilities/agGridSetup';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/src/context/AuthContext';
import { ProfileProvider } from '@/src/context/ProfileContext';
import { NotificationsProvider } from '@/src/context/NotificationsContext';
import { getSTID } from '@/src/hooks/useSessionTracking';
import { initializeInteractionTracking } from '@/src/utilities/interactionTracker';
import { useEffect } from 'react';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    getSTID();
    initializeInteractionTracking();

    const onError = (event: ErrorEvent) => {
      console.error('Uncaught error:', event.error);
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <ProfileProvider>
          <NotificationsProvider>{children}</NotificationsProvider>
        </ProfileProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
