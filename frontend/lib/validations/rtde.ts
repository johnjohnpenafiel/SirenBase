/**
 * RTD&E Form Validation Schemas
 *
 * Zod schemas for RTD&E tool forms (add/edit items, counts).
 */
import { z } from 'zod';

/**
 * Add/Edit RTD&E Item Form Schema
 *
 * Validates item name, icon (emoji), and par level for RTD&E items.
 */
export const rtdeItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Item name is required')
    .max(100, 'Item name must be 100 characters or less')
    .trim()
    .min(1, 'Item name cannot be empty after trimming'),

  icon: z
    .string()
    .min(1, 'Icon/emoji is required')
    .max(10, 'Icon must be 10 characters or less')
    .trim()
    .min(1, 'Icon cannot be empty after trimming'),

  par_level: z
    .number({
      required_error: 'Par level is required',
      invalid_type_error: 'Par level must be a number',
    })
    .int('Par level must be a whole number')
    .positive('Par level must be greater than 0')
    .max(999, 'Par level must be 999 or less'),
});

export type RTDEItemFormData = z.infer<typeof rtdeItemSchema>;

/**
 * Edit RTD&E Item Form Schema
 *
 * Same as add schema but includes active field for toggling item status.
 */
export const editRTDEItemSchema = rtdeItemSchema.extend({
  active: z.boolean(),
});

export type EditRTDEItemFormData = z.infer<typeof editRTDEItemSchema>;

/**
 * Count Update Schema
 *
 * Validates count input during counting session.
 */
export const countUpdateSchema = z.object({
  counted_quantity: z
    .number({
      required_error: 'Count is required',
      invalid_type_error: 'Count must be a number',
    })
    .int('Count must be a whole number')
    .min(0, 'Count cannot be negative')
    .max(999, 'Count must be 999 or less'),
});

export type CountUpdateFormData = z.infer<typeof countUpdateSchema>;
