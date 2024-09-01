import { useState, useEffect, useContext } from 'react';
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import './App.css';
import routeConstants from '@routes/routeContstants';
import { Me, User, Error404, Theme } from '@pages/';
import { AuthContext } from '@context/AuthContext';
import { NotificationsProvider } from '@context/NotificationsContext';
import Present from '@assets/present-optimized.svg';
import postReport from '@utilities/postReport';
import { setThemeOnBody } from '@utilities/setThemeOnBody';
import NotificationList from '@components/NotificationList';
import AuthButton from '@components/AuthButton';

type fallbackRenderPropsInterface = {
  error: Error;
};

function App() {
  const { accessToken } = useContext(AuthContext);
  let currentDate = new Date();

  const selectedThemeAtLoad = localStorage.getItem('theme') || 'theme__default';
  const [theme, setTheme] = useState(selectedThemeAtLoad);

  useEffect(() => {
    if (theme) {
      setThemeOnBody(theme);
    }
  }, [theme]);

  const updateTheme = () => {
    const newTheme = 'theme__default';
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
    setThemeOnBody(newTheme);
  };

  const logError = (error: Error, info: { componentStack: string }) => {
    postReport({
      type: 'error',
      report: error,
      body: {
        stackTrace: info,
        origin: 'errorBoundary',
      },
    });
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

  return (
    <Router>
      <header>
        <Link to={routeConstants.ME} className="logo">
          <div className="logo__mark-container">
            <Present />
          </div>
          <h1 className="logo__word">GiftManager</h1>
        </Link>

        <nav className="navbar">
          <Link to={routeConstants.USER}>user</Link> chooser
        </nav>

        <div className="auth">
          <AuthButton />
        </div>
      </header>

      <main>
        <ErrorBoundary
          fallbackRender={fallbackRender}
          onError={logError}
          // onReset={(details) => {
          //   // Reset the state of your app so the error doesn't happen again - NEED TO EXPLORE THIS
          // }}
        >
          <NotificationsProvider>
            <div className="notifications">
              <NotificationList />
            </div>
            {accessToken ? (
              <Routes>
                <Route path={routeConstants.HOME} Component={Me} />
                <Route path={routeConstants.ME} Component={Me} />
                <Route path={routeConstants.THEME} Component={Theme} />
                <Route path={routeConstants.USER} Component={User} />
                <Route
                  path={`${routeConstants.User}/:userId`}
                  Component={User}
                />
                <Route Component={Error404} />
              </Routes>
            ) : (
              <div className="unauthenticated">
                <h2>You are not logged in.</h2>
                <h3>
                  Please use the sign in button in the upper right corner.
                </h3>
              </div>
            )}
          </NotificationsProvider>
        </ErrorBoundary>
      </main>

      <footer>
        <div>
          &copy; Copyright 2010 - {currentDate.getFullYear()}.<br />
          All rights reserved.
        </div>
        <div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              updateTheme();
            }}
          >
            Use default theme
          </a>
        </div>
      </footer>
      <div className="half-circle"></div>
    </Router>
  );
}

export default App;
