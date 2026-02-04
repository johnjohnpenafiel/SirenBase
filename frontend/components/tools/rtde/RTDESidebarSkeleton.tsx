/**
 * RTDESidebarSkeleton - Loading Skeleton for Desktop Sidebar
 *
 * Displays a skeleton placeholder for the desktop sidebar while
 * session data is loading. Hidden on mobile.
 */
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function RTDESidebarSkeleton() {
  return (
    <div className="hidden md:flex flex-col w-72 border-r border-neutral-300/80 bg-card">
      <div className="p-4 border-b border-neutral-300/80">
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="flex-1 overflow-hidden p-2 space-y-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
      <div className="p-4 border-t border-neutral-300/80">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}
