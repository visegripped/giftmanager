import { render, screen } from '@testing-library/react';
import Notifications from './index';
import { Message } from './Notifications';

const messages = [
  { id: '1234-abcd-error', type: 'error', report: 'this is an error notification.' },
  { id: '1234-abcd-info', type: 'info', report: 'this is an info notification.' },
  { id: '1234-abcd-warn', type: 'warn', report: 'this is an warn notification.' },
  { id: '1234-abcd-success', type: 'success', report: 'this is an success notification.' },
  { id: '1234-abcd-standard', type: 'standard', report: 'this is an standard notification.' },
];

describe('Notifications', () => {
  test('snapshot matches', () => {
    render(<Notifications />);
    const renderedNotifications = screen.getByTestId('Notifications');
    expect(renderedNotifications).toMatchSnapshot();
  });
});

describe('Message', () => {
  test('snapshot for error state matches', () => {
    render(<Message {...messages[0]} />);
    const renderedNotifications = screen.getByTestId('Message');
    expect(renderedNotifications).toMatchSnapshot();
  });
  test('snapshot for info state matches', () => {
    render(<Message {...messages[1]} />);
    const renderedNotifications = screen.getByTestId('Message');
    expect(renderedNotifications).toMatchSnapshot();
  });
  test('snapshot for warn state matches', () => {
    render(<Message {...messages[2]} />);
    const renderedNotifications = screen.getByTestId('Message');
    expect(renderedNotifications).toMatchSnapshot();
  });
  test('snapshot for success state matches', () => {
    render(<Message {...messages[3]} />);
    const renderedNotifications = screen.getByTestId('Message');
    expect(renderedNotifications).toMatchSnapshot();
  });
  test('snapshot for standard state matches', () => {
    render(<Message {...messages[4]} />);
    const renderedNotifications = screen.getByTestId('Message');
    expect(renderedNotifications).toMatchSnapshot();
  });
});
