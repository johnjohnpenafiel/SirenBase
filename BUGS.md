# SirenBase - Bug & Issue Tracker

This document tracks bugs, issues, and technical debt in the SirenBase platform. All bugs should be referenced by their ID (e.g., `[BUG-001]`) in commit messages when fixed.

---

## 🐛 Active Bugs

_No active bugs at this time._

---

## ✅ Fixed Bugs Archive

### [BUG-010] Autocomplete suggestions reappear after selecting a suggestion

**Fixed**: 2026-01-18
**Commit**: (current session)
**Impact**: Medium - Poor UX requiring extra tap to dismiss

**Affected Component**: `frontend/components/tools/tracking/ItemNameAutocomplete.tsx`

**Description**:
In the Add Item dialog, when a user typed an item name and tapped on an autocomplete suggestion, the name field would autopopulate correctly, but after a brief moment the suggestions dropdown would reappear with the same results. Users had to tap the suggestion again to dismiss it, which could block the "Generate Code" button.

**Root Cause**:
Race condition between selection and the search effect:
1. `handleSelectSuggestion` called `onChange(suggestion.name)` updating the value
2. `setShowSuggestions(false)` hid the dropdown
3. But the `useEffect` watching `value` triggered due to the value change
4. The debounced search completed and called `setShowSuggestions(true)`
5. Dropdown reappeared with suggestions matching the selected name

**Expected Behavior**:
- User taps suggestion → name autopopulates → suggestions stay hidden
- Suggestions should only reappear if user manually types something different

**Solution Implemented**:
Added a `justSelectedRef` ref to track explicit selection:
1. Set `justSelectedRef.current = true` before calling `onChange` in `handleSelectSuggestion`
2. In the search `useEffect`, check the ref first - if set, skip the search and reset the ref
3. When typing manually via `handleInputChange`, the ref stays `false` so search works normally

**Files Changed**:
- `frontend/components/tools/tracking/ItemNameAutocomplete.tsx:47` - Added justSelectedRef
- `frontend/components/tools/tracking/ItemNameAutocomplete.tsx:78-82` - Skip search when just selected
- `frontend/components/tools/tracking/ItemNameAutocomplete.tsx:124` - Set ref before onChange

**Testing**:
- [ ] Type item name, tap suggestion → suggestions stay hidden
- [ ] After selecting, manually edit name → suggestions reappear normally
- [ ] Keyboard selection (Enter) also works without suggestions reappearing

---

### [BUG-009] Database connection timeout causes SSL error after idle period

**Fixed**: 2025-12-20
**Commit**: (current session)
**Impact**: High - App becomes unusable until page refresh

**Affected Component**: `backend/app/config.py`, `backend/app/__init__.py`

**Description**:
After leaving the app idle for extended periods (1+ hours), users would see technical error messages like `(psycopg2.OperationalError) SSL connection has been closed unexpectedly` when attempting to login or load data. The error would fix itself after a page refresh.

**Root Cause**:
1. SQLAlchemy connection pool had no staleness handling configured
2. PostgreSQL SSL connections in the pool became stale (closed by DB server or network infrastructure)
3. App tried to use dead connections, causing OperationalError
4. Production error handlers were exposing raw SQL queries to users (security issue)

**Expected Behavior**:
- App should handle connection drops gracefully
- Users should see friendly error messages, not SQL queries
- Stale connections should be automatically recycled

**Solution Implemented**:
1. Added `SQLALCHEMY_ENGINE_OPTIONS` with connection pool configuration:
   - `pool_pre_ping: True` - Validates connections before use
   - `pool_recycle: 300` - Recycles connections every 5 minutes
   - `pool_size: 5` - Base pool size
   - `max_overflow: 10` - Up to 15 connections under load
   - `pool_timeout: 30` - Wait up to 30s for connection

2. Added dedicated error handlers for database errors:
   - `OperationalError` handler returns user-friendly "Database connection error" (503)
   - `SQLAlchemyError` handler returns "A database error occurred" (500)
   - Fixed production check to use `app.debug` instead of deprecated `ENV` config

3. All error handlers now NEVER expose SQL queries or schema details to users

