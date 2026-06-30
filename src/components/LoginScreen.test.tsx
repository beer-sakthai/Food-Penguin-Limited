import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginScreen from './LoginScreen';

describe('LoginScreen', () => {
  it('renders the sign-in button', () => {
    render(<LoginScreen onLogin={() => {}} />);
    const signInButton = screen.getByRole('button', { name: /^Sign In$/i });
    expect(signInButton).toBeInTheDocument();
  });
});
