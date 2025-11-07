# SirenBase - Bug & Issue Tracker

This document tracks bugs, issues, and technical debt in the SirenBase platform. All bugs should be referenced by their ID (e.g., `[BUG-001]`) in commit messages when fixed.

---

## 🐛 Active Bugs

### High Priority

#### [BUG-001] AddItemDialog saves item prematurely (Step 1 instead of Step 2)

**Affected Component**: `frontend/components/tools/tracking/AddItemDialog.tsx`

**Description**:
The two-step "Add Item" flow currently creates the item in the database during **Step 1** (when the user clicks "Generate Code"), rather than waiting for **Step 2** confirmation. This means:
- The item is already saved to the database when the user sees the generated code
- The "Confirm & Save" button in Step 2 doesn't actually save anything
- If the user cancels at Step 2, the item remains in the database (orphaned)

**Expected Behavior**:
1. Step 1: User enters name + category, clicks "Generate Code"
2. Backend generates code but **does NOT save to database yet**
3. Step 2: User sees code, clicks "Confirm & Save"
4. Backend saves item to database with history entry
5. If user cancels at Step 2, nothing is saved

**Current Behavior**:
1. Step 1: Backend immediately saves item when "Generate Code" is clicked
2. Step 2: "Confirm & Save" button does nothing (item already exists)

**Impact**: Medium-High
- Data integrity issue (orphaned items if user cancels)
- User confusion (confirmation step is misleading)

**Reported**: 2025-01-05
**Status**: Open
**Assigned**: -

**Related Files**:
- `frontend/components/tools/tracking/AddItemDialog.tsx:78` (handleGenerateCode function)
- `backend/app/routes/tools/tracking.py:37` (POST /api/tracking/items)

**Fix Approach**:
Option A: Generate code on frontend only, send to backend on Step 2
Option B: Add a "reserve code" endpoint that generates without saving, then "confirm" endpoint that saves
Option C: Make code generation frontend-only (check existing codes, generate unique locally)

---

### Medium Priority

#### [BUG-002] No logout functionality in authenticated pages

**Affected Components**:
- `frontend/components/shared/Header.tsx`
- `frontend/app/dashboard/page.tsx`
- `frontend/app/tools/tracking/inventory/page.tsx`

**Description**:
Once a user logs in and navigates to the dashboard or inventory pages, there is no way to logout. The Header component does not include a logout button or user menu.

**Expected Behavior**:
- Header should display current user's name
- Logout button/link should be visible in header
- Clicking logout should:
  - Clear JWT token from localStorage
  - Call `logout()` from AuthContext
  - Redirect to `/login`

**Current Behavior**:
- User must manually clear localStorage or close browser to logout
- No visual indication of current logged-in user in header

**Impact**: Medium
- Poor UX (no way to switch users)
- Security concern (shared device usage)

**Reported**: 2025-01-05
**Status**: Open
**Assigned**: -

**Related Files**:
- `frontend/components/shared/Header.tsx`
- `frontend/contexts/auth-context.tsx` (logout function exists but no UI trigger)

---

### Low Priority

#### [BUG-003] Frontend doesn't trim whitespace in form inputs

**Affected Components**:
- `frontend/components/tools/tracking/AddItemDialog.tsx`
- `frontend/app/login/page.tsx`
- Any other form components

**Description**:
User input is not trimmed before being sent to the API. This can lead to:
- Items with leading/trailing spaces in names (e.g., " Vanilla Syrup ")
- Partner numbers with accidental spaces
- Inconsistent data display

**Expected Behavior**:
All text inputs should be trimmed before submission:
```typescript
const trimmedName = formData.name.trim()
```

**Current Behavior**:
Raw input is sent to backend as-is. Backend **does** trim in some places, but frontend should handle this first.

**Impact**: Low
- Backend validation catches this in some cases
- Minor data quality issue
- Could cause duplicate entries due to whitespace differences

**Reported**: 2025-01-05
**Status**: Open
**Assigned**: -

**Related Files**:
- `frontend/components/tools/tracking/AddItemDialog.tsx`
- `frontend/app/login/page.tsx`

---

## 💡 Known Issues / Technical Debt

### [TECH-001] No frontend unit tests

**Description**:
No unit or integration tests exist for frontend components, hooks, or utilities. Only basic ProtectedRoute tests exist.

**Impact**: Medium
- Difficult to catch regressions
- Refactoring is risky
- No CI/CD safety net

**Recommendation**:
Add React Testing Library tests for:
- Auth components (LoginForm, ProtectedRoute)
- Inventory components (AddItemDialog, ItemCodesDialog)
- Hooks (useAuth)
- API client

**Status**: Acknowledged
**Priority**: Medium

---

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

---

### [TECH-003] Could use form validation library

**Description**:
Currently using native HTML validation and manual error handling. Could benefit from react-hook-form + zod (already installed as dependencies).

**Impact**: Low
- Current approach works but is verbose
- More code to maintain

**Recommendation**:
Migrate forms to use react-hook-form + zod for better DX and type safety.

**Status**: Acknowledged
**Priority**: Low

---

## ✅ Fixed Bugs Archive

_(Bugs will be moved here when resolved, with date and commit reference)_

**Format**:
```markdown
#### [BUG-XXX] Short description
- Fixed: YYYY-MM-DD
- Commit: abc1234
- Fixed by: Developer Name
```

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

_Last Updated: January 5, 2025_
_Maintainer: Development Team_
