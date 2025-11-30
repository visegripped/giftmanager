import { useContext, useEffect, useState } from 'react';
import FacebookLogin from 'react-facebook-login';
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
  FacebookProfileInterface,
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

const convertFacebookProfile2Custom = (
  facebookProfile: FacebookProfileInterface
) => {
  let userProfile = { facebook: facebookProfile } as UserProfileInterface;
  const { email, name, picture, first_name, last_name } = facebookProfile;

  if (email) {
    userProfile.emailAddress = email;
  }

  if (picture?.data?.url) {
    userProfile.avatar = picture.data.url;
  }

  if (first_name) {
    userProfile.givenName = first_name;
  } else if (name) {
    // Fallback: split name if first_name not available
    const nameParts = name.split(' ');
    userProfile.givenName = nameParts[0] || '';
  }

  if (last_name) {
    userProfile.familyName = last_name;
  } else if (name) {
    // Fallback: split name if last_name not available
    const nameParts = name.split(' ');
    userProfile.familyName = nameParts.slice(1).join(' ') || '';
  }

  return userProfile;
};

export const AuthButton = () => {
  const {
    logout,
    login,
    accessToken = '',
    authProvider,
    facebookLogin,
  } = useContext(AuthContext) as AuthContextInterface;
  const { addNotification } = useContext(
    NotificationsContext
  ) as NotificationContextProps;
  const { setMyProfile, myProfile } = useContext(
    ProfileContext
  ) as ProfileContextInterface;
  const [emailAddress, setMyEmailAddress] = useState('');
  const [myAvatar, setMyAvatar] = useState('');
  const [googleProfileData, setGoogleProfileData] =
    useState<UserProfileInterface | null>(null);
  const [facebookProfileData, setFacebookProfileData] =
    useState<UserProfileInterface | null>(null);
  const fbAppId = import.meta.env.VITE_FB_APP_ID;

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
        setGoogleProfileData(convertedProfile);
        setMyEmailAddress(convertedProfile.emailAddress);
        if (convertedProfile.avatar) {
          setMyAvatar(convertedProfile.avatar);
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

  const fetchFacebookProfile = async (accessToken: string) => {
    // Fetch user profile information from Facebook Graph API
    if (accessToken && !myProfile.emailAddress) {
      try {
        console.log(
          'Fetching Facebook profile with token:',
          accessToken.substring(0, 10) + '...'
        );

        // Use Facebook SDK API method instead of direct fetch to avoid appsecret_proof requirement
        // The SDK handles authentication properly for client-side requests
        if (window.FB && window.FB.api) {
          return new Promise<void>((resolve, reject) => {
            window.FB!.api(
              '/me',
              {
                fields:
                  'id,name,email,picture.width(200).height(200),first_name,last_name',
              },
              (response: any) => {
                if (response.error) {
                  console.error('Facebook API error:', response.error);
                  postReport({
                    type: 'error',
                    report: 'Error fetching Facebook profile',
                    body: {
                      file: 'AuthButton',
                      origin: 'apiResponse',
                      error: JSON.stringify(response.error),
                    },
                  });
                  addNotification({
                    message: `Failed to load Facebook profile: ${response.error.message}`,
                    type: 'error',
                  });
                  reject(response.error);
                  return;
                }

                console.log(' -> got a facebook profile via SDK: ', response);

                // Check if email is present (required for validation)
                if (!response.email) {
                  console.error('Facebook profile missing email:', response);
                  addNotification({
                    message:
                      'Facebook profile is missing email address. Please ensure your Facebook account has an email.',
                    type: 'error',
                  });
                  reject(new Error('Missing email'));
                  return;
                }

                const convertedProfile =
                  convertFacebookProfile2Custom(response);
                console.log(' -> converted profile: ', convertedProfile);

                if (!convertedProfile.emailAddress) {
                  console.error(
                    'Converted profile missing emailAddress:',
                    convertedProfile
                  );
                  addNotification({
                    message: 'Failed to extract email from Facebook profile.',
                    type: 'error',
                  });
                  reject(new Error('Failed to extract email'));
                  return;
                }

                setFacebookProfileData(convertedProfile);
                setMyEmailAddress(convertedProfile.emailAddress);
                if (convertedProfile.avatar) {
                  setMyAvatar(convertedProfile.avatar);
                }
                resolve();
              }
            );
          });
        } else {
          // Fallback to direct fetch if SDK not available (but this may require appsecret_proof)
          console.warn(
            'Facebook SDK not available, falling back to direct fetch'
          );
          const response = await fetch(
            `https://graph.facebook.com/me?fields=id,name,email,picture.width(200).height(200),first_name,last_name&access_token=${accessToken}`
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error(
              'Facebook profile fetch failed:',
              response.status,
              errorText
            );
            postReport({
              type: 'error',
              report: 'Error fetching Facebook profile',
              body: {
                file: 'AuthButton',
                origin: 'apiResponse',
                error: `HTTP error! status: ${response.status}, body: ${errorText}`,
              },
            });
            addNotification({
              message: `Failed to load Facebook profile. Please try logging in again.`,
              type: 'error',
            });
            return;
          }
          const userProfile = await response.json();
          console.log(' -> got a facebook profile: ', userProfile);

          // Check if email is present (required for validation)
          if (!userProfile.email) {
            console.error('Facebook profile missing email:', userProfile);
            addNotification({
              message:
                'Facebook profile is missing email address. Please ensure your Facebook account has an email.',
              type: 'error',
            });
            return;
          }

          const convertedProfile = convertFacebookProfile2Custom(userProfile);
          console.log(' -> converted profile: ', convertedProfile);

          if (!convertedProfile.emailAddress) {
            console.error(
              'Converted profile missing emailAddress:',
              convertedProfile
            );
            addNotification({
              message: 'Failed to extract email from Facebook profile.',
              type: 'error',
            });
            return;
          }

          setFacebookProfileData(convertedProfile);
          setMyEmailAddress(convertedProfile.emailAddress);
          if (convertedProfile.avatar) {
            setMyAvatar(convertedProfile.avatar);
          }
          return convertedProfile;
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error('Error fetching Facebook profile:', error);
        postReport({
          type: 'error',
          report: 'Error fetching Facebook profile',
          body: {
            file: 'AuthButton',
            origin: 'apiResponse',
            error: errorMessage,
          },
        });
        addNotification({
          message: `Failed to load Facebook profile: ${errorMessage}`,
          type: 'error',
        });
      }
      return;
    } else {
      if (!accessToken) {
        console.error('fetchFacebookProfile called without accessToken');
      }
      if (myProfile.emailAddress) {
        console.log('fetchFacebookProfile skipped - profile already has email');
      }
    }
  };

  useEffect(() => {
    console.log(`BEGIN useEffect for emailAddress change. ${emailAddress}`);
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
            // Handle success response - could be array or string
            if (typeof validationResponse.success === 'string') {
              // If it's just a success message string, something went wrong
              postReport({
                type: 'warn',
                report: 'Unexpected success response type',
                body: {
                  file: 'AuthButton',
                  origin: 'apiResponse',
                  error: `Received string instead of user data: ${validationResponse.success}`,
                },
              });
            } else if (
              Array.isArray(validationResponse.success) &&
              validationResponse.success.length > 0
            ) {
              // Success with user data - use type assertion to work around TypeScript limitation
              const userArray = validationResponse.success as any[];
              const dbUser = userArray[0];
              // Map database fields to UserProfileInterface
              const mappedProfile = {
                emailAddress: dbUser.email,
                userid: String(dbUser.userid),
                givenName: dbUser.firstname,
                familyName: dbUser.lastname,
                avatar: dbUser.avatar || myAvatar,
                google: googleProfileData?.google || myProfile.google,
                facebook: facebookProfileData?.facebook || myProfile.facebook,
              } as UserProfileInterface;
              setMyProfile(mappedProfile);
            }
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
  Then a profile is retrieved from google/facebook which includes an email address.
  The email is used to determine if a valid account exists.
  if yes, the myProfile is updated and the user can proceed.
  if no, the user is logged out and a message is thrown.
  */
  useEffect(() => {
    // only need to get the profile once.
    if (accessToken && Object.keys(myProfile).length === 0 && authProvider) {
      console.log('Triggering profile fetch for:', authProvider);
      if (authProvider === 'google') {
        fetchGoogleProfile(accessToken);
      } else if (authProvider === 'facebook') {
        fetchFacebookProfile(accessToken);
      }
    } else {
      if (!accessToken) {
        console.log('Profile fetch skipped: no accessToken');
      } else if (Object.keys(myProfile).length > 0) {
        console.log('Profile fetch skipped: profile already exists');
      } else if (!authProvider) {
        console.log('Profile fetch skipped: no authProvider');
      }
    }
  }, [accessToken, authProvider, myProfile]);

  const authButtonLogout = () => {
    logout();
    setMyProfile({});
  };

  const handleFacebookResponse = (response: any) => {
    // Check if response has status indicating failure/cancellation
    if (response.status === 'not_authorized' || response.status === 'unknown') {
      addNotification({
        message: 'Facebook login was cancelled or not authorized.',
        type: 'warn',
      });
      return;
    }

    // Check if we have a valid access token
    if (response.accessToken) {
      facebookLogin(response);
    } else {
      // If no accessToken, it's likely a cancelled login
      addNotification({
        message: 'Facebook login was cancelled or failed.',
        type: 'warn',
      });
    }
  };

  return (
    <>
      {accessToken ? (
        <button onClick={() => authButtonLogout()}>Sign out</button>
      ) : (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => login()}>Sign in with Google 🚀</button>
          {fbAppId && (
            <FacebookLogin
              appId={fbAppId}
              autoLoad={false}
              fields="name,email,picture"
              callback={handleFacebookResponse}
              icon="fa-facebook"
              textButton="Sign in with Facebook"
              cssClass="facebook-login-button"
            />
          )}
        </div>
      )}
    </>
  );
};

export default AuthButton;
