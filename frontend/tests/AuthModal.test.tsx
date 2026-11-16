import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import AuthModal from '../src/app/components/AuthModal';

const mocks = vi.hoisted(() => ({
  login: vi.fn(async () => false),
  notify: vi.fn(),
}));

vi.mock('../src/app/context/AuthContext', () => ({
  useAuth: () => ({ login: mocks.login, logout: async () => {}, user: null, ready: true })
}));

vi.mock('../src/app/components/NotificationProvider', () => ({
  useNotification: () => ({ notify: mocks.notify })
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  mocks.login.mockClear();
  mocks.login.mockResolvedValue(false);
  mocks.notify.mockClear();
});

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
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('minlength', '8');
    expect(
      screen.getByText(/use at least 8 characters/i),
    ).toBeInTheDocument();
  });

  it('requires and submits a name when creating an account', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: 'user-1' } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<AuthModal isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByText('Sign up'));

    const name = screen.getByRole('textbox', { name: 'Name' });
    expect(name).toBeRequired();
    expect(name).toHaveAttribute('maxlength', '100');

    fireEvent.change(name, { target: { value: '  Ada   Lovelace  ' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'a memorable passphrase' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/signup',
      expect.objectContaining({
        body: JSON.stringify({
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          password: 'a memorable passphrase',
        }),
      }),
    );
  });

  it('shows authentication failures inside the dialog and preserves entered details', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers(),
      json: async () => ({
        detail: {
          code: 'internal_error',
          correlation_id: '3824d3b2-79a5-42a6-9988-1ea4986b153f',
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<AuthModal isOpen={true} onClose={() => {}} context="continue reading Insights" />);

    const email = screen.getByRole('textbox', { name: 'Email' });
    fireEvent.change(email, { target: { value: 'reader@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'correct horse battery staple' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(
      'Something went wrong. Please try again. Reference: 3824d3b2.',
    );
    expect(email).toHaveValue('reader@example.com');
    expect(screen.getByRole('dialog')).toContainElement(alert);
    expect(mocks.notify).not.toHaveBeenCalled();
  });
});
