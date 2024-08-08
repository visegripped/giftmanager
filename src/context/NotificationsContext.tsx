import { useState, createContext, PropsWithChildren } from 'react';
import { UUID } from 'uuidjs';

export interface AddNotificationProps {
  type: 'error' | 'success' | 'info' | 'warn';
  message: string;
  persist?: boolean | null;
  clearDuration?: number;
}

export interface NotificationProps extends AddNotificationProps {
  uuid: number;
}

export interface NotificationContextProps {
  notifications: { [k: number]: NotificationProps };
  setNotifications: () => {};
  addNotifications: ({ }: AddNotificationProps) => {};
  removeNotification: (number: NotificationProps) => {};
}

const NotificationsContext = createContext({});

const NotificationsProvider = (props: PropsWithChildren) => {
  const [notifications, setNotifications] = useState({});

  const removeNotification = (uuid: string) => {
    let updatedNotifications: object = { ...notifications };
    delete updatedNotifications[uuid];
    setNotifications(updatedNotifications);
  };

  const addNotification = (notificationObj: NotificationProps) => {
    let updatedNotifications = { ...notifications };
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
