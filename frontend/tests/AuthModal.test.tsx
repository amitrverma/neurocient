import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import AuthModal from '../src/app/components/AuthModal';

vi.mock('../src/app/context/AuthContext', () => ({
  useAuth: () => ({ login: async () => {}, logout: async () => {}, user: null, ready: true })
}));

vi.mock('../src/app/components/NotificationProvider', () => ({
  useNotification: () => ({ notify: () => {} })
}));

afterEach(cleanup);

describe('AuthModal', () => {
  it('renders custom context text', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} context="view the result" />);
    expect(screen.getByText('Log in to view the result')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    expect(screen.getByText('Sign up to view the result')).toBeInTheDocument();
  });

  it('exposes recovery and mirrors the signup password policy', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );

    fireEvent.click(screen.getByText('Sign up'));
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('minlength', '12');
    expect(
      screen.getByText(/long, memorable passphrase works well/i),
    ).toBeInTheDocument();
  });
});
