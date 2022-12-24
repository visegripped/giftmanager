import { createContext, useContext } from 'react';

const defaultState = {
  dark: false,
  toggleDark: () => {
    console.log('default context toggleDark executed');
  },
};

interface IThemeContext {
  dark: boolean;
  toggleDark: () => void;
}

export const ThemeContext = createContext<IThemeContext>(defaultState);

export const useThemeContext = () => useContext(ThemeContext);

export default ThemeContext;
