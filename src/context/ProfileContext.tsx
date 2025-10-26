import { useState, createContext, useMemo } from 'react';
import { UserProfileInterface } from '../types/types';

export interface ProfileContextInterface {
  myProfile: UserProfileInterface;
  setMyProfile: (a: object) => {};
  fetchGoogleProfile: () => {};
}

const ProfileContext = createContext({});

const ProfileProvider = (props: React.PropsWithChildren) => {
  const [myProfile, setMyProfile] = useState({});

  const contextValue = useMemo(
    () => ({
      myProfile,
      setMyProfile,
    }),
    [myProfile]
  );

  return (
    <ProfileContext.Provider value={contextValue}>
      {props.children}
    </ProfileContext.Provider>
  );
};

export { ProfileContext, ProfileProvider };
export default ProfileContext;
