import React from 'react';
import './SelectList.css';

interface OptionProps {
  value: string;
  label: string;
}

interface SelectListProps {
  options: OptionProps[];
  cssClasses: string;
  disabled: boolean;
  onChange(changeEvent: object, props: object): void;
}

const SelectList = (props: SelectListProps) => {
  const { options = [], cssClasses, disabled, onChange } = props;
  const selectChangeHandler = (changeEvent: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(changeEvent, props);
  };
  const className = `selectList ${cssClasses}`;
  return (
    <select className={className} disabled={disabled} data-testid="SelectList" onChange={selectChangeHandler}>
      {options.map((option) => {
        const { value, label } = option;
        return (
          <option value={value} key={value}>
            {label || value}
          </option>
        );
      })}
    </select>
  );
};

export default SelectList;
