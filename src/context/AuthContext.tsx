import React, { createContext, useContext } from 'react';

export interface IAuthUpdate {
  tokenId: string;
  userId: string;
}

interface IAuthContext extends IAuthUpdate {
  setAuth: (valObj: IAuthUpdate) => void;
  children?: React.ReactNode;
}

const defaultState = {
  tokenId: '',
  userId: '',
  setAuth: () => {
    console.log('default context updateAuth executed');
  },
};

export const AuthContext = createContext<IAuthContext>(defaultState);

export const useAuthContext = () => useContext(AuthContext);

export default AuthContext;
