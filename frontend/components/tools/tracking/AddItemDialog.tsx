/**
 * Add Item Dialog
 *
 * Two-step flow for adding items:
 * Step 1: Enter name and category → Generate Code
 * Step 2: Display code → Confirm & Save
 */
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<ItemCategory | ''>(preselectedCategory || '');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Update category when preselectedCategory changes (always sync, including null)
  useEffect(() => {
    setCategory(preselectedCategory || '');
  }, [preselectedCategory]);

  const handleClose = () => {
    // Reset form
    setStep('input');
    setItemName('');
    setCategory(preselectedCategory || '');
    setGeneratedCode('');
    onOpenChange(false);
  };

  const handleGenerateCode = async () => {
    // Validation
    if (!itemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }

    if (!category) {
      toast.error('Please select a category');
      return;
    }

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
    try {
      setLoading(true);

      // Now save to backend with the generated code
      await apiClient.createItem({
        name: itemName.trim(),
        category: category as ItemCategory,
        code: generatedCode, // Pass the frontend-generated code
      });

      toast.success(`${itemName} added to inventory!`);
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

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <ItemNameAutocomplete
                  value={itemName}
                  onChange={setItemName}
                  category={category}
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value as ItemCategory)}
                  disabled={loading}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEM_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {formatCategory(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleGenerateCode} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Code'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Code Generated!</DialogTitle>
              <DialogDescription>
                Write this code on the physical item with a marker, then confirm to save.
              </DialogDescription>
            </DialogHeader>

            <div className="py-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Your 4-digit code:</p>
                <div className="text-6xl font-bold font-mono text-primary tracking-wider mb-4">
                  {generatedCode}
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                  <p className="text-sm text-amber-900 dark:text-amber-200">
                    ⚠️ <strong>Important:</strong> Write this code on the item before confirming.
                    Once confirmed, the item will be added to your inventory.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>Confirm & Save</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
