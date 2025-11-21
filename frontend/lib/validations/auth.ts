/**
 * Authentication Form Validation Schemas
 *
 * Zod schemas for login and authentication forms.
 */
import { z } from 'zod';

/**
 * Login Form Schema
 *
 * Validates partner number and PIN for user authentication.
 */
export const loginSchema = z.object({
  partnerNumber: z
    .string()
    .min(1, 'Partner number is required')
    .trim()
    .transform((val) => val.toUpperCase()),

  pin: z
    .string()
    .min(1, 'PIN is required')
    .length(4, 'PIN must be exactly 4 digits')
    .regex(/^\d{4}$/, 'PIN must contain only digits'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
