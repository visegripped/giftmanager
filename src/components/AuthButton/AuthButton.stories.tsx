import type { Meta, StoryObj } from '@storybook/react-vite';
import AuthButton from './AuthButton';
import { AuthProvider } from '../../context/AuthContext';
import { ProfileProvider } from '../../context/ProfileContext';
import { NotificationsProvider } from '../../context/NotificationsContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const meta = {
  title: 'Components/AuthButton',
  component: AuthButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story: any) => {
      const googleClientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock-google-client-id';
      return (
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            <ProfileProvider>
              <NotificationsProvider>
                <Story />
              </NotificationsProvider>
            </ProfileProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      );
    },
  ],
} satisfies Meta<typeof AuthButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotAuthenticated: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Shows both Google and Facebook login buttons when user is not authenticated.',
      },
    },
  },
};

export const Authenticated: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Shows logout button when user is authenticated.',
      },
    },
  },
  decorators: [
    (Story: any) => {
      // Set up authenticated state
      localStorage.setItem('access_token', 'mock-token');
      localStorage.setItem('auth_provider', 'google');
      return (
        <GoogleOAuthProvider
          clientId={
            import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock-google-client-id'
          }
        >
          <AuthProvider>
            <ProfileProvider>
              <NotificationsProvider>
                <Story />
              </NotificationsProvider>
            </ProfileProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      );
    },
  ],
};

export const AuthenticatedWithFacebook: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Shows logout button when user is authenticated with Facebook.',
      },
    },
  },
  decorators: [
    (Story: any) => {
      // Set up authenticated state with Facebook
      localStorage.setItem('access_token', 'mock-facebook-token');
      localStorage.setItem('auth_provider', 'facebook');
      return (
        <GoogleOAuthProvider
          clientId={
            import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock-google-client-id'
          }
        >
          <AuthProvider>
            <ProfileProvider>
              <NotificationsProvider>
                <Story />
              </NotificationsProvider>
            </ProfileProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      );
    },
  ],
};
