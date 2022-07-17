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
  onSelect: Function;
}

const SelectList = (props: SelectListProps) => {
  const { options = [], cssClasses, disabled, onSelect = () => { } } = props;
  const selectChangeHandler = (clickEvent: React.MouseEvent<HTMLSelectElement>) => {
    onSelect(clickEvent, props);
  }
  const className = `selectList ${cssClasses}`;
  return (
    <select className={className} disabled={disabled} data-testid='SelectList' onSelect={selectChangeHandler} >
      {options.map((option) => {
        const { value, label } = option;
        return (<option value={value} key={value}>{label || value}</option>);
      })}
    </select >
  );
};

export default SelectList;
