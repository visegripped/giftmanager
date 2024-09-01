// import React from 'react';
import './Button.css';
import Icon from '@components/Icon';

export interface ButtonProps {
  size?: 'small' | 'medium' | 'large';
  label?: string;
  icon?: string,
  onButtonClick?: (e: React.MouseEvent) => void;
}

/**
 * Primary UI component for user interaction
 */
export const Button = (props: ButtonProps) => {
  const { icon, size = 'medium', label, onButtonClick } = props;

  return (
    <button type="button" className={`button button--${size}`} onClick={(e) => {
      if (onButtonClick) {
        onButtonClick(e);
      }
    }}>
      {icon ? <Icon icon={icon} size='small' /> : ''}
      {label ? <span>{label}</span> : ''}
    </button>
  );
};

export default Button;
