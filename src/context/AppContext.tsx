import React, { createContext, useContext } from 'react';
import { UserResponseProps } from '../util/fetchData';

export interface IAuthUpdate {
  tokenId: string;
  email: string;
}

interface IAppContext extends IAuthUpdate {
  setAuth: (valObj: IAuthUpdate) => void;
  children?: React.ReactNode;
  userId: number;
  setUserId: (id: number) => void;
  users: UserResponseProps[];
}

const defaultState = {
  tokenId: '',
  email: '',
  users: [],
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
