/**
 * RTDE Tool - Validation Utilities
 *
 * Helper functions for validation and state management
 */

import type { RTDEItem, ValidationResult, RTDEPullItem } from "./types";

/**
 * Check if all items have been counted
 * Returns validation result with list of uncounted items
 */
export function validateAllItemsCounted(items: RTDEItem[]): ValidationResult {
  const uncountedItems = items.filter(
    (item) => item.countedQuantity === null || item.countedQuantity === undefined
  );

  return {
    allCounted: uncountedItems.length === 0,
    uncountedItems,
  };
}

/**
 * Assign 0 to all uncounted items
 * Returns updated items array
 */
export function assignZeroToUncounted(items: RTDEItem[]): RTDEItem[] {
  return items.map((item) => ({
    ...item,
    countedQuantity:
      item.countedQuantity === null || item.countedQuantity === undefined
        ? 0
        : item.countedQuantity,
  }));
}

/**
 * Calculate pull list from items
 * Returns only items that need restocking (needQuantity > 0)
 */
export function generatePullList(items: RTDEItem[]): RTDEPullItem[] {
  return items
    .filter((item) => item.needQuantity > 0)
    .map((item) => ({
      itemId: item.itemId,
      name: item.name,
      icon: item.icon,
      needQuantity: item.needQuantity,
      isPulled: item.isPulled,
    }));
}

/**
 * Calculate need quantity for an item
 * needQuantity = parLevel - countedQuantity
 */
export function calculateNeedQuantity(
  parLevel: number,
  countedQuantity: number | null
): number {
  const counted = countedQuantity ?? 0;
  const need = parLevel - counted;
  return Math.max(0, need); // Never negative
}

/**
 * Check if an item has been counted
 * Returns true if countedQuantity is not null/undefined
 */
export function isItemCounted(item: RTDEItem): boolean {
  return item.countedQuantity !== null && item.countedQuantity !== undefined;
}

/**
 * Format count for display
 * Returns "-" for uncounted, number string for counted
 */
export function formatCountDisplay(countedQuantity: number | null): string {
  if (countedQuantity === null || countedQuantity === undefined) {
    return "-";
  }
  return countedQuantity.toString();
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

/**
 * Get count of items that have been counted
 */
export function getCountedItemsCount(items: RTDEItem[]): number {
  return items.filter(isItemCounted).length;
}

/**
 * Get count of items that have been pulled (from full item list)
 */
export function getPulledItemsCount(items: RTDEItem[]): number {
  return items.filter((item) => item.isPulled).length;
}

/**
 * Get count of pulled items from pull list
 */
export function getPulledCountFromPullList(pullList: RTDEPullItem[]): number {
  return pullList.filter((item) => item.isPulled).length;
}
