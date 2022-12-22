import React from 'react';
import './Notifications.css';
import { IMessage, useNotificationContext } from '../../context/NotificationContext';
import Button from '../../components/Button';
import './Notifications.css';

export const Message = (props: IMessage) => {
  const { type, report, id } = props;
  const { removeMessage } = useNotificationContext();
  const handleClick = (clickEvent: React.SyntheticEvent<HTMLButtonElement>) => {
    const messageId = clickEvent.currentTarget?.id;
    console.log(`Click triggered for removing ${messageId}`);
    removeMessage(messageId);
  };
  return (
    <div className={`message ${type}`}>
      <pre className="message--pre">{report}</pre>
      <Button
        cssClasses={`button message--button message--button--${type}`}
        priority={type}
        id={id}
        onClick={handleClick}
        text="X"
      />
    </div>
  );
};

const Notifications = () => {
  const { messages } = useNotificationContext();
  console.log(` Notifications messages.length: ${messages.length}`);
  return (
    <section>
      {messages.map((message: IMessage) => {
        return <Message key={message.id} {...message} />;
      })}
    </section>
  );
};

export default Notifications;
