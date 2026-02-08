/**
 * Milk Count Step Skeleton
 *
 * Loading placeholder for FOH, BOH, Morning, and On Order pages.
 * Mirrors: optional instructions card + dairy/non-dairy sections with count rows.
 */
"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface MilkCountStepSkeletonProps {
  showInstructions?: boolean;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-4 bg-card border border-neutral-300/80 rounded-2xl">
      {/* Icon */}
      <Skeleton className="shrink-0 size-14 rounded-xl" />
      {/* Name + category pill */}
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-24 mb-1.5" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      {/* Counter area */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Skeleton className="w-16 h-11 rounded-xl" />
        <div className="flex flex-col gap-1">
          <Skeleton className="size-11 rounded-xl" />
          <Skeleton className="size-11 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function MilkCountStepSkeleton({ showInstructions = false }: MilkCountStepSkeletonProps) {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {/* Instructions card */}
      {showInstructions && (
        <div className="bg-card border border-neutral-300/80 rounded-2xl p-3 pl-4">
          <Skeleton className="h-4 w-32 mb-2" />
          <div className="space-y-1.5 pl-4">
            <Skeleton className="h-3 w-full max-w-[280px]" />
            <Skeleton className="h-3 w-full max-w-[240px]" />
          </div>
        </div>
      )}

      {/* Dairy Section */}
      <section>
        <Skeleton className="h-3.5 w-16 mb-2 rounded" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonRow key={`dairy-${i}`} />
          ))}
        </div>
      </section>

      {/* Non-Dairy Section */}
      <section className="mt-2">
        <Skeleton className="h-3.5 w-24 mb-2 rounded" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonRow key={`nondairy-${i}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
