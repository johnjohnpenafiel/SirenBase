/**
 * Remove Item Dialog
 *
 * Confirmation dialog for removing inventory items.
 * Displays item name and code with a warning about permanent removal.
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
import { AlertTriangle } from 'lucide-react';

interface RemoveItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemCode: string;
  onConfirm: () => Promise<void>;
  isRemoving: boolean;
}

export function RemoveItemDialog({
  open,
  onOpenChange,
  itemName,
  itemCode,
  onConfirm,
  isRemoving,
}: RemoveItemDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6" showCloseButton={false}>
        <DialogHeader className="bg-neutral-200 rounded-xl px-4 pt-3 pb-3">
          <DialogTitle>
            Remove Item?
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this item from inventory?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Item details box - matching ItemCard design */}
          <div className="bg-muted/50 border border-neutral-300 rounded-2xl px-5 py-4">
            <p className="inline-block text-[10px] font-mono font-bold tracking-wide uppercase text-foreground bg-secondary px-2.5 py-1 rounded-full mb-2">
              {itemCode}
            </p>
            <p className="text-lg text-foreground">{itemName}</p>
          </div>

          {/* Warning box */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
            <p className="text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="size-4 mt-0.5 flex-shrink-0" />
              <span>
                This action will mark the item as removed and create a history entry.
                You can view removed items in the history log.
              </span>
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleConfirm}
            disabled={isRemoving}
            className="w-full"
          >
            {isRemoving ? 'Removing...' : 'Remove Item'}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRemoving}
            className="w-full"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
