/**
 * RTD&E Pull List Item Component
 *
 * Checkbox list item for the pull list screen.
 * Features:
 * - Large checkbox (44px touch target)
 * - Item name with emoji icon
 * - Quantity needed display
 * - Strikethrough when marked as pulled
 * - Visual feedback for completion state
 */
"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface RTDEPullListItemProps {
  itemName: string;
  icon: string; // Emoji
  quantityNeeded: number;
  isPulled: boolean;
  onToggle: () => void;
  className?: string;
}

export function RTDEPullListItem({
  itemName,
  icon,
  quantityNeeded,
  isPulled,
  onToggle,
  className,
}: RTDEPullListItemProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-4 w-full p-4 md:p-5 bg-card border border-border rounded-xl transition-all duration-200",
        "active:scale-[0.98]",
        isPulled && "bg-muted/50",
        className
      )}
      aria-label={`${
        isPulled ? "Unmark" : "Mark"
      } ${itemName} as pulled (${quantityNeeded} needed)`}
    >
      {/* Custom Checkbox */}
      <div
        className={cn(
          "flex items-center justify-center h-7 w-7 md:h-8 md:w-8 shrink-0 rounded-lg border-2 transition-all duration-200",
          isPulled
            ? "bg-green-600 border-green-600"
            : "border-muted-foreground/30"
        )}
        role="checkbox"
        aria-checked={isPulled}
      >
        {isPulled && <Check className="h-5 w-5 md:h-6 md:w-6 text-white" />}
      </div>

      {/* Item Icon with Background */}
      <div
        className={cn(
          "flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full shrink-0 transition-all duration-200",
          isPulled ? "bg-muted opacity-50" : "bg-muted"
        )}
      >
        <span className="text-2xl md:text-3xl" aria-hidden="true">
          {icon}
        </span>
      </div>

      {/* Item Name */}
      <div className="flex-1 text-left min-w-0">
        <p
          className={cn(
            "font-semibold text-base md:text-lg transition-all duration-200",
            isPulled && "line-through text-muted-foreground"
          )}
        >
          {itemName}
        </p>
      </div>

      {/* Pull Quantity Badge */}
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors duration-200 shrink-0",
          isPulled ? "bg-muted" : "bg-input/20"
        )}
      >
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Pull
        </span>
        <span
          className={cn(
            "text-2xl md:text-3xl font-bold transition-colors duration-200",
            isPulled ? "text-muted-foreground" : "text-chart-1"
          )}
        >
          {quantityNeeded}
        </span>
      </div>
    </button>
  );
}