**Files Changed**:
- `backend/app/config.py:27-35` - Added SQLALCHEMY_ENGINE_OPTIONS
- `backend/app/__init__.py:105-129` - Added OperationalError and SQLAlchemyError handlers
- `backend/app/__init__.py:138-144` - Fixed production error sanitization

**Testing**:
- [ ] Deploy to production and verify connection stability after idle periods
- [ ] Confirm error messages no longer expose SQL queries
- [ ] Monitor logs for any remaining connection issues

---

## 💡 Known Issues / Technical Debt

### [TECH-002] No error boundary components

**Description**:
No React error boundaries exist to catch rendering errors gracefully.

**Impact**: Low
- Entire app could crash if a component throws
- No fallback UI for errors

**Recommendation**:
Add error boundary wrapper in root layout with friendly error message.

**Status**: Acknowledged
**Priority**: Low
**Deferred**: Phase 7 (Production Deployment)

---

## ✅ Fixed Bugs Archive

### [BUG-008] RTDE count adjustment causes loading flash (unnecessary session reload)

**Fixed**: 2025-11-22
**Commit**: (current session)
**Impact**: Medium - Poor UX during counting

**Affected Component**: `frontend/app/tools/rtde/count/[sessionId]/page.tsx:106`

**Description**:
When adjusting an item's count using the +/- buttons, the entire page would briefly flash a "Loading session..." screen before returning to normal. This made the counting experience feel unstable and jarring.

**Root Cause**:
After saving a count update to the API, the `saveCount()` function called `await loadSession()` to reload the entire session from the backend. This caused:
1. `setLoading(true)` - triggering the full-page loading screen
2. API fetch of session data (unnecessary, as local state was already updated)
3. `setLoading(false)` - returning to normal view

**Expected Behavior**:
- Adjusting an item's count should be smooth and seamless
- No loading states should appear during count updates
- UI should update immediately (optimistic update)
- Background save should be invisible to the user

**Current Behavior** (before fix):
- User clicks +/- button
- Count updates immediately (optimistic update) ✅
- After 500ms debounce, count saves to API ✅
- Page shows "Loading session..." flash ❌
- Page returns to normal after ~200-300ms

**Solution Implemented**:
Removed the unnecessary `await loadSession()` call from `saveCount()` function:
1. Optimistic update in `handleCountChange()` already keeps UI in sync
2. API save happens in background without triggering loading state
3. Only show "Saving..." indicator, not full page reload
4. Added comment explaining why session reload is not needed

**Why This Works**:
- The optimistic update (lines 124-132) already updates the local state immediately
- The backend save confirms the change but doesn't need to reload all session data
- If save fails, error toast notifies user and they can retry
- Session data only needs to load once on page mount

**Files Changed**:
- `frontend/app/tools/rtde/count/[sessionId]/page.tsx:105-106` - Removed loadSession() call, added explanatory comment

**Testing**:
✅ Count adjustments are smooth without any flashing
✅ UI updates immediately when clicking +/- buttons
✅ "Saving..." indicator shows briefly (bottom of page)
✅ No full-page loading state appears during counting
✅ Session data remains consistent with backend

---

### [BUG-007] Session state missing items array causing undefined access error

**Fixed**: 2025-11-22
**Commit**: (current session)
**Impact**: High - Application crashes on RTDE count page

**Affected Component**: `frontend/app/tools/rtde/count/[sessionId]/page.tsx:164`

**Description**:
The session state only stored session metadata, not the items array. The API returns `{ session, items }` but the code only stored `response.session` in state, causing `session.items[currentIndex]` to fail with "Cannot read properties of undefined (reading '0')".

**Root Cause**:
Type mismatch between API response structure and component state:
1. API returns `GetRTDESessionResponse { session: RTDESession, items: RTDESessionItem[] }`
2. Component stored only `response.session` (missing items array)
3. Component tried to access `session.items[currentIndex]` which was undefined

**Expected Behavior**:
- State should store both session metadata and items array
- `session.items` should be accessible throughout component
- Field names should match API contract (`counted_quantity` not `count`)

**Solution Implemented**:
1. Created `RTDESessionWithItems` type that extends `RTDESession` with items array
2. Updated session state to use new type: `useState<RTDESessionWithItems | null>`
3. Modified `loadSession()` to combine session and items: `{ ...response.session, items: response.items }`
4. Fixed field name mismatch: `counted_quantity` instead of `count`
5. Fixed prop names in RTDECountCard: `name` and `icon` instead of `item_name` and `item_icon`

