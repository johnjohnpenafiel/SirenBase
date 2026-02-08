/**
 * Milk Count Summary Skeleton
 *
 * Loading placeholder for the milk count summary page.
 * Mobile: section headers + summary cards (icon + name + order badge + expand).
 * Desktop: table header row + 6 table rows.
 */
"use client";

import { Skeleton } from "@/components/ui/skeleton";

function SkeletonSummaryCard() {
  return (
    <div className="bg-card border border-neutral-300/80 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        {/* Icon */}
        <Skeleton className="shrink-0 size-10 rounded-xl" />
        {/* Name + category */}
        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 w-28 mb-1.5" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        {/* Order badge */}
        <div className="shrink-0 flex flex-col items-center">
          <Skeleton className="h-2.5 w-8 mb-1" />
          <Skeleton className="h-8 w-12 rounded-full" />
        </div>
      </div>
      {/* Expand trigger */}
      <div className="flex justify-center items-center py-1.5 bg-neutral-100 border-t border-neutral-200">
        <Skeleton className="size-4 rounded" />
      </div>
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <tr className="border-b">
      <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
      <td className="py-3 px-4"><Skeleton className="h-4 w-8 mx-auto" /></td>
      <td className="py-3 px-4"><Skeleton className="h-4 w-8 mx-auto" /></td>
      <td className="py-3 px-4"><Skeleton className="h-4 w-8 mx-auto" /></td>
      <td className="py-3 px-4"><Skeleton className="h-4 w-8 mx-auto" /></td>
      <td className="py-3 px-4"><Skeleton className="h-4 w-8 mx-auto" /></td>
      <td className="py-3 px-4"><Skeleton className="h-4 w-8 mx-auto" /></td>
      <td className="py-3 px-4"><Skeleton className="h-4 w-8 mx-auto" /></td>
    </tr>
  );
}

export function MilkCountSummarySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {/* Dairy section */}
        <section>
          <Skeleton className="h-3.5 w-20 mb-3 rounded" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonSummaryCard key={`dairy-${i}`} />
            ))}
          </div>
        </section>
        {/* Non-Dairy section */}
        <section>
          <Skeleton className="h-3.5 w-28 mb-3 rounded" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonSummaryCard key={`nondairy-${i}`} />
            ))}
          </div>
        </section>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="bg-card rounded-2xl border border-neutral-300/80 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {["Milk Type", "FOH", "BOH", "Delivered", "On Order", "Total", "Par", "Order"].map((header) => (
                  <th key={header} className="py-3 px-4">
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonTableRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
