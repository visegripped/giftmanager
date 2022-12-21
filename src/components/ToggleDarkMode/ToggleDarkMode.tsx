import React from 'react';
import { useThemeContext } from '../../context/ThemeContext';
import './ToggleDarkMode.css';

const ToggleDarkMode = () => {
  const { dark, toggleDark } = useThemeContext();
  const handleOnChange = () => {
    toggleDark();
  };

  return (
    <label>
      <input type="checkbox" name="darkMode" onChange={handleOnChange} checked={dark} />
      Enable dark mode
    </label>
  );
};

export default ToggleDarkMode;
