# SirenBase - Task Tracker

This document contains clear, actionable tasks for building the SirenBase multi-tool platform. Tasks are organized by tool and development phase, with checkboxes for tracking progress.

**Note**: See `PLANNING.md` for overall architecture, `BUGS.md` for active bugs and technical debt, and individual tool docs (`Planning/InventoryTracking.md`, `Planning/MilkCount.md`, `Planning/RTDE.md`) for detailed feature planning.

---

## Phase 0: Project Setup & Research ✅ COMPLETED (October 11, 2025)

### Environment Setup

- [x] Verify PostgreSQL installation
  - Check PostgreSQL is running: `psql --version` ✅ PostgreSQL 17.4
  - Test connection with `psql` or a GUI tool (pgAdmin, Postico, DBeaver) ✅
  - Create database: `createdb sirenbase` or via GUI tool ✅
- [x] Create project directories (already done: `frontend/`, `backend/`)
- [x] Initialize Git repository and create `.gitignore` files
  - Backend: Ignore `venv/`, `__pycache__/`, `.env`, `*.pyc` ✅
  - Frontend: Ignore `node_modules/`, `.next/`, `.env.local` ✅
  - Root: Added `.gitignore` for project-level files ✅
- [x] Set up GitHub repository
  - Repository active on `main` branch ✅
  - All Phase 0 work committed and pushed ✅

### Backend Setup (Flask)

- [x] Create Python virtual environment
  - Python 3.12.9 with venv ✅
- [x] Install initial dependencies
  - Flask 3.1.2, SQLAlchemy 2.0.44, JWT, CORS, Marshmallow, bcrypt ✅
  - psycopg2-binary 2.9.11 for PostgreSQL ✅
- [x] Create `requirements.txt`
  - All 21 dependencies documented ✅
- [x] Set up basic Flask project structure
  - Application factory pattern implemented ✅
  - Modular structure: models/, routes/, schemas/, middleware/, utils/ ✅
  - Extensions initialized: db, jwt, migrate ✅
  - Global error handlers registered ✅
- [x] Create `.env.example` file with required variables ✅
- [x] Copy to `.env` and fill with actual PostgreSQL credentials
  - Configured for user `johnpenafiel` with sirenbase database ✅

### Frontend Setup (Next.js)

- [x] Initialize Next.js project with TypeScript
  - Next.js 15.5.4 with App Router ✅
  - TypeScript 5.x configured ✅
  - Tailwind CSS 4.0 integrated ✅
- [x] Install additional dependencies
  - Axios 1.7.9 for API calls ✅
- [x] Install ShadCN UI
  - Initialized with default Neutral theme ✅
  - components.json configured ✅
  - lib/utils.ts created ✅
- [x] Set up Next.js project structure
  - app/ directory with layout and pages ✅
  - components/ with subdirectories (ui, layout, inventory, auth, history, admin) ✅
  - hooks/, types/, lib/ directories created ✅
- [x] Create `.env.local.example` ✅
- [x] Copy to `.env.local`
  - API URL configured: http://localhost:5000/api ✅

### Documentation

- [x] Update main `README.md` with project overview
  - Comprehensive setup instructions ✅
  - Running commands for both apps ✅
  - Environment variables documented ✅
  - Project structure overview ✅
- [x] ~~Create `backend/README.md` with setup instructions~~
  - **Decision**: Deferred to Phase 2 (after API endpoints implemented)
  - **Rationale**: Backend README more valuable with actual features to document; root README covers all setup needs for now
- [x] Update `frontend/README.md` with environment variable reference
  - Added env var section pointing to `.env.local.example` ✅
  - Links to main README for full documentation ✅

---

## Phase 1: Database Schema Design ✅ COMPLETED (October 17, 2025)

### Design Database Tables

- [x] Design `users` table schema

  - id (UUID, primary key)
  - partner_number (String, unique, not null)
  - name (String, not null)
  - pin_hash (String, not null)
  - role (Enum: 'admin', 'staff')
  - created_at (Timestamp)
  - updated_at (Timestamp)

- [x] Design `items` table schema ✅

  - id (UUID, primary key)
  - name (String, not null)
  - **category (String, not null, indexed)** ← Added October 17, 2025
  - code (String, unique, not null, 4 characters)
  - added_by (UUID, foreign key to users.id)
  - added_at (Timestamp)
  - is_removed (Boolean, for soft deletes)
  - removed_at (Timestamp, nullable)
  - removed_by (UUID, foreign key to users.id, nullable)

