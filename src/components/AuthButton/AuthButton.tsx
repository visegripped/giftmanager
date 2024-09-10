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
import postReport from '@utilities/postReport';
import {
  NotificationsContext,
  AddNotificationProps,
} from '@context/NotificationsContext';

export interface GoogleProfileInterface {
  resourceName: string;
  emailAddresses: [];
  emailData: {
    metaData: {};
  };
  names: string;
  namesData: {
    metaData: {};
  };
  photos: { url: string }[];
}

export interface userProfileInterface {
  emailAddress: string;
  givenName: string;
  familyName: string;
  google: GoogleProfileInterface;
}

export interface ProfileContextInterface {
  myProfile: userProfileInterface;
  setMyProfile: () => {};
  fetchGoogleProfile: () => {};
}

const convertGoogleProfile2Custom = (googleProfile: GoogleProfileInterface) => {
  // need the following from the profile: email. avatar? name.
  let userProfile = { google: googleProfile };
  const { resourceName, emailAddresses, names, photos } =
    googleProfile<GoogleProfileInterface>;

  userProfile.google.resourceName = resourceName;
  emailAddresses.forEach((emailData = {}) => {
    if (emailData?.metadata?.primary) {
      userProfile.emailAddress = emailData.value;
    }
  });

  photos.forEach((photosData = {}) => {
    if (photosData?.metadata?.primary) {
      userProfile.avatar = photosData.url;
    }
  });

  names.forEach((namesData) => {
    if (namesData?.metadata?.primary === true) {
      userProfile.givenName = namesData.givenName;
      userProfile.familyName = namesData.familyName;
    }
  });
  return userProfile;
};

export const AuthButton = () => {
  const {
    logout,
    login,
    accessToken = '',
  } = useContext<AuthContextInterface>(AuthContext) || {};
  const { addNotification } =
    useContext<AddNotificationProps>(NotificationsContext);
  const { setMyProfile, myProfile } =
    useContext<ProfileContextInterface>(ProfileContext) || {};
  const [emailAddress, setMyEmailAddress] = useState('');
  const [myAvatar, setMyAvatar] = useState('');

  const fetchGoogleProfile = async (accessToken: string) => {
    // Fetch user profile information
    if (accessToken && !myProfile.email) {
      try {
        //https://developers.google.com/people/api/rest/v1/people/get
        const response = await fetch(
          'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`, // this is the accessToken.
            },
          }
        );

        if (!response.ok) {
          postReport({
            type: 'error',
            report: 'Error fetching Google profile',
            body: {
              origin: 'ProfileContext',
              error: `HTTP error! status: ${response.status}`,
            },
          });
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userProfile = await response.json();
        console.log(' -> got a google profile: ', userProfile);
        const convertedProfile = convertGoogleProfile2Custom(userProfile);
        setMyEmailAddress(userProfile.emailAddress);
        return convertedProfile;
      } catch (error) {
        postReport({
          type: 'error',
          report: 'Error fetching Google profile',
          body: {
            origin: 'ProfileContext',
            error,
          },
        });
      }
      return;
    } else {
      postReport({
        type: 'error',
        report: 'Error fetching Google profile',
        body: {
          origin: 'ProfileContext',
          error:
            'Access token was not passed to fetchGoogleProfile.  No request attempt has been made to retrieve the user profile',
        },
      });
    }
  };

  useEffect(() => {
    if (emailAddress) {
      const userValidationResponse = validateUser(emailAddress);
      userValidationResponse.then(
        (validationResponse: { success: UserType[] }) => {
          if (validationResponse.success) {
            setMyProfile(validationResponse.success[0]);
          } else {
            logout();
            postReport({
              type: 'warn',
              report: 'Unauthorized user attempted to log in',
              body: {
                origin: 'AuthButton',
                email: emailAddress,
              },
            });
            addNotification({
              message: `The email address ${emailAddress} is not recognized as a valid user.
              If you think you have received this message in error, reach out to the site administrator.
              If you don't know who the site administrator is, you probably don't belong here.`,
              type: 'warn',
              persist: true,
            });
          }
        }
      );
    }
  }, [emailAddress]);

  useEffect(() => {
    if (myAvatar && myAvatar !== myProfile.avatar) {
      const response = fetchData({
        task: 'updateAvatar',
        email_address: emailAddress,
        avatar: myAvatar,
      });
      response &&
        response.then((data: { success: string; error: string }) => {
          if (data.error) {
            postReport({
              type: 'error',
              report: 'Avatar update failed.',
              body: {
                origin: 'AuthButton',
                error: data.error,
              },
            });
          }
        });
    }
  }, [myAvatar, myProfile.avatar]);
  /*
  When a user logs in, access token gets set.
  Then a profile is retrieved from google which includes an email address.
  The email is used to determine if a valid account exists.
  if yes, the myProfile is updated and the user can proceed.
  if no, the user is logged out and a message is thrown.
  */
  useEffect(() => {
    // only need to get the profile once.
    if (accessToken && Object.keys(myProfile).length === 0) {
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
    setMyProfile({});
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
