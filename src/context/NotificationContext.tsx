// https://felixgerschau.com/react-typescript-context/
import React, { createContext, FC, useState } from 'react';
import { v4 as getUUID } from 'uuid';

export interface IMessage {
  type: 'error' | 'critical' | 'info';
  report: string;
  id: string;
  meta?: object; //
}

interface INotificationContext {
  messages: IMessage[];
  removeMessage?: (messageId: string) => void;
  addMessage?: (message: IMessage) => void;
}
interface INotificationProvider {
  children: React.ReactNode;
}

const defaultState = {
  messages: [],
};

const NotificationContext = createContext<INotificationContext>(defaultState);

const removeMessageById = (messageArray: IMessage[], id: string) => {
  return messageArray.filter((el) => el.id !== id);
};

export const NotificationProvider: FC<INotificationProvider> = ({ children }) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const addMessage = (message: IMessage) => {
    if (message.report) {
      message.id = getUUID();
      messages.push(message);
      setMessages(messages);
    }
  };
  const removeMessage = (messageId: string) => {
    console.log(`Remove message ${messageId}`);
    removeMessageById(messages, messageId);
  };

  return (
    <NotificationContext.Provider
      value={{
        messages: [],
        addMessage,
        removeMessage,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
