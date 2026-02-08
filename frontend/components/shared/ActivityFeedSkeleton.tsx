/**
 * Activity Feed Skeleton Component
 *
 * Loading state placeholder for the activity feed.
 * Matches the compact row structure inside a single card.
 */
"use client";

interface ActivityFeedSkeletonProps {
  count?: number;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white rounded-lg animate-pulse">
      <div className="size-4 bg-neutral-200 rounded shrink-0" />
      <div className="flex-1 h-3.5 bg-neutral-200 rounded" />
      <div className="size-6 bg-neutral-200 rounded-full shrink-0" />
      <div className="w-6 h-3 bg-neutral-100 rounded shrink-0" />
    </div>
  );
}

export function ActivityFeedSkeleton({ count = 4 }: ActivityFeedSkeletonProps) {
  return (
    <div className="border border-neutral-300/80 rounded-2xl bg-neutral-100 p-1.5 flex flex-col gap-1">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonRow key={index} />
      ))}
    </div>
  );
}
