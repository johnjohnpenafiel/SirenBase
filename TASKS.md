# SirenBase - Task Tracker

This document contains clear, actionable tasks for building the SirenBase multi-tool platform. Tasks are organized by tool and development phase, with checkboxes for tracking progress.

**Note**: See `PLANNING.md` for overall architecture, `BUGS.md` for active bugs and technical debt, and individual tool docs (`Planning/InventoryTracking.md`, `Planning/MilkCount.md`, `Planning/RTDE.md`) for detailed feature planning.

**📦 Completed Work**: Phases 0-3D (Project Setup through Tool 1 Completion) have been archived to `docs/archive/TASKS_ARCHIVE.md` to keep this file focused on active work.

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

**Status**: Ready to begin
**Detailed Planning**: See `Planning/RTDE.md`

### Phase 6A: Admin Dashboard Restructure (COMPLETED ✅)

**Timeline**: 1-2 days
**Completed**: November 22, 2025
**Priority**: Must complete before RTD&E tool backend/frontend

**Goal**: Convert current single-page admin panel into modular dashboard to support tool-specific admin features.

#### Frontend - Admin Dashboard Restructure

- [x] Modify `/app/admin/page.tsx` to show module cards instead of user table

  - Create grid layout with ToolCard-style module cards
  - Add "User Management" card → Routes to `/admin/users`
  - Add "RTD&E Items & Pars" card → Routes to `/admin/rtde-items`
  - Add "Milk Count Pars" card (placeholder/disabled) → Routes to `/admin/milk-pars`
  - Use existing ProtectedRoute wrapper (admin-only access)

- [x] Create `/app/admin/users/page.tsx`

  - Move existing user management UI from `/app/admin/page.tsx`
  - Keep all functionality: user table, AddUserDialog, DeleteUserDialog
  - Add "Back to Admin Panel" navigation
  - No changes to backend - uses existing `/api/admin/*` endpoints

- [x] Create placeholder routes

  - `/app/admin/rtde-items/page.tsx` - Placeholder for Phase 6B
  - `/app/admin/milk-pars/page.tsx` - Placeholder with "Coming Soon"

- [x] Update navigation

  - No changes needed - Header component doesn't link to admin panel
  - Dashboard Admin Panel card already has generic description

- [x] Test admin dashboard navigation
  - Verify module cards display correctly
  - Test routing between admin dashboard and user management
  - Verify admin-only access protection
  - Build successful with all pages included

#### Documentation

- [x] Update PLANNING.md

  - Document admin dashboard restructure decision
  - Update admin routes section
  - Updated to Version 2.2.0

- [x] Update TASKS.md

  - Mark Phase 6A tasks as completed
  - Add date completed

- [x] Git commit
  - Commit message: "feat: Restructure admin panel into modular dashboard (Phase 6A)"
  - Push to repository

### Phase 6B: RTD&E Backend Development (✅ COMPLETE)

**Timeline**: 3-4 days (Completed in 1 day)
**Dependencies**: Phase 6A complete
**Started**: November 22, 2025
**Completed**: November 22, 2025

#### Database Schema

- [x] Create migration `20251122_add_rtde_tables.py`

  - `rtde_items` table (id, name, icon, par_level, display_order, active, timestamps)
  - `rtde_count_sessions` table (id, user_id, status, started_at, completed_at, expires_at)
  - `rtde_session_counts` table (id, session_id, item_id, counted_quantity, is_pulled, updated_at)
  - Add indexes: active+display_order, user_id+status, expires_at, session_id
  - Add foreign key constraints with CASCADE delete

- [x] Run migration
  - Executed `flask db upgrade`
  - Verified tables created successfully
  - Verified indexes and constraints

#### Models

- [x] Create `backend/app/models/rtde.py`
  - RTDEItem model (to_dict method, validation)
  - RTDECountSession model (auto-calculate expires_at with **init** override)
  - RTDESessionCount model (unique constraint on session+item)
  - Add relationships (user→sessions, sessions→counts, items→counts)
  - Imported models in `backend/app/models/__init__.py`

#### API Endpoints - Admin Item Management

- [x] Create `backend/app/routes/tools/rtde.py`

  - Set up blueprint with `/api/rtde` prefix
  - Registered blueprint in `app/__init__.py`

- [x] Implement admin item endpoints
  - GET `/api/rtde/admin/items` - List all items ordered by display_order (admin only)
  - POST `/api/rtde/admin/items` - Create item (admin only)
  - PUT `/api/rtde/admin/items/:id` - Update item (admin only)
  - DELETE `/api/rtde/admin/items/:id` - Delete item (hard/soft based on usage, admin only)
  - PUT `/api/rtde/admin/items/reorder` - Batch update display_order (admin only)

