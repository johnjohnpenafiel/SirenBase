/**
 * Authentication Hook
 *
 * Manages user authentication state and provides auth methods.
 * This is a minimal placeholder implementation for Phase 3A.
 * Full implementation will be added in Phase 3B.
 */
'use client';

import { useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  partnerNumber: string;
  role: 'admin' | 'staff';
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

/**
 * Hook for managing authentication state.
 *
 * Currently returns mock data for testing role-based features.
 * Will be replaced with real JWT-based authentication in Phase 3B.
 */
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with real authentication check
    // For now, return a mock admin user for testing
    const mockUser: User = {
      id: '1',
      name: 'Admin User',
      partnerNumber: 'ADMIN001',
      role: 'admin', // Change to 'staff' to test non-admin view
    };

    setUser(mockUser);
    setLoading(false);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: user !== null,
  };
}
