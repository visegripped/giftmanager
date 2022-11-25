// https://felixgerschau.com/react-typescript-context/
import React, { createContext, FC, useState } from 'react';

interface INotificationContext {
  messages: string; // TODO: will need to be an object eventually.
  setMessage: (message: string) => void;
}
interface INotificationProvider {
  children: React.ReactNode;
}

const defaultState = {
  messages: '',
  setMessage: (message: string) => {
    console.log('message: ', message);
  },
};

const NotificationContext = createContext<INotificationContext>(defaultState);

export const NotificationProvider: FC<INotificationProvider> = ({ children }) => {
  const [messages, setMessages] = useState([]);
  return (
    <NotificationContext.Provider
      value={{
        messages: 'bob',
        setMessage: (message) => {
          console.log('message:', message);
          setMessages(messages);
        },
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
