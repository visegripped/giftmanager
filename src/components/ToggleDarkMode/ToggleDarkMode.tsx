import React, { useEffect, useState } from 'react';
import { useThemeContext } from '../../context/ThemeContext';
import './ToggleDarkMode.css';

const ToggleDarkMode = () => {
  const { dark, toggleDark } = useThemeContext();
  const [isChecked, setIsChecked] = useState(dark);
  const handleOnChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    toggleDark();
  };

  useEffect(() => {
    setIsChecked(dark);
  }, [dark]);

  return (
    <label>
      <input type="checkbox" name="darkMode" onChange={handleOnChange} checked={isChecked} />
      Enable dark mode
    </label>
  );
};

export default ToggleDarkMode;
