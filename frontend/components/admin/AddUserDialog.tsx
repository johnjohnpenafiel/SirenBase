/**
 * Add User Dialog
 *
 * Form for admins to create new user accounts.
 * Allows setting role (admin/staff) and initial PIN.
 *
 * Uses react-hook-form + zod for type-safe validation with PIN confirmation.
 * Follows Design/dialogs.md guidelines.
 */
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { addUserSchema, type AddUserFormData } from '@/lib/validations/admin';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded: () => void;
}

export function AddUserDialog({ open, onOpenChange, onUserAdded }: AddUserDialogProps) {
  const form = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      partnerNumber: '',
      name: '',
      pin: '',
      confirmPin: '',
      role: 'staff',
    },
  });

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: AddUserFormData) => {
    try {
      await apiClient.createUser({
        partner_number: data.partnerNumber,
        name: data.name,
        pin: data.pin,
        role: data.role,
      });

      toast.success(`User ${data.name} created successfully!`);
      onUserAdded();
      handleClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create user';
      toast.error(`Failed to create user: ${errorMessage}`);
    }
  };

  const isLoading = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6" showCloseButton={false}>
        <DialogHeader className="bg-gray-100 rounded-xl px-4 pt-3 pb-3">
          <DialogTitle>Add New Partner</DialogTitle>
          <DialogDescription>
            Create a new partner account with partner number and PIN.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="partnerNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., PART001"
                        autoFocus
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., John Smith"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN (4 digits)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="••••"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm PIN</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="••••"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Admins have full access to all features and user management
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Creating...' : 'Create Partner'}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="w-full">
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
