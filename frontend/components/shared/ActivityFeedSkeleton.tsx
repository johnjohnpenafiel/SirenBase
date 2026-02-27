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
    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-black/5 rounded-lg animate-pulse">
      <div className="size-4 bg-black/10 rounded shrink-0" />
      <div className="flex-1 h-3.5 bg-black/10 rounded" />
      <div className="size-6 bg-black/10 rounded-full shrink-0" />
      <div className="w-6 h-3 bg-black/5 rounded shrink-0" />
    </div>
  );
}

export function ActivityFeedSkeleton({ count = 4 }: ActivityFeedSkeletonProps) {
  return (
    <div className="border border-[#b5a899] rounded-2xl bg-[#c4b8ab] p-1.5 flex flex-col gap-1">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonRow key={index} />
      ))}
    </div>
  );
}
