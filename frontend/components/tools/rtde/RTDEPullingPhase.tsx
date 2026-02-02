/**
 * RTDEPullingPhase - Pull List Phase UI Component
 *
 * Displays the pull list interface with:
 * - Progress tracking for pulled items
 * - Checkable list of items needing restocking
 * - Empty state when all items at par
 * - Complete session button
 *
 * This is a presentational component - all logic handled by parent (session page).
 */
"use client";

import { useState } from "react";
import { RTDEPullListItem } from "./RTDEPullListItem";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { RTDEPullItem } from "./types";

interface RTDEPullingPhaseProps {
  // Current state
  pullList: RTDEPullItem[];
  pulledCount: number;
  pullProgress: number;
  allPulled: boolean;
  completing: boolean;

  // Event handlers
  onTogglePulled: (itemId: string, currentPulledState: boolean) => void;
  onComplete: () => void;
}

export function RTDEPullingPhase({
  pullList,
  pulledCount,
  pullProgress,
  allPulled,
  completing,
  onTogglePulled,
  onComplete,
}: RTDEPullingPhaseProps) {
  const hasItemsToPull = pullList.length > 0;
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 16);
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Scrollable Area - Contains Island + Pull List */}
      <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        {/* Sticky Frosted Island - Progress Card */}
        <div className="sticky top-0 z-10 px-4 md:px-8 pt-2 pb-4 md:pt-3 md:pb-6">
          <div
            className={cn(
              "max-w-4xl mx-auto rounded-2xl",
              "bg-white/70 backdrop-blur-md",
                            "px-5 py-4 md:px-6 md:py-5",
              "transition-all duration-300 ease-out",
              isScrolled && "shadow-[0_4px_8px_-4px_rgba(0,0,0,0.08)]"
            )}
          >
            {/* Header with Complete Button (Desktop) */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-popover-foreground">
                Pulling Phase
              </h2>
              <Button
                onClick={onComplete}
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
            {hasItemsToPull && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {pulledCount} of {pullList.length}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      items pulled
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-emerald-500">
                      {pullProgress}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      complete
                    </span>
                  </div>
                </div>
                <div className="w-full bg-neutral-200/60 rounded-full h-2.5 overflow-hidden border border-neutral-300">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${pullProgress}%` }}
                    role="progressbar"
                    aria-valuenow={pullProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content - Scrolls under the island */}
        <div className="container max-w-4xl mx-auto px-4 md:px-8 pb-6 md:pb-8">
          {!hasItemsToPull ? (
            // Empty State - All items at par
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-green-100 dark:bg-green-950 mb-6">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">All items at par!</h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-md">
                No items need to be pulled from BOH. All display items are fully
                stocked.
              </p>
              <Button
                onClick={onComplete}
                size="lg"
                className="h-12 px-8"
                disabled={completing}
              >
                {completing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Complete Session
                  </>
                )}
              </Button>
            </div>
          ) : (
            // Pull List Items
            <div className="space-y-2">
              {pullList.map((item) => (
                <RTDEPullListItem
                  key={item.itemId}
                  itemName={item.name}
                  brand={item.brand}
                  imageFilename={item.imageFilename}
                  icon={item.icon}
                  quantityNeeded={item.needQuantity}
                  isPulled={item.isPulled}
                  onToggle={() => onTogglePulled(item.itemId, item.isPulled)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Complete Session Button - Mobile Footer (always visible at bottom) */}
      {hasItemsToPull && (
        <div className="sm:hidden bg-background border-t border-neutral-300 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div className="container max-w-4xl mx-auto px-4 pt-4 pb-6">
            <Button
              onClick={onComplete}
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
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Complete Session
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