- [x] Design `history` table schema ✅

  - id (UUID, primary key)
  - action (Enum: 'ADD', 'REMOVE')
  - item_name (String, not null)
  - item_code (String, not null)
  - user_id (UUID, foreign key to users.id)
  - timestamp (Timestamp)
  - notes (Text, nullable)

- [x] Document relationships ✅
  - users → items (one-to-many: one user can add many items)
  - users → history (one-to-many: one user has many history entries)
  - Documented in `backend/app/models/__init__.py`

### Implement Database Models

- [x] Create SQLAlchemy models in `backend/app/models/` ✅
  - User model with password hashing methods (`models/user.py`)
  - Item model with soft delete support + **category field** (`models/item.py`)
  - History model with helper methods (`models/history.py`)
  - All models using SQLAlchemy 2.0 syntax with type hints
  - Category validation via constants file + Marshmallow schema (String + Validation approach)
  - See `ChangeLog/CATEGORY_FIELD_DECISION.md` for rationale
- [x] Set up Flask-Migrate for migrations ✅
  - Flask-Migrate 4.1.0 already installed
  - Initialized with `flask db init`
- [x] Configure migrations to detect models ✅
  - Models imported in `app/__init__.py`
- [x] Create initial migration ✅
  - Migration file: `95337b169892_initial_schema_users_items_and_history_.py`
  - Includes all tables, indexes, and foreign keys
- [x] Review and apply migration ✅
  - Migration reviewed and verified
  - Applied with `flask db upgrade`
  - All tables created successfully

### Seed Database

- [x] Create database seeding script (`backend/seed.py`) ✅
  - Admin user creation (ADMIN001, PIN: 1234)
  - Test staff user creation (TEST123, PIN: 5678)
  - Sample items with unique 4-digit codes
  - History entries for all actions
  - Support for `--with-test-data` and `--clear` flags
- [x] Run seed script to populate initial data ✅
  - Created 2 users (1 admin, 1 staff)
  - Created 5 test items
  - Created 5 history entries
- [x] Verify data in PostgreSQL ✅
  - All tables populated correctly
  - Foreign key relationships working
  - Indexes created successfully

---

## Phase 2: Backend API Development ✅ COMPLETED (October 23, 2025)

### Authentication Endpoints ✅ COMPLETED (October 22, 2025)

- [x] Implement POST `/api/auth/login`
  - Accept partner_number and PIN ✅
  - Validate credentials ✅
  - Return JWT access token ✅
  - Return user info (name, role) ✅
- [x] Implement POST `/api/auth/signup`
  - Accept partner_number, name, PIN ✅
  - Create user account (defaults to staff role) ✅
  - Return success/error ✅
- [x] Implement GET `/api/auth/me`
  - Validate JWT token ✅
  - Return current user info ✅
- [x] Create JWT token middleware for protected routes ✅
  - `@jwt_required()` decorator working ✅
  - `admin_required` decorator for admin-only routes ✅
- [x] Test all auth endpoints ✅
  - Login with valid/invalid credentials ✅
  - Signup with new user ✅
  - Get current user with JWT ✅
  - Validation error handling ✅

### Items/Inventory Endpoints ✅ COMPLETED (October 23, 2025)

- [x] Implement GET `/api/items` ✅
  - Return all active items ✅
  - Support filtering by category ✅
  - Optional include_removed parameter ✅
  - Requires authentication ✅
- [x] Implement POST `/api/items` ✅
  - Accept item name and category ✅
  - Generate unique 4-digit code ✅
  - Save to database ✅
  - Log ADD action in history ✅
  - Return item with generated code ✅
- [x] Implement DELETE `/api/items/<code>` ✅
  - Accept item code ✅
  - Soft delete (mark as removed) ✅
  - Log REMOVE action in history ✅
  - Return success/error ✅
- [x] Create utility helper for code generation ✅
  - `generate_unique_code()` with collision detection ✅
  - `format_category_display()` for UI formatting ✅
- [x] Test all item endpoints ✅
  - Create item with valid/invalid category ✅
  - Get items with/without filtering ✅
  - Delete item (existing/non-existent) ✅
  - Authorization checks ✅
  - Validation error handling ✅