**Files Changed**:
- `frontend/types/index.ts:175-178` - Added RTDESessionWithItems interface
- `frontend/app/tools/rtde/count/[sessionId]/page.tsx:25` - Updated import
- `frontend/app/tools/rtde/count/[sessionId]/page.tsx:40` - Updated state type
- `frontend/app/tools/rtde/count/[sessionId]/page.tsx:72-76` - Combine session + items in loadSession()
- `frontend/app/tools/rtde/count/[sessionId]/page.tsx:103` - Fixed field name to counted_quantity
- `frontend/app/tools/rtde/count/[sessionId]/page.tsx:129` - Fixed field name in optimistic update
- `frontend/app/tools/rtde/count/[sessionId]/page.tsx:211-214` - Fixed prop names

**Testing**:
✅ Session loads with items array
✅ Current item is accessible without undefined errors
✅ Count updates work correctly with proper field names
✅ Optimistic UI updates reflect changes immediately

---

### [BUG-006] Next.js params accessed as object instead of Promise in RTDE count page

**Fixed**: 2025-11-22
**Commit**: (current session)
**Impact**: Medium - Deprecation warning that will break in future Next.js versions

**Affected Component**: `frontend/app/tools/rtde/count/[sessionId]/page.tsx:35`

**Description**:
In Next.js 14+, the `params` prop in dynamic route pages is now a Promise that must be unwrapped with `React.use()` before accessing properties. The code accessed `params.sessionId` directly, triggering a deprecation warning.

**Error Message**:
```
A param property was accessed directly with `params.sessionId`. `params` is now a Promise
and should be unwrapped with `React.use()` before accessing properties.
```

**Solution Implemented**:
1. Imported `use` from React: `import { use, useState, ... } from 'react'`
2. Updated CountPageProps interface: `params: Promise<{ sessionId: string }>`
3. Unwrapped params with React.use(): `const { sessionId } = use(params)`
4. Added comment for future reference

**Files Changed**:
- `frontend/app/tools/rtde/count/[sessionId]/page.tsx:14` - Added `use` to React imports
- `frontend/app/tools/rtde/count/[sessionId]/page.tsx:28` - Changed params type to Promise
- `frontend/app/tools/rtde/count/[sessionId]/page.tsx:35-36` - Unwrap params with use()

**Testing**:
✅ No deprecation warnings
✅ sessionId is correctly extracted from params
✅ Page renders without errors

---

### [BUG-005] RTD&E admin page not showing inactive items

**Fixed**: 2025-11-22
**Commit**: (current session)
**Impact**: Medium - Admin cannot view/manage inactive RTD&E items

**Affected Component**: `frontend/app/admin/rtde-items/page.tsx`, `frontend/lib/api.ts`

**Description**:
When editing an RTD&E item and setting it to inactive, the item would disappear from the admin list entirely. It wouldn't appear in "Show All Items" or "Show Active Only" mode, making it impossible to re-activate or manage inactive items.

**Root Cause**:
The backend endpoint `GET /api/rtde/admin/items` by default only returns active items. The frontend's `getRTDEItems()` API call didn't pass the `include_inactive=true` query parameter, so inactive items were filtered out on the backend.

**Expected Behavior**:
- Admin panel should always show ALL items (active and inactive)
- Client-side filtering should control what's displayed based on toggle
- Inactive items should show "Inactive" badge
- Toggling "Show All Items" / "Show Active Only" should work correctly

**Current Behavior** (before fix):
- After setting item to inactive, it disappeared from list
- "Show All Items" toggle had no effect
- No way to see or re-activate inactive items

**Solution Implemented**:
1. Updated `apiClient.getRTDEItems()` to accept optional `include_inactive` parameter
2. Modified admin page to always fetch with `{ include_inactive: true }`
3. Admin panel now fetches all items and filters client-side
4. Added clarifying comment in `loadItems()` function

**Files Changed**:
- `frontend/lib/api.ts:206-211` - Added params option to getRTDEItems()
- `frontend/app/admin/rtde-items/page.tsx:143-155` - Pass include_inactive: true

