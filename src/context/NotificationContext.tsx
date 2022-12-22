// https://felixgerschau.com/react-typescript-context/
import { createContext, useContext } from 'react';

export interface IMessage {
  type: 'error' | 'warn' | 'info';
  report: string;
  id?: string;
  meta?: object;
}

interface INotificationContext {
  messages: IMessage[];
  removeMessage: (messageId: string) => void;
  addMessage: (message: IMessage) => void;
}

const defaultState = {
  messages: [],
  addMessage: (message: IMessage) => {
    console.log('default addMessage triggered.', message.report);
  },
  removeMessage: (messageId: string) => {
    console.log('default removeMessage triggered.', messageId);
  },
};

export const NotificationContext = createContext<INotificationContext>(defaultState);

export const useNotificationContext = () => useContext(NotificationContext);

export default NotificationContext;
