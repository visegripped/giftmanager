import { useContext, useEffect, useState } from 'react';
import { AuthContext, AuthContextInterface } from '@context/AuthContext';
import {
  ProfileContext,
  ProfileContextInterface,
  GoogleProfileInterface,
} from '@context/ProfileContext';
import validateUser from '@utilities/validateUser';
import { UserType } from '@types/types';
import fetchData from '@utilities/fetchData';

export const AuthButton = () => {
  const {
    logout,
    login,
    accessToken = '',
  } = useContext<AuthContextInterface>(AuthContext) || {};
  const { setProfile, fetchGoogleProfile, profile } =
    useContext<ProfileContextInterface>(ProfileContext) || {};
  const [emailAddress, setMyEmailAddress] = useState('');
  const [myAvatar, setMyAvatar] = useState('');
  const [remoteProfile, setRemoteProfile] = useState<UserType>({});

  useEffect(() => {
    if (emailAddress) {
      const userValidationResponse = validateUser(emailAddress);
      userValidationResponse.then(
        (validationResponse: { success: UserType[] }) => {
          if (validationResponse.success) {
            setRemoteProfile(validationResponse.success);
          } else {
            logout();
            // TODO - log that this happened and what email address failed.
          }
        }
      );
    }
  }, [emailAddress]);

  useEffect(() => {
    if (myAvatar && myAvatar !== remoteProfile.avatar) {
      const response = fetchData({
        task: 'updateAvatar',
        email_address: emailAddress,
        avatar: myAvatar,
      });
      response &&
        response.then((data: { success: string; error: string }) => {
          if (data.error) {
            // TODO - log this.
            console.log(' -> error adding avatar: ', data.error);
          }
        });
    }
  }, [myAvatar, remoteProfile.avatar]);

  useEffect(() => {
    // only need to get the profile once.
    if (accessToken && Object.keys(profile).length === 0) {
      const userProfile = fetchGoogleProfile(accessToken);
      userProfile.then((theProfile: GoogleProfileInterface) => {
        setMyEmailAddress(theProfile.emailAddress);
        if (theProfile.avatar) {
          setMyAvatar(theProfile.avatar);
        }
      });
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
