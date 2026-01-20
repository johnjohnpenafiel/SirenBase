/**
 * RTDE Session Sidebar - Desktop Navigation
 *
 * Desktop sidebar showing all items with:
 * - Item name with checkmark indicator (if counted)
 * - Count number or "-" (if uncounted)
 * - Click to jump to item
 * - Subtle background highlight on current item
 * - "Start Pull List" button at bottom
 * - Independent scrolling (infinity pool pattern)
 * - Spotify-inspired minimal styling with hover effects
 */
"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RTDEItem, RTDESessionPhase } from "./types";
import { formatCountDisplay, isItemCounted } from "./utils";
import { RTDEItemImage } from "./RTDEItemImage";

interface RTDESessionSidebarProps {
  items: RTDEItem[];
  currentIndex: number;
  phase: RTDESessionPhase;
  onItemClick: (index: number) => void;
  onStartPull: () => void;
}

export function RTDESessionSidebar({
  items,
  currentIndex,
  phase,
  onItemClick,
  onStartPull,
}: RTDESessionSidebarProps) {
  const isCountingPhase = phase === "counting";

  return (
    <aside className="hidden md:flex md:flex-col w-64 lg:w-80 border-r bg-muted/30">
      {/* Fixed title header */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <h2 className="text-sm font-semibold text-popover-foreground">
          RTD&E Items
        </h2>
      </div>

      {/* Scrollable item list */}
      <div className="flex-1 overflow-y-auto bg-neutral-100 px-2 py-1">
        <div className="flex flex-col gap-[3px]">
          {items.map((item, index) => {
            const isCurrent = index === currentIndex;
            const counted = isItemCounted(item);
            const countDisplay = formatCountDisplay(item.countedQuantity);

            return (
              <button
                key={item.itemId}
                onClick={() => onItemClick(index)}
                disabled={!isCountingPhase}
                className={cn(
                  "w-full flex items-center gap-2.5 py-2 px-3 text-left",
                  "rounded-lg",
                  "transition-colors duration-150",
                  "active:bg-muted/50",
                  isCurrent
                    ? "bg-white ring-2 ring-foreground/10"
                    : "bg-background",
                  !isCountingPhase && "cursor-not-allowed opacity-60"
                )}
                aria-label={`${item.name}, ${
                  counted ? `counted: ${countDisplay}` : "not counted"
                }`}
                aria-current={isCurrent ? "true" : undefined}
              >
                {/* Product Image / Emoji / Placeholder */}
                <RTDEItemImage
                  imageFilename={item.imageFilename}
                  icon={item.icon}
                  size="md"
                  alt={`${item.brand ? `${item.brand} ` : ""}${item.name}`}
                  className="shrink-0"
                />

                {/* Brand & Item name */}
                <div className="flex-1 min-w-0">
                  {item.brand && (
                    <p className="text-[10px] text-muted-foreground leading-none mb-0.5">
                      {item.brand}
                    </p>
                  )}
                  <p className="text-[13px] font-medium truncate leading-tight">
                    {item.name}
                  </p>
                </div>

                {/* Count on the right */}
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                    "text-xs font-medium tabular-nums text-muted-foreground",
                    counted && "border-2 border-emerald-500"
                  )}
                >
                  {countDisplay}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fixed "Start Pull List" button */}
      <div className="border-t bg-background px-4 py-4 md:py-6">
        <Button
          size="lg"
          onClick={onStartPull}
          disabled={!isCountingPhase}
          className="w-full h-12 md:h-11"
        >
          Start Pull
        </Button>
      </div>
    </aside>
  );
}
