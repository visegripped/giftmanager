import { useContext, useEffect } from 'react';
import { AuthContext, AuthContextInterface } from '@context/AuthContext';
import {
  ProfileContext,
  ProfileContextInterface,
} from '@context/ProfileContext';

export const verifyUser = (email: string) => {};

export const AuthButton = () => {
  const {
    logout,
    login,
    accessToken = '',
  } = useContext<AuthContextInterface>(AuthContext);
  const { setProfile, fetchGoogleProfile, profile } =
    useContext<ProfileContextInterface>(ProfileContext);

  useEffect(() => {
    // only need to get the profile once.
    if (accessToken && Object.keys(profile).length === 0) {
      /* need to verify user is in users. get all relevant fields from DB. if any are empty, update them (pic, for instance). abstract this so it's re-usable.*/
      fetchGoogleProfile(accessToken);
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
