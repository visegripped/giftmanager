import React, { createContext, useContext } from 'react';

export interface IAuthUpdate {
  tokenId: string;
  email: string;
}

interface IAppContext extends IAuthUpdate {
  setAuth: (valObj: IAuthUpdate) => void;
  children?: React.ReactNode;
  userId: number;
  setUserId: (id: number) => void;
}

const defaultState = {
  tokenId: '',
  email: '',
  userId: 0,
  setUserId: () => {
    console.log('default context updateAuth executed');
  },
  setAuth: () => {
    console.log('default context updateAuth executed');
  },
};

export const AppContext = createContext<IAppContext>(defaultState);

export const useAppContext = () => useContext(AppContext);

export default AppContext;
