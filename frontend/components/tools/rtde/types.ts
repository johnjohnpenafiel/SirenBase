/**
 * RTDE Tool - TypeScript Type Definitions
 *
 * Shared types for the RTD&E counting and pulling workflow
 */

/**
 * Session Phase Type
 *
 * Represents the two distinct phases of the RTDE session workflow:
 * - "counting": User is counting display items one-by-one
 * - "pulling": User is pulling items from BOH based on needs
 *
 * Phase transitions are managed by the session page orchestrator.
 * UI components (RTDECountingPhase, RTDEPullingPhase) are conditionally
 * rendered based on this phase state.
 */
export type RTDESessionPhase = "counting" | "pulling";

/**
 * Enhanced RTDE Item Interface
 *
 * Represents a single RTD&E display item with counting state.
 *
 * KEY DESIGN DECISION - Counting Strategy:
 * - Backend stores `counted_quantity` as number (defaults to 0)
 * - Frontend treats 0 as "uncounted" (converts to null)
 * - This allows distinguishing between "not counted yet" vs "counted as zero"
 *
 * Example:
 * - Item created: backend=0, frontend=null (red dot, not counted)
 * - User counts as 5: backend=5, frontend=5 (green checkmark)
 * - User counts as 0: backend=0, frontend=0 (green checkmark, intentionally zero)
 *
 * This pattern enables validation before pull phase transition.
 */
export interface RTDEItem {
  itemId: string;
  name: string; // Display name (e.g., "Egg & Cheese Sandwich")
  brand?: string | null; // Brand name (e.g., "Evolution") - displayed above item name
  icon: string; // Emoji icon for visual recognition (e.g., "🥪")
  parLevel: number; // Target quantity for display
  displayOrder: number; // Order in counting sequence
  countedQuantity: number | null; // null = uncounted, 0+ = counted value
  needQuantity: number; // Calculated: parLevel - countedQuantity
  isPulled: boolean; // Marked as pulled during pull phase
}

// Session state interface
export interface RTDESessionState {
  sessionId: string;
  startedAt: string;
  expiresAt: string;
  status: string;
  items: RTDEItem[];
}

// Session with phase tracking
export interface RTDESessionWithPhase extends RTDESessionState {
  phase: RTDESessionPhase;
  currentItemIndex: number;
}

// Validation result
export interface ValidationResult {
  allCounted: boolean;
  uncountedItems: RTDEItem[];
}

// Pull list item (items that need restocking)
export interface RTDEPullItem {
  itemId: string;
  name: string;
  brand?: string | null; // Brand name (e.g., "Evolution") - displayed above item name
  icon: string;
  needQuantity: number;
  isPulled: boolean;
}
