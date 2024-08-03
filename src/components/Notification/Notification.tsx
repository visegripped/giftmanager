import { useContext } from "react";
import "./Notification.css";
import { NotificationsContext, NotificationProps, NotificationContextProps } from "@context/NotificationsContext";

export const Notification = (props: NotificationProps) => {
  const { type, message, uuid, persist, clearDuration = 5000 } = props;

  const { removeNotification }: NotificationContextProps = useContext(NotificationsContext);
  let wasManuallyCleared = false;

  const handleClick = () => {
    console.log(' -> handleClick got triggered')
    wasManuallyCleared = true;
    removeNotification(uuid);
  };

  if (persist) {
    console.log(' -> persist actually hit!')
  } else {
    setTimeout(() => {
      if (!wasManuallyCleared) {
        removeNotification(uuid);
      }
    }, clearDuration)
  }

  return (
    <div className={`notification ${type}`}>
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
};

export default Notification;
