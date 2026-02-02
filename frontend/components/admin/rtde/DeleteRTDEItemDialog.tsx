/**
 * Delete RTD&E Item Dialog
 *
 * Confirmation dialog for deleting RTD&E items.
 * Warns about potential cascade effects if item is used in sessions.
 * Follows Design/dialogs.md guidelines.
 */
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import type { RTDEItem } from '@/types';
import { AlertTriangle } from 'lucide-react';

interface DeleteRTDEItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemDeleted: () => void;
  item: RTDEItem | null;
}

export function DeleteRTDEItemDialog({
  open,
  onOpenChange,
  onItemDeleted,
  item,
}: DeleteRTDEItemDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!item) return;

    setIsDeleting(true);
    try {
      await apiClient.deleteRTDEItem(item.id);
      toast.success(`Item "${item.name}" deleted successfully!`);
      onItemDeleted();
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to delete item. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6" showCloseButton={false}>
        <DialogHeader className="bg-neutral-200 rounded-xl px-4 pt-3 pb-3">
          <DialogTitle>Delete RTD&E Item?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this item? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {item && (
          <div className="space-y-3">
            {/* Item Preview */}
            <div className="bg-muted/50 border border-border rounded-2xl px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Par Level: {item.par_level}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
              <p className="text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="size-4 mt-0.5 flex-shrink-0" />
                <span>
                  If this item has been used in counting sessions, it will be soft-deleted
                  (marked as inactive) to preserve historical data.
                </span>
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full"
          >
            {isDeleting ? 'Deleting...' : 'Delete Item'}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="w-full"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
