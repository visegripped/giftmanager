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
    handleTokenExpiration(authResponse.expires_in);
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
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('tokenId');
    localStorage.removeItem('auth_provider');
    setAccessToken('');
    setAuthProvider('');

    // Logout from the appropriate provider
    if (authProvider === 'google') {
      googleLogout();
    } else if (authProvider === 'facebook') {
      // Facebook logout - clear Facebook session
      // Note: react-facebook-login doesn't have a built-in logout function
      // We'll rely on clearing localStorage and the token
      try {
        // Attempt to logout via Facebook API if available
        if (window.FB) {
          window.FB.logout(() => {});
        }
      } catch (error) {
        // Silently fail if FB is not available
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
          logout();
          return false;
        }

        return true;
      } else if (authProvider === 'facebook') {
        // Validate Facebook token
        const response = await fetch(
          `https://graph.facebook.com/me?access_token=${accessToken}`
        );
        const data = await response.json();

        if (data.error) {
          logout();
          return false;
        }

        return true;
      }
      return false;
    } catch (error) {
      logout();
      return false;
    }
  }, [accessToken, authProvider, logout]);

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
