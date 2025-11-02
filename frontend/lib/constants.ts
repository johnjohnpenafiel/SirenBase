/**
 * SirenBase - Application Constants
 * Global constants and configuration values
 */

import type { ItemCategory } from '@/types';

// ============================================================================
// API Configuration
// ============================================================================

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ============================================================================
// Item Categories (matches backend)
// ============================================================================

export const ITEM_CATEGORIES: readonly ItemCategory[] = [
  'syrups',
  'sauces',
  'coffee_beans',
  'powders',
  'cups',
  'lids',
  'condiments',
  'cleaning_supplies',
  'other',
] as const;

// Category display names (formatted for UI)
export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  syrups: 'Syrups',
  sauces: 'Sauces',
  coffee_beans: 'Coffee Beans',
  powders: 'Powders',
  cups: 'Cups',
  lids: 'Lids',
  condiments: 'Condiments',
  cleaning_supplies: 'Cleaning Supplies',
  other: 'Other',
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format category for display
 * @param category - Category key (e.g., 'coffee_beans')
 * @returns Formatted string (e.g., 'Coffee Beans')
 */
export function formatCategory(category: ItemCategory): string {
  return CATEGORY_LABELS[category] || category;
}

/**
 * Validate if a string is a valid category
 * @param value - String to validate
 * @returns True if valid category
 */
export function isValidCategory(value: string): value is ItemCategory {
  return ITEM_CATEGORIES.includes(value as ItemCategory);
}

// ============================================================================
// Pagination
// ============================================================================

export const HISTORY_PAGE_SIZE = 20; // Items per page for history
export const HISTORY_MAX_FETCH = 500; // Maximum entries to fetch at once

// ============================================================================
// Local Storage Keys
// ============================================================================

export const AUTH_TOKEN_KEY = 'sirenbase_auth_token';
export const USER_DATA_KEY = 'sirenbase_user_data';
