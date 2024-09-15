import { useState, createContext } from 'react';
import { UserProfileInterface } from '../types/types';

export interface ProfileContextInterface {
  myProfile: UserProfileInterface;
  setMyProfile: (a: object) => {};
  fetchGoogleProfile: () => {};
}

const ProfileContext = createContext({});

const ProfileProvider = (props: React.PropsWithChildren) => {
  const [myProfile, setMyProfile] = useState({});

  return (
    <ProfileContext.Provider
      value={{
        myProfile,
        setMyProfile,
      }}
    >
      {props.children}
    </ProfileContext.Provider>
  );
};

export { ProfileContext, ProfileProvider };
export default ProfileContext;
