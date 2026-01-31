/**
 * Delete User Dialog
 *
 * Confirmation dialog for deleting user accounts.
 * Includes safety checks to prevent self-deletion.
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
import { useAuth } from '@/hooks/use-auth';
import apiClient from '@/lib/api';
import type { User } from '@/types';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface DeleteUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserDeleted: () => void;
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
  onUserDeleted,
}: DeleteUserDialogProps) {
  const { user: currentUser } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const isSelf = currentUser?.id === user.id;

  const handleDelete = async () => {
    if (isSelf) {
      toast.error('You cannot delete your own account');
      return;
    }

    try {
      setDeleting(true);
      await apiClient.deleteUser(user.id);
      toast.success(`User ${user.name} deleted successfully`);
      onUserDeleted();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete user';
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6" showCloseButton={false}>
        <DialogHeader className="bg-gray-100 rounded-xl px-4 pt-3 pb-3">
          <DialogTitle>Delete Partner?</DialogTitle>
          <DialogDescription>
            {isSelf ? (
              'You cannot delete your own account.'
            ) : (
              <>
                Are you sure you want to delete <strong>{user.name}</strong> (
                <span className="font-mono">{user.partner_number}</span>)?
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Partner details */}
          <div className="bg-muted/50 border border-border rounded-2xl px-5 py-4">
            <p className="font-semibold text-foreground">{user.name}</p>
            <p className="text-sm font-mono text-muted-foreground">{user.partner_number}</p>
          </div>

          {/* Warning */}
          {isSelf ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
              <p className="text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="size-4 mt-0.5 flex-shrink-0" />
                <span>
                  You cannot delete your own account. Please ask another admin to remove your account if needed.
                </span>
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
              <p className="text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="size-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Warning:</strong> This action cannot be undone. The partner will immediately lose access to the system.
                </span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {!isSelf && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="w-full"
            >
              {deleting ? 'Deleting...' : 'Delete Partner'}
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting} className="w-full">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
