/**
 * Delete User Dialog
 *
 * Confirmation dialog for deleting user accounts.
 * Includes safety checks to prevent self-deletion.
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
    // Safety check: prevent self-deletion
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete User?
          </DialogTitle>
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

        {isSelf ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ You cannot delete your own account. Please ask another admin to remove your
              account if needed.
            </p>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              ⚠️ <strong>Warning:</strong> This action cannot be undone. The user will
              immediately lose access to the system.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
            Cancel
          </Button>
          {!isSelf && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete User'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