#### API Endpoints - Session Management

- [x] Implement session endpoints
  - GET `/api/rtde/sessions/active` - Check for active session (authenticated)
  - POST `/api/rtde/sessions/start` - Create or resume session (authenticated)
  - GET `/api/rtde/sessions/:id` - Get session with all item counts (authenticated, owner only)
  - PUT `/api/rtde/sessions/:id/count` - Update count for item (authenticated, owner only)

#### API Endpoints - Pull List

- [x] Implement pull list endpoints
  - GET `/api/rtde/sessions/:id/pull-list` - Generate pull list (authenticated, owner only)
  - PUT `/api/rtde/sessions/:id/pull` - Mark item as pulled/unpulled (authenticated, owner only)
  - POST `/api/rtde/sessions/:id/complete` - Complete and delete session (authenticated, owner only)

#### Background Jobs

- [x] Create session cleanup script
  - Script: `backend/app/utils/rtde_cleanup.py`
  - Delete sessions where `status='in_progress' AND expires_at < NOW()`
  - Documentation for cron job usage included in script

#### Backend Testing (✅ COMPLETE - 77/77 tests)

- [x] Write model tests (`backend/tests/test_rtde_models.py`)

  - 17 tests covering item creation, validation, session expiration, cascade deletion, unique constraints
  - All 17 tests passing ✅

- [x] Write admin endpoint tests (`backend/tests/test_rtde_admin.py`)

  - 23 tests covering CRUD operations, reorder, authorization, validation
  - All 23 tests passing ✅

- [x] Write session endpoint tests (`backend/tests/test_rtde_sessions.py`)

  - 20 tests covering active session check, start/resume logic, session ownership, count updates, expiration
  - All 20 tests passing ✅

- [x] Write pull list tests (`backend/tests/test_rtde_pull_list.py`)

  - 17 tests covering pull list generation, mark pulled/unpulled, complete session, authorization
  - All 17 tests passing ✅

- [x] Run full test suite
  - **152 tests passing** (75 existing + 77 new RTDE tests)
  - No regression in existing tests ✅
  - 100% RTDE coverage: Models, Admin endpoints, Session endpoints, Pull list endpoints

#### Documentation

- [x] Update backend documentation

  - Updated backend/README.md with RTDE models, API endpoints, test coverage
  - Updated PLANNING.md to v2.4.0 (Phase 6B Complete)
  - Updated TASKS.md with completion status

- [x] Git commit
  - Commit message: "feat: Complete RTD&E backend with full test coverage - Phase 6B"
  - All 152 tests passing, 100% RTDE backend coverage

### Phase 6C: RTD&E Frontend Development (✅ COMPLETE)

**Timeline**: 4-5 days (Completed in 2 days)
**Dependencies**: Phase 6B complete
**Started**: November 22, 2025
**Completed**: November 24, 2025
**Status**: Fully complete - All features implemented, tested, and documented

#### Admin - Item Management UI (✅ COMPLETE)

- [x] Create `/app/admin/rtde-items/page.tsx`

  - Full item management UI with drag-and-drop reordering
  - List view with all items (sorted by display_order)
  - Shows: drag handle, icon, name, par level, active status, edit/delete buttons
  - "Add Item" button (top-right)
  - Filter toggle: Show active only / Show all items

- [x] Implement drag-and-drop reordering

  - Installed `@dnd-kit/core` and `@dnd-kit/sortable`
  - Drag handles on each item row
  - Real-time reordering in UI
  - "Save Order" button to persist changes
  - Calls PUT `/api/rtde/admin/items/reorder`

- [x] Create `components/admin/rtde/AddRTDEItemDialog.tsx`

  - Form fields: name, icon (emoji input), par_level, active toggle
  - Validation: name required (max 100 chars), icon required, par_level > 0
  - Uses react-hook-form + Zod validation
  - Calls POST `/api/rtde/admin/items`

- [x] Create `components/admin/rtde/EditRTDEItemDialog.tsx`

  - Pre-populates form with current item values
  - Same validation as AddItemDialog
  - Calls PUT `/api/rtde/admin/items/:id`

- [x] Create `components/admin/rtde/DeleteRTDEItemDialog.tsx`

  - Confirmation dialog with item name
  - Warning if item has been used in sessions
  - Calls DELETE `/api/rtde/admin/items/:id`

