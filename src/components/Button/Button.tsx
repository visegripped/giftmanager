import React from 'react';
import './Button.css';

interface ButtonProps {
  text: string;
  cssClasses: string;
  children: string;
}

const Button = (props: ButtonProps) => {
  const { text, cssClasses } = props;
  const className = `button ${cssClasses}`;
  return (
    <button className={ className } >{ text }</button>
  );
}

export default Button;