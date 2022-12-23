import React from 'react';
import './Button.css';

export interface ButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  theme?: 'standard' | 'error' | 'warn' | 'info';
  priority?: 'primary' | 'secondary';
  onClick(clickEvent: object, props: object): void;
  id?: string;
}

const Button = (props: ButtonProps) => {
  const { children, id, disabled, priority = 'primary', onClick = () => null, theme = 'standard' } = props;
  const buttonClickHandler = (clickEvent: React.MouseEvent<HTMLButtonElement>) => {
    onClick(clickEvent, props);
  };
  const className = `button ${priority} ${theme}`;
  return (
    <button id={id} className={className} disabled={disabled} data-testid="Button" onClick={buttonClickHandler}>
      {children}
    </button>
  );
};

export default Button;
