/**
 * Auth Context Tests
 *
 * Tests for authentication context functionality including:
 * - Hook usage validation
 * - Login/logout flows
 * - Token management
 * - User state management
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../auth-context';
import type { User } from '@/types';

// ============================================================================
// Mocks
// ============================================================================

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock API client
const mockLogin = vi.fn();
const mockGetMe = vi.fn();
const mockSetToken = vi.fn();
const mockClearToken = vi.fn();

vi.mock('@/lib/api', () => ({
  default: {
    login: (...args: any[]) => mockLogin(...args),
    getMe: (...args: any[]) => mockGetMe(...args),
    setToken: (...args: any[]) => mockSetToken(...args),
    clearToken: (...args: any[]) => mockClearToken(...args),
  },
}));

// Mock Sonner toast
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: (...args: any[]) => mockToastSuccess(...args),
    error: (...args: any[]) => mockToastError(...args),
  },
}));

// ============================================================================
// Test Helpers
// ============================================================================

const mockUser: User = {
  id: 1,
  partner_number: 'ADMIN001',
  name: 'Admin User',
  role: 'admin',
  is_deleted: false,
};

// Test component that uses the auth hook
function TestComponent() {
  const { user, loading, isAuthenticated, login, logout, refreshUser } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ partner_number: 'ADMIN001', pin: '1234' });
    } catch (error) {
      // Error handled in auth context
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshUser();
    } catch (error) {
      // Error handled in auth context
    }
  };

  return (
    <div>
      <div data-testid="loading">{loading ? 'true' : 'false'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="user">{user ? user.name : 'null'}</div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={handleRefresh}>Refresh</button>
    </div>
  );
}

// ============================================================================
// Tests
// ============================================================================

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Mock localStorage
    const localStorageMock: Record<string, string> = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
      }),
      length: 0,
      key: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Hook validation', () => {
    it('should throw error when useAuth is used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleError.mockRestore();
    });

    it('should not throw error when used inside AuthProvider', () => {
      mockGetMe.mockRejectedValueOnce(new Error('No token'));

      expect(() => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      }).not.toThrow();
    });
  });

  describe('Initial state', () => {
    it('should show unauthenticated state when no token exists', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(null);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    it('should fetch user when token exists in localStorage', async () => {
      localStorage.getItem = vi.fn().mockReturnValue('fake-jwt-token');
      mockGetMe.mockResolvedValueOnce(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for user to be fetched
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('Admin User');
      });

      expect(mockGetMe).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    it('should clear invalid token on fetchUser failure', async () => {
      localStorage.getItem = vi.fn().mockReturnValue('invalid-token');
      mockGetMe.mockRejectedValueOnce(new Error('Unauthorized'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(mockClearToken).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  describe('Login', () => {
    it('should successfully log in user and redirect to dashboard', async () => {
      mockLogin.mockResolvedValueOnce({
        token: 'new-jwt-token',
        user: mockUser,
      });

      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial loading
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Click login button
      const loginButton = screen.getByText('Login');
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          partner_number: 'ADMIN001',
          pin: '1234',
        });
      });

      expect(mockSetToken).toHaveBeenCalledWith('new-jwt-token');
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('Admin User');
    });

    it('should show error toast on login failure', async () => {
      const mockError = {
        response: {
          data: {
            error: 'Invalid credentials',
          },
        },
      };

      mockLogin.mockRejectedValueOnce(mockError);

      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial loading
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Click login button
      const loginButton = screen.getByText('Login');
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Invalid credentials');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should show default error message when no error message in response', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Network error'));

      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial loading
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Click login button
      const loginButton = screen.getByText('Login');
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Invalid partner number or PIN');
      });
    });
  });

  describe('Logout', () => {
    it('should successfully log out user and redirect to login', async () => {
      localStorage.getItem = vi.fn().mockReturnValue('fake-jwt-token');
      mockGetMe.mockResolvedValueOnce(mockUser);

      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for user to be fetched
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });

      // Click logout button
      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);

      await waitFor(() => {
        expect(mockClearToken).toHaveBeenCalled();
      });

      expect(mockToastSuccess).toHaveBeenCalledWith('Logged out successfully');
      expect(mockPush).toHaveBeenCalledWith('/login');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  describe('RefreshUser', () => {
    it('should successfully refresh user data', async () => {
      localStorage.getItem = vi.fn().mockReturnValue('fake-jwt-token');
      mockGetMe.mockResolvedValueOnce(mockUser);

      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial user fetch
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });

      // Mock updated user data
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockGetMe.mockResolvedValueOnce(updatedUser);

      // Click refresh button
      const refreshButton = screen.getByText('Refresh');
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('Updated Name');
      });

      expect(mockGetMe).toHaveBeenCalledTimes(2);
    });

    it('should handle refresh failure gracefully', async () => {
      localStorage.getItem = vi.fn().mockReturnValue('fake-jwt-token');
      mockGetMe.mockResolvedValueOnce(mockUser);

      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial user fetch
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      });

      // Mock refresh failure
      mockGetMe.mockRejectedValueOnce(new Error('Failed to refresh'));

      // Click refresh button
      const refreshButton = screen.getByText('Refresh');
      await user.click(refreshButton);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Failed to refresh user:', expect.any(Error));
      });

      // User should still be authenticated with old data
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('Admin User');

      consoleError.mockRestore();
    });
  });
});
