import {
  useState,
  createContext,
  PropsWithChildren,
  useCallback,
  useMemo,
} from 'react';
import { UUID } from 'uuidjs';

export type AddNotificationTypeProp = 'error' | 'success' | 'info' | 'warn';

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
  addNotification: ({}: AddNotificationProps) => {};
  removeNotification: (u: string | number) => {};
}

const NotificationsContext = createContext({});

const NotificationsProvider = (props: PropsWithChildren) => {
  const [notifications, setNotifications] = useState<{ [k: string]: NotificationProps }>({});

  const removeNotification = useCallback((uuid: string | number) => {
    setNotifications((prevNotifications) => {
      const updatedNotifications = { ...prevNotifications };
      delete updatedNotifications[uuid];
      return updatedNotifications;
    });
  }, []);

  const addNotification = useCallback((notificationObj: NotificationProps) => {
    const uuid = UUID.generate();
    notificationObj.uuid = uuid; // add to the individual notification for easy lookup later.
    setNotifications((prevNotifications) => ({
      ...prevNotifications,
      [uuid]: notificationObj,
    }));
  }, []);

  const contextValue = useMemo(
    () => ({
      notifications,
      setNotifications,
      addNotification,
      removeNotification,
    }),
    [notifications, addNotification, removeNotification]
  );

  return (
    <NotificationsContext.Provider value={contextValue}>
      {props.children}
    </NotificationsContext.Provider>
  );
};

export { NotificationsContext, NotificationsProvider };
export default NotificationsContext;
