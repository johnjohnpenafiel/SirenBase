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
// RTD&E Types (Tool 3)
// ============================================================================

export interface RTDEItem {
  id: string;
  name: string;
  icon: string; // Emoji (🥪, 🥤, etc.)
  par_level: number;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RTDESession {
  id: string;
  started_at: string;
  expires_at: string;
  status: 'in_progress' | 'completed' | 'expired';
}

// Fix [BUG-007]: Extended session data with items array for UI state
export interface RTDESessionWithItems extends RTDESession {
  items: RTDESessionItem[];
}

export interface RTDESessionItem {
  item_id: string;
  name: string;
  icon: string;
  par_level: number;
  display_order: number;
  counted_quantity: number;
  need_quantity: number; // Calculated: par_level - counted_quantity
  is_pulled: boolean;
}

export interface RTDEPullListItem {
  item_id: string;
  name: string;
  icon: string;
  need_quantity: number;
  is_pulled: boolean;
}

// RTD&E Admin API Types
export interface GetRTDEItemsResponse {
  items: RTDEItem[];
}

export interface CreateRTDEItemRequest {
  name: string;
  icon: string;
  par_level: number;
}

export interface CreateRTDEItemResponse {
  item: RTDEItem;
  message: string;
}

export interface UpdateRTDEItemRequest {
  name?: string;
  icon?: string;
  par_level?: number;
  active?: boolean;
}

export interface UpdateRTDEItemResponse {
  item: RTDEItem;
  message: string;
}

export interface DeleteRTDEItemResponse {
  message: string;
}

export interface ReorderRTDEItemsRequest {
  item_orders: Array<{ id: string; display_order: number }>;
}

export interface ReorderRTDEItemsResponse {
  message: string;
}

// RTD&E Session API Types
export interface RTDEActiveSessionSummary {
  id: string;
  started_at: string;
  expires_at: string;
  items_counted: number;
  total_items: number;
}

export interface GetRTDEActiveSessionResponse {
  session: RTDEActiveSessionSummary | null;
}

export interface StartRTDESessionRequest {
  action?: 'new' | 'resume'; // Optional: defaults to 'new' on backend
}

export interface StartRTDESessionResponse {
  session_id: string;
  expires_at: string;
}

export interface GetRTDESessionResponse {
  session: RTDESession;
  items: RTDESessionItem[];
}

export interface UpdateRTDECountRequest {
  item_id: string;
  counted_quantity: number;
}

export interface UpdateRTDECountResponse {
  message: string;
  counted_quantity: number;
}

// RTD&E Pull List API Types
export interface GetRTDEPullListResponse {
  pull_list: RTDEPullListItem[];
  total_items: number;
  items_pulled: number;
}

export interface MarkRTDEItemPulledRequest {
  item_id: string;
  is_pulled: boolean;
}

export interface MarkRTDEItemPulledResponse {
  message: string;
}

export interface CompleteRTDESessionResponse {
  message: string;
}

// ============================================================================
// UI State Types
// ============================================================================

export type ViewMode = 'categories' | 'all' | 'filtered';
