import { useContext } from 'react';
import './NotificationList.css';
import {
  NotificationsContext,
  NotificationContextProps,
} from '../../context/NotificationsContext';
import Notification from '../Notification/Notification';

export const NotificationList = () => {
  const { notifications } = useContext(
    NotificationsContext
  ) as NotificationContextProps;
  const notificationList: React.ReactElement[] = [];
  const keys = Object.keys(notifications);

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
