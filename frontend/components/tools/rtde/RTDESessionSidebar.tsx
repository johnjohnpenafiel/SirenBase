/**
 * RTDE Session Sidebar - Desktop Navigation
 *
 * Desktop sidebar showing all items with:
 * - Item name
 * - Checkmark icon (if counted)
 * - Count number or "-" (if uncounted)
 * - Click to jump to item
 * - Highlight current item
 * - "Start Pull List" button at bottom
 * - Independent scrolling (infinity pool pattern)
 */
"use client";

import { Check } from "lucide-react";
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
                  "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
                  "bg-card border",
                  "hover:scale-[1.02]",
                  isCurrent &&
                    "bg-primary/30 text-primary-foreground scale-[1.02] border-primary/50",
                  !isCountingPhase &&
                    "cursor-not-allowed opacity-60 hover:scale-100"
                )}
                aria-label={`${item.name}, ${
                  counted ? `counted: ${countDisplay}` : "not counted"
                }`}
                aria-current={isCurrent ? "true" : undefined}
              >
                {/* Item emoji icon with circular background */}
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full shrink-0 transition-colors",
                    isCurrent
                      ? "bg-primary-foreground/10"
                      : counted
                      ? "bg-primary/10"
                      : "bg-muted"
                  )}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {item.icon}
                  </span>
                </div>

                {/* Item name and count */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold truncate text-sm">
                      {item.name}
                    </span>
                    {counted && (
                      <div
                        className={cn(
                          "flex items-center justify-center w-5 h-5 rounded-full shrink-0",
                          isCurrent
                            ? "bg-primary-foreground/20"
                            : "bg-primary/20"
                        )}
                      >
                        <Check
                          className={cn(
                            "h-3 w-3 shrink-0",
                            isCurrent
                              ? "text-primary-foreground"
                              : "text-primary-foreground"
                          )}
                          aria-label="Counted"
                        />
                      </div>
                    )}
                  </div>
                  <div
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                      isCurrent
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : counted
                        ? "bg-primary/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <span className="opacity-75">Count:</span>
                    <span className="font-mono font-bold">{countDisplay}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fixed "Start Pull List" button */}
      <div className="border-t bg-background px-4 py-4 md:py-6">
        <Button
          variant="default"
          size="lg"
          onClick={onStartPull}
          disabled={!isCountingPhase}
          className="w-full shadow-sm h-12 md:h-11"
        >
          Start Pull List
        </Button>
      </div>
    </aside>
  );
}
