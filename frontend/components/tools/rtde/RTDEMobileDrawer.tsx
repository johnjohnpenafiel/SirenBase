/**
 * RTDE Mobile Drawer - Bottom Sheet Navigation
 *
 * Mobile bottom drawer showing all items with:
 * - Swipe up to open, swipe down to close
 * - Tap handle/button to toggle
 * - Item list (same format as desktop sidebar)
 * - Tap item to select and auto-close drawer
 * - "Start Pull List" button at bottom
 */
"use client";

import { Check, Menu } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RTDEItem, RTDESessionPhase } from "./types";
import {
  formatCountDisplay,
  isItemCounted,
  getCountedItemsCount,
} from "./utils";

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
          <DrawerHeader className="border-b bg-background">
            <DrawerTitle className="text-lg">RTD&E Items</DrawerTitle>
            <DrawerDescription className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <span className="font-bold text-secondary-foreground">
                  {countedCount}
                </span>
                <span className="opacity-75 text-secondary-foreground">of</span>
                <span className="font-bold text-secondary-foreground">
                  {items.length}
                </span>
              </span>
              <span className="text-muted-foreground">items counted</span>
            </DrawerDescription>
          </DrawerHeader>

          {/* Scrollable item list */}
          <div className="overflow-y-auto max-h-[60vh] px-4 bg-background">
            <div className="space-y-2 py-4">
              {items.map((item, index) => {
                const isCurrent = index === currentIndex;
                const counted = isItemCounted(item);
                const countDisplay = formatCountDisplay(item.countedQuantity);

                return (
                  <DrawerClose key={item.itemId} asChild>
                    <button
                      onClick={() => handleItemSelect(index)}
                      disabled={!isCountingPhase}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200",
                        "bg-card border",
                        "active:scale-[0.98]",
                        isCurrent &&
                          "bg-primary/30 text-primary-foreground border-primary/50",
                        !isCountingPhase &&
                          "cursor-not-allowed opacity-60 active:scale-100"
                      )}
                      aria-label={`${item.name}, ${
                        counted ? `counted: ${countDisplay}` : "not counted"
                      }`}
                      aria-current={isCurrent ? "true" : undefined}
                    >
                      {/* Item emoji icon with circular background */}
                      <div
                        className={cn(
                          "flex items-center justify-center w-14 h-14 rounded-full shrink-0 transition-colors",
                          isCurrent
                            ? "bg-primary-foreground/20"
                            : counted
                            ? "bg-primary/10"
                            : "bg-muted"
                        )}
                      >
                        <span className="text-3xl" aria-hidden="true">
                          {item.icon}
                        </span>
                      </div>

                      {/* Item name and count */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold truncate">
                            {item.name}
                          </span>
                          {counted && (
                            <div
                              className={cn(
                                "flex items-center justify-center w-6 h-6 rounded-full shrink-0",
                                isCurrent
                                  ? "bg-primary-foreground/20"
                                  : "bg-primary/20"
                              )}
                            >
                              <Check
                                className={cn(
                                  "h-4 w-4 shrink-0",
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
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium",
                            isCurrent
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : counted
                              ? "bg-primary/20 text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <span className="opacity-75 text-xs">Count:</span>
                          <span className="font-mono font-bold">
                            {countDisplay}
                          </span>
                        </div>
                      </div>
                    </button>
                  </DrawerClose>
                );
              })}
            </div>
          </div>

          {/* "Start Pull List" button */}
          <DrawerFooter className="border-t bg-background pb-6 flex items-center justify-center">
            <DrawerClose asChild>
              <Button
                variant="default"
                size="lg"
                onClick={onStartPull}
                disabled={!isCountingPhase}
                className="shadow-sm h-12 w-full max-w-md"
              >
                Start Pull List
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
