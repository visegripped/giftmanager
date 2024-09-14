import { useContext, useEffect, useState } from 'react';
import { AuthContext, AuthContextInterface } from '../../context/AuthContext';
import {
  ProfileContext,
  ProfileContextInterface,
} from '../../context/ProfileContext';
import validateUser from '../../utilities/validateUser';
import {
  responseInterface,
  GoogleProfileInterface,
  UserProfileInterface,
  GoogleProfileEmailInterface,
  GoogleProfilePhotoInterface,
} from '../../types/types';
import fetchData from '../../utilities/fetchData';
import postReport from '../../utilities/postReport';
import {
  NotificationsContext,
  NotificationContextProps,
} from '../../context/NotificationsContext';

const convertGoogleProfile2Custom = (googleProfile: GoogleProfileInterface) => {
  // need the following from the profile: email. avatar? name.
  let userProfile = { google: googleProfile } as UserProfileInterface;
  const { resourceName, emailAddresses, names, photos } = googleProfile;

  userProfile.google.resourceName = resourceName;
  emailAddresses.forEach((emailData: GoogleProfileEmailInterface) => {
    if (emailData?.metadata?.primary) {
      userProfile.emailAddress = emailData.value;
    }
  });

  photos.forEach((photosData: GoogleProfilePhotoInterface) => {
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
  } = useContext(AuthContext) as AuthContextInterface;
  const { addNotification } = useContext(
    NotificationsContext
  ) as NotificationContextProps;
  const { setMyProfile, myProfile } = useContext(
    ProfileContext
  ) as ProfileContextInterface;
  const [emailAddress, setMyEmailAddress] = useState('');
  const [myAvatar, setMyAvatar] = useState('');

  const fetchGoogleProfile = async (accessToken: string) => {
    // Fetch user profile information
    if (accessToken && !myProfile.emailAddress) {
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
              file: 'AuthButton',
              origin: 'apiResponse',
              error: `HTTP error! status: ${response.status}`,
            },
          });
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userProfile = await response.json();
        console.log(' -> got a google profile: ', userProfile);
        const convertedProfile = convertGoogleProfile2Custom(userProfile);
        setMyEmailAddress(userProfile.emailAddress);
        if (userProfile.avatar) {
          setMyAvatar(userProfile.avatar);
        }
        return convertedProfile;
      } catch (error: unknown) {
        postReport({
          type: 'error',
          report: 'Error fetching Google profile',
          body: {
            file: 'AuthButton',
            origin: 'apiResponse',
            error: JSON.stringify(error),
          },
        });
      }
      return;
    } else {
      postReport({
        type: 'error',
        report: 'Error fetching Google profile',
        body: {
          file: 'AuthButton',
          origin: 'apiResponse',
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
        // @ts-ignore: todo - remove this and address TS issue.
        (validationResponse: responseInterface) => {
          if (validationResponse?.warn) {
            logout();
            postReport({
              type: 'warn',
              report: 'Unauthorized user attempted to log in',
              body: {
                file: 'AuthButton',
                origin: 'apiResponse',
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
          } else if (validationResponse.success) {
            // @ts-ignore: todo - remove this and address TS issue.
            setMyProfile(validationResponse.success[0]);
          } else {
            postReport({
              type: 'warn',
              report: 'Error while attempting to validate user',
              body: {
                file: 'AuthButton',
                origin: 'apiResponse',
                email: emailAddress,
              },
            });
            addNotification({
              message: `Something went wrong while trying to validate your account.
              If you think you have received this message in error, reach out to the site administrator.
              If you don't know who the site administrator is, you probably don't belong here.`,
              type: 'error',
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
        response.then((data: responseInterface) => {
          if (data.error) {
            postReport({
              type: 'error',
              report: 'Avatar update failed.',
              body: {
                file: 'AuthButton',
                origin: 'apiResponse',
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
      fetchGoogleProfile(accessToken);
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
