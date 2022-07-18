import { render, screen } from '@testing-library/react';
import Nav from './index';
import { BrowserRouter } from 'react-router-dom';

describe('Nav', () => {
  test('snapshot matches', () => {
    render(<Nav cssClasses="test classes" />, { wrapper: BrowserRouter });
    const renderedNav = screen.getByTestId('Nav');
    expect(renderedNav).toMatchSnapshot();
  });
});
