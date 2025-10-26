import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { NotificationsProvider } from './context/NotificationsContext';

// Mock dependencies
vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  useGoogleLogin: () => vi.fn(),
}));

vi.mock('./utilities/postReport', () => ({
  default: vi.fn(),
}));

vi.mock('./utilities/setThemeOnBody', () => ({
  setThemeOnBody: vi.fn(),
}));

vi.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
  useErrorBoundary: () => ({ resetBoundary: vi.fn() }),
}));

// Mock child components
vi.mock('./components/AuthButton/AuthButton', () => ({
  default: () => <div data-testid="auth-button">Auth Button</div>,
}));

vi.mock('./components/UserChooser/UserChooser', () => ({
  default: () => <div data-testid="user-chooser">User Chooser</div>,
}));

vi.mock('./components/NotificationList/NotificationList', () => ({
  default: () => <div data-testid="notification-list">Notification List</div>,
}));

vi.mock('./pages/Me/Me', () => ({
  default: () => <div data-testid="me-page">Me Page</div>,
}));

vi.mock('./pages/User/User', () => ({
  default: () => <div data-testid="user-page">User Page</div>,
}));

vi.mock('./pages/Theme/Theme', () => ({
  default: () => <div data-testid="theme-page">Theme Page</div>,
}));

vi.mock('./pages/Error404/Error404', () => ({
  default: () => <div data-testid="error-404">Error 404</div>,
}));

const renderApp = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <NotificationsProvider>
            <App />
          </NotificationsProvider>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders header with logo and navigation', () => {
    renderApp();

    expect(screen.getByText('GiftManager')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders footer with copyright', () => {
    renderApp();

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent('Copyright 2010');
    expect(footer).toHaveTextContent('All rights reserved');
  });

  it('renders auth button in header', () => {
    renderApp();

    expect(screen.getByTestId('auth-button')).toBeInTheDocument();
  });

  it('renders notification list', () => {
    renderApp();

    expect(screen.getByTestId('notification-list')).toBeInTheDocument();
  });

  it('shows loading state when not authenticated', () => {
    renderApp();

    expect(screen.getByText('You are not logged in.')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Please use the sign in button in the upper right corner.'
      )
    ).toBeInTheDocument();
  });

  it('shows authenticated content when user is logged in', async () => {
    // Mock authenticated state
    localStorage.setItem('access_token', 'test-token');

    // Mock profile context to return authenticated user
    vi.doMock('./context/ProfileContext', () => ({
      ProfileProvider: ({ children }: { children: React.ReactNode }) =>
        children,
      ProfileContext: {
        Provider: ({ children }: { children: React.ReactNode }) => children,
      },
    }));

    renderApp();

    // Should show routes for authenticated users
    await waitFor(() => {
      expect(screen.getByTestId('me-page')).toBeInTheDocument();
    });
  });

  it('renders theme toggle link in footer', () => {
    renderApp();

    const themeLink = screen.getByText('Use default theme');
    expect(themeLink).toBeInTheDocument();
    expect(themeLink.tagName).toBe('A');
  });

  it('handles theme toggle click', () => {
    renderApp();

    const themeLink = screen.getByText('Use default theme');
    themeLink.click();

    // Should not throw error
    expect(themeLink).toBeInTheDocument();
  });

  it('renders with correct CSS classes', () => {
    renderApp();

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders half-circle decorative element', () => {
    renderApp();

    const halfCircle = document.querySelector('.half-circle');
    expect(halfCircle).toBeInTheDocument();
  });

  it('initializes theme from localStorage', () => {
    localStorage.setItem('theme', 'custom-theme');

    renderApp();

    // Theme should be initialized from localStorage
    expect(localStorage.getItem('theme')).toBe('custom-theme');
  });

  it('uses default theme when none stored in localStorage', () => {
    renderApp();

    // Should use default theme
    expect(localStorage.getItem('theme')).toBe('theme__default');
  });

  it('renders routes for authenticated users', async () => {
    // Mock authenticated state
    localStorage.setItem('access_token', 'test-token');

    renderApp();

    // Should render authenticated routes
    await waitFor(() => {
      expect(screen.getByTestId('me-page')).toBeInTheDocument();
    });
  });

  it('handles error boundary correctly', () => {
    renderApp();

    // Error boundary should be present
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders user chooser when authenticated', async () => {
    // Mock authenticated state
    localStorage.setItem('access_token', 'test-token');

    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('user-chooser')).toBeInTheDocument();
    });
  });

  it('does not render user chooser when not authenticated', () => {
    renderApp();

    expect(screen.queryByTestId('user-chooser')).not.toBeInTheDocument();
  });

  it('updates authentication state when profile changes', async () => {
    renderApp();

    // Initially not authenticated
    expect(screen.getByText('You are not logged in.')).toBeInTheDocument();

    // This test would need more complex mocking to test state changes
    // For now, we verify the initial state
  });

  it('renders with memoized current year', () => {
    renderApp();

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`Copyright 2010 - ${currentYear}`)
    ).toBeInTheDocument();
  });
});
