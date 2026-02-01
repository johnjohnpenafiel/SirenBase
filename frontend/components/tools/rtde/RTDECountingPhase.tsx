/**
 * RTDECountingPhase - Counting Phase UI Component
 *
 * Displays the counting interface with:
 * - Progress tracking
 * - Single-item focus with RTDECountCard
 * - Previous/Next navigation
 * - "Start Pull" button on last item
 *
 * This is a presentational component - all logic handled by parent (session page).
 */
"use client";

import { RTDECountCard } from "./RTDECountCard";
import { RTDEProgressBar } from "./RTDEProgressBar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { RTDEItem } from "./types";

interface RTDECountingPhaseProps {
  // Current state
  currentItem: RTDEItem;
  currentIndex: number;
  totalItems: number;
  progressPercent: number;
  isLastItem: boolean;
  saving: boolean;

  // Event handlers
  onCountChange: (newCount: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onStartPull: () => void;
  onOpenDrawer?: () => void; // Mobile only
}

export function RTDECountingPhase({
  currentItem,
  currentIndex,
  totalItems,
  progressPercent,
  isLastItem,
  saving,
  onCountChange,
  onPrevious,
  onNext,
  onStartPull,
  onOpenDrawer,
}: RTDECountingPhaseProps) {
  const showPreviousButton = currentIndex > 0;

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-muted/30">
      {/* Progress Section - Full (hidden on very short viewports) */}
      <div className="px-4 md:px-8 pt-3 md:pt-6 pb-2 [@media(max-height:670px)]:hidden">
        <div className="container max-w-4xl mx-auto">
          <RTDEProgressBar
            currentIndex={currentIndex}
            totalItems={totalItems}
            progressPercent={progressPercent}
          />
        </div>
      </div>

      {/* Progress Section - Compact (only on very short viewports) */}
      <div className="hidden [@media(max-height:670px)]:block px-4 pt-2 pb-1">
        <div className="container max-w-4xl mx-auto">
          <RTDEProgressBar
            currentIndex={currentIndex}
            totalItems={totalItems}
            progressPercent={progressPercent}
            size="compact"
          />
        </div>
      </div>

      {/* Count Card - Centered Content (min-h-0 allows flex shrinking) */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-1 md:py-4">
        <div className="container max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-center">
            <div className="w-full max-w-lg">
              <RTDECountCard
                itemName={currentItem.name}
                brand={currentItem.brand}
                imageFilename={currentItem.imageFilename}
                icon={currentItem.icon}
                parLevel={currentItem.parLevel}
                currentCount={currentItem.countedQuantity ?? 0}
                onCountChange={onCountChange}
                onNext={onNext}
                saving={saving}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Above Bottom Bar (flex-shrink-0 ensures it never gets cut off) */}
      <div className="md:hidden flex justify-center gap-3 px-4 py-3 flex-shrink-0">
        {showPreviousButton && (
          <Button
            variant="outline"
            size="lg"
            onClick={onPrevious}
            className="flex-1 h-12 border border-zinc-300/30 bg-zinc-200/70 text-zinc-700 hover:bg-zinc-300/70"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Previous
          </Button>
        )}

        {isLastItem ? (
          <Button size="lg" onClick={onStartPull} className="flex-1 h-12">
            Start Pull
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="lg"
            onClick={onNext}
            className="flex-1 h-12 border border-zinc-300/30 bg-zinc-200/70 text-zinc-700 hover:bg-zinc-300/70"
          >
            Next
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        )}
      </div>

      {/* Navigation Buttons - Fixed (flex-shrink-0 ensures it never gets cut off) */}
      <div className="border-t border-gray-200 bg-background pb-safe flex-shrink-0">
        <div className="container max-w-4xl mx-auto px-4 pt-3 pb-6 md:py-6">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between gap-3">
            {showPreviousButton && (
              <Button
                variant="outline"
                size="lg"
                onClick={onPrevious}
                className="flex-1 sm:flex-initial h-11 border border-zinc-300/30 bg-zinc-200/70 text-zinc-700 hover:bg-zinc-300/70"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Previous
              </Button>
            )}

            {isLastItem ? (
              <Button
                size="lg"
                onClick={onStartPull}
                className="flex-1 sm:flex-initial ml-auto h-11"
              >
                Start Pull
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={onNext}
                className="flex-1 sm:flex-initial ml-auto h-11 border border-zinc-300/30 bg-zinc-200/70 text-zinc-700 hover:bg-zinc-300/70"
              >
                Next
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            )}
          </div>

          {/* Mobile - Items List Button */}
          {onOpenDrawer && (
            <div className="md:hidden flex justify-center">
              <Button
                size="lg"
                onClick={onOpenDrawer}
                className="h-12 w-full max-w-md"
              >
                Items list
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
