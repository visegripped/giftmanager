import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import Admin from './Admin';
import {
  ProfileContext,
  ProfileContextInterface,
} from '../../context/ProfileContext';
import {
  NotificationsContext,
  NotificationContextProps,
} from '../../context/NotificationsContext';

const meta = {
  title: 'Pages/Admin',
  component: Admin,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Admin>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to create context providers
const createContextProviders = (
  profile: Partial<ProfileContextInterface['myProfile']>,
  notificationProps?: Partial<NotificationContextProps>
) => {
  const mockProfileContext: ProfileContextInterface = {
    myProfile: profile as ProfileContextInterface['myProfile'],
    setMyProfile: fn(),
  };

  const mockNotificationsContext: NotificationContextProps = {
    notifications: {},
    setNotifications: fn(),
    addNotification: fn(),
    removeNotification: fn(),
    ...notificationProps,
  };

  return (
    <ProfileContext.Provider value={mockProfileContext}>
      <NotificationsContext.Provider value={mockNotificationsContext}>
        <Admin />
      </NotificationsContext.Provider>
    </ProfileContext.Provider>
  );
};

// Admin user stories
export const AdminUser: Story = {
  render: () => createContextProviders({ userid: '1' }),
};

export const AdminUserStringId: Story = {
  render: () => createContextProviders({ userid: '1' }),
};

// Non-admin user stories
export const NonAdminUser: Story = {
  render: () => createContextProviders({ userid: '2' }),
};

export const NoUser: Story = {
  render: () => createContextProviders({}),
};

export const EmptyUserid: Story = {
  render: () => createContextProviders({ userid: '' }),
};
