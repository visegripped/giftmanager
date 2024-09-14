import { useState, createContext, PropsWithChildren } from 'react';
import { UUID } from 'uuidjs';

export type AddNotificationTypeProp =
  | 'error'
  | 'success'
  | 'info'
  | 'warn';

export interface AddNotificationProps {
  type: AddNotificationTypeProp;
  message: string;
  persist?: boolean | null;
  clearDuration?: number;
}

export interface NotificationProps extends AddNotificationProps {
  uuid: string | number;
}

export interface NotificationContextProps {
  notifications: { [k: string]: NotificationProps };
  setNotifications: () => {};
  addNotification: ({ }: AddNotificationProps) => {};
  removeNotification: (u: string | number) => {};
}

const NotificationsContext = createContext({});

const NotificationsProvider = (props: PropsWithChildren) => {
  const [notifications, setNotifications] = useState({});

  const removeNotification = (uuid: string | number) => {
    let updatedNotifications: { [k: string]: NotificationProps } = { ...notifications };
    delete updatedNotifications[uuid];
    setNotifications(updatedNotifications);
  };

  const addNotification = (notificationObj: NotificationProps) => {
    let updatedNotifications: { [k: string]: NotificationProps } = { ...notifications };
    const uuid = UUID.generate();
    notificationObj.uuid = uuid; // add to the individual notification for easy lookup later.
    updatedNotifications[uuid] = notificationObj;
    setNotifications(updatedNotifications);
  };
  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        setNotifications,
        addNotification,
        removeNotification,
      }}
    >
      {props.children}
    </NotificationsContext.Provider>
  );
};

export { NotificationsContext, NotificationsProvider };
export default NotificationsContext;
