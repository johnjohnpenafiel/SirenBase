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
      <DialogContent className="sm:max-w-md p-6" showCloseButton={false}>
        <DialogHeader className="bg-neutral-200 rounded-xl px-4 pt-3 pb-3">
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Uncounted Items
          </DialogTitle>
          <DialogDescription>
            The following items have not been counted yet:
          </DialogDescription>
        </DialogHeader>

        {/* List of uncounted items */}
        <div className="bg-neutral-200 rounded-xl p-2 max-h-[200px] overflow-y-auto space-y-1.5 border border-neutral-300/80">
          {uncountedItems.map((item) => (
            <div
              key={item.itemId}
              className="flex items-center gap-2 bg-background border border-neutral-300/80 rounded-lg px-3 py-1.5"
            >
              <span className="text-base" aria-hidden="true">
                {item.icon}
              </span>
              <span className="text-xs">{item.name}</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          These items will be excluded from the pull list. You can go back and
          count them, or continue without them.
        </p>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={onContinue}
            className="w-full"
          >
            Continue
          </Button>
          <Button
            variant="outline"
            onClick={onGoBack}
            className="w-full"
          >
            Go Back & Count
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
