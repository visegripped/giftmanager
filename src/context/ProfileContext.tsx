import { useState, createContext, useContext } from 'react';
import { AuthContext } from './AuthContext';
import postReport from '@utilities/postReport';

const ProfileContext = createContext(null);

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
  profile: userProfileInterface;
  setProfile: () => {};
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

const ProfileProvider = (props: React.PropsWithChildren) => {
  const [profile, setProfile] = useState({});
  const { accessToken } = useContext(AuthContext);
  const fetchGoogleProfile = async (accessToken) => {
    // Fetch user profile information
    if (accessToken && !profile.email) {
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
        setProfile(convertedProfile);
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

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        fetchGoogleProfile,
      }}
    >
      {props.children}
    </ProfileContext.Provider>
  );
};

export { ProfileContext, ProfileProvider };
export default ProfileContext;
