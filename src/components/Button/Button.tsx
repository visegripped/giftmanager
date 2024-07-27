// import React from 'react';
import './Button.css';

export interface ButtonProps {
  size?: 'small' | 'medium' | 'large';
  label: string;
  onClick?: () => void;
}

/**
 * Primary UI component for user interaction
 */
export const Button = ({ size = 'medium', label, ...props }: ButtonProps) => {
  return (
    <button type="button" className={`button button--${size}`} {...props}>
      {label}
    </button>
  );
};

export default Button;