### History Endpoints ✅ COMPLETED (October 23, 2025)

- [x] Implement GET `/api/history` ✅
  - Return recent history entries (configurable limit) ✅
  - Include user name via eager loading ✅
  - Include action, item details, timestamp ✅
  - Sort by most recent first ✅
  - Requires authentication ✅
- [x] Filtering support ✅
  - Filter by user_id (optional) ✅
  - Filter by action type (ADD/REMOVE) ✅
  - Configurable limit (default 100, max 500) ✅
- [x] Test history endpoints ✅
  - Get history with/without filters ✅
  - Action filtering (ADD/REMOVE) ✅
  - Invalid action validation ✅
  - Authentication required ✅
  - Limit parameter validation ✅

### Admin Endpoints ✅ COMPLETED (October 23, 2025)

- [x] Implement GET `/api/admin/users` ✅
  - Return all users (ordered by created_at desc)
  - Requires admin role
- [x] Implement POST `/api/admin/users` ✅
  - Add new authorized user (partner_number, name, PIN, optional role)
  - Supports creating both admin and staff users
  - Requires admin role
- [x] Implement DELETE `/api/admin/users/:id` ✅
  - Remove user authorization (hard delete)
  - Prevents admins from deleting themselves
  - Requires admin role
- [x] Test admin endpoints ✅
  - GET /api/admin/users: Lists all users correctly
  - POST /api/admin/users: Creates staff and admin users
  - DELETE /api/admin/users/:id: Deletes users with safeguards
  - Authorization: Staff users properly blocked from admin endpoints
  - Self-deletion prevention working

### Error Handling & Validation ✅ COMPLETED (October 23, 2025)

- [x] Implement global error handler ✅
  - Added handlers for 400, 401, 403, 404, 409, 500 errors
  - ValidationError handler for Marshmallow validation
  - Catch-all Exception handler with production/development modes
  - All handlers return consistent JSON format
- [x] Add request validation using Marshmallow ✅
  - Marshmallow schemas already in use (LoginSchema, SignupSchema, etc.)
  - Global ValidationError handler catches all validation errors
- [x] Return consistent error response format ✅
  - All errors return: `{"error": "message or details"}`
  - Validation errors return: `{"error": {"field": ["error msg"]}}`
- [x] Test error cases ✅
  - 404: Resource not found
  - Validation errors: Empty/invalid fields
  - Unauthorized: Missing JWT tokens

### CORS Configuration ✅ COMPLETED (October 23, 2025)

- [x] Configure Flask-CORS to allow Next.js origin ✅
  - CORS configured in `app/__init__.py` line 32
  - Origins from environment variable `CORS_ORIGINS`
  - Default: `http://localhost:3000` for development
  - Supports multiple origins via comma-separated values

### Comprehensive Test Suite ✅ COMPLETED (October 23, 2025)

- [x] Created complete pytest test suite for all Phase 2 endpoints and models ✅
  - tests/conftest.py: Pytest fixtures (app, client, users, tokens, headers)
  - tests/test_models.py: 13 unit tests for User, Item, History models
  - tests/test_utils.py: 8 unit tests for helper functions
  - tests/test_auth.py: 15 integration tests for authentication endpoints
  - tests/test_items.py: 12 integration tests for inventory endpoints
  - tests/test_history.py: 6 integration tests for history endpoint
  - tests/test_admin.py: 12 integration tests for admin endpoints
  - **Total: 66/66 tests passing (100% success rate)**
  - All endpoints tested for success, error, authorization, and validation cases
  - pytest and pytest-flask added to requirements.txt
  - backend/CHECKLIST.md created to enforce systematic testing on all future features

---

## Phase 3A: Multi-Tool Architecture Setup

### Backend API Restructuring ✅ COMPLETED (October 29, 2025)

- [x] Rename existing routes to tracking namespace
  - Move `/api/items` → `/api/tracking/items` ✅
  - Move `/api/history` → `/api/tracking/history` ✅
  - Keep `/api/auth/*` as shared authentication ✅
  - Keep `/api/admin/*` as shared admin ✅
- [x] Update route blueprints
  - Create `backend/app/routes/tools/` directory ✅
  - Create `tracking.py` with consolidated routes in tools directory ✅
  - Update blueprint registration in `app/__init__.py` ✅
  - Remove obsolete `items.py` and `history.py` files ✅
  - Update `backend/app/routes/__init__.py` imports ✅
