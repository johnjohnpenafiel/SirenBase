/**
 * Add RTD&E Item Dialog
 *
 * Form for admins to create new RTD&E items.
 * Allows setting item name, emoji icon, par level, and active status.
 *
 * Uses react-hook-form + zod for type-safe validation.
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
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { rtdeItemSchema, type RTDEItemFormData } from '@/lib/validations/rtde';

interface AddRTDEItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemAdded: () => void;
}

export function AddRTDEItemDialog({
  open,
  onOpenChange,
  onItemAdded,
}: AddRTDEItemDialogProps) {
  const form = useForm<RTDEItemFormData>({
    resolver: zodResolver(rtdeItemSchema),
    defaultValues: {
      name: '',
      brand: '',
      icon: '',
      par_level: 0,
    },
  });

  const handleClose = () => {
    // Reset form
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: RTDEItemFormData) => {
    try {
      await apiClient.createRTDEItem({
        name: data.name,
        brand: data.brand || undefined,
        icon: data.icon,
        par_level: data.par_level,
      });

      toast.success(`Item "${data.name}" created successfully!`);
      onItemAdded();
      handleClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to create item. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add RTD&E Item</DialogTitle>
          <DialogDescription>
            Create a new item for the RTD&E display with par level and icon.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Item Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Egg & Cheese Sandwich"
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    The display name for this RTD&E item
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Brand (Optional) */}
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Evolution"
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Brand name displayed above the item name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Icon/Emoji */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon/Emoji</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="🥪"
                      {...field}
                      disabled={form.formState.isSubmitting}
                      maxLength={10}
                    />
                  </FormControl>
                  <FormDescription>
                    Emoji icon to represent this item (e.g., 🥪, 🥤, 💧)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Par Level */}
            <FormField
              control={form.control}
              name="par_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Par Level</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="8"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Target quantity for the display
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating...' : 'Create Item'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
