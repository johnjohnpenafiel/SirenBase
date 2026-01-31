/**
 * Edit RTD&E Item Dialog
 *
 * Form for admins to edit existing RTD&E items.
 * Allows updating item name, emoji icon, par level, and active status.
 *
 * Uses react-hook-form + zod for type-safe validation.
 * Follows Design/dialogs.md guidelines.
 */
'use client';

import { useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { editRTDEItemSchema, type EditRTDEItemFormData } from '@/lib/validations/rtde';
import type { RTDEItem } from '@/types';
import { RTDEItemImage } from '@/components/tools/rtde/RTDEItemImage';

interface EditRTDEItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemUpdated: () => void;
  item: RTDEItem | null;
}

export function EditRTDEItemDialog({
  open,
  onOpenChange,
  onItemUpdated,
  item,
}: EditRTDEItemDialogProps) {
  const form = useForm<EditRTDEItemFormData>({
    resolver: zodResolver(editRTDEItemSchema),
    defaultValues: {
      name: '',
      brand: '',
      icon: '',
      par_level: 0,
      active: true,
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        brand: item.brand || '',
        icon: item.icon || '',
        par_level: item.par_level,
        active: item.active,
      });
    }
  }, [item, form]);

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: EditRTDEItemFormData) => {
    if (!item) return;

    try {
      await apiClient.updateRTDEItem(item.id, {
        name: data.name,
        brand: data.brand || null,
        icon: data.icon || null,
        par_level: data.par_level,
        active: data.active,
      });

      toast.success(`Item "${data.name}" updated successfully!`);
      onItemUpdated();
      handleClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to update item. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6" showCloseButton={false}>
        <DialogHeader className="bg-gray-100 rounded-xl px-4 pt-3 pb-3">
          <DialogTitle>Edit RTD&E Item</DialogTitle>
          <DialogDescription>
            Update item details, par level, or active status. Product images are
            managed by engineering.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Current Image Preview (Read-only) */}
            {item && (
              <div className="bg-muted/50 border border-border rounded-2xl px-5 py-4">
                <div className="flex items-center gap-4">
                  <RTDEItemImage
                    imageFilename={item.image_filename}
                    icon={item.icon}
                    size="md"
                    alt={`${item.brand ? `${item.brand} ` : ''}${item.name}`}
                  />
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm font-medium">Current Display</Label>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.image_filename
                        ? `Image: ${item.image_filename}`
                        : item.icon
                          ? `Emoji: ${item.icon}`
                          : 'Placeholder icon'}
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon/Emoji (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="🥪"
                      {...field}
                      disabled={form.formState.isSubmitting}
                      maxLength={10}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional emoji fallback if no product image exists
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {/* Active Toggle */}
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-2xl border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Inactive items are hidden from counting sessions
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded cursor-pointer"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
