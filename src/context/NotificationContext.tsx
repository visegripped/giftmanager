// https://felixgerschau.com/react-typescript-context/
import React, { createContext, useState } from 'react';

interface INotificationContext {
  messages: string; // TODO: will need to be an object eventually.
  setMessage: (message: string) => void;
}

const defaultState = {
  messages: '',
  setMessage: (message: string) => {
    console.log('message: ', message);
  },
};

const NotificationContext = createContext<INotificationContext>(defaultState);

export const NotificationProvider = (children: JSX.Element) => {
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
