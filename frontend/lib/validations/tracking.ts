/**
 * Inventory Tracking Form Validation Schemas
 *
 * Zod schemas for tracking tool forms (add/remove items).
 */
import { z } from 'zod';
import { ITEM_CATEGORIES } from '@/lib/constants';
import type { ItemCategory } from '@/types';

/**
 * Add Item Form Schema
 *
 * Validates item name and category for adding new inventory items.
 */
export const addItemSchema = z.object({
  itemName: z
    .string()
    .min(1, 'Item name is required')
    .trim()
    .min(1, 'Item name cannot be empty after trimming'),

  category: z
    .enum(ITEM_CATEGORIES as readonly [ItemCategory, ...ItemCategory[]], {
      errorMap: () => ({ message: 'Please select a valid category' }),
    }),
});

export type AddItemFormData = z.infer<typeof addItemSchema>;
