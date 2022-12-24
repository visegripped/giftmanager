import { render, screen } from '@testing-library/react';
import ToggleDarkMode from './index';

describe('ToggleDarkMode', () => {
  test('snapshot matches', () => {
    render(<ToggleDarkMode />);
    const renderedToggleDarkMode = screen.getByTestId('ToggleDarkMode');
    expect(renderedToggleDarkMode).toMatchSnapshot();
  });
});
