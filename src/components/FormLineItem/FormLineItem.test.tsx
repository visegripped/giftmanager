import { render, screen } from '@testing-library/react';
import FormLineItem from './index';

describe('FormLineItem', () => {
  test('snapshot matches', () => {
    render(<FormLineItem cssClasses="test classes" label="this is the input" children="<textarea ></textarea>" />);
    const renderedFormLineItem = screen.getByTestId('FormLineItem');
    expect(renderedFormLineItem).toMatchSnapshot();
  });
});
