/**
 * RTD&E Session Page - Single-Page Workflow
 *
 * Unified component managing both counting and pulling phases.
 * Features:
 * - Phase-based rendering (counting → pulling)
 * - Desktop sidebar with all items
 * - Mobile bottom drawer
 * - Validation before pull phase
 * - Auto-save with debouncing
 * - Progress tracking
 */
'use client';

import { use, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/shared/Header';
import { RTDECountCard } from '@/components/tools/rtde/RTDECountCard';
import { RTDESessionSidebar } from '@/components/tools/rtde/RTDESessionSidebar';
import { RTDEMobileDrawer } from '@/components/tools/rtde/RTDEMobileDrawer';
import { UncountedItemsDialog } from '@/components/tools/rtde/UncountedItemsDialog';
import { RTDEPullListItem } from '@/components/tools/rtde/RTDEPullListItem';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2, Package } from 'lucide-react';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import type { RTDESessionWithPhase, RTDEItem, RTDESessionPhase } from '@/components/tools/rtde/types';
import type { RTDESessionItem as APISessionItem, GetRTDESessionResponse } from '@/types';
import {
  validateAllItemsCounted,
  assignZeroToUncounted,
  calculateNeedQuantity,
  calculateProgress,
  getCountedItemsCount,
  getPulledCountFromPullList,
  generatePullList,
} from '@/components/tools/rtde/utils';

interface SessionPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default function RTDESessionPage({ params }: SessionPageProps) {
  const router = useRouter();
  const { sessionId } = use(params);

  // State
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<RTDESessionPhase>('counting');
  const [sessionData, setSessionData] = useState<RTDESessionWithPhase | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [uncountedItems, setUncountedItems] = useState<RTDEItem[]>([]);
  const [completing, setCompleting] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  // Debounce timer ref
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load session data on mount
  useEffect(() => {
    loadSession();
  }, [sessionId]);

