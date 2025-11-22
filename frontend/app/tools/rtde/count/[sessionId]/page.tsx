/**
 * RTD&E Counting Interface
 *
 * Main counting page - shows one item at a time for counting.
 * Features:
 * - RTDECountCard for current item
 * - Arrow key navigation (desktop)
 * - Swipe navigation (mobile - future)
 * - Progress indicator
 * - Auto-save counts
 */
'use client';

import { use, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { RTDECountCard } from '@/components/tools/rtde/RTDECountCard';
import { RTDENavBar } from '@/components/tools/rtde/RTDENavBar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import type { RTDESessionWithItems } from '@/types';

interface CountPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default function RTDECountPage({ params }: CountPageProps) {
  const router = useRouter();
  // Fix [BUG-006]: Unwrap params Promise with React.use()
  const { sessionId } = use(params);

  const [loading, setLoading] = useState(true);
  // Fix [BUG-007]: Store full session data including items array
  const [session, setSession] = useState<RTDESessionWithItems | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  // Debounce timer ref
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load session data
  useEffect(() => {
    loadSession();
  }, [sessionId]);

  // Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!session) return;

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < session.items.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session, currentIndex]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getRTDESession(sessionId);
      // Fix [BUG-007]: Combine session metadata with items array
      setSession({
        ...response.session,
        items: response.items,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to load session';
      toast.error(errorMessage);
      router.push('/tools/rtde');
    } finally {
      setLoading(false);
    }
  };

  // Save count with debouncing (500ms delay)
  const saveCount = useCallback(
    async (itemId: string, count: number) => {
      // Clear existing timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      // Set new timer
      saveTimerRef.current = setTimeout(async () => {
        try {
          setSaving(true);
          await apiClient.updateRTDECount(sessionId, {
            item_id: itemId,
            counted_quantity: count, // Match API contract field name
          });
          // Optionally reload session to get updated data
          await loadSession();
        } catch (error: any) {
          console.error('Failed to save count:', error);
          toast.error('Failed to save count');
        } finally {
          setSaving(false);
        }
      }, 500);
    },
    [sessionId]
  );

  // Handle count change
  const handleCountChange = (newCount: number) => {
    if (!session) return;

    const currentItem = session.items[currentIndex];

    // Update local state immediately (optimistic update)
    setSession({
      ...session,
      items: session.items.map((item) =>
        item.item_id === currentItem.item_id
          ? { ...item, counted_quantity: newCount }
          : item
      ),
    });

    // Save to backend with debounce
    saveCount(currentItem.item_id, newCount);
  };

  // Navigation
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (session && currentIndex < session.items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col h-screen">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading session...</p>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (!session) {
    return null;
  }

  const currentItem = session.items[currentIndex];
  const progress = Math.round(((currentIndex + 1) / session.items.length) * 100);

  return (
    <ProtectedRoute>
      <div className="flex flex-col md:flex-row h-screen">
        {/* Navigation Sidebar (Desktop) / Bottom Bar (Mobile) */}
        <RTDENavBar sessionId={sessionId} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 flex flex-col overflow-auto">
            {/* Progress Bar */}
            <div className="bg-muted/30 border-b">
              <div className="container max-w-4xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    Item {currentIndex + 1} of {session.items.length}
                  </span>
                  <span className="font-medium">{progress}% Complete</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            </div>

            {/* Count Card */}
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="w-full max-w-md">
                <RTDECountCard
                  itemName={currentItem.name}
                  icon={currentItem.icon}
                  parLevel={currentItem.par_level}
                  currentCount={currentItem.counted_quantity}
                  onCountChange={handleCountChange}
                />
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="border-t bg-background">
              <div className="container max-w-4xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="flex-1 sm:flex-initial"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  {saving && (
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      Saving...
                    </span>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentIndex === session.items.length - 1}
                    className="flex-1 sm:flex-initial"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}
