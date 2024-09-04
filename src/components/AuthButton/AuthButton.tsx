import { useContext, useEffect, useState } from 'react';
import { AuthContext, AuthContextInterface } from '@context/AuthContext';
import {
  ProfileContext,
  ProfileContextInterface,
} from '@context/ProfileContext';
import validateUser from '@utilities/validateUser';

export const AuthButton = () => {
  const {
    logout,
    login,
    accessToken = '',
  } = useContext<AuthContextInterface>(AuthContext);
  const { setProfile, fetchGoogleProfile, profile } =
    useContext<ProfileContextInterface>(ProfileContext);
  const [emailAddress, setMyEmailAddress] = useState('');

  useEffect(() => {
    // only need to get the profile once.
    if (accessToken && Object.keys(profile).length === 0) {
      /* need to verify user is in users. get all relevant fields from DB. if any are empty, update them (pic, for instance). abstract this so it's re-usable.*/
      const userProfile = fetchGoogleProfile(accessToken);
      userProfile.then((theProfile: { emailAddress: string }) => {
        setMyEmailAddress(theProfile.emailAddress);
      });
    }
  }, [accessToken]);

  useEffect(() => {
    if (emailAddress) {
      const userValidationResponse = validateUser(emailAddress);
      userValidationResponse.then((validationResponse: { success: [] }) => {
        if (validationResponse.success) {
          // TODO - check what fields are missing in the response and update them.
        } else {
          logout();
          // TODO - log that this happened and what email address failed.
        }
      });
    }
  }, [emailAddress]);

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
