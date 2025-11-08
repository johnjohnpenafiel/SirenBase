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
import { Trash2, AlertTriangle } from 'lucide-react';

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Remove Item?
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this item from inventory?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Item details box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-sm">
              <p className="font-semibold text-gray-900">{itemName}</p>
              <p className="text-gray-600 mt-1">
                Code: <span className="font-mono font-medium">{itemCode}</span>
              </p>
            </div>
          </div>

          {/* Warning box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                This action will mark the item as removed and create a history entry.
                You can view removed items in the history log.
              </span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRemoving}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isRemoving}
          >
            {isRemoving ? 'Removing...' : 'Remove Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
