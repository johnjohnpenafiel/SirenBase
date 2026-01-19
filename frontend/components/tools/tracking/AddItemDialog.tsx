/**
 * Add Item Dialog
 *
 * Two-step flow for adding items:
 * Step 1: Enter name and category → Generate Code
 * Step 2: Display code → Confirm & Save
 *
 * Uses react-hook-form + zod for type-safe validation.
 */
'use client';

import { useState, useEffect } from 'react';
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
import {
  Form,
  FormControl,
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
import { ItemNameAutocomplete } from '@/components/tools/tracking/ItemNameAutocomplete';
import apiClient from '@/lib/api';
import { ITEM_CATEGORIES, formatCategory } from '@/lib/constants';
import type { ItemCategory } from '@/types';
import { toast } from 'sonner';
import { addItemSchema, type AddItemFormData } from '@/lib/validations/tracking';
import { AlertTriangle } from 'lucide-react';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemAdded: () => void;
  preselectedCategory?: ItemCategory | null;
}

type Step = 'input' | 'confirm';

export function AddItemDialog({
  open,
  onOpenChange,
  onItemAdded,
  preselectedCategory
}: AddItemDialogProps) {
  const [step, setStep] = useState<Step>('input');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm<AddItemFormData>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      itemName: '',
      category: preselectedCategory || ('' as ItemCategory),
    },
  });

  // Update category when preselectedCategory changes (always sync, including null)
  useEffect(() => {
    form.setValue('category', preselectedCategory || ('' as ItemCategory));
  }, [preselectedCategory, form]);

  const handleClose = () => {
    // Reset form
    setStep('input');
    form.reset({
      itemName: '',
      category: preselectedCategory || ('' as ItemCategory),
    });
    setGeneratedCode('');
    onOpenChange(false);
  };

  const handleGenerateCode = async (data: AddItemFormData) => {
    try {
      setLoading(true);

      // Fetch existing item codes to avoid duplicates
      const response = await apiClient.getItems({ include_removed: true });
      const existingCodes = new Set(response.items.map(item => item.code));

      // Generate unique 4-digit code on frontend
      let newCode = '';
      let attempts = 0;
      const maxAttempts = 100;

      while (attempts < maxAttempts) {
        newCode = Math.floor(1000 + Math.random() * 9000).toString();
        if (!existingCodes.has(newCode)) {
          break; // Found a unique code
        }
        attempts++;
      }

      if (attempts === maxAttempts) {
        toast.error('Unable to generate unique code. Please try again.');
        return;
      }

      setGeneratedCode(newCode);
      setStep('confirm');
      toast.success('Code generated! Write it on the physical item.');
    } catch (error: any) {
      let errorMessage = 'Failed to generate code';

      if (error.response?.data?.error) {
        const err = error.response.data.error;
        // Handle both string errors and validation error objects
        if (typeof err === 'string') {
          errorMessage = err;
        } else if (typeof err === 'object') {
          // Extract first error message from validation object
          const firstKey = Object.keys(err)[0];
          errorMessage = Array.isArray(err[firstKey]) ? err[firstKey][0] : err[firstKey];
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    const formData = form.getValues();

    try {
      setLoading(true);

      // Now save to backend with the generated code
      await apiClient.createItem({
        name: formData.itemName, // Already trimmed by schema
        category: formData.category,
        code: generatedCode, // Pass the frontend-generated code
      });

      toast.success(`${formData.itemName} added to inventory!`);
      onItemAdded();
      handleClose();
    } catch (error: any) {
      let errorMessage = 'Failed to save item';

      if (error.response?.data?.error) {
        const err = error.response.data.error;
        // Handle both string errors and validation error objects
        if (typeof err === 'string') {
          errorMessage = err;
        } else if (typeof err === 'object') {
          // Extract first error message from validation object
          const firstKey = Object.keys(err)[0];
          errorMessage = Array.isArray(err[firstKey]) ? err[firstKey][0] : err[firstKey];
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (step === 'confirm') {
      toast.info('Item not saved. Code discarded.');
    }
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === 'input' ? (
          <>
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
              <DialogDescription>
                Enter the item details to generate a unique 4-digit code.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleGenerateCode)} className="space-y-4 pt-2 pb-4">
                <FormField
                  control={form.control}
                  name="itemName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <ItemNameAutocomplete
                          value={field.value}
                          onChange={field.onChange}
                          category={form.watch('category')}
                          disabled={loading}
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ITEM_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {formatCategory(cat)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Code'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Code Generated!</DialogTitle>
              <DialogDescription>
                Write this code on the physical item with a marker, then confirm to save.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {/* Code display box */}
              <div className="bg-muted/50 border border-border rounded-2xl px-5 py-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">Your 4-digit code:</p>
                <div className="text-5xl font-bold font-mono text-foreground tracking-wider">
                  {generatedCode}
                </div>
              </div>

              {/* Warning box */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
                <p className="text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                  <AlertTriangle className="size-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Important:</strong> Write this code on the item before confirming.
                    Once confirmed, the item will be added to your inventory.
                  </span>
                </p>
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button onClick={handleConfirm} disabled={loading} className="w-full">
                {loading ? 'Saving...' : 'Confirm & Save'}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={loading} className="w-full">
                Cancel
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
