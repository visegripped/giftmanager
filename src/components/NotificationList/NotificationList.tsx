import { useContext, useEffect } from 'react';
import './NotificationList.css';
import {
  NotificationsContext,
  NotificationContextProps,
} from '@context/NotificationsContext';
import Notification from '@components/Notification';

export const NotificationList = () => {
  const { notifications }: NotificationContextProps =
    useContext(NotificationsContext);
  const notificationList: [] = [];
  const keys = Object.keys(notifications);

  useEffect(() => {
    console.log(
      ' -> notifications state change occurred and triggere useEffect'
    );
  }, [notifications]);

  if (keys.length) {
    keys.forEach((uuid) => {
      const { message, type, persist } = notifications[uuid];
      notificationList.push(
        <Notification
          uuid={uuid}
          key={uuid}
          message={message}
          type={type}
          persist={persist}
        />
      );
    });
  }
  return (
    <section className="notificationList-container">{notificationList}</section>
  );
};

export default NotificationList;
