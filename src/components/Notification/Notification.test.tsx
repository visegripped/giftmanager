import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Notification } from './Notification';
import {
  NotificationsContext,
  NotificationProps,
} from '../../context/NotificationsContext';

// Mock the context
const mockRemoveNotification = vi.fn();
const mockContextValue = {
  notifications: {},
  setNotifications: vi.fn(),
  addNotification: vi.fn(),
  removeNotification: mockRemoveNotification,
};

const renderWithContext = (props: NotificationProps) => {
  return render(
    <NotificationsContext.Provider value={mockContextValue}>
      <Notification {...props} />
    </NotificationsContext.Provider>
  );
};

describe('Notification Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  const defaultProps: NotificationProps = {
    uuid: 'test-uuid-123',
    type: 'info',
    message: 'Test notification message',
  };

  it('renders notification with correct content', () => {
    renderWithContext(defaultProps);

    expect(screen.getByText('Test notification message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'X' })).toBeInTheDocument();
  });

  it('applies correct CSS class based on type', () => {
    const { rerender } = renderWithContext({ ...defaultProps, type: 'error' });
    expect(screen.getByTestId(`notification-${defaultProps.uuid}`)).toHaveClass(
      'notification',
      'error'
    );

    rerender(
      <NotificationsContext.Provider value={mockContextValue}>
        <Notification {...defaultProps} type="success" />
      </NotificationsContext.Provider>
    );
    expect(screen.getByTestId(`notification-${defaultProps.uuid}`)).toHaveClass(
      'notification',
      'success'
    );

    rerender(
      <NotificationsContext.Provider value={mockContextValue}>
        <Notification {...defaultProps} type="warn" />
      </NotificationsContext.Provider>
    );
    expect(screen.getByTestId(`notification-${defaultProps.uuid}`)).toHaveClass(
      'notification',
      'warn'
    );
  });

  it('renders message in pre element', () => {
    renderWithContext(defaultProps);
    const preElement = screen.getByText('Test notification message');
    expect(preElement.tagName).toBe('PRE');
    expect(preElement).toHaveClass('notification--pre');
  });

  it('handles manual close button click', () => {
    renderWithContext(defaultProps);

    const closeButton = screen.getByRole('button', { name: 'X' });
    fireEvent.click(closeButton);

    expect(mockRemoveNotification).toHaveBeenCalledWith('test-uuid-123');
  });

  it('auto-removes notification after default duration when not persistent', async () => {
    renderWithContext(defaultProps);

    expect(mockRemoveNotification).not.toHaveBeenCalled();

    // Fast-forward time by 5 seconds (default clearDuration)
    await vi.advanceTimersByTimeAsync(5000);

    expect(mockRemoveNotification).toHaveBeenCalledWith('test-uuid-123');
  });

  it('auto-removes notification after custom duration', async () => {
    renderWithContext({ ...defaultProps, clearDuration: 3000 });

    await vi.advanceTimersByTimeAsync(3000);

    expect(mockRemoveNotification).toHaveBeenCalledWith('test-uuid-123');
  });

  it('does not auto-remove persistent notifications', async () => {
    renderWithContext({ ...defaultProps, persist: true });

    // Fast-forward time significantly
    await vi.advanceTimersByTimeAsync(10000);

    expect(mockRemoveNotification).not.toHaveBeenCalled();
  });

  it('does not auto-remove if manually closed before timeout', async () => {
    renderWithContext(defaultProps);

    // Manually close the notification
    const closeButton = screen.getByRole('button', { name: 'X' });
    fireEvent.click(closeButton);

    expect(mockRemoveNotification).toHaveBeenCalledTimes(1);

    // Fast-forward time
    await vi.advanceTimersByTimeAsync(5000);

    // Should not be called again
    expect(mockRemoveNotification).toHaveBeenCalledTimes(1);
  });

  it('cleans up timeout on unmount', async () => {
    const { unmount } = renderWithContext(defaultProps);

    // Unmount before timeout
    unmount();

    // Fast-forward time
    await vi.advanceTimersByTimeAsync(5000);

    // Should not call removeNotification after unmount
    expect(mockRemoveNotification).not.toHaveBeenCalled();
  });

  it('handles multiple notifications with different UUIDs', () => {
    const props1 = { ...defaultProps, uuid: 'uuid-1' };
    renderWithContext(props1);
    const closeButton1 = screen.getByRole('button', { name: 'X' });
    fireEvent.click(closeButton1);
    expect(mockRemoveNotification).toHaveBeenCalledWith('uuid-1');
  });

  it('is memoized and only re-renders when props change', () => {
    const { rerender } = renderWithContext(defaultProps);

    // Re-render with same props
    rerender(
      <NotificationsContext.Provider value={mockContextValue}>
        <Notification {...defaultProps} />
      </NotificationsContext.Provider>
    );

    // Re-render with different props
    rerender(
      <NotificationsContext.Provider value={mockContextValue}>
        <Notification {...defaultProps} message="Different message" />
      </NotificationsContext.Provider>
    );
    expect(screen.getByText('Different message')).toBeInTheDocument();
  });

  it('renders close button with correct attributes', () => {
    renderWithContext(defaultProps);
    const closeButton = screen.getByRole('button', { name: 'X' });

    expect(closeButton).toHaveAttribute('data-uuid', 'test-uuid-123');
    expect(closeButton).toHaveClass('notification--button', 'info');
  });
});
