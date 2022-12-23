import React from 'react';
import './Notifications.css';
import { IMessage, useNotificationContext } from '../../context/NotificationContext';
import Button from '../../components/Button';
import './Notifications.css';

export const Message = (props: IMessage) => {
  const { type, report, id } = props;
  const { removeMessage } = useNotificationContext();
  /* https://www.toptal.com/designers/htmlarrows/symbols/ */
  const icons = {
    warn: 9785,
    success: 9786,
    error: 9760,
    info: 9881,
    standard: 9755,
  };
  const handleClick = (clickEvent: React.SyntheticEvent<HTMLButtonElement>) => {
    const messageId = clickEvent.currentTarget?.id;
    console.log(`Click triggered for removing ${messageId}`);
    removeMessage(messageId);
  };
  return (
    <div className={`message message--${type}`}>
      <div className="message--iconContainer">
        <span className="message--icon">{String.fromCharCode(icons[type])}</span>
      </div>
      <pre className="message--pre ">{report}</pre>
      <div className="message--buttonContainer">
        <Button theme={type} id={id} onClick={handleClick}>
          <b>&#x2716;</b>
        </Button>
      </div>
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
