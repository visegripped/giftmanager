import React from 'react';
import './Button.css';

interface ButtonProps {
  text: string; // change this to use children
  //   children: React.ReactNode;
  cssClasses?: string;
  disabled?: boolean;
  priority?: 'primary' | 'secondary' | 'ghost' | 'error' | 'critical' | 'info'; // error shouldn't be a priority.  Add a new theme prop w/ standard, error, warn
  onClick(clickEvent: object, props: object): void;
  id?: string;
}

const Button = (props: ButtonProps) => {
  const { text, cssClasses, id, disabled, priority, onClick = () => null } = props;
  const buttonClickHandler = (clickEvent: React.MouseEvent<HTMLButtonElement>) => {
    onClick(clickEvent, props);
  };
  const className = `button ${priority} ${cssClasses}`;
  return (
    <button id={id} className={className} disabled={disabled} data-testid="Button" onClick={buttonClickHandler}>
      {text}
    </button>
  );
};

export default Button;