  // Arrow key navigation (counting phase only)
  useEffect(() => {
    if (phase !== 'counting' || !sessionData) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      } else if (
        e.key === 'ArrowRight' &&
        currentIndex < sessionData.items.length - 1
      ) {
        setCurrentIndex((prev) => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, sessionData, currentIndex]);

  /**
   * Load session from API and transform to internal format
   * Backend uses `counted_quantity: number` (defaults to 0)
   * Frontend uses `counted_quantity: number | null` (null = uncounted)
   */
  const loadSession = async () => {
    try {
      setLoading(true);
      const response: GetRTDESessionResponse = await apiClient.getRTDESession(
        sessionId
      );

      // Transform API items to internal RTDEItem format
      const items: RTDEItem[] = response.items.map((apiItem: APISessionItem) => ({
        itemId: apiItem.item_id,
        name: apiItem.name,
        icon: apiItem.icon,
        parLevel: apiItem.par_level,
        displayOrder: apiItem.display_order,
        // Backend defaults to 0, treat 0 as "uncounted" initially
        countedQuantity: apiItem.counted_quantity === 0 ? null : apiItem.counted_quantity,
        needQuantity: calculateNeedQuantity(
          apiItem.par_level,
          apiItem.counted_quantity === 0 ? null : apiItem.counted_quantity
        ),
        isPulled: apiItem.is_pulled,
      }));

      setSessionData({
        sessionId: response.session.id,
        startedAt: response.session.started_at,
        expiresAt: response.session.expires_at,
        status: response.session.status,
        items,
        phase: 'counting',
        currentItemIndex: 0,
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

  /**
   * Save count with debouncing (500ms delay)
   * Converts null to 0 before sending to API
   */
  const saveCount = useCallback(
    async (itemId: string, count: number | null) => {
      // Clear existing timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      // Set new timer
      saveTimerRef.current = setTimeout(async () => {
        try {
          setSaving(true);
          // Convert null to 0 for API
          const countToSave = count ?? 0;
          await apiClient.updateRTDECount(sessionId, {
            item_id: itemId,
            counted_quantity: countToSave,
          });
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

  /**
   * Handle count change - optimistic update + debounced save
   */
  const handleCountChange = (newCount: number) => {
    if (!sessionData) return;

    const currentItem = sessionData.items[currentIndex];

    // Update local state immediately (optimistic)
    const updatedItems = sessionData.items.map((item) =>
      item.itemId === currentItem.itemId
        ? {
            ...item,
            countedQuantity: newCount,
            needQuantity: calculateNeedQuantity(item.parLevel, newCount),
          }
        : item
    );

    setSessionData({
      ...sessionData,
      items: updatedItems,
    });

    // Save to backend with debounce
    saveCount(currentItem.itemId, newCount);
  };

  /**
   * Jump to specific item (from sidebar/drawer)
   */
  const jumpToItem = (index: number) => {
    if (phase === 'counting') {
      setCurrentIndex(index);
    }
  };

  /**
   * Navigate to previous item
   */
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  /**
   * Navigate to next item
   */
  const handleNext = () => {
    if (sessionData && currentIndex < sessionData.items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  /**
   * Handle "Start Pull" button click
   * Validates all items counted before proceeding
   */
  const handleStartPull = () => {
    if (!sessionData) return;

    const validation = validateAllItemsCounted(sessionData.items);

    if (validation.allCounted) {
      // All items counted - proceed to pull phase
      transitionToPullPhase();
    } else {
      // Show validation dialog with uncounted items
      setUncountedItems(validation.uncountedItems);
      setShowValidationDialog(true);
    }
  };

  /**
   * Handle "Assign 0 & Continue" from validation dialog
   */
  const handleAssignZeroAndContinue = () => {
    if (!sessionData) return;

    // Assign 0 to all uncounted items
    const updatedItems = assignZeroToUncounted(sessionData.items);

    setSessionData({
      ...sessionData,
      items: updatedItems,
    });

    // Save all newly assigned zeros to backend
    uncountedItems.forEach((item) => {
      saveCount(item.itemId, 0);
    });

    setShowValidationDialog(false);
    setUncountedItems([]);
    transitionToPullPhase();
  };

  /**
   * Handle "Go Back" from validation dialog
   */
  const handleGoBack = () => {
    setShowValidationDialog(false);
    setUncountedItems([]);
    // Optionally: Jump to first uncounted item
    if (uncountedItems.length > 0) {
      const firstUncountedIndex = sessionData?.items.findIndex(
        (item) => item.itemId === uncountedItems[0].itemId
      );
      if (firstUncountedIndex !== undefined && firstUncountedIndex >= 0) {
        setCurrentIndex(firstUncountedIndex);
      }
    }
  };

  /**
   * Transition to pulling phase
   */
  const transitionToPullPhase = () => {
    setPhase('pulling');
    toast.success('Ready to pull items!');
  };

  /**
   * Toggle item pulled status
   */
  const handleTogglePulled = async (itemId: string, currentlyPulled: boolean) => {
    if (!sessionData) return;

    try {
      // Optimistic update
      const updatedItems = sessionData.items.map((item) =>
        item.itemId === itemId ? { ...item, isPulled: !currentlyPulled } : item
      );

      setSessionData({
        ...sessionData,
        items: updatedItems,
      });

      // Save to backend
      await apiClient.markRTDEItemPulled(sessionId, {
        item_id: itemId,
        is_pulled: !currentlyPulled,
      });
    } catch (error: any) {
      // Revert on error
      const revertedItems = sessionData.items.map((item) =>
        item.itemId === itemId ? { ...item, isPulled: currentlyPulled } : item
      );

      setSessionData({
        ...sessionData,
        items: revertedItems,
      });
      toast.error('Failed to update item');
    }
  };

  /**
   * Complete session
   */
  const handleCompleteSession = async () => {
    try {
      setCompleting(true);
      await apiClient.completeRTDESession(sessionId);
      toast.success('Session completed successfully!');
      router.push('/tools/rtde');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to complete session';
      toast.error(errorMessage);
    } finally {
      setCompleting(false);
      setShowCompleteDialog(false);
    }
  };

  // Loading state
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
        </div>
      </ProtectedRoute>
    );
  }

  // No session loaded
  if (!sessionData) {
    return null;
  }

  const currentItem = sessionData.items[currentIndex];
  const countedCount = getCountedItemsCount(sessionData.items);
  const progressPercent = calculateProgress(
    countedCount,
    sessionData.items.length
  );
  const isLastItem = currentIndex === sessionData.items.length - 1;

  // Pull phase calculations
  const pullList = generatePullList(sessionData.items);
  const pulledCount = getPulledCountFromPullList(pullList);
  const pullProgress = calculateProgress(pulledCount, pullList.length);
  const allPulled = pulledCount === pullList.length && pullList.length > 0;

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen">
        <Header />

        {/* Layout with Sidebar (Desktop) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Sidebar */}
          <RTDESessionSidebar
            items={sessionData.items}
            currentIndex={currentIndex}
            phase={phase}
            onItemClick={jumpToItem}
            onStartPull={handleStartPull}
          />

          {/* Main Content - Counting Phase */}
          {phase === 'counting' && (
            <main className="flex-1 flex flex-col overflow-hidden">
            {/* Page Title & Progress */}
            <div>
              <div className="container max-w-4xl mx-auto px-4 md:px-8 py-4 md:py-6">
                <h1 className="text-2xl md:text-3xl font-bold mb-4">
                  RTDE Display Count
                </h1>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Item {currentIndex + 1} of {sessionData.items.length}
                    </span>
                    <span className="font-medium">
                      {progressPercent}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                      role="progressbar"
                      aria-valuenow={progressPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Count Card - Scrollable Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="container max-w-4xl mx-auto px-4 md:px-8 py-6">
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="w-full max-w-md">
                    <RTDECountCard
                      itemName={currentItem.name}
                      icon={currentItem.icon}
                      parLevel={currentItem.parLevel}
                      currentCount={currentItem.countedQuantity ?? 0}
                      onCountChange={handleCountChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons - Fixed */}
            <div className="border-t bg-background">
              <div className="container max-w-4xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  {currentIndex > 0 && (
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      className="flex-1 sm:flex-initial"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  )}

                  {saving && (
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      Saving...
                    </span>
                  )}

                  {isLastItem ? (
                    <Button
                      onClick={handleStartPull}
                      className="flex-1 sm:flex-initial ml-auto"
                    >
                      Start Pull
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleNext}
                      className="flex-1 sm:flex-initial ml-auto"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            </main>
          )}

          {/* Main Content - Pulling Phase */}
          {phase === 'pulling' && (
            <main className="flex-1 flex flex-col overflow-hidden">
              {/* Page Title & Progress */}
              <div>
                <div className="container max-w-4xl mx-auto px-4 md:px-8 py-4 md:py-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold">Pull Items</h1>
                      <p className="text-muted-foreground mt-1">
                        Items needed to reach par levels
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowCompleteDialog(true)}
                      disabled={completing}
                      size="sm"
                      className="hidden sm:flex"
                    >
                      {completing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Complete
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {pulledCount} of {pullList.length} items pulled
                      </span>
                      <span className="font-medium">{pullProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pullProgress}%` }}
                        role="progressbar"
                        aria-valuenow={pullProgress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pull List - Scrollable Area */}
              <div className="flex-1 overflow-y-auto">
                <div className="container max-w-4xl mx-auto px-4 md:px-8 py-6">
                  {pullList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Package className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold">All items at par!</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        No items need to be pulled from BOH.
                      </p>
                      <Button onClick={() => setShowCompleteDialog(true)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Complete Session
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pullList.map((item) => (
                        <RTDEPullListItem
                          key={item.itemId}
                          itemName={item.name}
                          icon={item.icon}
                          quantityNeeded={item.needQuantity}
                          isPulled={item.isPulled}
                          onToggle={() => handleTogglePulled(item.itemId, item.isPulled)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Complete Session Button (Mobile) */}
                  {pullList.length > 0 && (
                    <div className="mt-6 sm:hidden">
                      <Button
                        onClick={() => setShowCompleteDialog(true)}
                        disabled={completing}
                        className="w-full"
                      >
                        {completing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Completing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Complete Session
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </main>
          )}
        </div>

        {/* Mobile Bottom Drawer */}
        <RTDEMobileDrawer
          items={sessionData.items}
          currentIndex={currentIndex}
          phase={phase}
          onItemClick={jumpToItem}
          onStartPull={handleStartPull}
        />

        {/* Validation Dialog - Uncounted Items */}
        <UncountedItemsDialog
          open={showValidationDialog}
          uncountedItems={uncountedItems}
          onAssignZero={handleAssignZeroAndContinue}
          onGoBack={handleGoBack}
        />

        {/* Complete Session Confirmation Dialog */}
        <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Complete Session?</AlertDialogTitle>
              <AlertDialogDescription>
                {allPulled
                  ? 'All items have been pulled. Completing this session will mark it as finished and it will be removed.'
                  : pullList.length > 0
                  ? `You still have ${pullList.length - pulledCount} items not marked as pulled. Are you sure you want to complete this session?`
                  : 'Completing this session will mark it as finished and it will be removed.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleCompleteSession} disabled={completing}>
                {completing ? 'Completing...' : 'Complete Session'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}
