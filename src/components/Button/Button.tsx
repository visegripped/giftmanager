import React from 'react';
import './Button.css';

interface ButtonProps {
  text: string;
  cssClasses: string;
  disabled: boolean;
  priority: 'primary' | 'secondary' | 'ghost';
  onClick(clickEvent: object, props: object): void;
}

const Button = (props: ButtonProps) => {
  const { text, cssClasses, disabled, priority, onClick = () => {} } = props;
  const buttonClickHandler = (clickEvent: React.MouseEvent<HTMLButtonElement>) => {
    onClick(clickEvent, props);
  };
  const className = `button ${priority} ${cssClasses}`;
  return (
    <button className={className} disabled={disabled} data-testid="Button" onClick={buttonClickHandler}>
      {text}
    </button>
  );
};

export default Button;
