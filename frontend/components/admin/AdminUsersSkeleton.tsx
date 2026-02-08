/**
 * Admin Users Skeleton
 *
 * Loading placeholder for the user management page.
 * Desktop: table with 4 column headers + 3 skeleton rows.
 * Mobile: 3 user card skeletons.
 */
"use client";

import { Skeleton } from "@/components/ui/skeleton";

function SkeletonUserCard() {
  return (
    <div className="p-4 bg-card border border-neutral-300/80 rounded-2xl">
      <div className="flex justify-between items-center">
        <div className="flex-1 min-w-0">
          {/* Partner number badge */}
          <Skeleton className="h-5 w-20 rounded-full" />
          {/* Name */}
          <Skeleton className="h-5 w-32 mt-2" />
          {/* Role badge */}
          <Skeleton className="h-5 w-14 rounded-full mt-1" />
        </div>
        {/* Ellipsis button */}
        <Skeleton className="size-9 rounded-md ml-4 shrink-0" />
      </div>
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <tr className="border-b border-border">
      <td className="px-5 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
      <td className="px-5 py-3.5"><Skeleton className="h-4 w-28" /></td>
      <td className="px-5 py-3.5"><Skeleton className="h-5 w-14 rounded-full" /></td>
      <td className="px-5 py-3.5"><Skeleton className="h-8 w-16 rounded-md" /></td>
    </tr>
  );
}

export function AdminUsersSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Desktop Table */}
      <div className="hidden md:block bg-card rounded-2xl border border-neutral-300/80 overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-neutral-300/80">
            <tr>
              {["Partner #", "Name", "Role", "Actions"].map((header) => (
                <th key={header} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonTableRow key={i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonUserCard key={i} />
        ))}
      </div>
    </div>
  );
}
