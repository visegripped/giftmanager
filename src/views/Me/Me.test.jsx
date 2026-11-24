import Me from './Me';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { ProfileContext, ProfileProvider } from '../../context/ProfileContext';
import {
  NotificationsContext,
  NotificationsProvider,
} from '../../context/NotificationsContext';
import fetchData from '../../utilities/fetchData';

vi.mock('../../utilities/fetchData', () => ({
  default: vi.fn(),
}));

vi.mock('../../utilities/postReport', () => ({
  default: vi.fn(),
}));

const mockFetchData = vi.mocked(fetchData);

const listItem = {
  itemid: 11,
  userid: 7,
  name: 'Wool socks',
  description: 'Warm',
  link: 'https://example.com/socks',
  removed: 0,
  date_added: 1,
  date_received: 0,
  status: null,
  added_by_userid: 7,
  groupid: 1,
  status_userid: 0,
  role: 'user',
};

const renderWithProfile = (userid = '7') => {
  const profile = {
    myProfile: {
      userid,
      emailAddress: 'me@example.com',
      givenName: 'Ada',
      familyName: 'Lovelace',
      avatar: '',
    },
    setMyProfile: vi.fn(),
  };
  const notifications = {
    notifications: {},
    setNotifications: vi.fn(),
    addNotification: vi.fn(),
    removeNotification: vi.fn(),
  };

  return render(
    <ProfileContext.Provider value={profile}>
      <NotificationsContext.Provider value={notifications}>
        <Me />
      </NotificationsContext.Provider>
    </ProfileContext.Provider>
  );
};

describe('The Me page', () => {
  beforeEach(() => {
    mockFetchData.mockReset();
  });

  describe('when no user context is provided', () => {
    it('should match snapshot', () => {
      const { container } = render(
        <ProfileProvider>
          <NotificationsProvider>
            <Me />
          </NotificationsProvider>
        </ProfileProvider>
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('when adding or editing an item', () => {
    it('keeps the list mounted while the form changes and refreshes after add', async () => {
      mockFetchData.mockImplementation((config) => {
        if (config.task === 'getMyItemList') {
          return Promise.resolve({ success: [listItem] });
        }
        return Promise.resolve({ success: 'added' });
      });

      const { container } = renderWithProfile();

      await waitFor(() => {
        expect(container.querySelector('.ag-root-wrapper')).toBeTruthy();
      });

      const list = container.querySelector('.ag-root-wrapper');
      const nameInput = container.querySelector('input[name="name"]');
      const linkInput = container.querySelector('input[name="link"]');
      const descriptionInput = container.querySelector(
        'textarea[name="description"]'
      );

      fireEvent.change(nameInput, { target: { value: 'New gift' } });
      fireEvent.change(linkInput, {
        target: { value: 'https://example.com/new' },
      });
      fireEvent.change(descriptionInput, { target: { value: 'A note' } });

      expect(container.querySelector('.ag-root-wrapper')).toBe(list);
      expect(mockFetchData).toHaveBeenCalledTimes(1);
      expect(nameInput).toHaveValue('New gift');

      fireEvent.submit(container.querySelector('form.form'));

      await waitFor(() => {
        expect(mockFetchData).toHaveBeenCalledWith(
          expect.objectContaining({
            task: 'addItemToMyList',
            name: 'New gift',
            description: 'A note',
            link: 'https://example.com/new',
          })
        );
      });

      await waitFor(() => {
        expect(mockFetchData).toHaveBeenCalledWith(
          expect.objectContaining({ task: 'getMyItemList' })
        );
        expect(nameInput).toHaveValue('');
      });
    });

    it('does not refresh the list while an edit is typed, then saves once', async () => {
      mockFetchData.mockImplementation((config) => {
        if (config.task === 'getMyItemList') {
          return Promise.resolve({ success: [listItem] });
        }
        return Promise.resolve({ success: 'updated' });
      });

      const { container } = renderWithProfile();

      await waitFor(() => {
        expect(
          container.querySelector(
            'button[title="Edit item (link/description)"]'
          )
        ).toBeTruthy();
      });

      const list = container.querySelector('.ag-root-wrapper');
      fireEvent.click(
        container.querySelector('button[title="Edit item (link/description)"]')
      );

      const descriptionInput = container.querySelector(
        'textarea[name="description"]'
      );
      fireEvent.change(descriptionInput, {
        target: { value: 'Updated description' },
      });

      expect(container.querySelector('.ag-root-wrapper')).toBe(list);
      expect(mockFetchData).toHaveBeenCalledTimes(1);
      expect(container.querySelector('legend').textContent).toBe(
        'Edit item on my list'
      );

      fireEvent.submit(container.querySelector('form.form'));

      await waitFor(() => {
        expect(mockFetchData).toHaveBeenCalledWith(
          expect.objectContaining({
            task: 'updateItemOnMyList',
            itemid: 11,
            description: 'Updated description',
            link: 'https://example.com/socks',
          })
        );
      });
    });
  });
});
