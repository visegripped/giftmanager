import { render, fireEvent, screen } from '@testing-library/react';
import ToggleDarkMode from './index';

const sampleOptions = [
  { value: 'something', label: 'something' },
  { value: 'somethingElse', label: 'something else' },
  { value: 'somethingMore', label: 'something more' },
];

describe('ToggleDarkMode', () => {
  test('onChange is executed properly', () => {
    let counter = 0;
    const testForClick = () => {
      counter += 1;
    };
    render(<ToggleDarkMode options={sampleOptions} onChange={testForClick} />);
    const renderedToggleDarkMode = screen.getByTestId('ToggleDarkMode');
    fireEvent.change(renderedToggleDarkMode, { target: { value: 1 } });
    expect(counter).toEqual(1);
  });
  test('snapshot matches', () => {
    render(<ToggleDarkMode cssClasses="test classes" options={sampleOptions} disabled={false} selected="something" />);
    const renderedToggleDarkMode = screen.getByTestId('ToggleDarkMode');
    expect(renderedToggleDarkMode).toMatchSnapshot();
  });
});
