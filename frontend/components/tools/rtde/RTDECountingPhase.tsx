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
      {/* Progress Section - Floating Card */}
      <div className="px-4 md:px-8 pt-4 md:pt-6 pb-2">
        <div className="container max-w-4xl mx-auto">
          <div className="bg-background border border-border rounded-2xl px-4 md:px-6 py-4 md:py-5">
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    Item {currentIndex + 1}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    of {totalItems}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">
                    {progressPercent}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    complete
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
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
      </div>

      {/* Count Card - Scrollable Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="flex items-center justify-center">
            <div className="w-full max-w-lg">
              <RTDECountCard
                itemName={currentItem.name}
                icon={currentItem.icon}
                parLevel={currentItem.parLevel}
                currentCount={currentItem.countedQuantity ?? 0}
                onCountChange={onCountChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons - Fixed */}
      <div className="border-t bg-background pb-safe">
        <div className="container max-w-4xl mx-auto px-4 py-4 md:py-6">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between gap-3">
            {showPreviousButton && (
              <Button
                variant="outline"
                size="lg"
                onClick={onPrevious}
                className="flex-1 sm:flex-initial h-11"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Previous
              </Button>
            )}

            {saving && (
              <span className="text-xs text-muted-foreground">Saving...</span>
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
                className="flex-1 sm:flex-initial ml-auto h-11"
              >
                Next
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden space-y-3">
            {/* Previous/Next Buttons */}
            <div className="flex items-center justify-between gap-3">
              {showPreviousButton && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onPrevious}
                  className="flex-1 h-12"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Previous
                </Button>
              )}

              {isLastItem ? (
                <Button
                  size="lg"
                  onClick={onStartPull}
                  className="flex-1 h-12"
                >
                  Start Pull
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onNext}
                  className="flex-1 h-12"
                >
                  Next
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              )}
            </div>

            {/* Saving Indicator */}
            {saving && (
              <p className="text-xs text-center text-muted-foreground">
                Saving...
              </p>
            )}

            {/* Open Drawer Button (Mobile Only) */}
            {onOpenDrawer && (
              <Button
                variant="outline"
                size="lg"
                onClick={onOpenDrawer}
                className="w-full h-12 rounded-2xl border"
              >
                Items list
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
