import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ReservedPurchasedItemsModal } from './ReservedPurchasedItemsModal';
import { NotificationsProvider } from '../../context/NotificationsContext';
import * as fetchDataModule from '../../utilities/fetchData';

vi.mock('../../utilities/fetchData');
vi.mock('../../utilities/postReport', () => ({
  default: vi.fn(),
}));

describe('ReservedPurchasedItemsModal Component', () => {
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
        <ReservedPurchasedItemsModal {...defaultProps} />
      </NotificationsProvider>
    );

    expect(
      screen.getByText('View Reserved/Purchased Items')
    ).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <NotificationsProvider>
        <ReservedPurchasedItemsModal {...defaultProps} isOpen={false} />
      </NotificationsProvider>
    );

    expect(
      screen.queryByText('View Reserved/Purchased Items')
    ).not.toBeInTheDocument();
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
        <ReservedPurchasedItemsModal {...defaultProps} />
      </NotificationsProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  it('shows empty state when no items', async () => {
    vi.spyOn(fetchDataModule, 'default').mockResolvedValue({
      success: [],
    });

    render(
      <NotificationsProvider>
        <ReservedPurchasedItemsModal {...defaultProps} />
      </NotificationsProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          'You have no reserved or purchased items from other users.'
        )
      ).toBeInTheDocument();
    });
  });

  it('displays items when available', async () => {
    const mockItems = [
      {
        itemid: 1,
        name: 'Test Item 1',
        owner_name: 'John Doe',
        status: 'purchased',
        userid: 2,
        date_added: 1234567890,
        removed: 0,
        added_by_userid: 2,
        groupid: 1,
        status_userid: 1,
        role: 'user' as const,
        date_received: 0,
      },
      {
        itemid: 2,
        name: 'Test Item 2',
        owner_name: 'Jane Smith',
        status: 'reserved',
        userid: 3,
        date_added: 1234567890,
        removed: 0,
        added_by_userid: 3,
        groupid: 1,
        status_userid: 1,
        role: 'user' as const,
        date_received: 0,
      },
    ];

    vi.spyOn(fetchDataModule, 'default').mockResolvedValue({
      success: mockItems,
    });

    render(
      <NotificationsProvider>
        <ReservedPurchasedItemsModal {...defaultProps} />
      </NotificationsProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    vi.spyOn(fetchDataModule, 'default').mockResolvedValue({
      success: [],
    });

    render(
      <NotificationsProvider>
        <ReservedPurchasedItemsModal {...defaultProps} onClose={onClose} />
      </NotificationsProvider>
    );

    const closeButton = screen.getByRole('button', { name: /×/i });
    closeButton.click();

    expect(onClose).toHaveBeenCalled();
  });
});
