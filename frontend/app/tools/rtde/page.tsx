/**
 * RTD&E Tool - Entry Point
 *
 * Landing page for RTD&E counting tool.
 * - Checks for active session
 * - Shows resume dialog if session exists
 * - Allows starting new session
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { ResumeSessionDialog } from '@/components/tools/rtde/ResumeSessionDialog';
import { ClipboardList, Loader2, PlayCircle } from 'lucide-react';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import type { RTDEActiveSessionSummary } from '@/types';

export default function RTDEToolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [activeSession, setActiveSession] = useState<RTDEActiveSessionSummary | null>(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  // Check for active session on mount
  useEffect(() => {
    checkForActiveSession();
  }, []);

  const checkForActiveSession = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getRTDEActiveSession();
      if (response.session) {
        setActiveSession(response.session);
        setShowResumeDialog(true);
      }
    } catch (error: any) {
      // No active session or error - that's fine
      console.log('No active session found');
    } finally {
      setLoading(false);
    }
  };

  // Start new session
  const handleStartNewSession = async () => {
    try {
      setStarting(true);
      const response = await apiClient.startRTDESession({});
      toast.success('Session started! Let\'s count.');
      router.push(`/tools/rtde/count/${response.session_id}`);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to start session. Please try again.';
      toast.error(errorMessage);
    } finally {
      setStarting(false);
    }
  };

  // Handle starting fresh (abandons current session)
  const handleStartFresh = async () => {
    // Starting a new session will auto-abandon the old one (backend handles this)
    await handleStartNewSession();
  };

  // Calculate progress for resume dialog
  const calculateProgress = () => {
    if (!activeSession) return { counted: 0, total: 0 };

    return {
      counted: activeSession.items_counted,
      total: activeSession.total_items,
    };
  };

  const { counted, total } = calculateProgress();

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center overflow-auto">
          <div className="container max-w-2xl mx-auto px-4 py-12 text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Icon */}
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/10 p-6">
                    <ClipboardList className="h-16 w-16 text-primary" />
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    RTD&E Count
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    Count ready-to-drink and ready-to-eat items, then generate a pull list
                    for restocking.
                  </p>
                </div>

                {/* How It Works */}
                <div className="bg-muted/50 rounded-lg p-6 text-left space-y-3">
                  <h2 className="font-semibold text-lg">How it works:</h2>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="shrink-0 font-bold text-foreground">1.</span>
                      <span>Count each item on the RTD&E display using the counting interface</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="shrink-0 font-bold text-foreground">2.</span>
                      <span>Review the pull list showing quantities needed to reach par</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="shrink-0 font-bold text-foreground">3.</span>
                      <span>Check off items as you pull them from the back of house</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="shrink-0 font-bold text-foreground">4.</span>
                      <span>Complete the session when finished restocking</span>
                    </li>
                  </ol>
                </div>

                {/* Start Button */}
                <Button
                  size="lg"
                  onClick={handleStartNewSession}
                  disabled={starting}
                  className="w-full sm:w-auto px-8"
                >
                  {starting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Start New Session
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Resume Session Dialog */}
      {activeSession && (
        <ResumeSessionDialog
          open={showResumeDialog}
          onOpenChange={setShowResumeDialog}
          sessionId={activeSession.id}
          sessionStartedAt={activeSession.started_at}
          itemsCounted={counted}
          totalItems={total}
          onStartFresh={handleStartFresh}
        />
      )}
    </ProtectedRoute>
  );
}
