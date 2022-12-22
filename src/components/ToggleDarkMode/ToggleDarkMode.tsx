import React from 'react';
import { useThemeContext } from '../../context/ThemeContext';
import './ToggleDarkMode.css';

const ToggleDarkMode = () => {
  const { dark, toggleDark } = useThemeContext();
  const handleOnChange = () => {
    toggleDark();
  };
  console.log('enable dark mode rendered');
  return (
    <label>
      <input type="checkbox" name="darkMode" onChange={handleOnChange} checked={dark} />
      Enable dark mode
    </label>
  );
};

export default ToggleDarkMode;
