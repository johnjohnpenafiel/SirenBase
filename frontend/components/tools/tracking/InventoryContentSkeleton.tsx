/**
 * Inventory Content Skeleton
 *
 * Loading placeholder for the inventory page content area.
 * Mirrors: item cards with code badge + name + category + action button.
 */
"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface InventoryContentSkeletonProps {
  count?: number;
}

function SkeletonItemCard() {
  return (
    <div className="p-5 bg-card border border-neutral-300/80 rounded-2xl">
      <div className="flex justify-between items-center">
        <div className="flex-1 min-w-0">
          {/* Category pill */}
          <Skeleton className="h-5 w-20 rounded-full mb-3" />
          {/* Item name */}
          <Skeleton className="h-6 w-40 mb-1" />
          {/* Code badge + date */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        {/* Ellipsis button */}
        <Skeleton className="size-9 rounded-md ml-4 shrink-0" />
      </div>
    </div>
  );
}

export function InventoryContentSkeleton({ count = 6 }: InventoryContentSkeletonProps) {
  return (
    <div className="space-y-1.5 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItemCard key={i} />
      ))}
    </div>
  );
}
