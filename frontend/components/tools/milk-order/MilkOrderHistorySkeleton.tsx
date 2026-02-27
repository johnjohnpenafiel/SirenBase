/**
 * Milk Order History Skeleton
 *
 * Loading placeholder for the milk order history page.
 * Mirrors: session cards with date badge + status + chevron.
 */
"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface MilkOrderHistorySkeletonProps {
  count?: number;
}

function SkeletonSessionCard() {
  return (
    <div className="p-4 border border-neutral-300/80 rounded-2xl bg-card">
      <div className="flex items-center gap-3">
        {/* Date Badge */}
        <Skeleton className="shrink-0 size-12 rounded-xl" />
        {/* Session Info */}
        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 w-32 mb-1" />
        </div>
        {/* Chevron */}
        <Skeleton className="size-4 rounded shrink-0" />
      </div>
    </div>
  );
}

export function MilkOrderHistorySkeleton({ count = 5 }: MilkOrderHistorySkeletonProps) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonSessionCard key={i} />
      ))}
    </div>
  );
}
