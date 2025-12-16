/**
 * RTD&E Pull List Item Component
 *
 * Apple-inspired checkbox list item for the pull list screen.
 * Features:
 * - Product image with emoji/placeholder fallback
 * - Refined checkbox (36-40px) with smooth animation
 * - Premium typography with proper tracking
 * - Quantity badge with gradient background
 * - Smooth strikethrough animation when marked as pulled
 * - Hover and press feedback with scale and shadow
 * - Visual feedback for completion state
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
        "group flex items-center gap-3 md:gap-4 w-full",
        "p-3 md:p-6",
        "bg-gradient-to-br from-card to-card/95",
        "border border-border/40",
        "rounded-xl md:rounded-2xl",
        "shadow-sm",
        "transition-all duration-300 ease-out",
        "hover:shadow-md hover:scale-[1.01]",
        "active:scale-[0.99]",
        isPulled && "bg-gradient-to-br from-muted/60 to-muted/40 shadow-none",
        className
      )}
      aria-label={`${
        isPulled ? "Unmark" : "Mark"
      } ${itemName} as pulled (${quantityNeeded} needed)`}
    >
      {/* Custom Checkbox - Refined with smooth animation */}
      <div
        className={cn(
          "flex items-center justify-center",
          "h-7 w-7 md:h-10 md:w-10 shrink-0",
          "rounded-lg md:rounded-xl",
          "border-2 transition-all duration-300 ease-out",
          isPulled
            ? "bg-green-600 border-green-600 scale-100"
            : "border-muted-foreground/25 group-hover:border-muted-foreground/40"
        )}
        role="checkbox"
        aria-checked={isPulled}
      >
        <Check
          className={cn(
            "h-4 w-4 md:h-6 md:w-6 text-white transition-all duration-200",
            isPulled ? "scale-100 opacity-100" : "scale-0 opacity-0"
          )}
          strokeWidth={3}
        />
      </div>

      {/* Product Image / Emoji / Placeholder - with fallback hierarchy */}
      <RTDEItemImage
        imageFilename={imageFilename}
        icon={icon}
        size="md"
        grayscale={isPulled}
        alt={`${brand ? `${brand} ` : ""}${itemName}`}
        className={cn(
          "shrink-0 rounded-xl md:rounded-2xl",
          "transition-all duration-300",
          isPulled && "opacity-40"
        )}
      />

      {/* Brand & Item Name - Refined typography */}
      <div className="flex-1 text-left min-w-0">
        {brand && (
          <p
            className={cn(
              "text-xs text-gray-500",
              "transition-all duration-300",
              isPulled && "opacity-60"
            )}
          >
            {brand}
          </p>
        )}
        <p
          className={cn(
            "font-semibold text-base md:text-lg",
            "transition-all duration-300",
            isPulled && "line-through text-muted-foreground opacity-60"
          )}
        >
          {itemName}
        </p>
      </div>

      {/* Pull Quantity Badge - More refined with gradient */}
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 md:gap-1.5",
          "px-3 py-2 md:px-5 md:py-3 min-w-[60px] md:min-w-[72px]",
          "rounded-lg md:rounded-xl",
          "transition-colors duration-300",
          isPulled
            ? "bg-muted/40"
            : "bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
        )}
      >
        <span className="text-[0.625rem] md:text-[0.6875rem] uppercase tracking-[0.06em] font-semibold text-muted-foreground">
          Pull
        </span>
        <span
          className={cn(
            "text-2xl md:text-[2.25rem] font-bold tabular-nums leading-none",
            "transition-colors duration-300",
            isPulled ? "text-muted-foreground" : "text-primary"
          )}
        >
          {quantityNeeded}
        </span>
      </div>
    </button>
  );
}
