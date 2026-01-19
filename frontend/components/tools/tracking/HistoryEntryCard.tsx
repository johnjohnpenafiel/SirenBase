/**
 * HistoryEntryCard Component
 *
 * Displays a history entry with action, item details, and metadata.
 * Typography-focused design matching ItemCard's visual language.
 */

import { cn } from "@/lib/utils";
import { Plus, CornerUpRight } from "lucide-react";
import type { HistoryAction } from "@/types";

interface HistoryEntryCardProps {
  action: HistoryAction;
  itemName: string;
  itemCode: string;
  userName: string;
  timestamp: string;
}

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function HistoryEntryCard({
  action,
  itemName,
  itemCode,
  userName,
  timestamp,
}: HistoryEntryCardProps) {
  const isAdd = action === "ADD";

  return (
    <div
      className={cn(
        "p-5 bg-card rounded-2xl",
        "border border-border",
        "transition-colors"
      )}
    >
      {/* Top row: Code pill and action indicator */}
      <div className="flex justify-between items-start mb-3">
        <p className="inline-block text-[10px] font-mono font-bold tracking-wide uppercase text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          {itemCode}
        </p>
        <span className="inline-flex items-center gap-1 text-xs font-medium bg-muted text-foreground px-2.5 py-1 rounded-full">
          {isAdd ? (
            <>
              <Plus className="size-3.5 text-green-400" strokeWidth={2.5} />
              Added
            </>
          ) : (
            <>
              <CornerUpRight className="size-3.5 text-red-400" strokeWidth={2.5} />
              Removed
            </>
          )}
        </span>
      </div>

      {/* Item name - prominent */}
      <h3 className="text-xl font-semibold text-foreground mb-1">
        {itemName}
      </h3>

      {/* Partner and timestamp - muted secondary */}
      <p className="text-sm text-muted-foreground">
        {userName}
        <span className="text-muted-foreground/60 ml-2 text-xs">
          {formatTimestamp(timestamp)}
        </span>
      </p>
    </div>
  );
}
