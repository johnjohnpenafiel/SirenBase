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
'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RTDEItem, RTDESessionPhase } from './types';
import { formatCountDisplay, isItemCounted } from './utils';

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
  const isCountingPhase = phase === 'counting';

  return (
    <aside className="hidden md:flex md:flex-col w-64 lg:w-80 border-r bg-background">
      {/* Scrollable item list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-1">
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
                  'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                  'hover:bg-accent',
                  isCurrent && 'bg-primary text-primary-foreground hover:bg-primary/90',
                  !isCountingPhase && 'cursor-not-allowed opacity-60'
                )}
                aria-label={`${item.name}, ${
                  counted ? `counted: ${countDisplay}` : 'not counted'
                }`}
                aria-current={isCurrent ? 'true' : undefined}
              >
                {/* Item emoji icon */}
                <span className="text-2xl shrink-0" aria-hidden="true">
                  {item.icon}
                </span>

                {/* Item name and count */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{item.name}</span>
                    {counted && (
                      <Check
                        className="h-4 w-4 shrink-0"
                        aria-label="Counted"
                      />
                    )}
                  </div>
                  <div className="text-sm opacity-90">
                    Count: <span className="font-mono font-semibold">{countDisplay}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fixed "Start Pull List" button */}
      <div className="border-t p-4">
        <Button
          variant="outline"
          onClick={onStartPull}
          disabled={!isCountingPhase}
          className="w-full"
        >
          Start Pull List
        </Button>
      </div>
    </aside>
  );
}