- [x] Test admin item management
  - ✅ Add items with various emojis
  - ✅ Edit item properties
  - ✅ Drag-and-drop reordering
  - ✅ Delete unused and used items
  - ✅ Toggle active/inactive ([BUG-005] fixed - inactive items now visible)
  - ✅ Mobile responsiveness

#### Counting Interface (✅ COMPLETE)

- [x] Create `/app/tools/rtde/page.tsx` (Landing/Entry Point)

  - Checks for active session via GET `/api/rtde/sessions/active`
  - Auto-starts new session if none exists
  - Shows resume/restart dialog if session exists
  - Routes to `/tools/rtde/count/:sessionId` after session confirmed

- [x] Create `components/tools/rtde/ResumeSessionDialog.tsx`

  - Displays session info (started X minutes ago, items counted)
  - Buttons: "Resume" | "Start Fresh"
  - Resume → Navigates to counting screen with existing session
  - Start Fresh → Calls POST `/api/rtde/sessions/start` with action="new"

- [x] Create `/app/tools/rtde/count/[sessionId]/page.tsx`

  - Fetches session data via GET `/api/rtde/sessions/:id`
  - One-item-at-a-time display with current item focused
  - Displays: emoji, name, par level, counted quantity, need quantity
  - Progress indicator: "X/Y items counted"
  - Navigation: Prev/Next buttons + Arrow key support
  - "Generate Pull List" button (bottom)
  - Fixed [BUG-006]: Next.js params Promise unwrapping
  - Fixed [BUG-007]: Session state structure with items array

- [x] Create `components/tools/rtde/RTDECountCard.tsx`

  - Large count display in center
  - +/- buttons (large touch targets, 44x44px+)
  - Direct number input (tap count to type)
  - Real-time "Need" calculation (par - counted)
  - Auto-save on every change (debounced 500ms)
  - Calls PUT `/api/rtde/sessions/:id/count`

- [x] Create `components/tools/rtde/RTDENavBar.tsx`

  - Desktop: Horizontal navigation bar with all items
  - Mobile: Bottom bar (scrollable)
  - Shows emoji for each item
  - Highlights current item
  - Shows count badge if counted
  - Click/tap to jump to item
  - Responsive breakpoint: 768px

- [x] Test counting interface
  - ✅ Count items with +/- buttons
  - ✅ Direct number input by tapping count
  - ✅ Navigate with Prev/Next buttons
  - ✅ Arrow key navigation (desktop)
  - ✅ Quick jump via navigator bar
  - ✅ Auto-save functionality (debounced)
  - ✅ Session resume after interruption
  - ✅ Mobile and desktop layouts

#### Pull List Screen (✅ COMPLETE)

- [x] Create `/app/tools/rtde/pull-list/[sessionId]/page.tsx`

  - Fetches pull list via GET `/api/rtde/sessions/:id/pull-list`
  - Displays only items where need_quantity > 0
  - Shows: emoji, name, quantity to pull
  - Checkbox for each item (mark as pulled)
  - "Back to Count" button
  - "Complete" button (confirmation dialog with AlertDialog)
  - Fixed [BUG-006]: Next.js params Promise unwrapping

- [x] Create `components/tools/rtde/RTDEPullListItem.tsx`

  - Item display with emoji, name, pull quantity
  - Checkbox interaction
  - Visual feedback when checked (checkmark, strikethrough)
  - Calls PUT `/api/rtde/sessions/:id/pull` on toggle

- [x] Complete session dialog implemented

  - Uses ShadCN AlertDialog component
  - Confirmation: "Mark session as complete?"
  - Warning: "Session data will be deleted"
  - Buttons: "Cancel" | "Complete"
  - On confirm: Calls POST `/api/rtde/sessions/:id/complete`
  - Success toast with navigation back to dashboard

- [x] Test pull list workflow
  - ✅ Generate pull list from counting screen
  - ✅ Mark items as pulled/unpulled
  - ✅ Back to count for corrections
  - ✅ Complete session (deletion)
  - ✅ Success feedback and navigation

#### API Integration (✅ COMPLETE)

- [x] Create TypeScript types (in `frontend/types/index.ts`)

  - RTDEItem type
  - RTDESession type
  - RTDESessionWithItems type (added for [BUG-007])
  - RTDESessionItem type
  - RTDEPullListItem type
  - RTDEActiveSessionSummary type
  - All API request/response types

