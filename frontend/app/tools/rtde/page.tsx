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
import { RTDESidebarSkeleton } from '@/components/tools/rtde/RTDESidebarSkeleton';
import apiClient from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
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
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to start RTD&E session'));
      router.push('/dashboard');
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-dvh">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <RTDESidebarSkeleton />
          <RTDECountingPhaseSkeleton />
        </div>
      </div>
    </ProtectedRoute>
  );
}
