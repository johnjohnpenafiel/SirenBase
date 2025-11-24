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
'use client';

import { Check, Menu } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RTDEItem, RTDESessionPhase } from './types';
import { formatCountDisplay, isItemCounted, getCountedItemsCount } from './utils';

interface RTDEMobileDrawerProps {
  items: RTDEItem[];
  currentIndex: number;
  phase: RTDESessionPhase;
  onItemClick: (index: number) => void;
  onStartPull: () => void;
}

export function RTDEMobileDrawer({
  items,
  currentIndex,
  phase,
  onItemClick,
  onStartPull,
}: RTDEMobileDrawerProps) {
  const isCountingPhase = phase === 'counting';
  const countedCount = getCountedItemsCount(items);

  const handleItemSelect = (index: number) => {
    onItemClick(index);
    // Drawer will auto-close via DrawerClose wrapper
  };

  return (
    <div className="md:hidden">
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 shadow-lg"
          >
            <Menu className="h-5 w-5 mr-2" />
            Item List ({countedCount}/{items.length})
          </Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>RTDE Items</DrawerTitle>
            <DrawerDescription>
              {countedCount} of {items.length} items counted
            </DrawerDescription>
          </DrawerHeader>

          {/* Scrollable item list */}
          <div className="overflow-y-auto max-h-[60vh] px-4">
            <div className="space-y-2 pb-4">
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
                        'w-full flex items-center gap-3 p-4 rounded-lg text-left transition-colors',
                        'hover:bg-accent',
                        isCurrent && 'bg-primary text-primary-foreground',
                        !isCountingPhase && 'cursor-not-allowed opacity-60'
                      )}
                      aria-label={`${item.name}, ${
                        counted ? `counted: ${countDisplay}` : 'not counted'
                      }`}
                      aria-current={isCurrent ? 'true' : undefined}
                    >
                      {/* Item emoji icon */}
                      <span className="text-3xl shrink-0" aria-hidden="true">
                        {item.icon}
                      </span>

                      {/* Item name and count */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{item.name}</span>
                          {counted && (
                            <Check
                              className="h-5 w-5 shrink-0"
                              aria-label="Counted"
                            />
                          )}
                        </div>
                        <div className="text-sm opacity-90">
                          Count:{' '}
                          <span className="font-mono font-semibold">
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
          <DrawerFooter>
            <DrawerClose asChild>
              <Button
                variant="outline"
                onClick={onStartPull}
                disabled={!isCountingPhase}
                className="w-full"
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
