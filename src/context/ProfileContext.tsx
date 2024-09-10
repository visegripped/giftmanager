import { useState, createContext, useContext } from 'react';
import { AuthContext } from './AuthContext';
import postReport from '@utilities/postReport';

const ProfileContext = createContext(null);

const ProfileProvider = (props: React.PropsWithChildren) => {
  const [myProfile, setMyProfile] = useState({});
  const { accessToken } = useContext(AuthContext);

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
