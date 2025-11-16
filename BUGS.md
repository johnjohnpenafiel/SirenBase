# SirenBase - Bug & Issue Tracker

This document tracks bugs, issues, and technical debt in the SirenBase platform. All bugs should be referenced by their ID (e.g., `[BUG-001]`) in commit messages when fixed.

---

## 🐛 Active Bugs

_(No active bugs currently - all known bugs have been resolved!)_

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

_Last Updated: January 15, 2025_
_Maintainer: Development Team_
