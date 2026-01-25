/**
 * RTD&E Session Page - Single-Page Workflow with Phase-Based Rendering
 *
 * Session orchestrator managing state, data loading, and API calls.
 * Delegates UI rendering to phase-specific components:
 * - RTDECountingPhase: Displays counting interface
 * - RTDEPullingPhase: Displays pull list interface
 *
 * Features:
 * - Phase state management (counting → pulling)
 * - Desktop sidebar + mobile drawer navigation
 * - Validation before pull phase transition
 * - Auto-save with debouncing (500ms)
 * - Optimistic UI updates
 */
"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { RTDECountingPhase } from "@/components/tools/rtde/RTDECountingPhase";
import { RTDEPullingPhase } from "@/components/tools/rtde/RTDEPullingPhase";
import { RTDESessionSidebar } from "@/components/tools/rtde/RTDESessionSidebar";
import { RTDEMobileDrawer } from "@/components/tools/rtde/RTDEMobileDrawer";
import { UncountedItemsDialog } from "@/components/tools/rtde/UncountedItemsDialog";
import { ResumeSessionDialog } from "@/components/tools/rtde/ResumeSessionDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckmarkAnimation } from "@/components/ui/checkmark-animation";
import { Loader2, AlertTriangle } from "lucide-react";
import apiClient from "@/lib/api";
import { toast } from "sonner";
import type {
  RTDESessionWithPhase,
  RTDEItem,
  RTDESessionPhase,
} from "@/components/tools/rtde/types";
import type {
  RTDESessionItem as APISessionItem,
  GetRTDESessionResponse,
} from "@/types";
import {
  validateAllItemsCounted,
  calculateNeedQuantity,
  calculateProgress,
  getCountedItemsCount,
  getPulledCountFromPullList,
  generatePullList,
} from "@/components/tools/rtde/utils";

