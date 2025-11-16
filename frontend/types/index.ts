/**
 * SirenBase - TypeScript Type Definitions
 * Shared types for the entire application
 */

// ============================================================================
// User Types
// ============================================================================

export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  partner_number: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Item Types (Tracking Tool)
// ============================================================================

export type ItemCategory =
  | 'syrups'
  | 'sauces'
  | 'coffee_beans'
  | 'powders'
  | 'cups'
  | 'lids'
  | 'condiments'
  | 'cleaning_supplies'
  | 'other';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  code: string; // 4-digit unique code
  added_by: string; // user ID
  added_at: string;
  is_removed: boolean;
  removed_at: string | null;
  removed_by: string | null;
}

// ============================================================================
// History Types (Tracking Tool)
// ============================================================================

export type HistoryAction = 'ADD' | 'REMOVE';

export interface HistoryEntry {
  id: string;
  action: HistoryAction;
  item_name: string;
  item_code: string;
  user_id: string;
  user_name: string; // Joined from users table
  timestamp: string;
  notes: string | null;
}

// ============================================================================
// API Response Types
// ============================================================================

// Authentication
export interface LoginRequest {
  partner_number: string;
  pin: string;
}

export interface LoginResponse {
  token: string; // Backend returns "token", not "access_token"
  user: User; // Full user object from backend
}

export interface SignupRequest {
  partner_number: string;
  name: string;
  pin: string;
}

export interface SignupResponse {
  message: string;
  user: User; // Full user object from backend
}

// Items
export interface GetItemsResponse {
  items: Item[];
}

export interface CreateItemRequest {
  name: string;
  category: ItemCategory;
  code?: string; // Optional: frontend can provide pre-generated code
}

export interface CreateItemResponse {
  item: Item;
  message: string;
}

export interface DeleteItemResponse {
  message: string;
}

// Item Search (Autocomplete)
export interface ItemSuggestion {
  name: string;
  source: 'existing' | 'template';
  code?: string; // Only present for 'existing' items
}

export interface SearchItemNamesResponse {
  suggestions: ItemSuggestion[];
}

// History
export interface GetHistoryResponse {
  history: HistoryEntry[];
}

// Admin
export interface GetUsersResponse {
  users: User[];
}

export interface CreateUserRequest {
  partner_number: string;
  name: string;
  pin: string;
  role?: UserRole; // Optional, defaults to 'staff'
}

export interface CreateUserResponse {
  message: string;
  user: User;
}

export interface DeleteUserResponse {
  message: string;
}

// Error Response
export interface ErrorResponse {
  error: string | Record<string, string[]>; // Can be string or validation errors
}

// ============================================================================
// UI State Types
// ============================================================================

export type ViewMode = 'categories' | 'all' | 'filtered';

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}
