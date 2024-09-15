// import React from 'react';
import './Button.css';
import Icon, { SupportedIcons } from '../Icon/Icon';

export interface ButtonProps {
  title?: string;
  icon?: SupportedIcons;
  size?: 'small' | 'medium' | 'large';
  label?: string;
  type?: 'submit' | 'button';
  onButtonClick?: (e: React.MouseEvent) => void;
}

/**
 * Primary UI component for user interaction
 */
export const Button = (props: ButtonProps) => {
  const { icon, title, size, label, type = 'button', onButtonClick } = props;

  return (
    <button
      type={type}
      title={title}
      className={`button button--${size}`}
      onClick={(e) => {
        if (onButtonClick) {
          onButtonClick(e);
        }
      }}
    >
      {icon ? <Icon icon={icon} /> : ''}
      {label ? <span>{label}</span> : ''}
    </button>
  );
};

export default Button;
