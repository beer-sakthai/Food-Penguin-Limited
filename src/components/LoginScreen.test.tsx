
import { render, screen } from '@testing-library/react';
import LoginScreen from './LoginScreen';

describe('LoginScreen', () => {
  it('renders the sign-in button', () => {
    render(<LoginScreen onSignIn={() => {}} />);
    const signInButton = screen.getByRole('button', { name: /^Sign In$/i });
    expect(signInButton).toBeInTheDocument();
  });
});
