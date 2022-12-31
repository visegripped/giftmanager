import { render, fireEvent, screen } from '@testing-library/react';
import AuthButton from './index';

describe('Button', () => {
  const clientId = '451536185848-p0c132ugq4jr7r08k4m6odds43qk6ipj.apps.googleusercontent.com';
  test('snapshot matches when no token is passed', () => {
    render(
      <AuthButton
        clientId={clientId}
        buttonText="Login"
        onSuccess={() => {}}
        onFailure={() => {}}
        cookiePolicy={'single_host_origin'}
        isSignedIn={true}
      />,
    );
    const renderedButton = screen.getByTestId('AuthButton');
    expect(renderedButton).toMatchSnapshot();
  });
  test('snapshot matches when token is passed', () => {
    render(<AuthButton clientId={clientId} onLogoutSuccess={() => {}} tokenId="1234" />);
    const renderedButton = screen.getByTestId('AuthButton');
    expect(renderedButton).toMatchSnapshot();
  });
});
