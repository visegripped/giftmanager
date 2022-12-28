import React from 'react';
import { GoogleLogin, GoogleLogout, GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { useAuthContext } from '../../context/AuthContext';
import { useNotificationContext } from '../../context/NotificationContext';
import './AuthButton.css';

// Will need to migrate this over to https://developers.google.com/identity/gsi/web/guides/client-library

interface ResponseProps {
  profileObj: {
    email: string;
  };
  message: string;
  tokenId: string;
  expires_in: number;
  tokenObj: {
    expires_in: number;
  };
  reloadAuthResponse: () => ResponseProps;
}

const clientId = '451536185848-p0c132ugq4jr7r08k4m6odds43qk6ipj.apps.googleusercontent.com';

export const AuthButton = () => {
  const { tokenId, setAuth } = useAuthContext();
  console.log(' -> tokenId: ', tokenId);
  const { addMessage } = useNotificationContext();

  const setToken = (tokenId = '', email = '') => {
    sessionStorage.setItem('tokenId', tokenId);
    sessionStorage.setItem('userId', email);
    setAuth({ tokenId: tokenId, userId: email });
  };

  const parseSuccessResponse = (authResponse: GoogleLoginResponseOffline | GoogleLoginResponse) => {
    let result, token, email;
    if ('profileObj' in authResponse) {
      result = authResponse.profileObj;
      email = result.email;
    }
    if ('tokenId' in authResponse) {
      token = authResponse.tokenId;
    }
    return {
      token,
      email,
    };
  };

  const onLoginSuccess = (authResponse: GoogleLoginResponseOffline | GoogleLoginResponse) => {
    console.log('Auth Success: currentUser:', authResponse);
    const { token, email } = parseSuccessResponse(authResponse);
    setToken(token, email);
    refreshAuthTokenBeforeExpiration(authResponse);
  };

  const onLoginFailure = (authResponse: ResponseProps) => {
    console.log(' - - - - - > authResponse: ', authResponse);
    addMessage({
      type: 'error',
      report: authResponse.message,
      meta: authResponse,
    });
  };

  const onLogoutSuccess = () => {
    sessionStorage.setItem('tokenId', '');
    sessionStorage.setItem('userId', '');
    setAuth({ tokenId: '', userId: '' });
    addMessage({
      report: 'You have been logged out',
      type: 'info',
    });
  };

  const refreshAuthTokenBeforeExpiration = (authResponse: GoogleLoginResponseOffline | GoogleLoginResponse) => {
    let refreshRate = 3600 - 5 * 60;
    if ('tokenObj' in authResponse) {
      refreshRate = authResponse?.tokenObj?.expires_in;
    }
    // Timing to renew access token
    let durationBetweenAutoRefresh = refreshRate * 1000;
    const refreshToken = async () => {
      if ('reloadAuthResponse' in authResponse) {
        const newAuthRes = await authResponse.reloadAuthResponse();
        console.log(' - - - > newAuthRes: ', newAuthRes);
        const { token, email } = parseSuccessResponse(authResponse);
        durationBetweenAutoRefresh = (newAuthRes.expires_in || 3600 - 5 * 60) * 1000;
        setToken(token, email);
        setTimeout(refreshToken, durationBetweenAutoRefresh);
      }
    };
    setTimeout(refreshToken, durationBetweenAutoRefresh);
  };

  return tokenId ? (
    <GoogleLogout clientId={clientId} buttonText="Logout" onLogoutSuccess={onLogoutSuccess}></GoogleLogout>
  ) : (
    <GoogleLogin
      clientId={clientId}
      buttonText="Login"
      onSuccess={onLoginSuccess}
      onFailure={onLoginFailure}
      cookiePolicy={'single_host_origin'}
      isSignedIn={true}
    />
  );
};

export default AuthButton;
