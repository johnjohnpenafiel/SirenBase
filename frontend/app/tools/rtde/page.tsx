/**
 * RTD&E Tool - Session Router
 *
 * Thin router that handles session initialization:
 * - Checks for active session
 * - If exists → redirects to session page with resume prompt
 * - If none → creates new session and redirects
 *
 * No landing page UI - just a loading spinner during redirect.
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/shared/Header';
import { RTDECountingPhaseSkeleton } from '@/components/tools/rtde/RTDECountingPhaseSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

export default function RTDEToolPage() {
  const router = useRouter();

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      // Check for active session
      const response = await apiClient.getRTDEActiveSession();

      if (response.session) {
        // Existing session - redirect with resume prompt
        router.replace(`/tools/rtde/session/${response.session.id}?resume=prompt`);
      } else {
        // No session - create new and redirect
        const newSession = await apiClient.startRTDESession({});
        router.replace(`/tools/rtde/session/${newSession.session_id}`);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to start RTD&E session';
      toast.error(errorMessage);
      router.push('/dashboard');
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-dvh">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop sidebar skeleton */}
          <div className="hidden md:flex flex-col w-72 border-r border-neutral-300/80 bg-card">
            <div className="p-4 border-b border-neutral-300/80">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex-1 overflow-hidden p-2 space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
            <div className="p-4 border-t border-neutral-300/80">
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
          <RTDECountingPhaseSkeleton />
        </div>
      </div>
    </ProtectedRoute>
  );
}
