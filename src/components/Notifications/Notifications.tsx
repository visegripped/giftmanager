import React from 'react';
import './Notifications.css';
import { IMessage } from '../../context/NotificationContext';
import 'Notifications.css';

interface NotificationsProps {
  cssClasses?: string;
  messages: [];
}

export const Message = (props: IMessage) => {
  const { type, report, id } = props;
  const handleClick = (clickEvent: React.SyntheticEvent<HTMLButtonElement>) => {
    const messageId = clickEvent.currentTarget?.dataset?.messageid;
    // removeMessage(messageId);
    console.log(`Click triggered for removing ${messageId}`);
  };
  return (
    <div className={`message ${type}`}>
      <pre className="message--pre">{report}</pre>
      <button className={`button message--button message--button--${type}`} data-messageid={id} onClick={handleClick}>
        X
      </button>
    </div>
  );
};

const Notifications = (props: NotificationsProps) => {
  const { cssClasses, messages } = props;
  const className = `Notifications ${cssClasses}`;
  return (
    <section className={className}>
      {messages.map((message: IMessage) => {
        return <Message {...message} />;
      })}
    </section>
  );
};

export default Notifications;
