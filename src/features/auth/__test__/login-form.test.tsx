import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../components/login-form';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('LoginForm', () => {
  const mockRouterPush = vi.fn();
  const mockRouterRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockRouterPush,
      refresh: mockRouterRefresh,
    } as any);
  });

  it('should render the login form', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in to account/i })).toBeInTheDocument();
  });

  it('should display error message on failed sign in', async () => {
    vi.mocked(signIn).mockResolvedValueOnce({ error: 'Failed' } as any);

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'test' } });
    fireEvent.change(screen.getByLabelText(/^Password$/), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in to account/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith('Authentication failed. Please check credentials.');
    });
  });

  it('should toggle password visibility', () => {
    render(<LoginForm />);
    const passwordInput = screen.getByLabelText(/^Password$/);
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should redirect based on role on successful sign in (ADMIN)', async () => {
    vi.mocked(signIn).mockResolvedValueOnce({ error: null, ok: true } as any);
    vi.mocked(getSession).mockResolvedValueOnce({
      user: { role: ['ADMIN'] },
    } as any);

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/^Password$/), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in to account/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Welcome back!');
      expect(mockRouterPush).toHaveBeenCalledWith('/admin/dashboard');
      expect(mockRouterRefresh).toHaveBeenCalled();
    });
  });

  it('should redirect based on role on successful sign in (MANAGER)', async () => {
    vi.mocked(signIn).mockResolvedValueOnce({ error: null, ok: true } as any);
    vi.mocked(getSession).mockResolvedValueOnce({
      user: { role: 'MANAGER' },
    } as any);

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'manager' } });
    fireEvent.change(screen.getByLabelText(/^Password$/), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in to account/i }));

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/manager/dashboard');
    });
  });
  
  it('should redirect based on role on successful sign in (CASHIER)', async () => {
    vi.mocked(signIn).mockResolvedValueOnce({ error: null, ok: true } as any);
    vi.mocked(getSession).mockResolvedValueOnce({
      user: { role: 'CASHIER' },
    } as any);

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'cashier' } });
    fireEvent.change(screen.getByLabelText(/^Password$/), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in to account/i }));

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/cashier/dashboard');
    });
  });
  
  it('should redirect based on role on successful sign in (default STAFF)', async () => {
    vi.mocked(signIn).mockResolvedValueOnce({ error: null, ok: true } as any);
    vi.mocked(getSession).mockResolvedValueOnce({
      user: { role: 'STAFF' },
    } as any);

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'staff' } });
    fireEvent.change(screen.getByLabelText(/^Password$/), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in to account/i }));

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/cashier/dashboard');
    });
  });

  it('should handle unexpected errors during sign in', async () => {
    vi.mocked(signIn).mockRejectedValueOnce(new Error('Unexpected error'));

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'test' } });
    fireEvent.change(screen.getByLabelText(/^Password$/), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in to account/i }));

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    });
  });
});
