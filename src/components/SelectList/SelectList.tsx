import React from 'react';
import './SelectList.css';

export interface SelectListOptionProps {
  value: string | number;
  label: string;
}

interface SelectListProps {
  options: SelectListOptionProps[];
  cssClasses?: string;
  disabled?: boolean;
  uuid: string | number;
  selected?: string | number;
  onChange(changeEvent: object, uuid: string | number): void;
}

const SelectList = (props: SelectListProps) => {
  const { options = [], cssClasses, disabled, uuid, onChange, selected } = props;
  const selectChangeHandler = (changeEvent: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(changeEvent, uuid);
  };
  const className = `selectList ${cssClasses}`;
  return (
    <select
      className={className}
      disabled={disabled}
      data-testid="SelectList"
      onChange={selectChangeHandler}
      value={selected}
    >
      {options.map((option: SelectListOptionProps) => {
        const { value, label } = option;
        return (
          <option value={value} key={`${uuid}_${value}`}>
            {label || value}
          </option>
        );
      })}
    </select>
  );
};

export default SelectList;
