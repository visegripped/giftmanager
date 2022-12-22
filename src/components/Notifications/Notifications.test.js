import { render, screen } from '@testing-library/react';
import Notifications from './index';

const messages = [
  { id: '1234-abcd-error', type: 'error', report: 'this is an error notification.' },
  { id: '1234-abcd-info', type: 'info', report: 'this is an info notification.' },
  { id: '1234-abcd-warn', type: 'warn', report: 'this is an warn notification.' },
];

describe('Notifications', () => {
  test('snapshot matches', () => {
    render(<Notifications cssClasses="test classes" />);
    const renderedNotifications = screen.getByTestId('Notifications');
    expect(renderedNotifications).toMatchSnapshot();
  });
});
