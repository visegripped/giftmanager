import { useContext, useEffect, useState, useMemo } from 'react';
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import './App.css';
import routeConstants from './routes/routeContstants';
import Error404 from './pages/Error404/Error404';
import Theme from './pages/Theme/Theme';
import Admin from './pages/Admin/Admin';
import Me from './pages/Me/Me';
import User from './pages/User/User';
import { AuthContext, AuthContextInterface } from './context/AuthContext';
import { NotificationsProvider } from './context/NotificationsContext';
import Present from '@assets/present-optimized.svg';
import postReport from './utilities/postReport';
import { reportCreate } from './utilities/reportCreate';
import { trackPageLoad } from './utilities/performanceTracker';
import { setThemeOnBody } from './utilities/setThemeOnBody';
import NotificationList from './components/NotificationList/NotificationList';
import AuthButton from './components/AuthButton/AuthButton';
import UserChooser from './components/UserChooser/UserChooser';
import {
  ProfileContext,
  ProfileContextInterface,
} from './context/ProfileContext';

type fallbackRenderPropsInterface = {
  error: Error;
};

function App() {
  const { accessToken } = useContext(AuthContext) as AuthContextInterface;
  const { myProfile } = useContext(ProfileContext) as ProfileContextInterface;
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!(accessToken && myProfile && myProfile.userid)
  );

  // Memoize current year to avoid creating new Date on every render
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const selectedThemeAtLoad = localStorage.getItem('theme') || 'theme__default';
  const [theme, setTheme] = useState(selectedThemeAtLoad);

  useEffect(() => {
    if (theme) {
      setThemeOnBody(theme);
    }
  }, [theme]);

  // Track page load performance
  useEffect(() => {
    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      trackPageLoad();
    } else {
      window.addEventListener('load', trackPageLoad);
      return () => window.removeEventListener('load', trackPageLoad);
    }
  }, []);

  useEffect(() => {
    console.log('auth state changed:', { accessToken, myProfile });
    const nextIsAuthenticated = !!(
      accessToken &&
      myProfile &&
      myProfile.userid
    );
    console.log(`isAuthenticated will be set to: ${nextIsAuthenticated}`);
    setIsAuthenticated(nextIsAuthenticated);
  }, [accessToken, myProfile]);

  // Check if user is admin (userid === 1)
  const isAdmin = String(myProfile.userid) === '1';

  const updateTheme = () => {
    const newTheme = 'theme__default';
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
    setThemeOnBody(newTheme);
  };

  const logError = (error: Error, info: { componentStack: string }) => {
    // Use new reporting system
    const stid = sessionStorage.getItem('giftmanager_stid') || '';
    if (stid) {
      reportCreate({
        stid,
        report_type: 'error',
        component: 'App',
        message: 'Error caught by errorBoundary',
        stack_trace: error.stack || JSON.stringify(info),
        metadata: {
          error: error.message,
          errorName: error.name,
          componentStack: info.componentStack,
          origin: 'errorBoundary',
        },
      }).catch((reportError) => {
        console.error('Failed to report error:', reportError);
        // Fallback to old postReport
        postReport({
          type: 'error',
          report: 'Error caught by errorBoundary',
          body: {
            stackTrace: JSON.stringify(info),
            error: JSON.stringify(error),
            origin: 'errorBoundary',
            file: 'App',
          },
        });
      });
    } else {
      // Fallback to old postReport if no STID
      postReport({
        type: 'error',
        report: 'Error caught by errorBoundary',
        body: {
          stackTrace: JSON.stringify(info),
          error: JSON.stringify(error),
          origin: 'errorBoundary',
          file: 'App',
        },
      });
    }
  };

  const fallbackRender = (props: fallbackRenderPropsInterface) => {
    const { error } = props;
    const { resetBoundary } = useErrorBoundary();
    return (
      <div role="alert">
        <p>Something went wrong:</p>
        <pre style={{ color: 'red' }}>{error.message}</pre>
        <button onClick={resetBoundary}>Try again</button>
      </div>
    );
  };

  const LoadingStates = (props: { accessToken: string }) => {
    const { accessToken } = props;
    return accessToken ? (
      <div>Loading your profile...</div>
    ) : (
      <div className="unauthenticated">
        <h2>You are not logged in.</h2>
        <h3>Please use the sign in button in the upper right corner.</h3>
      </div>
    );
  };

  return (
    <NotificationsProvider>
      <Router>
        <header>
          <Link to={routeConstants.ME} className="logo">
            <div className="logo__mark-container">
              <Present />
            </div>
            <h1 className="logo__word">GiftManager</h1>
          </Link>

          <nav className="navbar">
            {isAuthenticated ? <UserChooser /> : <></>}
          </nav>

          <div className="auth">
            <AuthButton />
          </div>
        </header>

        <main>
          <ErrorBoundary
            fallbackRender={fallbackRender}
            // @ts-ignore: todo - remove this and address TS issue.
            onError={logError}
            // onReset={(details) => {
            //   // Reset the state of your app so the error doesn't happen again - NEED TO EXPLORE THIS
            // }}
          >
            <div className="notifications">
              <NotificationList />
            </div>
            {isAuthenticated ? (
              <Routes>
                <Route path={routeConstants.HOME} Component={Me} />
                <Route path={routeConstants.ME} Component={Me} />
                <Route path={routeConstants.THEME} Component={Theme} />
                <Route path={routeConstants.ADMIN} Component={Admin} />
                <Route path={routeConstants.USER} Component={User} />
                <Route
                  path={`${routeConstants.USER}/:userid`}
                  Component={User}
                />
                <Route Component={Error404} />
              </Routes>
            ) : (
              <LoadingStates accessToken={accessToken} />
            )}
          </ErrorBoundary>
        </main>

        <footer>
          <div>&copy; Copyright 2010 - {currentYear}. All rights reserved.</div>
          <div>
            v1.0.0 |
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
                | <Link to={routeConstants.ADMIN}>Admin</Link> |
                <Link to={routeConstants.THEME}>Theme Test</Link>
              </>
            )}
          </div>
        </footer>
        <div className="half-circle"></div>
      </Router>
    </NotificationsProvider>
  );
}

export default App;
