/**
 * Admin Pars Skeleton
 *
 * Loading placeholder for the milk pars management page.
 * Mirrors: two sections (Dairy/Non-Dairy) with par level rows.
 */
"use client";

import { Skeleton } from "@/components/ui/skeleton";

function SkeletonParRow() {
  return (
    <div className="flex items-center gap-3 p-4 bg-card border border-neutral-300/80 rounded-2xl">
      {/* Category icon */}
      <Skeleton className="shrink-0 size-8 rounded-lg" />
      {/* Milk name */}
      <Skeleton className="flex-1 h-4 max-w-[160px]" />
      {/* Par value box */}
      <Skeleton className="w-16 h-11 rounded-xl shrink-0" />
    </div>
  );
}

export function AdminParsSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      {/* Dairy Section */}
      <section>
        <Skeleton className="h-3.5 w-16 mb-2 ml-1 rounded" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonParRow key={`dairy-${i}`} />
          ))}
        </div>
      </section>

      {/* Non-Dairy Section */}
      <section>
        <Skeleton className="h-3.5 w-24 mb-2 ml-1 rounded" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonParRow key={`nondairy-${i}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
