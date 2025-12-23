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
import { reportCreate } from '../../utilities/reportCreate';
import {
  NotificationsContext,
  NotificationContextProps,
} from '../../context/NotificationsContext';

const convertGoogleProfile2Custom = (googleProfile: GoogleProfileInterface) => {
  // need the following from the profile: email. avatar? name.
  let userProfile = { google: googleProfile } as UserProfileInterface;
  const { resourceName, emailAddresses, names, photos } = googleProfile;

  if (userProfile.google) {
    userProfile.google.resourceName = resourceName;
  }
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

  // Debug: Log Facebook App ID status
  useEffect(() => {
    if (fbAppId) {
      console.log('Facebook App ID loaded:', fbAppId.substring(0, 10) + '...');
    } else {
      console.warn(
        'Facebook App ID not found. VITE_FB_APP_ID environment variable is not set.'
      );
      console.log(
        'Available env vars:',
        Object.keys(import.meta.env).filter((key) => key.startsWith('VITE_'))
      );
    }
  }, [fbAppId]);

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
    // Fetch user profile information via server-side only
    // All Facebook API calls happen on the server with appsecret_proof
    if (accessToken && !myProfile.emailAddress) {
      try {
        console.log(
          'Fetching Facebook profile via server:',
          accessToken.substring(0, 10) + '...'
        );

        // Temporarily set access_token in localStorage for fetchData to use
        const originalToken = localStorage.getItem('access_token');
        localStorage.setItem('access_token', accessToken);

        try {
          // Use our API endpoint to fetch Facebook profile (server handles appsecret_proof)
          const response = ((await fetchData({
            task: 'getFacebookProfile',
          })) || {}) as responseInterface;

          const errorMessage = response.error ?? response.err;
          if (errorMessage) {
            console.error('Facebook profile error:', errorMessage);
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
            return;
          }

          if (
            response.success &&
            Array.isArray(response.success) &&
            response.success.length > 0
          ) {
            const successArray = response.success as any[];
            const userProfile = successArray[0] as FacebookProfileInterface;
            console.log(
              ' -> got a facebook profile from server: ',
              userProfile
            );

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
          } else {
            throw new Error('Unexpected response format from server');
          }
        } finally {
          // Restore original access token
          if (originalToken) {
            localStorage.setItem('access_token', originalToken);
          } else {
            localStorage.setItem('access_token', accessToken);
          }
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

            // Log unauthorized login attempt to reporting API
            const stid = sessionStorage.getItem('giftmanager_stid') || '';
            if (stid) {
              reportCreate({
                stid,
                report_type: 'warning',
                component: 'AuthButton',
                message: 'Unauthorized user attempted to log in',
                metadata: {
                  email: emailAddress,
                  warning: validationResponse.warn,
                  origin: 'apiResponse',
                  file: 'AuthButton',
                },
              }).catch((reportError) => {
                console.error(
                  'Failed to report unauthorized login attempt:',
                  reportError
                );
              });
            }

            // Also use postReport for backward compatibility
            postReport({
              type: 'warn',
              report: 'Unauthorized user attempted to log in',
              body: {
                file: 'AuthButton',
                origin: 'apiResponse',
                email: emailAddress,
                warn: validationResponse.warn,
              },
            });

            // Show user-friendly error message with specific warning
            const warnMessage =
              validationResponse.warn ||
              'Email address not recognized as a valid user';
            addNotification({
              message: `Login failed: ${warnMessage}
              If you think you have received this message in error, reach out to the site administrator.`,
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
            // Handle error response - includes specific error message from API
            const errorMessage =
              validationResponse?.error ||
              validationResponse?.err ||
              'Unknown error';

            // Log login failure to reporting API
            const stid = sessionStorage.getItem('giftmanager_stid') || '';
            if (stid) {
              reportCreate({
                stid,
                report_type: 'error',
                component: 'AuthButton',
                message: 'Login validation failed',
                metadata: {
                  email: emailAddress,
                  error: errorMessage,
                  origin: 'apiResponse',
                  file: 'AuthButton',
                },
              }).catch((reportError) => {
                console.error('Failed to report login failure:', reportError);
              });
            }

            // Also use postReport for backward compatibility
            postReport({
              type: 'error',
              report: 'Error while attempting to validate user',
              body: {
                file: 'AuthButton',
                origin: 'apiResponse',
                email: emailAddress,
                error: errorMessage,
              },
            });

            // Show user-friendly error message with specific API error
            addNotification({
              message: `Login failed: ${errorMessage}
              If you think you have received this message in error, reach out to the site administrator.`,
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
