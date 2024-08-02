import { describe, it, beforeEach, expect } from 'vitest';
import setThemeOnBody from './setThemeOnBody';

// Helper function to reset body class
const resetBodyClass = () => {
  document.body.className = '';
};

describe('setThemeOnBody', () => {
  beforeEach(() => {
    // Reset the body class before each test
    resetBodyClass();
  });

  it('should add the theme class if the body has no class', () => {
    setThemeOnBody('dark');
    expect(document.body.classList.contains('dark')).toBe(true);
  });

  it('should replace the current theme class with the new one', () => {
    document.body.classList.add('light');
    setThemeOnBody('dark');
    expect(document.body.classList.contains('light')).toBe(false);
    expect(document.body.classList.contains('dark')).toBe(true);
  });

  it('should not add the new theme class if it is the same as the current one', () => {
    document.body.classList.add('dark');
    setThemeOnBody('dark');
    expect(document.body.classList.contains('dark')).toBe(true);
    expect(document.body.classList.length).toBe(1);
  });

  it('should preserve the existing theme if passed a blank string', () => {
    document.body.classList.add('dark');
    setThemeOnBody('');
    expect(document.body.classList.contains('dark')).toBe(true);
    expect(document.body.classList.contains('')).toBe(false);
  });
});
