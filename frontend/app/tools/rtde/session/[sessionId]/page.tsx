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
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { RTDECountingPhase } from "@/components/tools/rtde/RTDECountingPhase";
import { RTDEPullingPhase } from "@/components/tools/rtde/RTDEPullingPhase";
import { RTDESessionSidebar } from "@/components/tools/rtde/RTDESessionSidebar";
import { RTDEMobileDrawer } from "@/components/tools/rtde/RTDEMobileDrawer";
import { UncountedItemsDialog } from "@/components/tools/rtde/UncountedItemsDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
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
  assignZeroToUncounted,
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
  const { sessionId } = use(params);

  // State management
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<RTDESessionPhase>("counting");
  const [sessionData, setSessionData] = useState<RTDESessionWithPhase | null>(
    null
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [uncountedItems, setUncountedItems] = useState<RTDEItem[]>([]);
  const [completing, setCompleting] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Debounce timer ref for auto-save
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load session data on mount
  useEffect(() => {
    loadSession();
  }, [sessionId]);

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
   * Prevents excessive API calls during rapid +/- button clicks
   */
  const saveCount = useCallback(
    async (itemId: string, count: number | null) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(async () => {
        try {
          setSaving(true);
          await apiClient.updateRTDECount(sessionId, {
            item_id: itemId,
            counted_quantity: count ?? 0,
          });
        } catch (error: any) {
          console.error("Failed to save count:", error);
          toast.error("Failed to save count");
        } finally {
          setSaving(false);
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
   * CRITICAL WORKFLOW STEP: Validates all items counted before phase transition.
   *
   * Architectural Pattern:
   * - Phase-based rendering: Same route, different UI based on `phase` state
   * - Validation gatekeeper: Ensures data integrity before pull list generation
   * - No backend API call: Phase state is frontend-only (stateless transition)
   *
   * Flow:
   * 1. User clicks "Start Pull" button (last item in counting phase)
   * 2. Validate all items have countedQuantity !== null
   * 3a. If valid → setPhase("pulling") → RTDEPullingPhase renders
   * 3b. If invalid → Show UncountedItemsDialog with 2 options:
   *     - "Go Back" → handleGoBack() → Jump to first uncounted item
   *     - "Assign 0 & Continue" → handleAssignZeroAndContinue() → Proceed anyway
   *
   * Design Decision:
   * - Validation before transition prevents pull list showing "Need: X" based on null values
   * - Gives user choice: Fix missing counts OR treat them as zero
   */
  const handleStartPull = () => {
    if (!sessionData) return;

    const validation = validateAllItemsCounted(sessionData.items);

    if (validation.allCounted) {
      // All items counted - proceed to pull phase
      setPhase("pulling");
      toast.success("Ready to pull items!");
    } else {
      // Show validation dialog with uncounted items
      setUncountedItems(validation.uncountedItems);
      setShowValidationDialog(true);
    }
  };

  /**
   * Validation Dialog Recovery: "Assign 0 & Continue"
   *
   * User chose to treat uncounted items as "counted zero" and proceed to pull phase.
   *
   * State Updates:
   * 1. Frontend: null → 0 (assignZeroToUncounted utility)
   * 2. Backend: Batch save 0 values via saveCount (debounced)
   * 3. Phase transition: "counting" → "pulling"
   *
   * Business Logic:
   * - Uncounted items now treated as "intentionally zero" (not missing data)
   * - Pull list will calculate needQuantity = parLevel - 0 for these items
   * - Example: Par=10, Counted=null → Assign 0 → Need=10 (pull all 10)
   *
   * Alternative Flow:
   * - If user clicked "Go Back", they'd jump to first uncounted item instead
   */
  const handleAssignZeroAndContinue = () => {
    if (!sessionData) return;

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
    setPhase("pulling");
    toast.success("Ready to pull items!");
  };

  /**
   * Handle "Go Back" from validation dialog
   * Returns to first uncounted item
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
   * - Success toast notification
   * - Navigate to /tools/rtde (landing page)
   * - User can start new session from scratch
   */
  const handleCompleteSession = async () => {
    try {
      setCompleting(true);
      await apiClient.completeRTDESession(sessionId);
      toast.success("Session completed successfully!");
      router.push("/tools/rtde");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to complete session";
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
      <div className="flex flex-col h-screen">
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
          onAssignZero={handleAssignZeroAndContinue}
          onGoBack={handleGoBack}
        />

        {/* Complete Session Confirmation Dialog */}
        <AlertDialog
          open={showCompleteDialog}
          onOpenChange={setShowCompleteDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Complete Session?</AlertDialogTitle>
              <AlertDialogDescription>
                This will complete the RTD&E counting session. All data will be
                permanently deleted (calculator-style).
                {!allPulled &&
                  pullList.length > 0 &&
                  " Some items haven't been marked as pulled yet."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={completing}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCompleteSession}
                disabled={completing}
              >
                {completing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  "Complete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}
