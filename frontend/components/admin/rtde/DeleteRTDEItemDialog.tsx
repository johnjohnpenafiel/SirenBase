/**
 * Delete RTD&E Item Dialog
 *
 * Confirmation dialog for deleting RTD&E items.
 * Warns about potential cascade effects if item is used in sessions.
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
import { AlertCircle } from 'lucide-react';

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete RTD&E Item</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this item? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {item && (
          <div className="space-y-4">
            {/* Item Preview */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Par Level: {item.par_level}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-destructive">Warning</p>
                <p className="text-sm text-muted-foreground">
                  If this item has been used in counting sessions, it will be soft-deleted
                  (marked as inactive) to preserve historical data.
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
