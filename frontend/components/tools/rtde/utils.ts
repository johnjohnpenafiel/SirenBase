/**
 * RTDE Tool - Validation Utilities
 *
 * Helper functions for validation, calculations, and state management in the RTD&E workflow.
 *
 * KEY BUSINESS LOGIC:
 * - Validation ensures data integrity before phase transitions (counting → pulling)
 * - Need quantity calculations determine what items to pull from BOH
 * - Progress tracking provides user feedback during counting/pulling workflow
 */

import type { RTDEItem, ValidationResult, RTDEPullItem } from "./types";

/**
 * Validate All Items Counted - Phase Transition Check
 *
 * Checks if all items have been counted before transitioning to pull phase.
 *
 * Business Logic:
 * - If validation fails, user sees dialog with 2 options:
 *   1. "Go Back & Count" → Jump to first uncounted item
 *   2. "Continue" → Proceed to pull phase (uncounted items excluded from pull list)
 *
 * Detection Strategy:
 * - Uncounted items have countedQuantity === null (frontend representation)
 * - Counted items have countedQuantity === number (0 or positive integer)
 *
 * @param items - Full list of RTD&E items from session
 * @returns ValidationResult with allCounted flag and uncountedItems list
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
 * Generate Pull List - Filter Items Needing Restocking
 *
 * Creates the pull list shown in pulling phase from full item inventory.
 *
 * Filtering Strategy:
 * - Only includes COUNTED items where needQuantity > 0 (display needs restocking)
 * - UNCOUNTED items (countedQuantity === null) are EXCLUDED entirely
 * - Items at or above par level are excluded (display is fully stocked)
 * - Transforms full RTDEItem to lightweight RTDEPullItem (only pull-relevant fields)
 *
 * Business Logic:
 * - needQuantity is calculated as: parLevel - countedQuantity
 * - Staff pulls needQuantity items from BOH to restock display
 * - Empty pull list = "All items at par!" empty state
 * - Uncounted items are excluded so users can count only items they need to restock
 *
 * Example:
 * - Item A: parLevel=10, counted=7 → needQuantity=3 → INCLUDED in pull list
 * - Item B: parLevel=10, counted=10 → needQuantity=0 → EXCLUDED (at par)
 * - Item C: parLevel=10, counted=null → EXCLUDED (not counted)
 *
 * @param items - Full RTD&E item list (all items from session)
 * @returns Filtered pull list with only counted items needing restocking
 */
export function generatePullList(items: RTDEItem[]): RTDEPullItem[] {
  return items
    .filter((item) => item.countedQuantity !== null && item.needQuantity > 0)
    .map((item) => ({
      itemId: item.itemId,
      name: item.name,
      brand: item.brand,
      imageFilename: item.imageFilename,
      icon: item.icon,
      needQuantity: item.needQuantity,
      isPulled: item.isPulled,
    }));
}

/**
 * Calculate Need Quantity - Core Business Logic
 *
 * Determines how many items to pull from BOH to reach par level.
 *
 * Formula:
 * needQuantity = max(0, parLevel - countedQuantity)
 *
 * Business Rules:
 * - parLevel: Target quantity for display (set by admin)
 * - countedQuantity: Current quantity on display (counted by staff)
 * - needQuantity: Gap between target and current (what to pull)
 *
 * Examples:
 * - Par=10, Counted=7  → Need=3  (pull 3 from BOH)
 * - Par=10, Counted=10 → Need=0  (at par, don't pull)
 * - Par=10, Counted=12 → Need=0  (overstocked, still don't pull - never negative)
 *
 * Edge Cases:
 * - countedQuantity=null → Calculated as need=parLevel, but item is excluded from pull list
 * - Overstocked items (counted > par) → Returns 0, not negative
 *
 * @param parLevel - Target quantity for display (admin-configured)
 * @param countedQuantity - Current quantity on display (null if uncounted)
 * @returns Number of items to pull from BOH (never negative)
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
 * Check If Item Has Been Counted
 *
 * Type guard for distinguishing counted vs uncounted items.
 *
 * Business Logic:
 * - Uncounted: countedQuantity === null (not yet counted)
 * - Counted: countedQuantity === number (0 or positive, intentionally counted)
 *
 * Use Cases:
 * - Sidebar/drawer navigation: Show red dot (uncounted) vs green checkmark (counted)
 * - Progress tracking: Count how many items are completed
 * - Validation: Ensure all items counted before pull phase transition
 *
 * @param item - RTD&E item to check
 * @returns true if item has been counted (countedQuantity is a number), false otherwise
 */
export function isItemCounted(item: RTDEItem): boolean {
  return item.countedQuantity !== null && item.countedQuantity !== undefined;
}

/**
 * Format Count for Display
 *
 * Converts countedQuantity to user-friendly display string.
 *
 * Display Rules:
 * - Uncounted (null) → "-" (dash indicating "not yet counted")
 * - Counted (0+) → "0", "1", "2", etc. (actual count as string)
 *
 * Used in:
 * - Sidebar/drawer item previews
 * - Summary displays
 *
 * @param countedQuantity - Count value (null if uncounted)
 * @returns Display string: "-" for uncounted, number string for counted
 */
export function formatCountDisplay(countedQuantity: number | null): string {
  if (countedQuantity === null || countedQuantity === undefined) {
    return "-";
  }
  return countedQuantity.toString();
}

/**
 * Calculate Progress Percentage
 *
 * Converts current/total counts to percentage for progress bars.
 *
 * Rounding:
 * - Math.round() ensures whole number percentages (no decimals)
 * - Example: 7/10 = 70%, 1/3 = 33%
 *
 * Edge Cases:
 * - total=0 → Returns 0% (prevents division by zero)
 *
 * Used in:
 * - Counting phase: (countedItems / totalItems) * 100
 * - Pulling phase: (pulledItems / pullListItems) * 100
 *
 * @param current - Number of completed items
 * @param total - Total number of items
 * @returns Progress percentage (0-100, rounded to whole number)
 */
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

/**
 * Get Count of Counted Items
 *
 * Calculates how many items have been counted for counting phase progress tracking.
 *
 * Progress Calculation:
 * - countedCount = getCountedItemsCount(items)
 * - totalCount = items.length
 * - progress = calculateProgress(countedCount, totalCount)
 *
 * Used in:
 * - Counting phase progress bar
 * - Session page state calculations
 *
 * @param items - Full RTD&E item list
 * @returns Count of items with countedQuantity !== null
 */
export function getCountedItemsCount(items: RTDEItem[]): number {
  return items.filter(isItemCounted).length;
}

/**
 * Get Count of Pulled Items (Pull List)
 *
 * Calculates pulling phase progress from filtered pull list.
 *
 * Progress Calculation:
 * - pulledCount = getPulledCountFromPullList(pullList)
 * - totalNeeded = pullList.length
 * - progress = calculateProgress(pulledCount, totalNeeded)
 *
 * Used in:
 * - Pulling phase progress bar
 * - Completion validation (allPulled = pulledCount === pullList.length)
 *
 * @param pullList - Filtered pull list (only items with needQuantity > 0)
 * @returns Count of items where isPulled === true
 */
export function getPulledCountFromPullList(pullList: RTDEPullItem[]): number {
  return pullList.filter((item) => item.isPulled).length;
}
