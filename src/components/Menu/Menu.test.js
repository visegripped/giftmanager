import { render, screen } from '@testing-library/react';
import Menu from './index';
import { BrowserRouter } from 'react-router-dom';

describe('Menu', () => {
  test('snapshot matches', () => {
    render(<Menu cssClasses="test classes" />, { wrapper: BrowserRouter });
    const renderedMenu = screen.getByTestId('Menu');
    expect(renderedMenu).toMatchSnapshot();
  });
});
