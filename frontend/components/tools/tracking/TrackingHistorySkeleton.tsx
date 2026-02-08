/**
 * Tracking History Skeleton
 *
 * Loading placeholder for the inventory history page.
 * Mirrors: history entry cards with code badge + action + name + metadata.
 */
"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface TrackingHistorySkeletonProps {
  count?: number;
}

function SkeletonHistoryCard() {
  return (
    <div className="p-5 bg-card border border-neutral-300/80 rounded-2xl">
      {/* Top row: code pill + action badge */}
      <div className="flex justify-between items-start mb-3">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-6 w-8 rounded-full" />
      </div>
      {/* Item name */}
      <Skeleton className="h-6 w-44 mb-1" />
      {/* Partner + timestamp */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function TrackingHistorySkeleton({ count = 5 }: TrackingHistorySkeletonProps) {
  return (
    <div className="space-y-1.5 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonHistoryCard key={i} />
      ))}
    </div>
  );
}
