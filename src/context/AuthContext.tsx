import {
  useState,
  createContext,
  useEffect,
  useCallback,
  PropsWithChildren,
  useContext,
} from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google'; // docs: https://www.npmjs.com/package/@react-oauth/google
import {
  NotificationsContext,
  NotificationContextProps,
} from './NotificationsContext';

export interface AuthContextInterface {
  login: () => {};
  logout: () => {};
  accessToken: string;
  setAccessToken: (accessToken: string) => {};
}

const AuthContext = createContext({});
// const refreshTokenUrl = import.meta.env.VITE_REFRESH_TOKEN_URL;
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export interface GoogleAuthResponseInterface {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope: string;
}

function AuthProvider(props: PropsWithChildren) {
  // console.log(' -> props from authProvider', props);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('access_token') || ''
  );
  const [accessTokenExpiration, setAccessTokenExpiration] = useState<
    Date | string
  >(localStorage.getItem('access_token_expiration') || '');

  const { addNotification } = useContext(
    NotificationsContext
  ) as NotificationContextProps;

  const handleGoogleTokenExpiration = () => {
    let currentTime = new Date().getTime();
    const expirationTime = new Date(currentTime + 2 * 60 * 60 * 1000); // 2 hours for token life
    setAccessTokenExpiration(expirationTime);
    localStorage.setItem('access_token_expiration', expirationTime.toString());
  };

  const onLoginSuccess = (authResponse: GoogleAuthResponseInterface) => {
    const { access_token, refresh_token } = authResponse;
    setAccessToken(access_token);
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token || '');
    handleGoogleTokenExpiration();
  };

  const onLoginFailure = (authResponse: GoogleAuthResponseInterface) => {
    addNotification({
      message: `Something has gone wrong with your authentication.  This may help: ${JSON.stringify(
        authResponse
      )}`,
      type: 'error',
    });
  };

  const login = useGoogleLogin({
    onSuccess: onLoginSuccess,
    // @ts-ignore: todo - remove this and address TS issue.
    onError: onLoginFailure,
    client_id: googleClientId,
    scope: 'openid profile email',
  });

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('tokenId');
    setAccessToken('');
    googleLogout();
  };

  const validateTokenViaAPI = useCallback(async () => {
    if (!accessToken) return false;

    try {
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' +
          accessToken
      );
      const data = await response.json();

      if (data.error_description) {
        logout();
        return false;
      }

      return true;
    } catch (error) {
      logout();
      return false;
    }
  }, [accessToken, logout]);

  const tokenIsValid = useCallback(async () => {
    if (!accessToken) {
      return false;
    }
    const currentTime = new Date();
    if (currentTime >= accessTokenExpiration) {
      return false;
    }
    if (!(await validateTokenViaAPI())) {
      return false;
    }

    return true;
  }, [accessToken, accessTokenExpiration, validateTokenViaAPI]);

  useEffect(() => {
    const checkToken = async () => {
      if (!accessToken || !(await tokenIsValid())) {
        logout();
      }
    };
    checkToken();
  }, [accessToken, tokenIsValid, logout]);

  // Automatically log the user out when the access token expires,
  // and record the reason so the UI can show an appropriate message.
  useEffect(() => {
    if (!accessToken || !accessTokenExpiration) {
      return;
    }

    const expirationTime = new Date(accessTokenExpiration).getTime();
    const now = Date.now();
    const timeoutMs = expirationTime - now;

    if (Number.isNaN(timeoutMs)) {
      return;
    }

    // If already expired, log out immediately.
    if (timeoutMs <= 0) {
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('logout_reason', 'inactivity');
        }
      } catch (error) {
        console.error('Failed to store logout_reason in sessionStorage', error);
      }
      logout();
      return;
    }

    const timerId = window.setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('logout_reason', 'inactivity');
        }
      } catch (error) {
        console.error('Failed to store logout_reason in sessionStorage', error);
      }
      logout();
    }, timeoutMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [accessToken, accessTokenExpiration, logout]);

  return (
    <AuthContext.Provider
      value={{ login, logout, accessToken, setAccessToken }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
export default AuthContext;
