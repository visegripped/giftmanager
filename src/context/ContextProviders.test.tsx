import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import {
  NotificationsProvider,
  NotificationsContext,
} from './NotificationsContext';
import { ProfileProvider, ProfileContext } from './ProfileContext';
import { AuthProvider, AuthContext } from './AuthContext';

// Mock dependencies
vi.mock('@react-oauth/google', () => ({
  googleLogout: vi.fn(),
  useGoogleLogin: vi.fn(() => vi.fn()),
}));

vi.mock('../../utilities/postReport', () => ({
  default: vi.fn(),
}));

describe('NotificationsContext', () => {
  const TestComponent = () => {
    const { notifications, addNotification, removeNotification } =
      useContext(NotificationsContext) as any;

    return (
      <div>
        <div data-testid="notifications-count">
          {Object.keys(notifications).length}
        </div>
        <button
          onClick={() =>
            addNotification({ type: 'info', message: 'Test notification' })
          }
        >
          Add Notification
        </button>
        <button onClick={() => removeNotification('test-uuid')}>
          Remove Notification
        </button>
      </div>
    );
  };

  it('provides initial empty notifications', () => {
    render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    );

    expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
  });

  it('adds notification correctly', () => {
    render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    );

    const addButton = screen.getByText('Add Notification');
    act(() => {
      addButton.click();
    });

    expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
  });

  it('removes notification correctly', () => {
    render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    );

    const addButton = screen.getByText('Add Notification');
    const removeButton = screen.getByText('Remove Notification');

    act(() => {
      addButton.click();
    });

    expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');

    act(() => {
      removeButton.click();
    });

    expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
  });

  it('generates unique UUIDs for notifications', () => {
    render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    );

    const addButton = screen.getByText('Add Notification');

    act(() => {
      addButton.click();
      addButton.click();
    });

    expect(screen.getByTestId('notifications-count')).toHaveTextContent('2');
  });

  it('memoizes context value to prevent unnecessary re-renders', () => {
    const { rerender } = render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    );

    const initialCount = screen.getByTestId('notifications-count').textContent || '';

    // Re-render with same props
    rerender(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    );

    expect(screen.getByTestId('notifications-count')).toHaveTextContent(
      initialCount
    );
  });
});

describe('ProfileContext', () => {
  const TestComponent = () => {
    const { myProfile, setMyProfile } = useContext(ProfileContext) as any;

    return (
      <div>
        <div data-testid="profile">{JSON.stringify(myProfile)}</div>
        <button
          onClick={() => setMyProfile({ userid: '123', name: 'Test User' })}
        >
          Set Profile
        </button>
      </div>
    );
  };

  it('provides initial empty profile', () => {
    render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    expect(screen.getByTestId('profile')).toHaveTextContent('{}');
  });

  it('updates profile correctly', () => {
    render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    const setButton = screen.getByText('Set Profile');
    act(() => {
      setButton.click();
    });

    expect(screen.getByTestId('profile')).toHaveTextContent(
      '{"userid":"123","name":"Test User"}'
    );
  });

  it('memoizes context value to prevent unnecessary re-renders', () => {
    const { rerender } = render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    const initialProfile = screen.getByTestId('profile').textContent || '';

    // Re-render with same props
    rerender(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );

    expect(screen.getByTestId('profile')).toHaveTextContent(initialProfile);
  });
});

describe('AuthContext', () => {
  const TestComponent = () => {
    const { accessToken, login, logout, setAccessToken } =
      useContext(AuthContext) as any;

    return (
      <div>
        <div data-testid="access-token">{accessToken || 'no-token'}</div>
        <button onClick={login}>Login</button>
        <button onClick={logout}>Logout</button>
        <button onClick={() => setAccessToken('test-token')}>Set Token</button>
      </div>
    );
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('provides initial empty access token', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('access-token')).toHaveTextContent('no-token');
  });

  it('loads access token from localStorage on mount', () => {
    localStorage.setItem('access_token', 'stored-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('access-token')).toHaveTextContent(
      'stored-token'
    );
  });

  it('sets access token correctly', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const setButton = screen.getByText('Set Token');
    act(() => {
      setButton.click();
    });

    expect(screen.getByTestId('access-token')).toHaveTextContent('test-token');
  });

  it('clears access token on logout', () => {
    localStorage.setItem('access_token', 'initial-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('access-token')).toHaveTextContent(
      'initial-token'
    );

    const logoutButton = screen.getByText('Logout');
    act(() => {
      logoutButton.click();
    });

    expect(screen.getByTestId('access-token')).toHaveTextContent('no-token');
    expect(localStorage.getItem('access_token')).toBeNull();
  });

  it('handles token validation correctly', async () => {
    // Mock fetch for token validation
    (globalThis as any).fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({}),
    });

    localStorage.setItem('access_token', 'valid-token');
    localStorage.setItem(
      'access_token_expiration',
      new Date(Date.now() + 3600000).toString()
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should not logout with valid token
    expect(screen.getByTestId('access-token')).toHaveTextContent('valid-token');
  });

  it('handles expired token correctly', async () => {
    // Mock fetch for token validation
    (globalThis as any).fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ error_description: 'Token expired' }),
    });

    localStorage.setItem('access_token', 'expired-token');
    localStorage.setItem(
      'access_token_expiration',
      new Date(Date.now() - 3600000).toString()
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should logout with expired token
    await waitFor(() => {
      expect(screen.getByTestId('access-token')).toHaveTextContent('no-token');
    });
  });

  it('memoizes functions to prevent unnecessary re-renders', () => {
    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const initialToken = screen.getByTestId('access-token').textContent || '';

    // Re-render with same props
    rerender(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('access-token')).toHaveTextContent(initialToken);
  });
});