- [x] Add RTDE API methods to `frontend/lib/api.ts`
  - getRTDEActiveSession()
  - startRTDESession(action: "new" | "resume")
  - getRTDESession(sessionId: string)
  - updateRTDECount(sessionId, itemId, quantity)
  - getRTDEPullList(sessionId)
  - markRTDEItemPulled(sessionId, itemId, isPulled)
  - completeRTDESession(sessionId)
  - Admin methods: getRTDEItems(), createRTDEItem(), updateRTDEItem(), deleteRTDEItem(), reorderRTDEItems()

#### Dashboard Integration (✅ COMPLETE)

- [x] Update dashboard RTD&E card
  - Removed "disabled" state
  - Routes to `/tools/rtde`
  - Card shows as active with primary icon color
  - ✅ Navigation tested from dashboard

#### End-to-End Testing (✅ COMPLETE)

- [x] Test complete workflow
  - ✅ Backend: All 77 RTDE tests passing (17 model + 23 admin + 20 session + 17 pull list)
  - ✅ Frontend: Builds successfully with all RTDE routes present
  - ✅ Admin: Add/edit/reorder items functionality verified
  - ✅ Staff: Complete counting workflow (start → count → pull list → complete)
  - ✅ Session management: Resume, restart, and expiration logic implemented
  - ✅ Mobile responsiveness: Tested at 320px+ with adaptive layouts
  - 📋 Manual browser testing recommended: Chrome, Safari, Firefox

#### Documentation (✅ COMPLETE)

- [x] Update frontend documentation

  - ✅ Added RTDE routes to frontend/README.md
  - ✅ Documented component structure (RTDECountCard, RTDENavBar, RTDEPullListItem, etc.)
  - ✅ Updated admin routes with modular dashboard structure

- [x] Update PLANNING.md

  - ✅ Marked Tool 3 as "100% Complete"
  - ✅ Updated Phase 6C status from "FUTURE" to "✅ COMPLETE"
  - ✅ Updated version to 2.5.0 and last updated date

- [x] Update TASKS.md

  - ✅ Marked Phase 6C tasks as completed
  - ✅ Added completion date (November 24, 2025)

- [x] Git commit
  - Commit message: "feat: Complete RTD&E frontend (admin, counting, pull list) - Phase 6C"
  - Push to repository

### Phase 6D: RTD&E Code Cleanup (✅ COMPLETE)

**Timeline**: November 25, 2025
**Completed**: November 25, 2025
**Status**: ✅ Complete - Dead code removed, documentation updated

**Goal**: Remove orphaned files from RTDE architectural redesign (commit 23904bf) that replaced tab-based navigation with phase-based rendering.

#### Cleanup Tasks (✅ COMPLETE)

- [x] Commit uncommitted styling changes
  - 6 files with UI improvements (312 insertions, 142 deletions)
  - Commit message: "UI: Improve RTDE session UI components and styling"
  - Pushed to remote (commit c1c5a39)

- [x] Delete orphaned files (699 lines total)
  - `frontend/app/tools/rtde/count/[sessionId]/page.tsx` (268 lines)
  - `frontend/app/tools/rtde/pull-list/[sessionId]/page.tsx` (284 lines)
  - `frontend/components/tools/rtde/RTDENavBar.tsx` (147 lines)

- [x] Update documentation
  - `frontend/README.md` - Updated route structure to reflect unified session workflow
  - Removed references to deleted count/pull-list routes
  - Added references to RTDESessionSidebar, RTDEMobileDrawer, UncountedItemsDialog

- [x] Verify no broken references
  - Searched codebase for imports of deleted components (none found except docs)
  - Frontend build successful with no errors
  - All routes working correctly

- [x] Update TASKS.md
  - Added Phase 6D completion entry
  - Documented cleanup process

**Architectural Change**:
- **Before**: Separate routes `/count/[sessionId]` and `/pull-list/[sessionId]` with RTDENavBar tab navigation
- **After**: Unified route `/session/[sessionId]` with phase-based rendering (`"counting"` | `"pulling"`)
- **Navigation**: Replaced tabs with RTDESessionSidebar (desktop) and RTDEMobileDrawer (mobile)

**Impact**:
- Removed 699 lines of dead code (27% of RTDE frontend)
- Improved codebase maintainability
- Eliminated confusion about correct implementation
- Frontend now 100% aligned with current architecture

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
- **TASKS_ARCHIVE.md**: Completed phases (Phase 0-3D) for historical reference
- **CLAUDE.md**: AI assistant guidelines for maintaining codebase

---

_Last Updated: December 12, 2025_
_Version: 3.3.0 - Pre-Deployment Cleanup Complete (Dead code removed, docs synced)_
