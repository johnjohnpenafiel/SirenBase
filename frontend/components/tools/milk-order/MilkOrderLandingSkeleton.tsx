/**
 * Milk Order Landing Skeleton
 *
 * Loading placeholder for the milk order landing page.
 * Mirrors: status card + session progress stepper.
 */
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function MilkOrderLandingSkeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {/* Status Card Skeleton */}
      <div className="p-4 border border-neutral-300/80 rounded-2xl bg-card">
        {/* Top row: badge + icon */}
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-5 w-10 rounded-full" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
        {/* Title */}
        <Skeleton className="h-6 w-28 mb-1" />
        {/* Status + description */}
        <div className="mt-1 mb-4">
          <Skeleton className="h-3.5 w-20 mb-1" />
          <Skeleton className="h-3 w-48" />
        </div>
        {/* Action button */}
        <Skeleton className="h-11 w-full rounded-md" />
      </div>

      {/* Session Progress Skeleton */}
      <div className="p-4 border border-neutral-300/80 rounded-2xl bg-card">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
        {/* Stepper: 4 steps */}
        <div className="flex flex-col gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex flex-col items-center">
                <Skeleton className="size-6 rounded-full" />
                {i < 3 && <div className="w-0.5 flex-1 min-h-3 bg-neutral-200" />}
              </div>
              <div className="flex-1 pb-2">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