**Testing**:
✅ Edit item and set to inactive → Item remains visible with "Inactive" badge
✅ "Show All Items" toggle → Shows both active and inactive items
✅ "Show Active Only" toggle → Shows only active items (filters out inactive)

---

### [TECH-003] Form validation library migration

**Fixed**: 2025-11-20
**Impact**: Low - Code quality and developer experience improvement

**Affected Components**: All forms in frontend

**Description**:
React-hook-form + zod were installed as dependencies but not being used. All forms used native HTML validation with manual error handling, which was verbose and not type-safe.

**Solution Implemented**:
Migrated all Tool 1 forms to use react-hook-form + zod:
1. Created Zod validation schemas for auth, tracking, and admin forms
2. Migrated login form to use react-hook-form with zodResolver
3. Migrated AddItemDialog to use react-hook-form (maintained two-step flow)
4. Migrated AddUserDialog to use react-hook-form with PIN confirmation validation

**Benefits**:
- Type-safe form validation with TypeScript inference
- Automatic field-level error messages
- Better UX with touched states and validation on blur
- DRY validation (schemas can be reused)
- Consistent form pattern for future tools

**Files Changed**:
- `frontend/lib/validations/auth.ts` - Login schema
- `frontend/lib/validations/tracking.ts` - Add item schema
- `frontend/lib/validations/admin.ts` - Add user schema with PIN confirmation
- `frontend/app/login/page.tsx` - Migrated to RHF + Zod
- `frontend/components/tools/tracking/AddItemDialog.tsx` - Migrated to RHF + Zod
- `frontend/components/admin/AddUserDialog.tsx` - Migrated to RHF + Zod

**Testing**:
✅ All forms compile without TypeScript errors
✅ 14 validation schema tests passing
✅ Pattern established for Tool 2 and Tool 3

---

### [TECH-001] Frontend testing infrastructure

**Fixed**: 2025-11-20
**Impact**: Medium - Testing infrastructure established

**Description**:
No frontend testing infrastructure or tests existed. This made it difficult to catch regressions and refactor with confidence.

**Solution Implemented**:
Set up Vitest + React Testing Library testing infrastructure:
1. Installed testing dependencies (vitest, @testing-library/react, @testing-library/jest-dom, etc.)
2. Created vitest.config.ts configuration with jsdom environment
3. Created vitest.setup.ts for test setup and cleanup
4. Added test scripts to package.json (test, test:ui, test:coverage)
5. Wrote 14 validation schema tests (all passing)

**Test Coverage Established**:
- ✅ Login validation schema tests (5 tests)
- ✅ Add item validation schema tests (4 tests)
- ✅ Add user validation schema tests (5 tests)

**Files Created**:
- `frontend/vitest.config.ts` - Vitest configuration
- `frontend/vitest.setup.ts` - Test setup file
- `frontend/lib/__tests__/validations.test.ts` - Validation tests (14 passing)
- `frontend/contexts/__tests__/auth-context.test.tsx` - Auth context tests (draft)

**Status**: Infrastructure complete, component tests can be added incrementally

**Next Steps**:
- Add component tests as needed when refactoring
- Target 60-70% coverage for critical paths before production

---

### [BUG-004] User deletion fails with 500 Internal Server Error

**Fixed**: 2025-11-20
**Commit**: 4f7d106
**Impact**: High - Admin cannot delete users due to foreign key constraints

**Affected Component**: `backend/app/routes/admin.py`

**Description**:
When admin attempts to delete a user via the admin panel, the request fails with a 500 error. The backend couldn't delete users because of RESTRICT foreign key constraints on `tracking_items.added_by` and `tracking_history.user_id`.

**Expected Behavior**:
- Admin clicks "Delete User" button
- User is deleted from the system
- User no longer appears in admin panel
- Deleted user cannot log in
- **Audit trail is preserved** (history and items remain intact)

**Current Behavior** (before fix):
- DELETE request to `/api/admin/users/:id` returns 500 error
- Frontend shows "Failed to delete user" toast
- Database throws foreign key constraint violation

