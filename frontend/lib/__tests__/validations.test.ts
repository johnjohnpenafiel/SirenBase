/**
 * Validation Schema Tests
 *
 * Tests for Zod validation schemas to ensure they properly validate form inputs.
 */
import { describe, it, expect } from 'vitest';
import { loginSchema } from '../validations/auth';
import { addItemSchema } from '../validations/tracking';
import { addUserSchema } from '../validations/admin';

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        partnerNumber: 'admin001',
        pin: '1234',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);

      if (result.success) {
        // Should transform to uppercase
        expect(result.data.partnerNumber).toBe('ADMIN001');
      }
    });

    it('should trim and uppercase partner number', () => {
      const data = {
        partnerNumber: '  admin001  ',
        pin: '1234',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.partnerNumber).toBe('ADMIN001');
      }
    });

    it('should reject empty partner number', () => {
      const data = {
        partnerNumber: '',
        pin: '1234',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Partner number is required');
      }
    });

    it('should reject PIN that is not 4 digits', () => {
      const data = {
        partnerNumber: 'admin001',
        pin: '123', // Only 3 digits
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.errors[0].message).toBe('PIN must be exactly 4 digits');
      }
    });

    it('should reject PIN with non-numeric characters', () => {
      const data = {
        partnerNumber: 'admin001',
        pin: 'abcd',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.errors[0].message).toBe('PIN must contain only digits');
      }
    });
  });
});

describe('Tracking Validation Schemas', () => {
  describe('addItemSchema', () => {
    it('should validate correct item data', () => {
      const validData = {
        itemName: 'Coffee Beans',
        category: 'coffee_beans' as const,
      };

      const result = addItemSchema.safeParse(validData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.itemName).toBe('Coffee Beans');
        expect(result.data.category).toBe('coffee_beans');
      }
    });

    it('should trim item name', () => {
      const data = {
        itemName: '  Coffee Beans  ',
        category: 'coffee_beans' as const,
      };

      const result = addItemSchema.safeParse(data);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.itemName).toBe('Coffee Beans');
      }
    });

    it('should reject empty item name', () => {
      const data = {
        itemName: '',
        category: 'coffee_beans' as const,
      };

      const result = addItemSchema.safeParse(data);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Item name is required');
      }
    });

    it('should reject invalid category', () => {
      const data = {
        itemName: 'Coffee Beans',
        category: 'invalid_category',
      };

      const result = addItemSchema.safeParse(data);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Please select a valid category');
      }
    });
  });
});

describe('Admin Validation Schemas', () => {
  describe('addUserSchema', () => {
    it('should validate correct user data with matching PINs', () => {
      const validData = {
        partnerNumber: 'part001',
        name: 'John Doe',
        pin: '1234',
        confirmPin: '1234',
        role: 'staff' as const,
      };

      const result = addUserSchema.safeParse(validData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.partnerNumber).toBe('PART001'); // Should be uppercased
        expect(result.data.name).toBe('John Doe');
      }
    });

    it('should trim and uppercase partner number', () => {
      const data = {
        partnerNumber: '  part001  ',
        name: 'John Doe',
        pin: '1234',
        confirmPin: '1234',
        role: 'staff' as const,
      };

      const result = addUserSchema.safeParse(data);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.partnerNumber).toBe('PART001');
      }
    });

    it('should trim name', () => {
      const data = {
        partnerNumber: 'part001',
        name: '  John Doe  ',
        pin: '1234',
        confirmPin: '1234',
        role: 'staff' as const,
      };

      const result = addUserSchema.safeParse(data);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.name).toBe('John Doe');
      }
    });

    it('should reject mismatched PINs', () => {
      const data = {
        partnerNumber: 'part001',
        name: 'John Doe',
        pin: '1234',
        confirmPin: '5678',
        role: 'staff' as const,
      };

      const result = addUserSchema.safeParse(data);
      expect(result.success).toBe(false);

      if (!result.success) {
        const pinError = result.error.errors.find(e => e.path[0] === 'confirmPin');
        expect(pinError?.message).toBe('PINs do not match');
      }
    });

    it('should reject invalid role', () => {
      const data = {
        partnerNumber: 'part001',
        name: 'John Doe',
        pin: '1234',
        confirmPin: '1234',
        role: 'superadmin', // Invalid role
      };

      const result = addUserSchema.safeParse(data);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Please select a valid role');
      }
    });
  });
});
