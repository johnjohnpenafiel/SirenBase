/**
 * Admin Items Skeleton
 *
 * Loading placeholder for the RTDE items management page.
 * Mirrors: item cards with drag handle + emoji circle + name/brand + par badge + ellipsis.
 */
"use client";

import { Skeleton } from "@/components/ui/skeleton";

function SkeletonItemCard() {
  return (
    <div className="flex items-center gap-3 p-4 bg-card border border-neutral-300/80 rounded-2xl">
      {/* Drag handle */}
      <Skeleton className="size-5 rounded shrink-0" />
      {/* Emoji circle */}
      <Skeleton className="size-8 rounded shrink-0" />
      {/* Name + brand + par */}
      <div className="flex-1 min-w-0">
        <Skeleton className="h-3 w-16 mb-1" />
        <Skeleton className="h-4 w-32 mb-1.5" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      {/* Ellipsis button */}
      <Skeleton className="size-9 rounded-md ml-4 shrink-0" />
    </div>
  );
}

export function AdminItemsSkeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonItemCard key={i} />
      ))}
    </div>
  );
}
