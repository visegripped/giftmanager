import { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import './App.css';
import routeConstants from '@routes/routeContstants';
import { Me, User, Error404, Theme } from '@pages/';
import present from './assets/present-optimized.svg';
import postReport from '@utilities/postReport';
import { setThemeOnBody } from '@utilities/setThemeOnBody';
import { NotificationsProvider } from '@context/NotificationsContext';
// import Button from '@components/Button';
import NotificationList from '@components/NotificationList';
import Header from '@components/Header';

type fallbackRenderPropsInterface = {
  error: Error;
};

function App() {
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
            <img src={present} className="logo__mark" alt="GiftManager Logo" />
          </div>
          <h1 className="logo__word">GiftManager</h1>
        </Link>

        <nav className="navbar">
          <Link to={routeConstants.USER}>user</Link> chooser
        </nav>

        <div className="auth">login to go here</div>
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
            <Routes>
              <Route path={routeConstants.HOME} Component={Me} />
              <Route path={routeConstants.ME} Component={Me} />
              <Route path={routeConstants.THEME} Component={Theme} />
              <Route path={routeConstants.USER} Component={User} />
              <Route path={`${routeConstants.User}/:userId`} Component={User} />
              <Route Component={Error404} />
            </Routes>
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