**Solution Implemented**:
Implemented **soft delete** pattern to preserve audit trail:
1. Added `is_deleted`, `deleted_at`, `deleted_by` columns to users table
2. DELETE endpoint now marks user as deleted instead of removing from database
3. GET /api/admin/users filters out deleted users
4. Login endpoint rejects deleted users with clear error message
5. History and items remain intact with original user references

**Files Changed**:
- `backend/app/models/user.py:79-94` - Added soft delete fields
- `backend/migrations/versions/38f7e23d7ea7_*.py` - Database migration
- `backend/app/routes/admin.py:45` - Filter deleted users in GET endpoint
- `backend/app/routes/admin.py:138-205` - Soft delete in DELETE endpoint
- `backend/app/routes/auth.py:58-59` - Reject deleted users at login
- `backend/app/routes/auth.py:117-119` - Prevent reuse of deleted partner numbers
- `backend/app/routes/auth.py:180-181` - Check deleted status in /me endpoint

**Testing**:
✅ User deletion sets is_deleted=True
✅ Deleted users don't appear in admin panel
✅ Deleted users cannot log in
✅ History still shows deleted user's name
✅ Items created by deleted user remain intact

---

### [BUG-001] AddItemDialog saves item prematurely (Step 1 instead of Step 2)

**Fixed**: 2025-01-15
**Impact**: High - Data integrity issue (orphaned items if user cancels)

**Solution Implemented**:
- Frontend now generates unique 4-digit code locally by fetching existing codes and checking for duplicates
- Step 1: Code is generated and displayed (NO database save)
- Step 2: Item is saved to database only when user clicks "Confirm & Save" with the exact code displayed
- Cancel at Step 2: No orphaned records created
- Backend updated to accept optional `code` parameter to use frontend-generated code

**Files Changed**:
- `frontend/components/tools/tracking/AddItemDialog.tsx` - Refactored handleGenerateCode and handleConfirm
- `frontend/types/index.ts` - Added optional `code` field to CreateItemRequest
- `backend/app/schemas/item.py` - Added optional `code` field with validation
- `backend/app/routes/tools/tracking.py` - Updated to use provided code or generate if not provided

---

### [BUG-002] No logout functionality in authenticated pages

**Fixed**: 2025-01-15
**Impact**: Medium - Poor UX and security concern

**Solution**:
This bug was already fixed before verification. The Header component includes complete logout functionality:
- User dropdown menu with name displayed (desktop) / icon only (mobile)
- Logout button calls `logout()` from auth context
- Properly clears JWT token, user state, and redirects to login

**Files Verified**:
- `frontend/components/shared/Header.tsx` - Complete implementation exists
- `frontend/contexts/auth-context.tsx` - logout() function properly implemented

---

### [BUG-003] Frontend doesn't trim whitespace in form inputs

**Fixed**: 2025-01-15
**Impact**: Low - Minor data quality issue

**Solution Implemented**:
- Added `.trim()` to `partnerNumber` and `pin` inputs in login page before submission
- Note: AddItemDialog and AddUserDialog already had proper trimming

**Files Changed**:
- `frontend/app/login/page.tsx` - Added `.trim()` to partner_number and pin inputs

---

## 📝 Bug Reporting Guidelines

### When to Create a Bug Entry

**DO report**:
- Incorrect behavior (code does not match expected behavior)
- Data integrity issues
- Security vulnerabilities
- UX issues that prevent task completion
- Performance regressions

**DON'T report** (use TASKS.md instead):
- Missing features that were never implemented
- Feature requests
- Enhancements to existing functionality

### Bug Entry Template

```markdown
#### [BUG-XXX] Short descriptive title

**Affected Component**: Path to file or component name

**Description**:
Clear description of the bug

**Expected Behavior**:
What should happen

**Current Behavior**:
What actually happens

**Steps to Reproduce** (if applicable):
1. Step one
2. Step two
3. Bug occurs

**Impact**: High | Medium | Low
Brief explanation of impact

**Reported**: YYYY-MM-DD
**Status**: Open | In Progress | Fixed
**Assigned**: Developer name or -

**Related Files**:
- `path/to/file.ts:line_number`

**Fix Approach** (optional):
Ideas for how to fix
```

---

_Last Updated: 2026-01-18_
_Version: 3.3.0_
_Maintainer: Development Team_
