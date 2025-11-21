/**
 * Admin Form Validation Schemas
 *
 * Zod schemas for admin panel forms (add/edit users).
 */
import { z } from 'zod';

/**
 * Add User Form Schema
 *
 * Validates all fields for creating a new user account.
 * Includes PIN confirmation matching.
 */
export const addUserSchema = z
  .object({
    partnerNumber: z
      .string()
      .min(1, 'Partner number is required')
      .trim()
      .transform((val) => val.toUpperCase()),

    name: z
      .string()
      .min(1, 'Name is required')
      .trim()
      .min(1, 'Name cannot be empty after trimming'),

    pin: z
      .string()
      .min(1, 'PIN is required')
      .length(4, 'PIN must be exactly 4 digits')
      .regex(/^\d{4}$/, 'PIN must contain only digits'),

    confirmPin: z
      .string()
      .min(1, 'Please confirm PIN')
      .length(4, 'PIN must be exactly 4 digits')
      .regex(/^\d{4}$/, 'PIN must contain only digits'),

    role: z.enum(['admin', 'staff'], {
      errorMap: () => ({ message: 'Please select a valid role' }),
    }),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: 'PINs do not match',
    path: ['confirmPin'], // Error will be attached to confirmPin field
  });

export type AddUserFormData = z.infer<typeof addUserSchema>;
