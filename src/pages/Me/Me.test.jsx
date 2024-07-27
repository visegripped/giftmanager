import Me from './Me';
import { render } from '@testing-library/react';

describe('The Me page', () => {
  describe('when no user context is provided', () => {
    it('should match snapshot', () => {
      const { container } = render(<Me />);
      expect(container).toMatchSnapshot();
    });
  });
});
