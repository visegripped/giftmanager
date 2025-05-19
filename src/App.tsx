import { useContext, useEffect, useState } from 'react';
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
import { setThemeOnBody } from './utilities/setThemeOnBody';
import NotificationList from './components/NotificationList/NotificationList';
import AuthButton from './components/AuthButton/AuthButton';
import UserChooser from './components/UserChooser/UserChooser';

type fallbackRenderPropsInterface = {
  error: Error;
};

function App() {
  const { accessToken } = useContext(AuthContext) as AuthContextInterface;
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
      report: 'Error caught by errorBoundary',
      body: {
        stackTrace: JSON.stringify(info),
        error: JSON.stringify(error),
        origin: 'errorBoundary',
        file: 'App',
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

        <nav className="navbar">{accessToken ? <UserChooser /> : <></>}</nav>

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
          <NotificationsProvider>
            <div className="notifications">
              <NotificationList />
            </div>
            {accessToken ? (
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
          &copy; Copyright 2010 - {currentDate.getFullYear()}. All rights
          reserved.
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
          |{' '}
          <Link to={routeConstants.ADMIN} className="logo">
            Admin
          </Link>
          |{' '}
          <Link to={routeConstants.THEME} className="logo">
            Theme Test
          </Link>
        </div>
      </footer>
      <div className="half-circle"></div>
    </Router>
  );
}

export default App;
