import Error404 from './Error404';
import { render } from '@testing-library/react';

describe('The Error404 page', () => {
  describe('when no user context is provided', () => {
    it('should match snapshot', () => {
      const { container } = render(<Error404 />);
      expect(container).toMatchSnapshot();
    });
  });
});