- [x] Update existing tests for new routes
  - Update all test files to use `/api/tracking/*` paths ✅
  - Verify all 66 tests still pass ✅ (Commits: 0eff74a, a4bdf11)

### Backend Database Restructuring ✅ COMPLETED (October 29, 2025)

- [x] Rename existing tables with tracking prefix
  - Rename `items` → `tracking_items` ✅
  - Rename `history` → `tracking_history` ✅
  - Create migration file ✅
  - Test migration on development database ✅
- [x] Update model files
  - Update `backend/app/models/item.py` with new table name ✅
  - Update `backend/app/models/history.py` with new table name ✅
  - All references automatically updated (no explicit route/test references to table names) ✅
- [x] Run migration and verify
  - Execute `flask db upgrade` ✅
  - Verify tables renamed successfully ✅
  - Verify foreign keys and indexes intact ✅
  - Run full test suite (66/66 passing) ✅
  - Verify data preserved (6 items, 7 history entries) ✅ (Commit: 998d434)

### Frontend Directory Restructuring ✅ COMPLETED (October 30, 2025)

- [x] Create tool-based directory structure
  - Create `frontend/app/dashboard/` for tool grid ✅
  - Create `frontend/app/tools/tracking/` for tracking tool ✅
  - Create `frontend/app/tools/milk-count/` for milk count tool (placeholder) ✅
  - Create `frontend/app/tools/rtde/` for RTD&E tool (placeholder) ✅
  - Create `frontend/app/admin/` for global admin panel ✅
  - Create `frontend/components/shared/` for shared components ✅
  - Create `frontend/components/tools/tracking/` for tracking components ✅
- [x] Move/reorganize existing component placeholders
  - Reorganized empty placeholder directories ✅
  - Removed `components/layout/` (consolidated into `components/shared/`) ✅
- [x] Create placeholder pages with basic structure
  - `app/page.tsx` - Redirects to dashboard ✅
  - `app/dashboard/page.tsx` - Tool selection grid ✅
  - `app/tools/tracking/page.tsx` - Tracking tool landing ✅
  - `app/admin/page.tsx` - Admin panel landing ✅
- [x] Create shared components
  - `components/shared/Header.tsx` ✅
  - `components/shared/Footer.tsx` ✅
  - `components/shared/ToolCard.tsx` ✅
- [x] Verify build succeeds
  - All routes build successfully ✅
  - TypeScript compilation passes ✅

### Dashboard Implementation ✅ COMPLETED (October 30, 2025)

- [x] Create Dashboard page (`app/dashboard/page.tsx`)
  - Grid layout with tool cards ✅
  - "Inventory Tracking" card → `/tools/tracking` ✅
  - "Milk Count" card (disabled/coming soon) ✅
  - "RTD&E Count" card (disabled/coming soon) ✅
  - "Admin Panel" card (visible only to admin role users) ✅
  - Icons for each tool (Package, Milk, Box, ShieldCheck from lucide-react) ✅
  - Welcome message with user name ✅
  - Loading state while checking authentication ✅
- [x] Create Tool Card component (`components/shared/ToolCard.tsx`)
  - Props: title, description, icon, route, isDisabled, isAdminOnly ✅
  - Click handler for navigation using Next.js router ✅
  - Visual states: hover, disabled, admin-only ✅
  - Styled with Tailwind CSS (no ShadCN Card needed) ✅
- [x] Implement role-based card visibility
  - Show admin card only when `user.role === 'admin'` ✅
  - Created `hooks/use-auth.ts` with minimal auth hook ✅
  - Mock user data for testing (will be replaced in Phase 3B) ✅
  - Message for non-admin users ✅
- [x] Verify build and functionality
  - Next.js build successful ✅
  - TypeScript compilation passes ✅
  - All routes working correctly ✅

### Update Documentation ✅ COMPLETED (October 30, 2025)

- [x] Update backend README (if exists) with new structure
  - Created `backend/README.md` with multi-tool architecture overview ✅
  - Flask setup instructions, API namespacing strategy, common tasks ✅
- [x] Update frontend README with new routing structure
  - Replaced boilerplate with SirenBase-specific content ✅
  - Multi-tool routing structure, component organization, development guide ✅
