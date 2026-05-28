import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import AuthModal from '../src/app/components/AuthModal';

vi.mock('../src/app/context/AuthContext', () => ({
  useAuth: () => ({ login: async () => {}, logout: async () => {}, user: null, ready: true })
}));

vi.mock('../src/app/components/NotificationProvider', () => ({
  useNotification: () => ({ notify: () => {} })
}));

describe('AuthModal', () => {
  it('renders custom context text', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} context="view the result" />);
    expect(screen.getByText('Log in to view the result')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Sign up'));
    expect(screen.getByText('Sign up to view the result')).toBeInTheDocument();
  });
});
