/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the application.
 * Uses JWT tokens stored in localStorage for session management.
 */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import type { User, LoginRequest } from '@/types';
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// ============================================================================
// Context Creation
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * Fetch current user from backend using stored JWT token
   */
  const fetchUser = useCallback(async () => {
    try {
      const userData = await apiClient.getMe();
      setUser(userData);
    } catch (error) {
      // If token is invalid or expired, clear it
      apiClient.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    // Only fetch user if we have a token
    const hasToken = typeof window !== 'undefined' && localStorage.getItem('sirenbase_auth_token');

    if (hasToken) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  /**
   * Login with partner number and PIN
   */
  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        const response = await apiClient.login(credentials);

        // Store JWT token (backend returns "token" not "access_token")
        apiClient.setToken(response.token);

        // Set user data
        setUser(response.user);

        // Show success message
        toast.success(`Welcome back, ${response.user.name}!`);

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error: any) {
        // Handle errors
        const errorMessage =
          error.response?.data?.error || 'Invalid partner number or PIN';
        toast.error(errorMessage);
        throw error;
      }
    },
    [router]
  );

  /**
   * Logout and clear session
   */
  const logout = useCallback(() => {
    // Clear token
    apiClient.clearToken();

    // Clear user state
    setUser(null);

    // Show message
    toast.success('Logged out successfully');

    // Redirect to login
    router.push('/login');
  }, [router]);

  /**
   * Refresh user data (useful after profile updates)
   */
  const refreshUser = useCallback(async () => {
    try {
      const userData = await apiClient.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: user !== null,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// Hook for consuming auth context
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