- [x] Update backend/CLAUDE.md with multi-tool structure
  - Updated project structure diagram with routes/tools/ subdirectory ✅
  - Updated blueprint registration examples ✅
  - Updated all code examples to use /api/tracking/* namespace ✅
- [x] Document architectural changes in `ChangeLog/`
  - Created `ChangeLog/MULTI_TOOL_ARCHITECTURE.md` ✅
  - Comprehensive documentation of all Phase 3A changes ✅
  - Includes rationale, decisions, migration guide, and verification ✅
- [x] Update root README.md with current phase status
  - Updated to show Phase 3A complete ✅
  - Added Phase 3B as current phase ✅
  - Updated last modified date to October 30, 2025 ✅
- [x] Verify PLANNING.md matches implemented architecture
  - Confirmed PLANNING.md is accurate and current ✅
  - No updates needed - already reflects multi-tool architecture ✅

---

## Phase 3B: Tool 1 Frontend Development (Tracking) - ~80% Complete

### Authentication UI ✅ COMPLETED

- [x] Create login page (`app/login/page.tsx`)
  - Partner number input
  - PIN input (masked)
  - Login button
  - Error message display
- [ ] Create signup page (if allowing self-signup)
  - Partner number input
  - Name input
  - PIN input (with confirmation)
  - Submit button
  - **Note**: Not implemented yet; users created via admin panel
- [x] Implement authentication context/provider
  - Store JWT token in localStorage or secure cookie
  - Provide `login()`, `logout()`, `isAuthenticated()` functions
  - Provide current user info
- [x] Create protected route wrapper
  - Redirect to login if not authenticated
  - Wrap inventory, history, and admin pages
- [x] Test login/logout flow

### Inventory/Items UI ✅ COMPLETED

- [x] Create inventory page (`app/tools/tracking/inventory/page.tsx`)
  - **Three view modes on single page**:
    - **Categories View** (default/home): 2-column grid of category cards with item counts
    - **All View**: Full-width list showing all items from all categories
    - **Category-Filtered View**: Click category card to view items in that category only
  - View toggle: `[All | Categories]` switching between modes
  - Mobile-first design with large, touch-friendly rectangles (min 44x44px)
  - Items display with code count (e.g., "Vanilla Syrup 3x")
  - "Add Item" functionality accessible in all views
  - "Remove Item" functionality for each item
  - Individual code display mechanism (ItemCodesDialog component)
  - Update API calls to use `/api/tracking/items`
  - **Enhancement**: Category preselection in Add Item dialog when in filtered view (commit 8960aad)
- [x] Create "Add Item" two-step flow
  - **Step 1 - Generate Code Modal/Screen**:
    - Input: Item name (max 255 characters)
    - Dropdown: Category selection (validated from predefined list)
    - **Category auto-preselected when in category-filtered view**
    - Button: "Generate Code"
  - **Step 2 - Confirm After Marking**:
    - Display generated 4-digit code prominently
    - Prompt: "Write this code on the physical item"
    - Button: "Confirm & Save" (saves item to database with history entry)
    - Cancel option available (discards code, doesn't save to database)
  - Success: Item appears in inventory list immediately
  - **Known Issue**: [BUG-001] Item saves prematurely in Step 1 (see BUGS.md)
- [x] Create "Remove Item" confirmation dialog
  - Show item name and specific code (e.g., "Remove Vanilla Syrup (Code 2847)?")
  - Buttons: "Cancel" | "Remove"
  - On confirm: Soft delete (set is_removed=true) and create history entry
- [x] Implement API calls to backend
  - GET `/api/tracking/items` - Fetch items on page load
  - POST `/api/tracking/items` - Add item (Step 2 of two-step flow)
  - DELETE `/api/tracking/items/<code>` - Remove item by code
  - Support category filtering via query params
- [x] Add loading states and error handling
  - Loading spinners during API calls
  - Toast notifications for success/error (using Sonner)
  - Handle network errors gracefully
- [x] Test complete workflows
  - Test add item flow (both steps, including cancel)
  - Test remove item flow (with confirmation)
  - Test view switching (Categories ↔ All ↔ Category-filtered)
  - Test on mobile devices (touch targets, responsive grid)
  - Test category preselection behavior

### History UI

- [ ] Create history page (`app/tools/tracking/history/page.tsx`)
  - Display recent actions in reverse chronological order
  - Show: staff name, action, item name, code, timestamp
  - Implement pagination or infinite scroll (if many entries)
  - Update API calls to use `/api/tracking/history`
- [ ] Fetch history data from backend
- [ ] Add filters (optional: by user, by date range)
- [ ] Test history display

### Global Admin Panel UI

- [ ] Create admin page (`app/admin/page.tsx`)
  - **Note**: This is the global admin panel (not tool-specific)
  - Accessible from dashboard "Admin Panel" card
  - Require admin role (redirect if not admin)
  - Display all users in a table
  - Show partner number, name, role, created date
  - Uses `/api/auth/admin/*` or `/api/admin/*` endpoints
- [ ] Add "Add User" form/modal
  - Input for partner number
  - Submit button
- [ ] Add "Remove User" button for each user
  - Confirmation dialog
- [ ] Implement API calls for user management
- [ ] Test admin functionality

### UI/UX Polish ✅ MOSTLY COMPLETED

- [x] Add ShadCN components (Button, Input, Dialog, Card, etc.)
- [x] Implement consistent styling with TailwindCSS
- [x] Add loading spinners for async operations
- [x] Add toast notifications for success/error messages (Sonner library)
- [x] Ensure mobile responsiveness (test on various screen sizes)
- [ ] Add keyboard shortcuts for common actions (optional)
- [ ] Implement dark mode support (optional)
- **Known Issue**: [BUG-002] No logout button in Header (see BUGS.md)

### API Integration ✅ COMPLETED

- [x] Create API client utility (`lib/api.ts`)
  - Axios instance with base URL
  - Automatic JWT token injection in headers
  - Error handling interceptor
- [x] **Create category constants file** (`lib/constants.ts`)
  - Define ITEM_CATEGORIES array (matches backend)
  - Create ItemCategory type
  - Create formatCategory utility function (e.g., "coffee_beans" → "Coffee Beans")
- [x] Create TypeScript types for API responses (`types/index.ts`)
  - User type
  - Item type **(include category field)**
  - HistoryEntry type
  - ItemCategory type (from constants)
- [x] Implement all API calls with new namespaced routes
  - Auth: login, signup, getMe → `/api/auth/*`
  - **Tracking Items**: getItems, addItem (with category), removeItem → `/api/tracking/items`
  - **Tracking History**: getHistory → `/api/tracking/history`
  - Admin: getUsers, addUser, removeUser → `/api/auth/admin/*` or `/api/admin/*`

---

## Phase 4: Testing & Quality Assurance

### Backend Testing

- [ ] Write unit tests for models
  - User password hashing
  - Code generation uniqueness
- [ ] Write unit tests for utility functions
- [ ] Write integration tests for API endpoints
  - Auth flow (login, protected routes)
  - CRUD operations (items, history)
  - Admin operations
- [ ] Test error handling and edge cases
- [ ] Run tests with `pytest`

### Frontend Testing (Optional for MVP)

- [ ] Write component tests with React Testing Library
- [ ] Test user flows (login, add item, remove item)
- [ ] Test error states and edge cases

### Manual Testing

- [ ] Test complete user workflows end-to-end
  - Admin adds user → User signs up → User logs in → User adds item → User removes item
- [ ] Test on multiple browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test with multiple concurrent users
- [ ] Test error scenarios (network errors, invalid data, unauthorized access)

### Performance Testing

- [ ] Measure API response times
- [ ] Measure frontend page load times
- [ ] Test with larger datasets (100+ items)
- [ ] Optimize slow queries or operations

---

## Phase 5: Tool 2 - Milk Count System

**Status**: Awaiting Tool 1 completion
**Detailed Planning**: See `Planning/MilkCount.md`

### Backend Development

- [ ] Design database schema
  - milk_count_sessions table (night/morning counts)
  - milk_count_par_levels table (target inventory)
  - milk_count_milk_types table (milk definitions)
  - Create migration
- [ ] Create SQLAlchemy models
  - MilkCountSession model
  - ParLevel model
  - MilkType model
- [ ] Implement API endpoints (`/api/milk-count/*`)
  - POST `/api/milk-count/sessions` - Create new count session
  - GET `/api/milk-count/sessions/:id` - Get session details
  - PATCH `/api/milk-count/sessions/:id` - Update session (night/morning counts)
  - GET `/api/milk-count/sessions` - Get historical sessions
  - GET `/api/milk-count/par-levels` - Get par levels
  - PUT `/api/milk-count/par-levels` - Update par levels (admin only)
  - GET `/api/milk-count/milk-types` - Get milk type definitions
- [ ] Implement calculation logic
  - Delivered = Current BOH - Night BOH (for Option A)
  - Total = FOH + BOH + Delivered
  - Order = Par - Total
- [ ] Write comprehensive test suite
  - Session creation and updates
  - Calculation accuracy
  - Par level management
  - Authorization checks

### Frontend Development

- [ ] Create routing structure
  - `/tools/milk-count/` - Landing/status page
  - `/tools/milk-count/night-count/foh` - Night FOH count
  - `/tools/milk-count/night-count/boh` - Night BOH count
  - `/tools/milk-count/morning-count` - Morning count
  - `/tools/milk-count/summary` - Daily summary
  - `/tools/milk-count/history` - Historical data
  - `/tools/milk-count/admin/par-levels` - Par management (admin only)
- [ ] Create shared Counter component
  - +/- buttons for quick counting
  - Large number display
  - Reusable across FOH/BOH/morning screens
- [ ] Implement Night Count screens
  - FOH count screen with milk type list
  - BOH count screen with milk type list
  - Save and progress flow
- [ ] Implement Morning Count screen
  - Display night BOH counts
  - Dual input methods (Option A: current BOH, Option B: direct delivered)
  - Real-time calculation of delivered milks
  - Method selection per milk type
- [ ] Implement Summary screen
  - Table matching logbook format
  - All calculated values (FOH, BOH, Delivered, Total, Par, Order)
  - Export/copy functionality
- [ ] Implement Par Level Management (admin)
  - List view of all par levels
  - Edit interface with +/- or direct input
  - Save with confirmation
- [ ] Implement Historical Data view
  - Past sessions with date filtering
  - View summary for any past day

### Testing & Deployment

- [ ] Test complete workflow (night → morning → summary)
- [ ] Test calculations with various scenarios
- [ ] Test admin par level management
- [ ] Mobile responsiveness testing
- [ ] Deploy Tool 2 to production

---

## Phase 6: Tool 3 - RTD&E Counting System

**Status**: Awaiting Tool 2 completion
**Detailed Planning**: See `Planning/RTDE.md`

### Backend Development

- [ ] Design database schema
  - rtde_items table (display items with expected quantities)
  - rtde_pull_lists table (generated pull lists)
  - Create migration
- [ ] Create SQLAlchemy models
  - RTDEItem model
  - PullList model
- [ ] Implement API endpoints (`/api/rtde/*`)
  - GET `/api/rtde/items` - Get all display items
  - PATCH `/api/rtde/items/:id` - Update item count
  - POST `/api/rtde/pull-lists` - Generate pull list
  - GET `/api/rtde/pull-lists/:id` - Get pull list details
  - PATCH `/api/rtde/pull-lists/:id/items/:item_id` - Mark item as pulled
  - PUT `/api/rtde/items` - Bulk update items (admin only)
- [ ] Implement pull list generation logic
  - Calculate missing = expected - current
  - Filter items with missing > 0
  - Create pull list record
- [ ] Write comprehensive test suite
  - Item counting
  - Pull list generation
  - Item marking as pulled
  - Authorization checks

### Frontend Development

- [ ] Create routing structure
  - `/tools/rtde/` - Landing page
  - `/tools/rtde/count` - Counting screen
  - `/tools/rtde/pull-list/:id` - Pull list view (BOH)
  - `/tools/rtde/history` - Past pull lists
  - `/tools/rtde/admin/items` - Item management (admin only)
- [ ] Implement Counting screen
  - List of all display items
  - +/- buttons for counting (reuse Counter component)
  - Direct number input for bulk items
  - "Generate Pull List" button
- [ ] Implement Pull List view
  - List of items to pull with quantities
  - "Mark as Pulled" button per item
  - Progress indicator
  - Return to display for restocking
- [ ] Implement Item Management (admin)
  - List view of all items
  - Add/remove/edit items
  - Set expected quantities
  - Seasonal updates
- [ ] Implement Historical Data view
  - Past pull lists with date filtering
  - View details for any past pull list

### Testing & Deployment

- [ ] Test complete workflow (count → pull list → mark pulled)
- [ ] Test admin item management
- [ ] Mobile responsiveness testing
- [ ] Deploy Tool 3 to production

---

## Phase 7: Deployment Preparation

### Backend Deployment

- [ ] Create production configuration
  - Set `FLASK_ENV=production`
  - Use strong `JWT_SECRET_KEY`
  - Configure production database URL (AWS RDS)
- [ ] Set up AWS Elastic Beanstalk
  - Create application
  - Create environment
  - Configure environment variables
- [ ] Create `.ebextensions` config for AWS (if needed)
- [ ] Deploy backend to AWS Elastic Beanstalk
- [ ] Test production API endpoints

### Frontend Deployment

- [ ] Update `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Deploy to Vercel
  - Connect GitHub repository
  - Configure environment variables
  - Deploy
- [ ] Test production frontend

### Database Setup

- [ ] Create AWS RDS PostgreSQL instance
  - Choose appropriate instance size
  - Enable automated backups
  - Configure security groups (allow Elastic Beanstalk access)
- [ ] Run migrations on production database
  ```bash
  alembic upgrade head
  ```
- [ ] Seed production database with admin user

### Post-Deployment

- [ ] Test complete production workflow
- [ ] Set up monitoring and logging
  - AWS CloudWatch for backend
  - Vercel Analytics for frontend
- [ ] Set up error tracking (Sentry, optional)
- [ ] Create backup and restore procedures
- [ ] Document deployment process

---

## Phase 8: Documentation & Handoff

### User Documentation

- [ ] Create quick start guide for staff
  - How to log in
  - How to add items
  - How to remove items
  - How to check history
- [ ] Create admin guide
  - How to add users
  - How to manage access
- [ ] Create troubleshooting guide
  - Common issues and solutions

### Developer Documentation

- [ ] Document API endpoints with examples
  - Request/response formats
  - Authentication requirements
  - Error codes
- [ ] Create architecture diagram
- [ ] Document deployment procedures
- [ ] Document backup/restore procedures
- [ ] Add contribution guidelines (if open-sourcing)

### Training

- [ ] Conduct training session with staff
- [ ] Gather feedback on usability
- [ ] Address any issues or confusion
- [ ] Iterate based on feedback

---

## Ongoing Tasks

### Maintenance

- [ ] Monitor application health and errors
- [ ] Review and rotate JWT secrets periodically
- [ ] Keep dependencies up to date
- [ ] Respond to user feedback and bug reports
- [ ] Plan and implement feature enhancements

### Backups

- [ ] Verify automated backups are running (AWS RDS)
- [ ] Test restore procedures periodically
- [ ] Document backup retention policy

---

## Optional Enhancements (Post-MVP)

- [ ] Implement low stock alerts
- [ ] Add analytics dashboard
- [ ] Enable bulk operations
- [ ] Add export functionality (CSV, PDF)
- [ ] Implement WebSocket for real-time updates
- [ ] Create native mobile apps
- [ ] Add barcode/QR code scanning
- [ ] Integrate with POS system
- [ ] Add multi-store support

---

## Notes

### Development Workflow

- **Build tools incrementally**: Complete and deploy Tool 1 before starting Tool 2
- **Prioritize ruthlessly**: Focus on core functionality first (auth, add/remove, history)
- **Test incrementally**: Test each feature as you build it, don't wait until the end
- **Commit often**: Small, focused commits make debugging easier
- **Deploy early**: Get to production as soon as basic functionality works

### Multi-Tool Best Practices

- **Shared first**: Build shared components and infrastructure before tool-specific features
- **Reuse patterns**: Counter component, admin panels, history pages follow similar patterns
- **Namespace consistently**: Use `/api/{tool-name}/*` and `/tools/{tool-name}/*` patterns
- **Test isolation**: Each tool's tests should be independent

### Documentation

- **PLANNING.md**: Overall multi-tool architecture and decisions
- **Tool-specific docs**: `Planning/InventoryTracking.md`, `Planning/MilkCount.md`, `Planning/RTDE.md` for detailed features
- **TASKS.md**: This file - track progress across all phases
- **CLAUDE.md**: AI assistant guidelines for maintaining codebase

---

_Last Updated: November 7, 2025_
_Version: 2.1.0 - Phase 3B Progress Update & Bug Tracking Integration_
