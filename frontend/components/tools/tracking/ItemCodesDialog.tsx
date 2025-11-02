/**
 * Item Codes Dialog
 *
 * Displays all codes for a selected item.
 * Allows removing individual codes with confirmation.
 */
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api';
import { formatCategory } from '@/lib/constants';
import type { GroupedItem } from '@/types';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface ItemCodesDialogProps {
  item: GroupedItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemRemoved: () => void;
}

export function ItemCodesDialog({
  item,
  open,
  onOpenChange,
  onItemRemoved,
}: ItemCodesDialogProps) {
  const [codeToRemove, setCodeToRemove] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const handleRemoveClick = (code: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${item.name} (Code ${code})? This action will mark the item as removed and log it in the audit history.`
    );

    if (confirmed) {
      handleConfirmRemove(code);
    }
  };

  const handleConfirmRemove = async (code: string) => {
    try {
      setRemoving(true);
      await apiClient.deleteItem(code);
      toast.success(`${item.name} (${code}) removed from inventory`);
      onItemRemoved();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to remove item';
      toast.error(errorMessage);
    } finally {
      setRemoving(false);
    }
  };

  // Sort codes by date (most recent first)
  const sortedCodes = [...item.codes].sort(
    (a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{item.name}</DialogTitle>
            <DialogDescription>{formatCategory(item.category)}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              {item.codes.length} {item.codes.length === 1 ? 'code' : 'codes'} in inventory:
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sortedCodes.map((codeInfo) => (
                <div
                  key={codeInfo.code}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div>
                    <p className="text-2xl font-bold text-blue-600 font-mono">
                      {codeInfo.code}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Added {new Date(codeInfo.added_at).toLocaleDateString()}
                    </p>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveClick(codeInfo.code)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
