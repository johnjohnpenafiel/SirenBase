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
  brand?: string | null; // Brand name (e.g., "Evolution") - displayed above item name
  image_filename?: string | null; // Product image filename (e.g., "ethos-water.jpeg") - managed by engineering
  icon?: string | null; // Emoji (🥪, 🥤, etc.) - optional fallback
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
  brand?: string | null; // Brand name (e.g., "Evolution") - displayed above item name
  image_filename?: string | null; // Product image filename - managed by engineering
  icon?: string | null; // Emoji - optional fallback
  par_level: number;
  display_order: number;
  counted_quantity: number;
  need_quantity: number; // Calculated: par_level - counted_quantity
  is_pulled: boolean;
}

export interface RTDEPullListItem {
  item_id: string;
  name: string;
  brand?: string | null; // Brand name (e.g., "Evolution") - displayed above item name
  image_filename?: string | null; // Product image filename - managed by engineering
  icon?: string | null; // Emoji - optional fallback
  need_quantity: number;
  is_pulled: boolean;
}

// RTD&E Admin API Types
export interface GetRTDEItemsResponse {
  items: RTDEItem[];
}

export interface CreateRTDEItemRequest {
  name: string;
  brand?: string;
  image_filename?: string; // Optional - managed by engineering
  icon?: string; // Optional - emoji fallback
  par_level: number;
}

export interface CreateRTDEItemResponse {
  item: RTDEItem;
  message: string;
}

export interface UpdateRTDEItemRequest {
  name?: string;
  brand?: string | null;
  image_filename?: string | null; // Optional - managed by engineering
  icon?: string | null; // Optional - emoji fallback
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

export interface GetRTDELastCompletedResponse {
  last_completed_at: string | null;
  user_name?: string;
}

// ============================================================================
// Milk Order Types (Tool 2)
// ============================================================================

export type MilkCategory = 'dairy' | 'non_dairy';

export type MilkOrderSessionStatus = 'night_foh' | 'night_boh' | 'morning' | 'on_order' | 'completed';

export type MilkOrderMorningMethod = 'boh_count' | 'direct_delivered';

export interface MilkType {
  id: string;
  name: string;
  category: MilkCategory;
  display_order: number;
  active: boolean;
  par_value?: number; // Included when include_par=true
  created_at: string;
  updated_at: string;
}

export interface MilkOrderParLevel {
  id: string;
  milk_type_id: string;
  milk_type_name: string;
  milk_type_category: MilkCategory;
  par_value: number;
  updated_at: string;
  updated_by?: string;
  updated_by_name?: string;
}

export interface MilkOrderSession {
  id: string;
  date: string; // YYYY-MM-DD format
  status: MilkOrderSessionStatus;
  night_count_user_id?: string;
  night_count_user_name?: string;
  morning_count_user_id?: string;
  morning_count_user_name?: string;
  night_foh_saved_at?: string;
  night_boh_saved_at?: string;
  morning_saved_at?: string;
  on_order_saved_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface MilkOrderEntry {
  id: string;
  session_id: string;
  milk_type_id: string;
  milk_type_name: string;
  milk_type_category: MilkCategory;
  foh_count: number | null;
  boh_count: number | null;
  morning_method: MilkOrderMorningMethod | null;
  current_boh: number | null;
  delivered: number | null;
  on_order: number | null;
  updated_at: string;
}

export interface MilkOrderSummaryEntry {
  milk_type: string;
  category: MilkCategory;
  foh: number;
  boh: number;
  delivered: number;
  on_order: number;
  total: number;
  par: number;
  order: number;
}

export interface MilkOrderSummaryTotals {
  total_foh: number;
  total_boh: number;
  total_delivered: number;
  total_on_order: number;
  total_inventory: number;
  total_order: number;
}

// Milk Order Admin API Types
export interface GetMilkTypesResponse {
  milk_types: MilkType[];
}

export interface UpdateMilkTypeRequest {
  display_order?: number;
  active?: boolean;
}

export interface UpdateMilkTypeResponse {
  message: string;
  milk_type: MilkType;
}

export interface GetParLevelsResponse {
  par_levels: MilkOrderParLevel[];
}

export interface UpdateParLevelRequest {
  par_value: number;
}

export interface UpdateParLevelResponse {
  message: string;
  par_level: MilkOrderParLevel;
}

// Milk Order Session API Types
export interface GetTodaySessionResponse {
  session: MilkOrderSession | null;
}

export interface StartMilkOrderSessionResponse {
  message: string;
  session: MilkOrderSession;
}

export interface GetMilkOrderSessionResponse {
  session: MilkOrderSession;
  entries: MilkOrderEntry[];
}

export interface MilkOrderNightCount {
  milk_type_id: string;
  foh_count?: number;
  boh_count?: number;
}

export interface SaveNightFOHRequest {
  counts: Array<{ milk_type_id: string; foh_count: number }>;
}

export interface SaveNightBOHRequest {
  counts: Array<{ milk_type_id: string; boh_count: number }>;
}

export interface MilkOrderMorningCount {
  milk_type_id: string;
  method: MilkOrderMorningMethod;
  current_boh?: number; // Required if method is 'boh_count'
  delivered?: number; // Required if method is 'direct_delivered'
}

export interface SaveMorningCountRequest {
  counts: MilkOrderMorningCount[];
}

export interface MilkOrderOnOrder {
  milk_type_id: string;
  on_order: number;
}

export interface SaveOnOrderRequest {
  on_orders: MilkOrderOnOrder[];
}

export interface SaveMilkOrderResponse {
  message: string;
  session: MilkOrderSession;
}

export interface GetMilkOrderSummaryResponse {
  session: MilkOrderSession;
  summary: MilkOrderSummaryEntry[];
  totals: MilkOrderSummaryTotals;
}

export interface GetMilkOrderHistoryResponse {
  sessions: MilkOrderSession[];
  total: number;
  limit: number;
  offset: number;
}

// Milk order UI state - map of milk type ID to count value
export interface MilkOrderState {
  [milkTypeId: string]: number;
}

// ============================================================================
// Activity Feed Types
// ============================================================================

export type DashboardActivityType =
  | 'inventory_add'
  | 'inventory_remove'
  | 'rtde_completed'
  | 'milk_order_foh'
  | 'milk_order_boh'
  | 'milk_order_morning'
  | 'milk_order_completed';

export type AdminActivityType =
  | 'user_created'
  | 'user_deleted'
  | 'milk_par_updated'
  | 'rtde_item_created'
  | 'rtde_item_updated'
  | 'rtde_item_deleted';

export interface DashboardActivity {
  id: string;
  type: DashboardActivityType;
  title: string;
  description: string;
  user_name: string;
  timestamp: string;
  tool: 'inventory' | 'milk-order' | 'rtde';
}

export interface AdminActivity {
  id: string;
  type: AdminActivityType;
  title: string;
  description: string;
  admin_name: string;
  timestamp: string;
}

export interface GetRecentActivityResponse {
  activities: DashboardActivity[];
  count: number;
}

export interface GetAdminActivityResponse {
  activities: AdminActivity[];
  count: number;
}

// ============================================================================
// UI State Types
// ============================================================================

export type ViewMode = 'categories' | 'all' | 'filtered';
