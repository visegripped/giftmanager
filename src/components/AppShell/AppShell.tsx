'use client';

import { useContext, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import '@/src/App.css';
import routeConstants from '@/src/routes/routeContstants';
import { AuthContext, AuthContextInterface } from '@/src/context/AuthContext';
import Present from '@/src/assets/present-optimized.svg';
import postReport from '@/src/utilities/postReport';
import { reportCreate } from '@/src/utilities/reportCreate';
import { trackPageLoad } from '@/src/utilities/performanceTracker';
import { setThemeOnBody } from '@/src/utilities/setThemeOnBody';
import NotificationList from '@/src/components/NotificationList/NotificationList';
import AuthButton from '@/src/components/AuthButton/AuthButton';
import UserChooser from '@/src/components/UserChooser/UserChooser';
import {
  ProfileContext,
  ProfileContextInterface,
} from '@/src/context/ProfileContext';

function LoadingStates({ accessToken }: { accessToken: string }) {
  const [logoutReason] = useState(() => {
    if (typeof window === 'undefined') return '';
    const reason = window.sessionStorage.getItem('logout_reason') || '';
    if (reason) window.sessionStorage.removeItem('logout_reason');
    return reason;
  });

  if (accessToken) {
    return <div>Loading your profile...</div>;
  }

  if (logoutReason === 'inactivity') {
    return (
      <div className="unauthenticated">
        <h2>You were logged out due to inactivity.</h2>
        <h3>
          Please sign in again using the button in the upper right corner.
        </h3>
      </div>
    );
  }

  return (
    <div className="unauthenticated">
      <h2>You are not logged in.</h2>
      <h3>Please use the sign in button in the upper right corner.</h3>
    </div>
  );
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { accessToken } = useContext(AuthContext) as AuthContextInterface;
  const { myProfile } = useContext(ProfileContext) as ProfileContextInterface;
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!(accessToken && myProfile && myProfile.userid)
  );

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const selectedThemeAtLoad =
    typeof window !== 'undefined'
      ? localStorage.getItem('theme') || 'theme__default'
      : 'theme__default';
  const [theme, setTheme] = useState(selectedThemeAtLoad);

  useEffect(() => {
    if (theme) setThemeOnBody(theme);
  }, [theme]);

  useEffect(() => {
    if (document.readyState === 'complete') {
      trackPageLoad();
    } else {
      window.addEventListener('load', trackPageLoad);
      return () => window.removeEventListener('load', trackPageLoad);
    }
  }, []);

  useEffect(() => {
    const nextIsAuthenticated = !!(
      accessToken &&
      myProfile &&
      myProfile.userid
    );
    setIsAuthenticated(nextIsAuthenticated);
  }, [accessToken, myProfile]);

  const isAdmin = myProfile?.userid ? String(myProfile.userid) === '1' : false;

  const updateTheme = () => {
    const newTheme = 'theme__default';
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
    setThemeOnBody(newTheme);
  };

  const logError = (
    error: unknown,
    info: { componentStack?: string | null }
  ) => {
    const err = error instanceof Error ? error : new Error(String(error));
    const stid = sessionStorage.getItem('giftmanager_stid') || '';
    if (stid) {
      reportCreate({
        stid,
        report_type: 'error',
        component: 'AppShell',
        message: 'Error caught by errorBoundary',
        stack_trace: err.stack || JSON.stringify(info),
        metadata: {
          error: err.message,
          errorName: err.name,
          componentStack: info.componentStack,
          origin: 'errorBoundary',
        },
      }).catch((reportError) => {
        console.error('Failed to report error:', reportError);
        postReport({
          type: 'error',
          report: 'Error caught by errorBoundary',
          body: {
            stackTrace: JSON.stringify(info),
            error: JSON.stringify(err),
            origin: 'errorBoundary',
            file: 'AppShell',
          },
        });
      });
    } else {
      postReport({
        type: 'error',
        report: 'Error caught by errorBoundary',
        body: {
          stackTrace: JSON.stringify(info),
          error: JSON.stringify(error),
          origin: 'errorBoundary',
          file: 'AppShell',
        },
      });
    }
  };

  const appVersion =
    process.env.NEXT_PUBLIC_APP_VERSION ??
    process.env.npm_package_version ??
    '2.0.0';

  return (
    <div id="root">
      <header>
        <Link href={routeConstants.ME} className="logo">
          <div className="logo__mark-container">
            <Present />
          </div>
          <h1 className="logo__word">GiftManager</h1>
        </Link>

        <nav className="navbar">{isAuthenticated ? <UserChooser /> : null}</nav>

        <div className="auth">
          <AuthButton />
        </div>
      </header>

      <main>
        <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
          <div className="notifications">
            <NotificationList />
          </div>
          {isAuthenticated ? (
            children
          ) : (
            <LoadingStates accessToken={accessToken} />
          )}
        </ErrorBoundary>
      </main>

      <footer>
        <div>&copy; Copyright 2010 - {currentYear}. All rights reserved.</div>
        <div>
          v{appVersion} |
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              updateTheme();
            }}
          >
            Use default theme
          </a>
          {isAdmin && (
            <>
              {' '}
              | <Link href={routeConstants.ADMIN}>Admin</Link> |
              <Link href={routeConstants.THEME}>Theme Test</Link>
            </>
          )}
        </div>
      </footer>
      <div className="half-circle"></div>
    </div>
  );
}
