/**
 * Activity Feed Skeleton Component
 *
 * Loading state placeholder for activity feed.
 * Matches the ActivityCard structure for smooth transitions.
 */
"use client";

import { cn } from "@/lib/utils";

interface ActivityFeedSkeletonProps {
  count?: number;
}

function SkeletonCard() {
  return (
    <div className="p-3.5 border border-neutral-300/60 rounded-xl bg-card animate-pulse">
      {/* Top row: Badge and icon placeholders */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="h-5 w-14 bg-neutral-200 rounded-full" />
        <div className="h-4 w-4 bg-neutral-200 rounded" />
      </div>

      {/* Description placeholder */}
      <div className="h-4 w-3/4 bg-neutral-200 rounded mt-1" />

      {/* Metadata row placeholder */}
      <div className="h-3 w-1/2 bg-neutral-100 rounded mt-2" />
    </div>
  );
}

export function ActivityFeedSkeleton({ count = 4 }: ActivityFeedSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
