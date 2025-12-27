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
  authProvider: 'google' | 'facebook' | '';
  facebookLogin: (response: FacebookAuthResponseInterface) => void;
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

export interface FacebookAuthResponseInterface {
  accessToken: string;
  userID: string;
  expiresIn?: number;
  signedRequest?: string;
  graphDomain?: string;
  data_access_expiration_time?: number;
}

function AuthProvider(props: PropsWithChildren) {
  // console.log(' -> props from authProvider', props);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('access_token') || ''
  );
  const [accessTokenExpiration, setAccessTokenExpiration] = useState<
    Date | string
  >(localStorage.getItem('access_token_expiration') || '');
  const [authProvider, setAuthProvider] = useState<'google' | 'facebook' | ''>(
    (localStorage.getItem('auth_provider') as 'google' | 'facebook' | '') || ''
  );

  const { addNotification } = useContext(
    NotificationsContext
  ) as NotificationContextProps;

  const handleTokenExpiration = (expiresIn?: number) => {
    let currentTime = new Date().getTime();
    // Facebook tokens typically expire in 1-2 hours, Google in 2 hours
    const expirationTime = expiresIn
      ? new Date(currentTime + expiresIn * 1000)
      : new Date(currentTime + 2 * 60 * 60 * 1000); // Default 2 hours
    setAccessTokenExpiration(expirationTime);
    localStorage.setItem('access_token_expiration', expirationTime.toString());
  };

  const onLoginSuccess = (
    authResponse: GoogleAuthResponseInterface,
    provider: 'google' | 'facebook' = 'google'
  ) => {
    const { access_token, refresh_token } = authResponse;
    setAccessToken(access_token);
    setAuthProvider(provider);
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token || '');
    localStorage.setItem('auth_provider', provider);
    // Set login timestamp to prevent immediate validation
    localStorage.setItem('login_timestamp', Date.now().toString());
    handleTokenExpiration(authResponse.expires_in);
  };

  const onLoginFailure = (authResponse: GoogleAuthResponseInterface) => {
    addNotification({
      message: `Something has gone wrong with your authentication.  This may help: ${JSON.stringify(
        authResponse
      )}`,
      type: 'error',
      persist: true,
    });
  };

  const login = useGoogleLogin({
    onSuccess: (response) => onLoginSuccess(response, 'google'),
    // @ts-ignore: todo - remove this and address TS issue.
    onError: onLoginFailure,
    client_id: googleClientId,
    scope: 'openid profile email',
  });

  const facebookLogin = (response: FacebookAuthResponseInterface) => {
    if (response.accessToken) {
      const googleFormatResponse: GoogleAuthResponseInterface = {
        access_token: response.accessToken,
        token_type: 'Bearer',
        expires_in: response.expiresIn,
        scope: 'email',
      };
      onLoginSuccess(googleFormatResponse, 'facebook');
    } else {
      addNotification({
        message: 'Facebook login failed. Please try again.',
        type: 'error',
        persist: true,
      });
    }
  };

  const logout = () => {
    const currentProvider = authProvider;
    const hadToken = !!accessToken;

    localStorage.removeItem('access_token');
    localStorage.removeItem('tokenId');
    localStorage.removeItem('auth_provider');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('access_token_expiration');
    localStorage.removeItem('login_timestamp');
    setAccessToken('');
    setAuthProvider('');

    // Logout from the appropriate provider
    if (currentProvider === 'google') {
      googleLogout();
    } else if (currentProvider === 'facebook' && hadToken) {
      // Facebook logout - clear Facebook session
      // Note: react-facebook-login doesn't have a built-in logout function
      // Only attempt logout if we actually had a token (user was logged in)
      try {
        // Check if Facebook SDK is loaded and user has an active session
        if (
          window.FB &&
          window.FB.getAuthResponse &&
          window.FB.getAuthResponse()
        ) {
          window.FB.logout(() => {
            // Callback after logout - nothing to do
          });
        }
      } catch (error) {
        // Silently fail if FB is not available or logout fails
        console.debug('Facebook logout failed:', error);
      }
    }
  };

  const validateTokenViaAPI = useCallback(async () => {
    if (!accessToken || !authProvider) return false;

    try {
      if (authProvider === 'google') {
        const response = await fetch(
          'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' +
            accessToken
        );
        const data = await response.json();

        if (data.error_description) {
          console.debug(
            'Google token validation error:',
            data.error_description
          );
          return false;
        }

        return true;
      } else if (authProvider === 'facebook') {
        // Validate Facebook token using client-side fetch
        // Client-side calls don't require appsecret_proof
        try {
          const graphUrl = new URL('https://graph.facebook.com/v18.0/me');
          graphUrl.searchParams.set('access_token', accessToken);
          graphUrl.searchParams.set('fields', 'id');

          const response = await fetch(graphUrl.toString(), {
            method: 'GET',
            credentials: 'omit', // Don't send cookies, just the access token
          });

          if (!response.ok) {
            // Only treat 401/403 as invalid token, other errors might be temporary
            if (response.status === 401 || response.status === 403) {
              console.debug(
                'Facebook token validation failed: HTTP',
                response.status
              );
              return false;
            }
            // For other HTTP errors, assume token might still be valid (network issue)
            console.debug(
              'Facebook token validation HTTP error (non-auth):',
              response.status
            );
            return true; // Don't logout on network/server errors
          }

          const data = await response.json();

          if (data.error) {
            // Only logout on specific error codes that indicate invalid token
            const errorCode = data.error?.code;
            if (errorCode === 190 || errorCode === 102) {
              // 190 = Invalid OAuth 2.0 Access Token, 102 = Session key invalid
              console.debug('Facebook token validation error:', data.error);
              return false;
            }
            // Other errors might be temporary, don't logout
            console.debug(
              'Facebook token validation error (non-fatal):',
              data.error
            );
            return true;
          }

          // Token is valid if we get user data back
          return !!data.id;
        } catch (error) {
          // Network errors - assume token might still be valid, don't logout
          console.debug(
            'Facebook token validation network error (non-fatal):',
            error
          );
          return true; // Return true to avoid logout on network errors
        }
      }
      return false;
    } catch (error) {
      // Network or other errors - assume token might still be valid
      console.debug('Token validation error (non-fatal):', error);
      return true; // Return true to avoid logout on network errors
    }
  }, [accessToken, authProvider]);

  const tokenIsValid = useCallback(async () => {
    if (!accessToken) {
      return false;
    }

    // Check expiration if it's set
    if (accessTokenExpiration) {
      const expirationDate =
        typeof accessTokenExpiration === 'string'
          ? new Date(accessTokenExpiration)
          : accessTokenExpiration;
      const currentTime = new Date();

      // Only check expiration if it's a valid date
      if (expirationDate instanceof Date && !isNaN(expirationDate.getTime())) {
        if (currentTime >= expirationDate) {
          return false;
        }
      }
    }

    // Skip API validation if token was just set (give it time to propagate)
    // We'll rely on expiration check for now, and API validation happens later
    return true;
  }, [accessToken, accessTokenExpiration]);

  useEffect(() => {
    // Only validate token if we have both accessToken and authProvider
    // This prevents validation from running during login flow
    if (!accessToken || !authProvider) {
      return;
    }

    // Skip validation for a longer period after login to prevent premature logout
    // This gives the token time to be properly stored and the app to initialize
    const loginTimestamp = localStorage.getItem('login_timestamp');
    const now = Date.now();

    // If login was less than 10 seconds ago, skip validation (likely a fresh login)
    // This gives Facebook tokens time to fully initialize and be validated by the app
    if (loginTimestamp && now - parseInt(loginTimestamp) < 10000) {
      console.debug('Skipping token validation - login was recent');
      return;
    }

    const checkToken = async () => {
      // First check basic validity (expiration) - this is synchronous
      const basicValid = await tokenIsValid();
      if (!basicValid) {
        console.debug('Token basic validation failed (expiration)');
        logout();
        return;
      }

      // Then validate via API (but don't logout immediately on failure)
      // Only logout if it's clearly invalid (not a temporary network issue)
      try {
        const isValid = await validateTokenViaAPI();
        if (!isValid) {
          // Token is invalid, logout
          console.debug('Token API validation failed');
          logout();
        } else {
          console.debug('Token validation successful');
        }
      } catch (error) {
        // Network error - don't logout, token might still be valid
        console.debug(
          'Token validation network error, keeping session:',
          error
        );
      }
    };

    // Add a delay before first validation to avoid race conditions
    // Increase delay if login was recent
    const delay =
      loginTimestamp && now - parseInt(loginTimestamp) < 15000 ? 5000 : 2000;

    // For Facebook, validate less frequently to avoid premature logouts
    // Facebook tokens are longer-lived and validation can be more lenient
    const validationInterval = authProvider === 'facebook' ? 60000 : 30000; // 60s for FB, 30s for Google

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const timeoutId = setTimeout(() => {
      checkToken();

      // Set up periodic validation (less frequent for Facebook)
      intervalId = setInterval(() => {
        checkToken();
      }, validationInterval);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [accessToken, authProvider, tokenIsValid, validateTokenViaAPI, logout]);

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
      value={{
        login,
        logout,
        accessToken,
        setAccessToken,
        authProvider,
        facebookLogin,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
export default AuthContext;
