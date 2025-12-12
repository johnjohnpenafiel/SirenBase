/**
 * RTDE Session Sidebar - Desktop Navigation
 *
 * Desktop sidebar showing all items with:
 * - Item name with green dot indicator (if counted)
 * - Count number or "-" (if uncounted)
 * - Click to jump to item
 * - Subtle background highlight on current item
 * - "Start Pull List" button at bottom
 * - Independent scrolling (infinity pool pattern)
 * - Spotify-inspired minimal styling with hover effects
 */
"use client";

// Check icon removed - using green dot indicator instead
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RTDEItem, RTDESessionPhase } from "./types";
import { formatCountDisplay, isItemCounted } from "./utils";

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
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-2">
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
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors duration-150",
                  "hover:bg-muted",
                  isCurrent && "bg-accent",
                  !isCountingPhase && "cursor-not-allowed opacity-60"
                )}
                aria-label={`${item.name}, ${
                  counted ? `counted: ${countDisplay}` : "not counted"
                }`}
                aria-current={isCurrent ? "true" : undefined}
              >
                {/* Item emoji icon with rounded square background */}
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-border shrink-0">
                  <span className="text-2xl" aria-hidden="true">
                    {item.icon}
                  </span>
                </div>

                {/* Item name and count */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium truncate text-sm">
                      {item.name}
                    </span>
                    {counted && (
                      <div
                        className="w-2 h-2 rounded-full bg-primary shrink-0"
                        aria-label="Counted"
                      />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {countDisplay}
                  </span>
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
