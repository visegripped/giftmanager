import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserChooser, getUserNameFromUsersList } from './UserChooser';
import { NotificationsContext } from '../../context/NotificationsContext';
import { UserType } from '../../types/types';

// Mock fetchData utility
vi.mock('../../utilities/fetchData', () => ({
  default: vi.fn(),
}));

// Mock postReport utility
vi.mock('../../utilities/postReport', () => ({
  default: vi.fn(),
}));

const mockFetchData = vi.mocked(
  await import('../../utilities/fetchData')
).default;

const mockUsers: UserType[] = [
  {
    userid: 1,
    firstname: 'John',
    lastname: 'Doe',
    groupid: 1,
    created: '2023-01-01',
    email: 'john@example.com',
    avatar: '',
  },
  {
    userid: 2,
    firstname: 'Jane',
    lastname: 'Smith',
    groupid: 1,
    created: '2023-01-02',
    email: 'jane@example.com',
    avatar: '',
  },
  {
    userid: 3,
    firstname: 'Bob',
    lastname: 'Johnson',
    groupid: 1,
    created: '2023-01-03',
    email: 'bob@example.com',
    avatar: '',
  },
];

const mockContextValue = {
  notifications: {},
  setNotifications: vi.fn(),
  addNotification: vi.fn(),
  removeNotification: vi.fn(),
};

const renderWithContext = () => {
  return render(
    <BrowserRouter>
      <NotificationsContext.Provider value={mockContextValue}>
        <UserChooser />
      </NotificationsContext.Provider>
    </BrowserRouter>
  );
};

describe('UserChooser Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders choose user button', () => {
    renderWithContext();

    const button = screen.getByRole('button', { name: /choose user/i });
    expect(button).toBeInTheDocument();
  });

  it('opens dropdown when button is clicked', () => {
    renderWithContext();

    const button = screen.getByRole('button', { name: /choose user/i });
    fireEvent.click(button);

    expect(screen.getByText('loading...')).toBeInTheDocument();
  });

  it('closes dropdown when button is clicked again', () => {
    renderWithContext();

    const button = screen.getByRole('button', { name: /choose user/i });

    // Open dropdown
    fireEvent.click(button);
    expect(screen.getByText('loading...')).toBeInTheDocument();

    // Close dropdown
    fireEvent.click(button);
    expect(screen.queryByText('loading...')).not.toBeInTheDocument();
  });

  it('fetches users list on mount', async () => {
    mockFetchData.mockResolvedValue({
      err: '',
      success: mockUsers,
    } as any);

    renderWithContext();

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith({
        task: 'getUsersList',
      });
    });
  });

  it('displays users list when data is loaded', async () => {
    mockFetchData.mockResolvedValue({
      err: '',
      success: mockUsers,
    } as any);

    renderWithContext();

    const button = screen.getByRole('button', { name: /choose user/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  it('handles user selection', async () => {
    mockFetchData.mockResolvedValue({
      err: '',
      success: mockUsers,
    } as any);

    renderWithContext();

    const button = screen.getByRole('button', { name: /choose user/i });
    fireEvent.click(button);

    await waitFor(() => {
      const userLink = screen.getByText('John Doe');
      fireEvent.click(userLink);
    });

    // Dropdown should close after selection
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    mockFetchData.mockResolvedValue({
      err: 'Failed to fetch users',
    });

    renderWithContext();

    await waitFor(() => {
      expect(mockContextValue.addNotification).toHaveBeenCalledWith({
        message: expect.stringContaining(
          'Something went wrong while trying to get the list of users'
        ),
        type: 'error',
        persist: true,
      });
    });
  });

  it('closes dropdown when clicking outside', () => {
    renderWithContext();

    const button = screen.getByRole('button', { name: /choose user/i });
    fireEvent.click(button);

    expect(screen.getByText('loading...')).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(document.body);

    expect(screen.queryByText('loading...')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    renderWithContext();

    const button = screen.getByRole('button', { name: /choose user/i });
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
  });
});

describe('getUserNameFromUsersList utility function', () => {
  it('returns correct user name for valid userid', () => {
    const result = getUserNameFromUsersList(mockUsers, 1);
    expect(result).toBe('John Doe');
  });

  it('returns correct user name for string userid', () => {
    const result = getUserNameFromUsersList(mockUsers, '2');
    expect(result).toBe('Jane Smith');
  });

  it('returns empty string for non-existent userid', () => {
    const result = getUserNameFromUsersList(mockUsers, 999);
    expect(result).toBe('');
  });

  it('returns empty string for empty users list', () => {
    const result = getUserNameFromUsersList([], 1);
    expect(result).toBe('');
  });

  it('handles numeric string comparison correctly', () => {
    const result = getUserNameFromUsersList(mockUsers, '3');
    expect(result).toBe('Bob Johnson');
  });

  it('handles negative userid', () => {
    const result = getUserNameFromUsersList(mockUsers, -1);
    expect(result).toBe('');
  });

  it('handles zero userid', () => {
    const result = getUserNameFromUsersList(mockUsers, 0);
    expect(result).toBe('');
  });
});
