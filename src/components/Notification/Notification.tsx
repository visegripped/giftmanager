import React, { useContext, useEffect, useRef } from 'react';
import './Notification.css';
import {
  NotificationsContext,
  NotificationProps,
  NotificationContextProps,
} from '../../context/NotificationsContext';

export const Notification = React.memo((props: NotificationProps) => {
  const { type, message, uuid, persist, clearDuration = 5000 } = props;

  const { removeNotification } = useContext(
    NotificationsContext
  ) as NotificationContextProps;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasManuallyClearedRef = useRef(false);

  const handleClick = () => {
    console.log(' -> handleClick got triggered');
    wasManuallyClearedRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    removeNotification(uuid);
  };

  useEffect(() => {
    if (!persist) {
      timeoutRef.current = setTimeout(() => {
        if (!wasManuallyClearedRef.current) {
          removeNotification(uuid);
        }
      }, clearDuration);
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [persist, clearDuration, uuid, removeNotification]);

  return (
    <div
      className={`notification ${type}`}
      data-testid={`notification-${uuid}`}
    >
      <pre className="notification--pre">{message}</pre>
      <button
        className={`notification--button ${type}`}
        data-uuid={uuid}
        onClick={handleClick}
      >
        X
      </button>
    </div>
  );
});

Notification.displayName = 'Notification';

export default Notification;
