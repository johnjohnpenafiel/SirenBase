/**
 * RTD&E Pull List Item Component
 *
 * Checkbox list item for the pull list screen.
 * Features:
 * - Large checkbox (44px touch target)
 * - Item name with emoji icon
 * - Quantity needed display
 * - Strikethrough when marked as pulled
 * - Visual feedback for completion state
 */
'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface RTDEPullListItemProps {
  itemName: string;
  icon: string; // Emoji
  quantityNeeded: number;
  isPulled: boolean;
  onToggle: () => void;
  className?: string;
}

export function RTDEPullListItem({
  itemName,
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
        'flex items-center gap-4 w-full p-4 bg-card border border-border rounded-lg transition-all',
        'hover:shadow-sm active:scale-[0.98]',
        isPulled && 'bg-muted/50',
        className
      )}
      aria-label={`${isPulled ? 'Unmark' : 'Mark'} ${itemName} as pulled (${quantityNeeded} needed)`}
    >
      {/* Custom Checkbox */}
      <div
        className={cn(
          'flex items-center justify-center h-6 w-6 shrink-0 rounded border-2 transition-colors',
          isPulled
            ? 'bg-primary border-primary'
            : 'border-muted-foreground/30 hover:border-muted-foreground'
        )}
        role="checkbox"
        aria-checked={isPulled}
      >
        {isPulled && <Check className="h-4 w-4 text-primary-foreground" />}
      </div>

      {/* Item Icon (Emoji) */}
      <span
        className={cn(
          'text-3xl shrink-0 transition-opacity',
          isPulled && 'opacity-40'
        )}
        aria-hidden="true"
      >
        {icon}
      </span>

      {/* Item Details */}
      <div className="flex-1 text-left min-w-0">
        <p
          className={cn(
            'font-medium text-base transition-all',
            isPulled && 'line-through text-muted-foreground'
          )}
        >
          {itemName}
        </p>
        <p
          className={cn(
            'text-sm transition-colors',
            isPulled ? 'text-muted-foreground' : 'text-foreground/70'
          )}
        >
          Qty: <span className="font-semibold">{quantityNeeded}</span>
        </p>
      </div>

      {/* Visual Indicator (Mobile) */}
      {isPulled && (
        <div
          className="md:hidden flex items-center justify-center h-8 w-8 shrink-0 rounded-full bg-green-100 dark:bg-green-950"
          aria-hidden="true"
        >
          <Check className="h-5 w-5 text-green-700 dark:text-green-300" />
        </div>
      )}
    </button>
  );
}
