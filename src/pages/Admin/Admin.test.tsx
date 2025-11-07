import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Admin from './Admin';
import {
  ProfileContext,
  ProfileContextInterface,
} from '../../context/ProfileContext';
import {
  NotificationsContext,
  NotificationContextProps,
} from '../../context/NotificationsContext';
import fetchData from '../../utilities/fetchData';
import postReport from '../../utilities/postReport';

// Mock the utilities
vi.mock('../../utilities/fetchData');
vi.mock('../../utilities/postReport');

const mockFetchData = vi.mocked(fetchData);
const mockPostReport = vi.mocked(postReport);

describe('Admin Component', () => {
  const mockAddNotification = vi.fn();
  const mockSetMyProfile = vi.fn();

  const mockNotificationsContext: NotificationContextProps = {
    notifications: {},
    setNotifications: vi.fn(),
    addNotification: mockAddNotification,
    removeNotification: vi.fn(),
  };

  const renderWithContext = (
    profile: Partial<ProfileContextInterface['myProfile']>
  ) => {
    const mockProfileContext: ProfileContextInterface = {
      myProfile: profile as ProfileContextInterface['myProfile'],
      setMyProfile: mockSetMyProfile,
    };

    return render(
      <ProfileContext.Provider value={mockProfileContext}>
        <NotificationsContext.Provider value={mockNotificationsContext}>
          <Admin />
        </NotificationsContext.Provider>
      </ProfileContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when user is admin (userid === 1)', () => {
    it('renders admin interface with buttons', () => {
      renderWithContext({ userid: 1 });

      expect(screen.getByText('Administration')).toBeInTheDocument();
      expect(screen.getByText('Archive purchased items')).toBeInTheDocument();
      expect(screen.getByText('Archive removed items')).toBeInTheDocument();
    });

    it('renders admin interface with userid as string "1"', () => {
      renderWithContext({ userid: '1' });

      expect(screen.getByText('Administration')).toBeInTheDocument();
      expect(screen.getByText('Archive purchased items')).toBeInTheDocument();
      expect(screen.getByText('Archive removed items')).toBeInTheDocument();
    });

    it('calls fetchData with correct task when archive purchased items button is clicked', async () => {
      const mockResponse = Promise.resolve({
        success: 'Purchased items have been archived. 5 items affected.',
      });
      mockFetchData.mockReturnValue(mockResponse);

      renderWithContext({ userid: 1 });

      const button = screen.getByText('Archive purchased items');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockFetchData).toHaveBeenCalledWith({
          task: 'archivePurchasedItems',
          myuserid: 1,
        });
      });
    });

    it('calls fetchData with correct task when archive removed items button is clicked', async () => {
      const mockResponse = Promise.resolve({
        success: 'Removed items have been archived 3 items affected.',
      });
      mockFetchData.mockReturnValue(mockResponse);

      renderWithContext({ userid: 1 });

      const button = screen.getByText('Archive removed items');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockFetchData).toHaveBeenCalledWith({
          task: 'archiveRemovedItems',
          myuserid: 1,
        });
      });
    });

    it('shows success notification when archive purchased items succeeds', async () => {
      const mockResponse = Promise.resolve({
        success: 'Purchased items have been archived. 5 items affected.',
      });
      mockFetchData.mockReturnValue(mockResponse);

      renderWithContext({ userid: 1 });

      const button = screen.getByText('Archive purchased items');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith({
          message: 'Purchased items have been archived. 5 items affected.',
          type: 'success',
        });
      });
    });

    it('shows success notification when archive removed items succeeds', async () => {
      const mockResponse = Promise.resolve({
        success: 'Removed items have been archived 3 items affected.',
      });
      mockFetchData.mockReturnValue(mockResponse);

      renderWithContext({ userid: 1 });

      const button = screen.getByText('Archive removed items');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith({
          message: 'Removed items have been archived 3 items affected.',
          type: 'success',
        });
      });
    });

    it('shows warn notification when archive purchased items returns warn', async () => {
      const mockResponse = Promise.resolve({
        warn: 'There were no matching items.',
      });
      mockFetchData.mockReturnValue(mockResponse);

      renderWithContext({ userid: 1 });

      const button = screen.getByText('Archive purchased items');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith({
          message: 'There were no matching items.',
          type: 'success',
        });
      });
    });

    it('shows error notification and reports error when archive purchased items fails', async () => {
      const mockResponse = Promise.resolve({
        error: 'Failed to prepare the statement',
      });
      mockFetchData.mockReturnValue(mockResponse);
      mockPostReport.mockResolvedValue(undefined);

      renderWithContext({ userid: 1 });

      const button = screen.getByText('Archive purchased items');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockPostReport).toHaveBeenCalledWith({
          type: 'error',
          report: 'Failure executing fetchData for archivePurchasedItems',
          body: {
            error: 'Failed to prepare the statement',
            file: 'Admin',
            origin: 'apiResponse',
          },
        });
        expect(mockAddNotification).toHaveBeenCalledWith({
          message: 'Something went wrong: Failed to prepare the statement',
          type: 'error',
          persist: true,
        });
      });
    });

    it('shows error notification and reports error when archive removed items fails', async () => {
      const mockResponse = Promise.resolve({
        error: 'Database connection failed',
      });
      mockFetchData.mockReturnValue(mockResponse);
      mockPostReport.mockResolvedValue(undefined);

      renderWithContext({ userid: 1 });

      const button = screen.getByText('Archive removed items');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockPostReport).toHaveBeenCalledWith({
          type: 'error',
          report: 'Failure executing fetchData for archiveRemovedItems',
          body: {
            error: 'Database connection failed',
            file: 'Admin',
            origin: 'apiResponse',
          },
        });
        expect(mockAddNotification).toHaveBeenCalledWith({
          message: 'Something went wrong: Database connection failed',
          type: 'error',
          persist: true,
        });
      });
    });

    it('does not call notification when fetchData returns undefined', async () => {
      mockFetchData.mockReturnValue(undefined);

      renderWithContext({ userid: 1 });

      const button = screen.getByText('Archive purchased items');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAddNotification).not.toHaveBeenCalled();
      });
    });
  });

  describe('when user is not admin', () => {
    it('shows permission denied message', () => {
      renderWithContext({ userid: 2 });

      expect(screen.getByText('Administration')).toBeInTheDocument();
      expect(
        screen.getByText('You do not have permission to access this page.')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Archive purchased items')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Archive removed items')
      ).not.toBeInTheDocument();
    });

    it('shows permission denied message when userid is undefined', () => {
      renderWithContext({});

      expect(screen.getByText('Administration')).toBeInTheDocument();
      expect(
        screen.getByText('You do not have permission to access this page.')
      ).toBeInTheDocument();
    });

    it('shows permission denied message when userid is empty string', () => {
      renderWithContext({ userid: '' });

      expect(screen.getByText('Administration')).toBeInTheDocument();
      expect(
        screen.getByText('You do not have permission to access this page.')
      ).toBeInTheDocument();
    });
  });

  describe('button titles', () => {
    it('has correct title for archive purchased items button', () => {
      renderWithContext({ userid: 1 });
      const button = screen.getByText('Archive purchased items');
      expect(button).toHaveAttribute(
        'title',
        'Remove all items from all lists where items are tagged as purchased'
      );
    });

    it('has correct title for archive removed items button', () => {
      renderWithContext({ userid: 1 });
      const button = screen.getByText('Archive removed items');
      expect(button).toHaveAttribute(
        'title',
        'Archive all items from all lists where items are tagged as removed'
      );
    });
  });
});
