/**
 * RTD&E Pull List Item Component
 *
 * Seamless tappable card for the pull list screen.
 * Features:
 * - Product image with emoji/placeholder fallback
 * - Premium typography with proper tracking
 * - Quantity badge with gradient background
 * - Smooth strikethrough animation when marked as pulled
 * - Hover and press feedback with scale and shadow
 * - Visual feedback for completion state
 * - Tap anywhere on card to toggle pulled state
 */
"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { RTDEItemImage } from "./RTDEItemImage";

interface RTDEPullListItemProps {
  itemName: string;
  brand?: string | null; // Brand name displayed above item name
  imageFilename?: string | null; // Product image filename
  icon?: string | null; // Emoji fallback
  quantityNeeded: number;
  isPulled: boolean;
  onToggle: () => void;
  className?: string;
}

export function RTDEPullListItem({
  itemName,
  brand,
  imageFilename,
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
        "flex items-center gap-4 w-full text-left",
        "p-5 bg-card rounded-2xl",
        "border-2 border-neutral-300/80",
        "transition-all duration-300 ease-out",
        "active:scale-[0.99]",
        isPulled && "bg-muted/50",
        className
      )}
      aria-label={`${
        isPulled ? "Unmark" : "Mark"
      } ${itemName} as pulled (${quantityNeeded} needed)`}
      aria-pressed={isPulled}
    >
      {/* Product Image / Emoji / Placeholder */}
      <RTDEItemImage
        imageFilename={imageFilename}
        icon={icon}
        size="md"
        grayscale={isPulled}
        showBackground={false}
        alt={`${brand ? `${brand} ` : ""}${itemName}`}
        className={cn(
          "shrink-0 !w-14 !h-14",
          "transition-all duration-300",
          isPulled && "opacity-40"
        )}
      />

      {/* Brand & Item Name */}
      <div className="flex-1 min-w-0">
        {brand && (
          <p
            className={cn(
              "text-xs text-muted-foreground mb-0.5",
              "transition-opacity duration-300",
              isPulled && "opacity-60"
            )}
          >
            {brand}
          </p>
        )}
        <p
          className={cn(
            "text-base font-normal text-gray-800 truncate",
            "transition-all duration-300",
            isPulled && "text-muted-foreground opacity-60"
          )}
        >
          {itemName}
        </p>
      </div>

      {/* Pull Quantity Badge / Checkmark */}
      <div
        className={cn(
          "flex flex-col items-center justify-center",
          "w-14 h-14 shrink-0",
          "rounded-full",
          "transition-all duration-300",
          isPulled ? "bg-emerald-500" : "bg-muted"
        )}
      >
        {isPulled ? (
          <Check className="h-6 w-6 text-white" strokeWidth={3} />
        ) : (
          <>
            <span className="text-[8px] font-medium uppercase tracking-wide text-muted-foreground">
              Pull
            </span>
            <span className="text-xl font-bold tabular-nums leading-tight text-foreground">
              {quantityNeeded}
            </span>
          </>
        )}
      </div>
    </button>
  );
}
