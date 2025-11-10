/**
 * Protected Route Component
 *
 * Wraps pages/components that require authentication.
 * Redirects to login if user is not authenticated.
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean; // Optional: require admin role
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for loading to finish
    if (loading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Redirect to dashboard if admin required but user is not admin
    if (requireAdmin && user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, loading, isAuthenticated, requireAdmin, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if admin required but user is not admin (will redirect)
  if (requireAdmin && user?.role !== 'admin') {
    return null;
  }

  // Render children if authenticated (and admin if required)
  return <>{children}</>;
}
