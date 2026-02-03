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
        <DrawerContent className="bg-card">
          <DrawerHeader className="border-b border-neutral-300/80 bg-card pb-3">
            <div className="flex items-center justify-center gap-2">
              <DrawerTitle className="text-xl font-normal tracking-tight text-black">
                RTD&E
              </DrawerTitle>
              <span className="text-xs font-medium tracking-wide capitalize bg-neutral-200/50 border border-neutral-300 text-neutral-800 px-2.5 py-1 rounded-full">
                Items
              </span>
            </div>
            <div className="flex justify-center mt-1">
              <span className="inline-flex items-center gap-1 text-xs text-foreground">
                <span className="font-medium">{countedCount}</span>
                <span className="text-muted-foreground">of</span>
                <span className="font-medium">{items.length}</span>
                <span className="text-muted-foreground">counted</span>
              </span>
            </div>
          </DrawerHeader>

          {/* Scrollable item list */}
          <div className="overflow-y-auto max-h-[60vh] bg-neutral-100 px-2 py-2">
            <div className="flex flex-col gap-1">
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
                        "rounded-xl bg-card border-2",
                        "transition-colors duration-150",
                        "active:bg-neutral-100",
                        isCurrent
                          ? "border-emerald-400 shadow-sm"
                          : "border-transparent",
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
                        size="sm"
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
                          "text-xs font-medium tabular-nums",
                          counted
                            ? "bg-emerald-400 text-white"
                            : "text-muted-foreground"
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
          <DrawerFooter className="border-t border-neutral-300/80 bg-card pb-safe">
            <div className="flex items-center justify-center w-full pt-3 pb-6">
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
