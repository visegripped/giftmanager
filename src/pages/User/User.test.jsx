import User from './User';
import { render } from '@testing-library/react';

describe('The User page', () => {
  describe('when no user context is provided', () => {
    it('should match snapshot', () => {
      const { container } = render(<User />);
      expect(container).toMatchSnapshot();
    });
  });
});
