import React from 'react';

const defaultState = {
  dark: false,
  toggleDark: () => {
    console.log('stuff');
  },
};

interface IThemeContext {
  dark: boolean;
  toggleDark: () => void;
}

export const ThemeContext = React.createContext<IThemeContext>(defaultState);

export const useThemeContext = () => React.useContext(ThemeContext);

export default ThemeContext;
