import React from 'react';
import { GoogleLogin, GoogleLogout, GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { useAuthContext } from '../../context/AuthContext';
import { useNotificationContext } from '../../context/NotificationContext';
import './AuthButton.css';

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
  const { addMessage } = useNotificationContext();

  // const setToken = (tokenId: string, email: string) => {
  //   sessionStorage.setItem("tokenId", tokenId);
  //   sessionStorage.setItem("userId", email);
  //   setAuth({ "tokenId": tokenId, "userId": email });
  // };

  const onLoginSuccess = (authResponse: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    console.log('Auth Success: currentUser:', authResponse);
    // const { tokenId, profileObj } = authResponse;
    // const { email } = profileObj;
    // setToken(tokenId, email);
    // refreshAuthTokenBeforeExpiration(authResponse);
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
  };

  // const refreshAuthTokenBeforeExpiration = (res: ResponseProps) => {
  //   // Timing to renew access token
  //   let durationBetweenAutoRefresh =
  //     (res.tokenObj.expires_in || 3600 - 5 * 60) * 1000;
  //   const refreshToken = async () => {
  //     const newAuthRes = await res.reloadAuthResponse();
  //     console.log(" - - - > newAuthRes: ", newAuthRes);
  //     const { tokenId, profileObj } = newAuthRes;
  //     const { email } = profileObj;
  //     durationBetweenAutoRefresh =
  //       (newAuthRes.expires_in || 3600 - 5 * 60) * 1000;
  //     setToken(tokenId, email);
  //     setTimeout(refreshToken, durationBetweenAutoRefresh);
  //   };
  //   setTimeout(refreshToken, durationBetweenAutoRefresh);
  // };

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
