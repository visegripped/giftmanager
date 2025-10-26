import User from './User';
import { render } from '@testing-library/react';
import { ProfileProvider } from '../../context/ProfileContext';
import { NotificationsProvider } from '../../context/NotificationsContext';

describe('The User page', () => {
  describe('when no user context is provided', () => {
    it('should match snapshot', () => {
      const { container } = render(
        <ProfileProvider>
          <NotificationsProvider>
            <User />
          </NotificationsProvider>
        </ProfileProvider>
      );
      expect(container).toMatchSnapshot();
    });
  });
});
