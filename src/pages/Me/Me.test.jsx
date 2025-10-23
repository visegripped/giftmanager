import Me from './Me';
import { render } from '@testing-library/react';
import { ProfileProvider } from '../../context/ProfileContext';
import { NotificationsProvider } from '../../context/NotificationsContext';

describe('The Me page', () => {
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
});
