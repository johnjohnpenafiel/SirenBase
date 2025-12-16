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

import { Check } from "lucide-react";
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
                        "w-full flex items-center gap-4 p-4 rounded-lg text-left transition-colors duration-150",
                        "active:bg-muted/40",
                        isCurrent && "bg-muted/50",
                        !isCountingPhase && "cursor-not-allowed opacity-60"
                      )}
                      aria-label={`${item.name}, ${
                        counted ? `counted: ${countDisplay}` : "not counted"
                      }`}
                      aria-current={isCurrent ? "true" : undefined}
                    >
                      {/* Product Image / Emoji / Placeholder - with fallback hierarchy */}
                      <RTDEItemImage
                        imageFilename={item.imageFilename}
                        icon={item.icon}
                        size="md"
                        alt={`${item.brand ? `${item.brand} ` : ""}${item.name}`}
                        className="shrink-0"
                      />

                      {/* Brand, Item name and count */}
                      <div className="flex-1 min-w-0">
                        {item.brand && (
                          <span className="text-xs text-gray-500 truncate block">
                            {item.brand}
                          </span>
                        )}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">
                            {item.name}
                          </span>
                          {counted && (
                            <div
                              className="flex items-center justify-center w-4 h-4 rounded-full bg-primary shrink-0"
                              aria-label="Counted"
                            >
                              <Check className="w-2.5 h-2.5 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {countDisplay}
                        </span>
                      </div>
                    </button>
                  </DrawerClose>
                );
              })}
            </div>
          </div>

          {/* "Start Pull List" button */}
          <DrawerFooter className="border-t bg-background pb-4 pb-safe flex items-center justify-center">
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
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
