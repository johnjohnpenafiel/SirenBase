/**
 * RTDE Mobile Drawer - Bottom Sheet Navigation
 *
 * Mobile bottom drawer showing all items with:
 * - Swipe up to open, swipe down to close
 * - Tap handle/button to toggle
 * - Item list with checkmark indicator (if counted)
 * - Tap item to select and auto-close drawer
 * - "Start Pull List" button at bottom
 */
"use client";

import { useCallback } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RTDEItem, RTDESessionPhase } from "./types";
import {
  formatCountDisplay,
  isItemCounted,
  getCountedItemsCount,
  CURRENT_ITEM_HIGHLIGHT,
} from "./utils";
import { RTDEItemImage } from "./RTDEItemImage";

interface RTDEMobileDrawerProps {
  items: RTDEItem[];
  currentIndex: number;
  phase: RTDESessionPhase;
  onItemClick: (index: number) => void;
  onStartPull: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RTDEMobileDrawer({
  items,
  currentIndex,
  phase,
  onItemClick,
  onStartPull,
  open,
  onOpenChange,
}: RTDEMobileDrawerProps) {
  const isCountingPhase = phase === "counting";
  const countedCount = getCountedItemsCount(items);

  // Callback ref that scrolls immediately when element mounts
  const currentItemCallbackRef = useCallback(
    (node: HTMLButtonElement | null) => {
      if (node && open) {
        // Scroll immediately so it happens during drawer animation, not after
        node.scrollIntoView({
          behavior: "instant",
          block: "center",
        });
      }
    },
    [open]
  );

  const handleItemSelect = (index: number) => {
    onItemClick(index);
    onOpenChange(false); // Close drawer after selection
  };

  // Hide drawer in pull phase (not needed during pulling)
  if (phase === "pulling") {
    return null;
  }

  return (
    <div className="md:hidden">
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="bg-background">
          <DrawerHeader className="border-b bg-background pb-3">
            <DrawerTitle className="text-lg">RTD&E Items</DrawerTitle>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-xs text-foreground">
                <span className="font-bold">{countedCount}</span>
                <span>of</span>
                <span className="font-bold">{items.length}</span>
              </span>
            </div>
          </DrawerHeader>

          {/* Scrollable item list */}
          <div className="overflow-y-auto max-h-[60vh] bg-neutral-100 px-2 py-1">
            <div className="flex flex-col gap-[3px]">
              {items.map((item, index) => {
                const isCurrent = index === currentIndex;
                const counted = isItemCounted(item);
                const countDisplay = formatCountDisplay(item.countedQuantity);

                return (
                  <DrawerClose key={item.itemId} asChild>
                    <button
                      ref={isCurrent ? currentItemCallbackRef : undefined}
                      onClick={() => handleItemSelect(index)}
                      disabled={!isCountingPhase}
                      className={cn(
                        "w-full flex items-center gap-2.5 py-2 px-3 text-left",
                        "rounded-2xl bg-background",
                        "transition-colors duration-150",
                        "active:bg-muted/50",
                        isCurrent && CURRENT_ITEM_HIGHLIGHT,
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
                  </DrawerClose>
                );
              })}
            </div>
          </div>

          {/* "Start Pull List" button */}
          <DrawerFooter className="border-t bg-background pb-safe">
            <div className="flex items-center justify-center w-full pt-4 pb-6">
              <DrawerClose asChild>
                <Button
                  size="lg"
                  onClick={onStartPull}
                  disabled={!isCountingPhase}
                  className="h-12 w-full max-w-md"
                >
                  Start Pull
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
