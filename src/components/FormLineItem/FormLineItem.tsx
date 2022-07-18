import React from 'react';
import './FormLineItem.css';

interface FormLineItemProps {
  label: string;
  cssClasses?: string;
  children: React.ReactNode;
}

const FormLineItem = (props: FormLineItemProps) => {
  const { label, cssClasses, children } = props;
  const className = `formLineItem ${cssClasses}`;
  return (
    <label className={className} data-testid="FormLineItem">
      <span>{label}</span>
      {children}
    </label>
  );
};

export default FormLineItem;
