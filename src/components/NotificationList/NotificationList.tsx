import React, { useContext, useMemo } from 'react';
import './NotificationList.css';
import {
  NotificationsContext,
  NotificationContextProps,
} from '../../context/NotificationsContext';
import Notification from '../Notification/Notification';

export const NotificationList = React.memo(() => {
  const { notifications } = useContext(
    NotificationsContext
  ) as NotificationContextProps;

  const notificationList = useMemo(() => {
    const keys = Object.keys(notifications);
    return keys.map((uuid) => {
      const { message, type, persist } = notifications[uuid];
      return (
        <Notification
          uuid={uuid}
          key={uuid}
          message={message}
          type={type}
          persist={persist}
        />
      );
    });
  }, [notifications]);

  return (
    <section className="notificationList-container">{notificationList}</section>
  );
});

NotificationList.displayName = 'NotificationList';

export default NotificationList;
