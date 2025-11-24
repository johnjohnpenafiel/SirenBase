/**
 * RTDE Tool - TypeScript Type Definitions
 *
 * Shared types for the RTD&E counting and pulling workflow
 */

// Session phase enum
export type RTDESessionPhase = "counting" | "pulling";

// Enhanced item interface with counted state
export interface RTDEItem {
  itemId: string;
  name: string;
  icon: string;
  parLevel: number;
  displayOrder: number;
  countedQuantity: number | null; // null = not counted, 0 = counted as zero
  needQuantity: number;
  isPulled: boolean;
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
  icon: string;
  needQuantity: number;
  isPulled: boolean;
}
