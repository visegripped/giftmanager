// import React from 'react';
import './Button.css';
import Icon from '@components/Icon';

export interface ButtonProps {
  size?: 'small' | 'medium' | 'large';
  label?: string;
  title?: string;
  icon?: string;
  type?: 'submit' | 'button';
  onButtonClick?: (e: React.MouseEvent) => void;
}

/**
 * Primary UI component for user interaction
 */
export const Button = (props: ButtonProps) => {
  const {
    icon,
    size = 'medium',
    label,
    title,
    type = 'button',
    onButtonClick,
  } = props;

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
      {icon ? <Icon icon={icon} size="small" /> : ''}
      {label ? <span>{label}</span> : ''}
    </button>
  );
};

export default Button;
