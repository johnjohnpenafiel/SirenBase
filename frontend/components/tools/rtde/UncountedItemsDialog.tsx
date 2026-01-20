/**
 * Uncounted Items Dialog
 *
 * Modal dialog shown when user tries to proceed to pull phase
 * but some items have not been counted yet.
 *
 * Provides two options:
 * 1. Continue - Excludes uncounted items from pull list
 * 2. Go Back - Returns to counting phase to count them
 */
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import type { RTDEItem } from './types';

interface UncountedItemsDialogProps {
  open: boolean;
  uncountedItems: RTDEItem[];
  onContinue: () => void;
  onGoBack: () => void;
}

export function UncountedItemsDialog({
  open,
  uncountedItems,
  onContinue,
  onGoBack,
}: UncountedItemsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onGoBack()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <DialogTitle>Uncounted Items</DialogTitle>
          </div>
          <DialogDescription>
            The following items have not been counted yet:
          </DialogDescription>
        </DialogHeader>

        {/* List of uncounted items */}
        <div className="bg-muted rounded-lg p-4 max-h-[200px] overflow-y-auto">
          <ul className="space-y-2">
            {uncountedItems.map((item) => (
              <li key={item.itemId} className="flex items-center gap-2 text-sm">
                <span className="text-xl" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-muted-foreground">
          These items will be excluded from the pull list. You can go back and
          count them, or continue without them.
        </p>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onGoBack}
            className="w-full sm:w-auto"
          >
            Go Back & Count
          </Button>
          <Button
            onClick={onContinue}
            className="w-full sm:w-auto"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
