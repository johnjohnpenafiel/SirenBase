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
        "bg-card border border-neutral-300/80",
        isCompact ? "rounded-xl px-3 py-2" : "rounded-2xl px-4 md:px-6 py-4 md:py-5"
      )}
    >
      {/* Title row: RTD&E + phase badge */}
      {!isCompact && (
        <div className="flex items-center gap-2 mb-2 md:mb-3">
          <h2 className="text-xl md:text-3xl font-normal tracking-tight text-black">
            RTD&E
          </h2>
          <span className="text-xs font-medium tracking-wide capitalize bg-neutral-200/50 border border-neutral-300 text-neutral-800 px-2.5 py-1 rounded-full">
            Count
          </span>
        </div>
      )}

      {/* Progress content */}
      <div className={cn(isCompact ? "space-y-1.5" : "space-y-2 md:space-y-3")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "font-medium text-foreground",
                isCompact ? "text-[10px]" : "text-xs"
              )}
            >
              Item {currentIndex + 1}
            </span>
            <span className={cn("text-muted-foreground", isCompact ? "text-[10px]" : "text-xs")}>
              of {totalItems}
            </span>
          </div>
          <span
            className={cn(
              "font-medium text-foreground tabular-nums",
              isCompact ? "text-[10px]" : "text-xs"
            )}
          >
            {progressPercent}%
          </span>
        </div>

        <div
          className={cn(
            "w-full bg-neutral-200/60 rounded-full overflow-hidden border border-neutral-300",
            isCompact ? "h-1.5" : "h-2.5"
          )}
        >
          <div
            className="bg-emerald-400 h-full rounded-full transition-all duration-500 ease-out"
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
