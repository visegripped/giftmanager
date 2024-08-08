import { useContext, useEffect } from 'react';
import { AuthContext, AuthContextInterface } from '@context/AuthContext';
import {
  ProfileContext,
  ProfileContextInterface,
} from '@context/ProfileContext';

export const AuthButton = () => {
  const {
    logout,
    login,
    accessToken = '',
  } = useContext<AuthContextInterface>(AuthContext);
  const { setProfile, fetchProfile, profile } =
    useContext<ProfileContextInterface>(ProfileContext);

  useEffect(() => {
    // only need to get the profile once.
    if (accessToken && Object.keys(profile).length === 0) {
      fetchProfile(accessToken);
    }
  }, [accessToken]);

  const authButtonLogout = () => {
    logout();
    setProfile({});
  };

  return (
    <>
      {accessToken ? (
        <button onClick={() => authButtonLogout()}>Sign out</button>
      ) : (
        <button onClick={() => login()}>Sign in with Google 🚀 </button>
      )}
    </>
  );
};

export default AuthButton;
