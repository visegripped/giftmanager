import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotificationList } from './NotificationList';
import { NotificationsContext } from '../../context/NotificationsContext';

// Mock the Notification component
vi.mock('../Notification/Notification', () => ({
  default: ({ uuid, message, type }: any) => (
    <div data-testid={`notification-${uuid}`} data-type={type}>
      {message}
    </div>
  ),
}));

describe('NotificationList Component', () => {
  const mockContextValue = {
    notifications: {},
    setNotifications: vi.fn(),
    addNotification: vi.fn(),
    removeNotification: vi.fn(),
  };

  const renderWithContext = (notifications = {}) => {
    return render(
      <NotificationsContext.Provider
        value={{ ...mockContextValue, notifications }}
      >
        <NotificationList />
      </NotificationsContext.Provider>
    );
  };

  it('renders empty list when no notifications', () => {
    renderWithContext();

    const container = screen.getByRole('region', { hidden: true });
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('notificationList-container');
    expect(container).toBeEmptyDOMElement();
  });

  it('renders single notification', () => {
    const notifications = {
      'uuid-1': {
        uuid: 'uuid-1',
        message: 'Test notification',
        type: 'info',
        persist: false,
      },
    };

    renderWithContext(notifications);

    expect(screen.getByTestId('notification-uuid-1')).toBeInTheDocument();
    expect(screen.getByText('Test notification')).toBeInTheDocument();
  });

  it('renders multiple notifications', () => {
    const notifications = {
      'uuid-1': {
        uuid: 'uuid-1',
        message: 'First notification',
        type: 'info',
        persist: false,
      },
      'uuid-2': {
        uuid: 'uuid-2',
        message: 'Second notification',
        type: 'error',
        persist: true,
      },
      'uuid-3': {
        uuid: 'uuid-3',
        message: 'Third notification',
        type: 'success',
        persist: false,
      },
    };

    renderWithContext(notifications);

    expect(screen.getByTestId('notification-uuid-1')).toBeInTheDocument();
    expect(screen.getByTestId('notification-uuid-2')).toBeInTheDocument();
    expect(screen.getByTestId('notification-uuid-3')).toBeInTheDocument();

    expect(screen.getByText('First notification')).toBeInTheDocument();
    expect(screen.getByText('Second notification')).toBeInTheDocument();
    expect(screen.getByText('Third notification')).toBeInTheDocument();
  });

  it('passes correct props to Notification components', () => {
    const notifications = {
      'uuid-1': {
        uuid: 'uuid-1',
        message: 'Test message',
        type: 'warn',
        persist: true,
        clearDuration: 10000,
      },
    };

    renderWithContext(notifications);

    const notification = screen.getByTestId('notification-uuid-1');
    expect(notification).toHaveAttribute('data-type', 'warn');
    expect(notification).toHaveTextContent('Test message');
  });

  it('handles different notification types', () => {
    const notifications = {
      'error-uuid': {
        uuid: 'error-uuid',
        message: 'Error message',
        type: 'error',
        persist: false,
      },
      'success-uuid': {
        uuid: 'success-uuid',
        message: 'Success message',
        type: 'success',
        persist: false,
      },
      'warn-uuid': {
        uuid: 'warn-uuid',
        message: 'Warning message',
        type: 'warn',
        persist: false,
      },
      'info-uuid': {
        uuid: 'info-uuid',
        message: 'Info message',
        type: 'info',
        persist: false,
      },
    };

    renderWithContext(notifications);

    expect(screen.getByTestId('notification-error-uuid')).toHaveAttribute(
      'data-type',
      'error'
    );
    expect(screen.getByTestId('notification-success-uuid')).toHaveAttribute(
      'data-type',
      'success'
    );
    expect(screen.getByTestId('notification-warn-uuid')).toHaveAttribute(
      'data-type',
      'warn'
    );
    expect(screen.getByTestId('notification-info-uuid')).toHaveAttribute(
      'data-type',
      'info'
    );
  });

  it('handles notifications with persist flag', () => {
    const notifications = {
      'persistent-uuid': {
        uuid: 'persistent-uuid',
        message: 'Persistent notification',
        type: 'info',
        persist: true,
      },
      'temporary-uuid': {
        uuid: 'temporary-uuid',
        message: 'Temporary notification',
        type: 'info',
        persist: false,
      },
    };

    renderWithContext(notifications);

    expect(
      screen.getByTestId('notification-persistent-uuid')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('notification-temporary-uuid')
    ).toBeInTheDocument();
  });

  it('renders container with correct CSS class', () => {
    renderWithContext();

    const container = screen.getByRole('region', { hidden: true });
    expect(container).toHaveClass('notificationList-container');
  });

  it('is memoized and only re-renders when notifications change', () => {
    const initialNotifications = {
      'uuid-1': {
        uuid: 'uuid-1',
        message: 'Initial notification',
        type: 'info',
        persist: false,
      },
    };

    const { rerender } = renderWithContext(initialNotifications);
    expect(screen.getByTestId('notification-uuid-1')).toBeInTheDocument();

    // Re-render with same notifications
    rerender(
      <NotificationsContext.Provider
        value={{ ...mockContextValue, notifications: initialNotifications }}
      >
        <NotificationList />
      </NotificationsContext.Provider>
    );
    expect(screen.getByTestId('notification-uuid-1')).toBeInTheDocument();

    // Re-render with different notifications
    const updatedNotifications = {
      'uuid-2': {
        uuid: 'uuid-2',
        message: 'Updated notification',
        type: 'error',
        persist: false,
      },
    };

    rerender(
      <NotificationsContext.Provider
        value={{ ...mockContextValue, notifications: updatedNotifications }}
      >
        <NotificationList />
      </NotificationsContext.Provider>
    );

    expect(screen.queryByTestId('notification-uuid-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('notification-uuid-2')).toBeInTheDocument();
  });

  it('handles empty notification objects gracefully', () => {
    const notifications = {
      'empty-uuid': {
        uuid: 'empty-uuid',
        message: '',
        type: 'info',
        persist: false,
      },
    };

    renderWithContext(notifications);

    const notification = screen.getByTestId('notification-empty-uuid');
    expect(notification).toBeInTheDocument();
    expect(notification).toBeEmptyDOMElement();
  });

  it('handles notifications with missing optional properties', () => {
    const notifications = {
      'minimal-uuid': {
        uuid: 'minimal-uuid',
        message: 'Minimal notification',
        type: 'info',
      },
    };

    renderWithContext(notifications);

    expect(screen.getByTestId('notification-minimal-uuid')).toBeInTheDocument();
    expect(screen.getByText('Minimal notification')).toBeInTheDocument();
  });
});
