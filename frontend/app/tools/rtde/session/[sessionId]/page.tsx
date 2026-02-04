/**
 * RTD&E Session Page - Single-Page Workflow with Phase-Based Rendering
 *
 * Session orchestrator managing UI rendering and dialog state.
 * Delegates business logic to useRTDESession hook.
 *
 * Features:
 * - Phase-based rendering (counting → pulling)
 * - Desktop sidebar + mobile drawer navigation
 * - Resume session dialog for returning users
 * - Complete session confirmation dialog
 */
"use client";

import { use, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { RTDECountingPhase } from "@/components/tools/rtde/RTDECountingPhase";
import { RTDECountingPhaseSkeleton } from "@/components/tools/rtde/RTDECountingPhaseSkeleton";
import { RTDESidebarSkeleton } from "@/components/tools/rtde/RTDESidebarSkeleton";
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
import { useRTDESession } from "@/hooks/rtde/useRTDESession";
import {
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
  const searchParams = useSearchParams();
  const { sessionId } = use(params);

  // Core session management via hook
  const {
    loading,
    sessionData,
    phase,
    currentIndex,
    saving,
    showValidationDialog,
    uncountedItems,
    setShowValidationDialog,
    jumpToItem,
    handlePrevious,
    handleNext,
    handleCountChange,
    handleStartPull,
    handleContinueWithExclusions,
    handleGoBack,
    handleTogglePulled,
    handleCompleteSession,
    handleStartFresh,
    completing,
    completed,
  } = useRTDESession({ sessionId });

  // UI-only state (dialogs, drawers)
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPullingScrolled, setIsPullingScrolled] = useState(false);

  // Scroll handler for pulling phase
  const handlePullingScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsPullingScrolled(e.currentTarget.scrollTop > 16);
  };

  // Check for resume prompt in URL (show dialog after session loads)
  useEffect(() => {
    if (searchParams.get("resume") === "prompt" && sessionData && !loading) {
      setShowResumeDialog(true);
      // Clean up URL without triggering navigation
      window.history.replaceState({}, "", `/tools/rtde/session/${sessionId}`);
    }
  }, [searchParams, sessionData, loading, sessionId]);

  // Handle complete session with dialog close
  const onCompleteSession = async () => {
    await handleCompleteSession();
    // Dialog closes automatically when completed state changes
  };

  // Loading state - skeleton loader
  if (loading) {
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
      {phase === "counting" ? (
        // Counting phase: Header outside scroll context (no scrolling needed)
        <div className="flex flex-col h-dvh">
          <Header />
          <div className="flex-1 flex overflow-hidden">
            <RTDESessionSidebar
              items={sessionData.items}
              currentIndex={currentIndex}
              phase={phase}
              onItemClick={jumpToItem}
              onStartPull={handleStartPull}
            />
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
        </div>
      ) : (
        // Pulling phase: Header INSIDE scroll context (like inventory)
        // Mobile footer OUTSIDE scroll to stay visible
        <div className="flex flex-col h-dvh">
          <div className="flex flex-1 overflow-hidden">
            <RTDESessionSidebar
              items={sessionData.items}
              currentIndex={currentIndex}
              phase={phase}
              onItemClick={jumpToItem}
              onStartPull={handleStartPull}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Scrollable area - Header + Progress card + Item list */}
              <div className="flex-1 overflow-y-auto" onScroll={handlePullingScroll}>
                <Header />
                <RTDEPullingPhase
                  pullList={pullList}
                  pulledCount={pulledCount}
                  pullProgress={pullProgress}
                  allPulled={allPulled}
                  completing={completing}
                  onTogglePulled={handleTogglePulled}
                  onComplete={() => setShowCompleteDialog(true)}
                  isScrolled={isPullingScrolled}
                />
              </div>

              {/* Mobile footer - OUTSIDE scroll container, always visible */}
              {pullList.length > 0 && (
                <div className="sm:hidden bg-card border-t border-neutral-300/80 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                  <div className="container max-w-4xl mx-auto px-4 pt-4 pb-6">
                    <Button
                      onClick={() => setShowCompleteDialog(true)}
                      disabled={completing}
                      size="lg"
                      className="w-full h-12"
                    >
                      {completing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        "Complete Session"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Drawer - not used in pulling phase but keep for consistency */}
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
        </div>
      )}

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
            // Fixed min-height to match confirmation dialog size for smooth transition
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <CheckmarkAnimation size={72} />
              <p className="mt-4 text-lg font-medium text-foreground">
                Session Complete!
              </p>
            </div>
          ) : (
            // Confirmation state
            <>
              <div className="space-y-2">
                <DialogHeader className="bg-neutral-200 rounded-xl px-4 pt-3 pb-3">
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
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <Button
                  onClick={onCompleteSession}
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
    </ProtectedRoute>
  );
}
