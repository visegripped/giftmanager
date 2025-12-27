import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PrintListModal } from './PrintListModal';
import { NotificationsProvider } from '../../context/NotificationsContext';
import * as fetchDataModule from '../../utilities/fetchData';

vi.mock('../../utilities/fetchData');
vi.mock('../../utilities/postReport', () => ({
  default: vi.fn(),
}));
vi.mock('react-to-print', () => ({
  useReactToPrint: () => vi.fn(),
}));

describe('PrintListModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    myUserid: '1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    vi.spyOn(fetchDataModule, 'default').mockResolvedValue({
      success: [],
    });

    render(
      <NotificationsProvider>
        <PrintListModal {...defaultProps} />
      </NotificationsProvider>
    );

    expect(screen.getByText('Print My List')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <NotificationsProvider>
        <PrintListModal {...defaultProps} isOpen={false} />
      </NotificationsProvider>
    );

    expect(screen.queryByText('Print My List')).not.toBeInTheDocument();
  });

  it('shows loading state', async () => {
    vi.spyOn(fetchDataModule, 'default').mockImplementation(
      () =>
        new Promise(() => {
          // Never resolves to keep loading
        })
    );

    render(
      <NotificationsProvider>
        <PrintListModal {...defaultProps} />
      </NotificationsProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  it('shows empty state when no purchased items', async () => {
    vi.spyOn(fetchDataModule, 'default').mockResolvedValue({
      success: [],
    });

    render(
      <NotificationsProvider>
        <PrintListModal {...defaultProps} />
      </NotificationsProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText('You have no purchased items to print.')
      ).toBeInTheDocument();
    });
  });

  it('displays only purchased items', async () => {
    const mockItems = [
      {
        itemid: 1,
        name: 'Purchased Item',
        status: 'purchased',
        userid: 1,
        date_added: 1234567890,
        removed: 0,
        added_by_userid: 1,
        groupid: 1,
        status_userid: 1,
        role: 'user' as const,
        date_received: 0,
        owner_name: 'John Doe',
      },
      {
        itemid: 2,
        name: 'Reserved Item',
        status: 'reserved',
        userid: 1,
        date_added: 1234567890,
        removed: 0,
        added_by_userid: 1,
        groupid: 1,
        status_userid: 1,
        role: 'user' as const,
        date_received: 0,
        owner_name: 'Jane Smith',
      },
    ];

    const fetchDataSpy = vi
      .spyOn(fetchDataModule, 'default')
      .mockResolvedValue({
        success: mockItems,
      });

    render(
      <NotificationsProvider>
        <PrintListModal {...defaultProps} />
      </NotificationsProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Purchased Item')).toBeInTheDocument();
      expect(screen.queryByText('Reserved Item')).not.toBeInTheDocument();
    });

    // Verify the correct task is called
    expect(fetchDataSpy).toHaveBeenCalledWith({
      task: 'getMyReservedPurchasedItems',
      myuserid: '1',
    });
  });

  it('shows print button when items are available', async () => {
    const mockItems = [
      {
        itemid: 1,
        name: 'Purchased Item',
        status: 'purchased',
        userid: 1,
        date_added: 1234567890,
        removed: 0,
        added_by_userid: 1,
        groupid: 1,
        status_userid: 1,
        role: 'user' as const,
        date_received: 0,
        owner_name: 'John Doe',
      },
    ];

    const fetchDataSpy = vi
      .spyOn(fetchDataModule, 'default')
      .mockResolvedValue({
        success: mockItems,
      });

    render(
      <NotificationsProvider>
        <PrintListModal {...defaultProps} />
      </NotificationsProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Print')).toBeInTheDocument();
    });

    // Verify the correct task is called
    expect(fetchDataSpy).toHaveBeenCalledWith({
      task: 'getMyReservedPurchasedItems',
      myuserid: '1',
    });
  });

  it('displays owner name when available', async () => {
    const mockItems = [
      {
        itemid: 1,
        name: 'Purchased Item',
        status: 'purchased',
        userid: 1,
        date_added: 1234567890,
        removed: 0,
        added_by_userid: 1,
        groupid: 1,
        status_userid: 1,
        role: 'user' as const,
        date_received: 0,
        owner_name: 'John Doe',
      },
    ];

    vi.spyOn(fetchDataModule, 'default').mockResolvedValue({
      success: mockItems,
    });

    render(
      <NotificationsProvider>
        <PrintListModal {...defaultProps} />
      </NotificationsProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('For: John Doe')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    vi.spyOn(fetchDataModule, 'default').mockResolvedValue({
      success: [],
    });

    render(
      <NotificationsProvider>
        <PrintListModal {...defaultProps} onClose={onClose} />
      </NotificationsProvider>
    );

    await waitFor(() => {
      const closeButton = screen.getByLabelText('Close modal');
      closeButton.click();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
