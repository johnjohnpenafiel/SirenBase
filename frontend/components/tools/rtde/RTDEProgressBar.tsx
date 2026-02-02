/**
 * RTDEProgressBar - Counting Phase Progress Indicator
 *
 * Displays current item progress with:
 * - Item counter (e.g., "Item 3 of 10")
 * - Percentage complete
 * - Animated progress bar
 *
 * Supports two sizes:
 * - default: Full-size with title, used on normal viewports
 * - compact: Minimal version for short viewports (< 670px height)
 */
"use client";

import { cn } from "@/lib/utils";

interface RTDEProgressBarProps {
  currentIndex: number;
  totalItems: number;
  progressPercent: number;
  size?: "default" | "compact";
}

export function RTDEProgressBar({
  currentIndex,
  totalItems,
  progressPercent,
  size = "default",
}: RTDEProgressBarProps) {
  const isCompact = size === "compact";

  return (
    <div
      className={cn(
        "bg-background border-2 border-neutral-300/80",
        isCompact ? "rounded-xl px-3 py-2" : "rounded-2xl px-4 md:px-6 py-3 md:py-5"
      )}
    >
      {/* Title - only in default size */}
      {!isCompact && (
        <h2 className="text-base font-semibold text-popover-foreground mb-3 md:mb-4">
          Counting Phase
        </h2>
      )}

      {/* Progress content */}
      <div className={cn(isCompact ? "space-y-1.5" : "space-y-2 md:space-y-3")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "font-medium text-foreground",
                isCompact ? "text-xs" : "text-sm"
              )}
            >
              Item {currentIndex + 1}
            </span>
            <span className={cn("text-muted-foreground", isCompact ? "text-xs" : "text-sm")}>
              of {totalItems}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "font-bold text-emerald-500",
                isCompact ? "text-xs" : "text-sm"
              )}
            >
              {progressPercent}%
            </span>
            {!isCompact && (
              <span className="text-sm text-muted-foreground">complete</span>
            )}
          </div>
        </div>

        <div
          className={cn(
            "w-full bg-gray-200/60 rounded-full overflow-hidden border border-neutral-300",
            isCompact ? "h-1.5" : "h-2.5"
          )}
        >
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  );
}
