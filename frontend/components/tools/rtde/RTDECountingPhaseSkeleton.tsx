/**
 * RTDECountingPhaseSkeleton - Loading Skeleton for Counting Phase
 *
 * Displays a skeleton placeholder that mirrors the counting phase layout
 * while session data is loading. Provides visual structure to improve
 * perceived performance.
 */
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function RTDECountingPhaseSkeleton() {
  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Progress Bar Skeleton */}
      <div className="flex-shrink-0 px-4 md:px-8 pt-2 md:pt-6 pb-2">
        <div className="container max-w-4xl mx-auto">
          <div className="bg-card border border-neutral-300/80 rounded-2xl px-4 md:px-6 py-4 md:py-5">
            {/* Title row skeleton */}
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            {/* Progress content skeleton */}
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Count Card Skeleton */}
      <div className="flex-1 min-h-0 flex flex-col px-4 md:px-8 pb-2">
        <div className="container max-w-lg mx-auto flex-1 min-h-0 flex flex-col">
          <div className="flex-1 flex flex-col bg-card border border-neutral-300/80 rounded-2xl overflow-hidden">
            {/* Image placeholder */}
            <div className="flex-1 min-h-0 flex items-center justify-center p-4">
              <Skeleton className="w-32 h-32 rounded-xl" />
            </div>
            {/* Item name section */}
            <div className="px-4 py-3 text-center">
              <Skeleton className="h-3 w-16 mx-auto mb-2" />
              <Skeleton className="h-7 w-48 mx-auto" />
            </div>
            {/* Par badge */}
            <div className="flex justify-center pb-3">
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            {/* Counter controls */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-center gap-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <Skeleton className="h-16 w-24 rounded-xl" />
                <Skeleton className="h-14 w-14 rounded-full" />
              </div>
              <Skeleton className="h-3 w-20 mx-auto mt-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Skeleton */}
      <div className="border-t border-neutral-300/80 bg-card pb-safe flex-shrink-0">
        <div className="container max-w-4xl mx-auto px-4 pt-3 pb-6 md:py-6">
          {/* Mobile nav */}
          <div className="md:hidden flex justify-center gap-3">
            <Skeleton className="flex-1 h-12 rounded-md" />
            <Skeleton className="flex-1 h-12 rounded-md" />
          </div>
          {/* Desktop nav */}
          <div className="hidden md:flex justify-end">
            <Skeleton className="h-11 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </main>
  );
}