interface SessionPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default function RTDESessionPage({ params }: SessionPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sessionId } = use(params);

  // State management
  const [loading, setLoading] = useState(true);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [phase, setPhase] = useState<RTDESessionPhase>("counting");
  const [sessionData, setSessionData] = useState<RTDESessionWithPhase | null>(
    null
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [uncountedItems, setUncountedItems] = useState<RTDEItem[]>([]);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Debounce timer ref for auto-save
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Track when saving indicator started (for minimum display time)
  const savingStartTimeRef = useRef<number | null>(null);
  // Minimum time to show "Saving..." indicator (allows fade animation to complete)
  const MIN_SAVING_DISPLAY_MS = 800;

  // Load session data on mount
  useEffect(() => {
    loadSession();
  }, [sessionId]);

  // Check for resume prompt in URL (show dialog after session loads)
  useEffect(() => {
    if (searchParams.get("resume") === "prompt" && sessionData && !loading) {
      setShowResumeDialog(true);
      // Clean up URL without triggering navigation
      window.history.replaceState({}, "", `/tools/rtde/session/${sessionId}`);
    }
  }, [searchParams, sessionData, loading, sessionId]);

  // Arrow key navigation (counting phase only)
  useEffect(() => {
    if (phase !== "counting" || !sessionData) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      } else if (
        e.key === "ArrowRight" &&
        currentIndex < sessionData.items.length - 1
      ) {
        setCurrentIndex((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, sessionData, currentIndex]);

  /**
   * Load session from API and transform to internal format
   * NOTE: Backend defaults counted_quantity to 0, frontend treats 0 as "uncounted" (null)
   */
  const loadSession = async () => {
    try {
      setLoading(true);
      const response: GetRTDESessionResponse = await apiClient.getRTDESession(
        sessionId
      );

      // Transform API items to internal RTDEItem format
      const items: RTDEItem[] = response.items.map(
        (apiItem: APISessionItem) => ({
          itemId: apiItem.item_id,
          name: apiItem.name,
          brand: apiItem.brand,
          imageFilename: apiItem.image_filename,
          icon: apiItem.icon,
          parLevel: apiItem.par_level,
          displayOrder: apiItem.display_order,
          countedQuantity:
            apiItem.counted_quantity === 0 ? null : apiItem.counted_quantity,
          needQuantity: calculateNeedQuantity(
            apiItem.par_level,
            apiItem.counted_quantity === 0 ? null : apiItem.counted_quantity
          ),
          isPulled: apiItem.is_pulled,
        })
      );

      setSessionData({
        sessionId: response.session.id,
        startedAt: response.session.started_at,
        expiresAt: response.session.expires_at,
        status: response.session.status,
        items,
        phase: "counting",
        currentItemIndex: 0,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to load session";
      toast.error(errorMessage);
      router.push("/tools/rtde");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save count with debouncing (500ms delay)
   * Shows "Saving..." immediately, keeps visible through debounce + API call
   * Uses minimum display time to prevent brief flashes during rapid clicks
   */
  const saveCount = useCallback(
    async (itemId: string, count: number | null) => {
      // Clear any pending save timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      // Show "Saving..." immediately when user starts interaction
      setSaving(true);
      if (!savingStartTimeRef.current) {
        savingStartTimeRef.current = Date.now();
      }

      // Debounce the actual API call (500ms)
      saveTimerRef.current = setTimeout(async () => {
        try {
          await apiClient.updateRTDECount(sessionId, {
            item_id: itemId,
            counted_quantity: count ?? 0,
          });
        } catch (error: any) {
          console.error("Failed to save count:", error);
          toast.error("Failed to save count");
        } finally {
          // Ensure minimum display time for smooth fade animation
          const elapsed =
            Date.now() - (savingStartTimeRef.current || Date.now());
          const remaining = Math.max(0, MIN_SAVING_DISPLAY_MS - elapsed);

          setTimeout(() => {
            setSaving(false);
            savingStartTimeRef.current = null;
          }, remaining);
        }
      }, 500);
    },
    [sessionId]
  );

  /**
   * Handle count change - optimistic UI update + debounced save
   */
  const handleCountChange = (newCount: number) => {
    if (!sessionData) return;

    const currentItem = sessionData.items[currentIndex];

    // Update local state immediately (optimistic update)
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
   * Navigation handlers
   */
  const jumpToItem = (index: number) => {
    if (phase === "counting") {
      setCurrentIndex(index);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (sessionData && currentIndex < sessionData.items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  /**
   * Phase Transition: Counting → Pulling
   *
   * Validates counting status before phase transition.
   *
   * Architectural Pattern:
   * - Phase-based rendering: Same route, different UI based on `phase` state
   * - Validation check: Notifies user of uncounted items before pull list generation
   * - No backend API call: Phase state is frontend-only (stateless transition)
   *
   * Flow:
   * 1. User clicks "Start Pull" button (last item in counting phase)
   * 2. Check if all items have countedQuantity !== null
   * 3a. If all counted → setPhase("pulling") → RTDEPullingPhase renders
   * 3b. If some uncounted → Show UncountedItemsDialog with 2 options:
   *     - "Go Back & Count" → handleGoBack() → Jump to first uncounted item
   *     - "Continue" → handleContinueWithExclusions() → Exclude uncounted from pull list
   *
   * Design Decision:
   * - Uncounted items are excluded from pull list (not assigned 0)
   * - Allows users to count only items they need to restock
   */
  const handleStartPull = () => {
    if (!sessionData) return;

    const validation = validateAllItemsCounted(sessionData.items);

    if (validation.allCounted) {
      // All items counted - proceed to pull phase
      setPhase("pulling");
    } else {
      // Show validation dialog with uncounted items
      setUncountedItems(validation.uncountedItems);
      setShowValidationDialog(true);
    }
  };

  /**
   * Validation Dialog: "Continue" (Exclude Uncounted Items)
   *
   * User chose to proceed to pull phase with uncounted items excluded.
   *
   * Business Logic:
   * - Uncounted items remain null (not modified)
   * - Pull list excludes uncounted items via generatePullList() filter
   * - User only sees items they explicitly counted that need restocking
   *
   * Use Case:
   * - User only needs to restock a subset of items (e.g., 5 of 20 items)
   * - Count only those items, proceed to pull phase
   * - Uncounted items don't clutter the pull list
   *
   * Alternative Flow:
   * - If user clicked "Go Back & Count", they'd jump to first uncounted item
   */
  const handleContinueWithExclusions = () => {
    setShowValidationDialog(false);
    setUncountedItems([]);
    setPhase("pulling");
  };

  /**
   * Handle "Go Back & Count" from validation dialog
   * Returns to first uncounted item in counting phase
   */
  const handleGoBack = () => {
    setShowValidationDialog(false);
    if (uncountedItems.length > 0) {
      const firstUncountedIndex = sessionData?.items.findIndex(
        (item) => item.itemId === uncountedItems[0].itemId
      );
      if (firstUncountedIndex !== undefined && firstUncountedIndex >= 0) {
        setCurrentIndex(firstUncountedIndex);
      }
    }
    setUncountedItems([]);
  };

  /**
   * Toggle Item Pulled Status (Pulling Phase)
   *
   * Marks items as pulled/unpulled in pull list via checkbox interaction.
   *
   * Optimistic Update Pattern:
   * 1. Update local state immediately (instant UI feedback)
   * 2. Save to backend asynchronously
   * 3. If backend fails → Revert local state + Show error toast
   *
   * Why Optimistic Updates:
   * - Mobile users expect instant feedback (no loading spinners)
   * - Network latency shouldn't block UI interactions
   * - Rare failure case handled gracefully with rollback
   *
   * State Management:
   * - Updates full sessionData.items array (not just pull list)
   * - Pull list is derived from items via generatePullList()
   * - Progress recalculated automatically from updated state
   *
   * Backend Persistence:
   * - POST /api/rtde/sessions/:sessionId/mark-pulled
   * - Stores isPulled flag in rtde_session_items table
   */
  const handleTogglePulled = async (
    itemId: string,
    currentlyPulled: boolean
  ) => {
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
      toast.error("Failed to update item");
    }
  };

  /**
   * Complete Session - Calculator-Style Deletion
   *
   * Permanently deletes session and all associated data (no history preservation).
   *
   * Design Philosophy - "Calculator Style":
   * - Like a calculator, session data is temporary working memory
   * - Once complete, data is cleared (not archived)
   * - Rationale: RTDE is a daily workflow tool, not historical reporting system
   * - Staff complete session → Start fresh next time
   *
   * Deletion Scope:
   * - Session record (rtde_sessions table)
   * - All session items (rtde_session_items table - CASCADE delete)
   * - No undo available after completion
   *
   * Confirmation Flow:
   * - AlertDialog shown before execution (setShowCompleteDialog)
   * - Warning if not all items pulled (optional safety check)
   * - User must explicitly click "Complete" to confirm
   *
   * Post-Completion:
   * - Navigate to /tools/rtde (landing page)
   * - User can start new session from scratch
   */
  const handleCompleteSession = async () => {
    try {
      setCompleting(true);
      await apiClient.completeRTDESession(sessionId);
      // Show success animation before redirecting
      setCompleting(false);
      setCompleted(true);
      // Wait for animation to play, then redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to complete session";
      toast.error(errorMessage);
      setCompleting(false);
      setShowCompleteDialog(false);
    }
  };

  /**
   * Handle "Start Fresh" from Resume Dialog
   * Abandons current session, creates new one, and redirects
   */
  const handleStartFresh = async () => {
    try {
      // Backend auto-abandons old session when starting new
      const newSession = await apiClient.startRTDESession({});
      router.replace(`/tools/rtde/session/${newSession.session_id}`);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to start new session";
      toast.error(errorMessage);
    }
  };

  // Loading state
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col h-dvh">
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

  // No session loaded (shouldn't happen but safeguard)
  if (!sessionData) {
    return null;
  }

  // Calculate values for rendering
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
      <div className="flex flex-col h-dvh">
        <Header />

        {/* Layout with Sidebar (Desktop) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Sidebar - Always visible on desktop */}
          <RTDESessionSidebar
            items={sessionData.items}
            currentIndex={currentIndex}
            phase={phase}
            onItemClick={jumpToItem}
            onStartPull={handleStartPull}
          />

          {/* Main Content - Phase-Based Rendering */}
          {phase === "counting" ? (
            <RTDECountingPhase
              currentItem={currentItem}
              currentIndex={currentIndex}
              totalItems={sessionData.items.length}
              progressPercent={progressPercent}
              isLastItem={isLastItem}
              saving={saving}
              onCountChange={handleCountChange}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onStartPull={handleStartPull}
              onOpenDrawer={() => setDrawerOpen(true)}
            />
          ) : (
            <RTDEPullingPhase
              pullList={pullList}
              pulledCount={pulledCount}
              pullProgress={pullProgress}
              allPulled={allPulled}
              completing={completing}
              onTogglePulled={handleTogglePulled}
              onComplete={() => setShowCompleteDialog(true)}
            />
          )}
        </div>

        {/* Mobile Drawer - Bottom navigation for mobile */}
        <RTDEMobileDrawer
          items={sessionData.items}
          currentIndex={currentIndex}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          onItemClick={(index) => {
            jumpToItem(index);
            setDrawerOpen(false);
          }}
          onStartPull={handleStartPull}
          phase={phase}
        />

        {/* Validation Dialog - Uncounted items warning */}
        <UncountedItemsDialog
          open={showValidationDialog}
          uncountedItems={uncountedItems}
          onContinue={handleContinueWithExclusions}
          onGoBack={handleGoBack}
        />

        {/* Complete Session Confirmation Dialog */}
        <Dialog
          open={showCompleteDialog}
          onOpenChange={(open) => {
            // Prevent closing during completion or after completed
            if (!completing && !completed) {
              setShowCompleteDialog(open);
            }
          }}
        >
          <DialogContent className="sm:max-w-md p-6" showCloseButton={false}>
            {completed ? (
              // Success state with checkmark animation
              <div className="flex flex-col items-center justify-center py-6">
                <CheckmarkAnimation size={72} />
                <p className="mt-4 text-lg font-medium text-foreground">
                  Session Complete!
                </p>
              </div>
            ) : (
              // Confirmation state
              <>
                <DialogHeader className="bg-gray-100 rounded-xl px-4 pt-3 pb-3">
                  <DialogTitle>Complete Session?</DialogTitle>
                  <DialogDescription>
                    This will complete the RTD&E counting session.
                  </DialogDescription>
                </DialogHeader>

                {/* Warning about unpulled items - only show if applicable */}
                {!allPulled && pullList.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
                    <p className="text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                      <AlertTriangle className="size-4 mt-0.5 flex-shrink-0" />
                      <span>
                        Some items haven&apos;t been marked as pulled yet.
                      </span>
                    </p>
                  </div>
                )}

                <DialogFooter className="flex-col gap-2 sm:flex-col">
                  <Button
                    onClick={handleCompleteSession}
                    disabled={completing}
                    className="w-full"
                  >
                    {completing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      "Complete Session"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCompleteDialog(false)}
                    disabled={completing}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Resume Session Dialog - Shown when navigating from existing session */}
        {sessionData && (
          <ResumeSessionDialog
            open={showResumeDialog}
            onOpenChange={setShowResumeDialog}
            sessionStartedAt={sessionData.startedAt}
            itemsCounted={sessionData.items.filter(
              (i) => i.countedQuantity !== null
            ).length}
            totalItems={sessionData.items.length}
            onStartFresh={handleStartFresh}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
