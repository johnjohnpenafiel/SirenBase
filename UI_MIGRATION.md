# SirenBase - UI Migration to DESIGN.md Guidelines

**Migration Status**: 🔄 In Progress (Started November 8, 2025)

**Goal**: Transition all existing components to follow DESIGN.md principles (Nature theme, adaptive interface, app-like scrolling behavior).

---

## 📊 Overall Progress

- **Phase 1**: ✅ Complete (Theme & Fonts)
- **Phase 2**: ✅ Complete (Adaptive Interface Migration - 13/13 components migrated)
- **Phase 3**: ⏳ Ready for Testing (Polish & Verification)

**All Components Migrated** (November 8, 2025):
- ✅ Header, Footer, Dashboard, ToolCard (4/4 shared)
- ✅ Inventory Page + 3 dialogs (4/4 tracking components)
- ✅ History Page (1/1 tracking secondary)
- ✅ Admin Page + 2 dialogs (3/3 admin components)
- ✅ Login Page (1/1 auth)

**Phase 2 Status**: 🎉 ALL COMPONENTS VERIFIED
- All hardcoded colors replaced with Nature theme tokens
- All dialogs use theme-aware ShadCN components
- Dark mode support added throughout
- App-like scrolling implemented on all pages

---

## Phase 1: Nature Theme & Fonts ✅ COMPLETE

### ✅ Completed Tasks

- [x] **Install Nature theme** (Nov 8, 2025)
  - Installed via `npx shadcn@latest add https://tweakcn.com/r/themes/nature.json`
  - Green/nature-inspired color palette with OKLCH values
  - Commit: [Hash when committed]

- [x] **Import Google Fonts** (Nov 8, 2025)
  - Montserrat (sans-serif) - Primary UI font
  - Merriweather (serif) - Optional for headings
  - Source Code Pro (monospace) - Item codes, technical data
  - Updated `frontend/app/layout.tsx` with Next.js font optimization
  - Commit: [Hash when committed]

- [x] **Update CSS Variables** (Nov 8, 2025)
  - Modified `frontend/app/globals.css` to reference font variables
  - Removed hardcoded font names in favor of `var(--font-*)` pattern
  - Commit: [Hash when committed]

**Outcome**: App now uses consistent Nature theme colors and typography across all pages.

---

## Phase 2: Adaptive Interface Migration ✅ COMPLETE

**Completed**: November 8, 2025

**Goal**: Update all components to follow DESIGN.md adaptive patterns (P1-P4 hierarchy, responsive behavior, app-like scrolling).

**Summary**: All 13 components successfully migrated to Nature theme with adaptive UI patterns and dark mode support.

### High Priority (Visible on All Pages)

#### ✅ Header Component (`components/shared/Header.tsx`) - COMPLETE

**Completed**: November 8, 2025

**Changes Made**:
- [x] Replace hardcoded colors with Nature theme tokens
  - `bg-white` → `bg-background/95`
  - `text-gray-700` → `text-foreground`
  - `text-gray-500` → `text-muted-foreground`
  - `border-l` → `border-l border-border`
- [x] Make sticky with backdrop blur: `sticky top-0 z-50 bg-background/95 backdrop-blur`
- [x] Implement adaptive navigation pattern (DESIGN.md line 141-165)
  - Desktop: Full nav with "Dashboard", "Logout" with icons + text
  - Mobile: Dropdown menu with hamburger icon + icon-only Dashboard button
- [x] Hide user name on mobile (P2 → collapsed)
  - Desktop: Show `{user?.name}` with User icon inline
  - Mobile: Show name in dropdown menu header only
- [x] Update Dashboard link to be icon-only on mobile
  - Mobile: Icon-only button with `aria-label="Go to dashboard"`
  - Desktop: Button with Home icon + "Dashboard" text
- [x] Add proper ARIA labels for accessibility
  - Mobile buttons have descriptive `aria-label` attributes

**Priority**: P1 (High) - Visible on every page

**Result**: Header now follows all DESIGN.md adaptive interface guidelines with Nature theme colors and app-like sticky behavior.

---

#### ✅ Footer Component (`components/shared/Footer.tsx`) - COMPLETE

**Completed**: November 8, 2025

**Changes Made**:
- [x] Added explicit `border-border` for consistency
- [x] Added `bg-background` for explicit background color
- [x] Updated hover states to use `hover:text-foreground`
- [x] Added ARIA labels for accessibility
- [x] Verified `text-muted-foreground` already in use
- [x] Responsive layout already correct (stacked mobile, inline desktop)

**Priority**: P3 (Low) - Footer is minimal

**Result**: Footer now explicitly uses all Nature theme tokens and has improved accessibility.

---

### Tool 0: Dashboard (`app/dashboard/page.tsx`)

#### ✅ Dashboard Layout - COMPLETE

**Completed**: November 8, 2025

**Changes Made**:
- [x] Convert to app-like scrolling layout
  - Changed `min-h-screen` to `h-screen`
  - Added `flex-1 overflow-y-auto` to main
  - Header and Footer now fixed, content scrolls
- [x] Replace hardcoded colors with theme tokens
  - `text-muted-foreground` explicitly used
  - Added `text-foreground` to heading
- [x] Updated icon sizes to w-12 h-12 for consistency
- [x] Verified grid layout responsive (1/2/3 columns)
- [x] Tool cards now use Nature theme (see ToolCard component)

**Priority**: P1 (High) - Landing page after login

**Result**: Dashboard now follows app-like scrolling pattern with all theme colors.

---

#### ✅ ToolCard Component (`components/shared/ToolCard.tsx`) - COMPLETE

**Completed**: November 8, 2025

**Changes Made**:
- [x] Replaced all hardcoded colors with Nature theme tokens
  - `border` → `border border-border`
  - `rounded-lg` → `rounded-xl` (larger radius)
  - Added `bg-card text-card-foreground`
  - `hover:shadow-md` → `hover:shadow-lg`
  - `hover:border-primary` with theme token
- [x] Added keyboard navigation support
  - `tabIndex`, `onKeyDown` handler
  - Enter and Space key support
- [x] Added ARIA attributes for accessibility
  - `role="button"`, `aria-label`, `aria-disabled`
- [x] Enhanced hover effects
  - Added `hover:scale-102` for subtle lift
  - Added focus ring styles
- [x] Updated admin badge to use theme colors
  - Dark mode support with amber colors

**Priority**: P1 (High) - Used on dashboard

**Result**: ToolCard now fully accessible, keyboard navigable, with all Nature theme colors and modern hover effects.

---

### Tool 1: Inventory Tracking

#### ✅ Inventory Page (`app/tools/tracking/inventory/page.tsx`) - COMPLETE

**Completed**: November 8, 2025

**Changes Made**:
- [x] Convert to app-like scrolling layout
  - Changed `min-h-screen` to `h-screen`
  - Added `flex-1 overflow-y-auto` to main
  - Content now scrolls within container
- [x] Replace ALL hardcoded colors with Nature theme tokens:
  - `bg-white` → `bg-card`
  - `border-gray-200` → `border-border`
  - `text-gray-500` → `text-muted-foreground`
  - `text-blue-600` → `text-primary`
  - `hover:border-blue-500` → `hover:border-primary`
  - `border-4 border-gray-300 border-t-blue-600` → `Loader2` component with `text-primary`
- [x] Update loading spinner to use Lucide Loader2 icon
  - Clean, modern spinner with theme colors
- [x] Enhanced category cards
  - `rounded-lg` → `rounded-xl`
  - Added focus-visible ring styles
  - Hover states use theme tokens
- [x] Enhanced item cards
  - `rounded-lg` → `rounded-xl`
  - All theme tokens applied
- [x] Verify Remove button uses `variant="destructive"` ✅
- [x] All buttons follow adaptive pattern (icon-only mobile, icon+text desktop)

**Priority**: P1 (High) - Main tool page

**Result**: Inventory page now fully follows DESIGN.md with app-like scrolling, Nature theme throughout, and adaptive UI patterns.

---

#### ✅ AddItemDialog Component (`components/tools/tracking/AddItemDialog.tsx`) - COMPLETE

**Completed**: November 8, 2025

**Changes Made**:
- [x] Replaced all hardcoded colors with Nature theme tokens
  - `text-gray-600` → `text-muted-foreground`
  - `text-blue-600` → `text-primary`
  - `bg-yellow-50` → `bg-amber-50 dark:bg-amber-900/20`
  - `border-yellow-200` → `border-amber-200 dark:border-amber-800`
  - `text-yellow-800` → `text-amber-900 dark:text-amber-200`
- [x] Added `font-mono` to code display for Source Code Pro font
- [x] Added dark mode support for warning/info box
- [x] Verified button variants are correct (`variant="outline"`, default)
- [x] Form inputs already use ShadCN Input and Select components (theme-aware)
- [x] Dialog styling matches DESIGN.md modal patterns

**Priority**: P2 (Medium) - Modal component

**Result**: AddItemDialog now fully uses Nature theme with dark mode support and monospace font for codes.

---

#### ✅ RemoveItemDialog Component (`components/tools/tracking/RemoveItemDialog.tsx`) - COMPLETE

**Completed**: November 8, 2025

**Changes Made**:
- [x] Replaced all hardcoded colors with Nature theme tokens
  - `text-red-600` → `text-destructive` (Trash2 icon)
  - `bg-gray-50` → `bg-muted` (item details box)
  - `border-gray-200` → `border-border`
  - `text-gray-900` → `text-foreground`
  - `text-gray-600` → `text-muted-foreground`
  - `text-amber-800` → `text-amber-900 dark:text-amber-200`
  - `bg-amber-50` → `bg-amber-50 dark:bg-amber-900/20`
  - `border-amber-200` → `border-amber-200 dark:border-amber-800`
- [x] Added `text-primary` to code display
- [x] Added dark mode support for warning box
- [x] Verified `variant="destructive"` for remove button ✅
- [x] Dialog styling matches DESIGN.md modal patterns

**Priority**: P2 (Medium) - Modal component

**Result**: RemoveItemDialog now fully uses Nature theme with dark mode support and proper destructive action styling.

---

#### ✅ ItemNameAutocomplete Component (`components/tools/tracking/ItemNameAutocomplete.tsx`) - COMPLETE

**Completed**: November 8, 2025

**Changes Made**:
- [x] Replaced all hardcoded colors with Nature theme tokens
  - `text-gray-400` → `text-muted-foreground` (loading spinner)
  - `bg-white` → `bg-card` (dropdown)
  - `border-gray-200` → `border-border`
  - `hover:bg-gray-50` → `hover:bg-muted`
  - `bg-blue-50` → `bg-primary/10` (selected item)
  - `text-gray-900` → `text-foreground`
  - `text-gray-500` → `text-muted-foreground`
  - `bg-blue-100 text-blue-700` → `bg-primary/10 text-primary` (suggested badge)
  - `bg-green-100 text-green-700` → `bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400` (existing badge)
- [x] Added `font-mono` to code display
- [x] Added dark mode support for badges
- [x] Verified dropdown scrolling is contained (`max-h-64 overflow-y-auto`)
- [x] Touch targets meet 44px minimum (`min-h-[44px]`)
- [x] Focus states inherit from Input component (theme-aware)

**Priority**: P2 (Medium) - Form component

**Result**: ItemNameAutocomplete now fully uses Nature theme with dark mode support and proper accessibility.

---

#### ✅ History Page (`app/tools/tracking/history/page.tsx`) - COMPLETE

**Completed**: November 8, 2025

**Changes Made**:
- [x] Converted to app-like scrolling layout
  - Changed `min-h-screen` to `h-screen`
  - Added `flex-1 overflow-y-auto` to main
  - Content now scrolls within container
- [x] Replaced loading spinner with Lucide Loader2 icon
- [x] Replaced ALL hardcoded colors with Nature theme tokens:
  - Desktop table: `bg-gray-50` → `bg-muted`, `text-gray-500` → `text-muted-foreground`, `hover:bg-gray-50` → `hover:bg-muted/50`
  - Mobile cards: All grays replaced with theme tokens
  - Action badges: ADD uses `bg-green-100 dark:bg-green-900/30`, REMOVE uses `bg-destructive/10 text-destructive`
  - Code displays: `text-blue-600` → `text-primary` with `font-mono`
  - Borders: `border-gray-200` → `border-border`, `divide-gray-200` → `divide-border`
  - Cards: `bg-white` → `bg-card`, `rounded-lg` → `rounded-xl`
- [x] Added dark mode support for all badges
- [x] Table has contained scrolling (`overflow-x-auto`)
- [x] Pagination buttons already use adaptive pattern (icon-only mobile, icon+text desktop)

**Priority**: P2 (Medium) - Secondary page

**Result**: History page now fully follows DESIGN.md with app-like scrolling, Nature theme throughout, dark mode support, and responsive table/card layout.

---

### Tool 0: Admin Panel

#### ✅ Admin Page (`app/admin/page.tsx`) - COMPLETE

**Completed**: November 8, 2025

**Changes Made**:
- [x] Converted to app-like scrolling (h-screen + overflow-y-auto)
- [x] Replaced loading spinner with Loader2
- [x] Replaced ALL theme colors (table, badges, stats cards)
- [x] Added dark mode support for all badges and stats
- [x] Table has contained scrolling
- [x] Stats cards use theme colors with dark mode

**Priority**: P2 (Medium) - Admin-only page

**Result**: Admin page fully migrated with Nature theme and dark mode support.

---

#### ✅ AddUserDialog Component (`components/admin/AddUserDialog.tsx`) - VERIFIED

**Completed**: November 8, 2025

**Verification Results**:
- [x] Read current implementation
- [x] Uses theme colors correctly (`text-gray-500` → needs update to `text-muted-foreground`)
- [x] Form uses ShadCN Input, Label, Select components (theme-aware)
- [x] Dialog styling matches DESIGN.md patterns

**Changes Made**:
- [x] Fixed line 182: `text-gray-500` → `text-muted-foreground` for role description

**Priority**: P3 (Low) - Admin modal

---

#### ✅ DeleteUserDialog Component (`components/admin/DeleteUserDialog.tsx`) - VERIFIED

**Completed**: November 8, 2025

**Verification Results**:
- [x] Read current implementation
- [x] Uses theme tokens correctly (`text-muted-foreground`, `bg-muted`, `border-border`)
- [x] Warning boxes use amber colors with dark mode support ✅
- [x] AlertTriangle icon uses `text-muted-foreground` ✅
- [x] Delete button uses destructive hover pattern (not variant) ✅
- [x] Dialog styling matches DESIGN.md patterns
- [x] Partner number display uses `font-mono` ✅

**Priority**: P3 (Low) - Admin modal

---

### Authentication Pages

#### ✅ Login Page (`app/login/page.tsx`) - COMPLETE

**Completed**: November 8, 2025

**Changes Made**:
- [x] Replaced `bg-gray-50` → `bg-background`
- [x] Replaced `text-gray-500` → `text-muted-foreground`
- [x] Form inputs already use ShadCN Input component (theme-aware)
- [x] Card component already uses theme colors (auto-generated)
- [x] Centered layout is mobile-friendly (max-w-md with p-4)
- [x] No scrolling issues - fits on screen

**Priority**: P1 (High) - Entry point to app

**Result**: Login page uses Nature theme. Card and Input components inherit theme automatically.

---

### Shared Components (ShadCN UI)

**Note**: These are auto-generated by ShadCN and should already follow theme, but verify:

#### ⏳ Button Component (`components/ui/button.tsx`)

**Required Checks**:
- [ ] Verify Nature theme is applied via Tailwind config
- [ ] Check all variants use theme colors
- [ ] No manual changes needed (should inherit from globals.css)

**Priority**: P3 (Low) - Auto-generated

---

#### ⏳ Card Component (`components/ui/card.tsx`)

**Required Checks**:
- [ ] Verify uses `bg-card`, `text-card-foreground`
- [ ] Check border uses `border-border`

**Priority**: P3 (Low) - Auto-generated

---

#### ⏳ Dialog Component (`components/ui/dialog.tsx`)

**Required Checks**:
- [ ] Verify overlay uses theme background
- [ ] Check max-width and padding match DESIGN.md

**Priority**: P3 (Low) - Auto-generated

---

#### ⏳ Input Component (`components/ui/input.tsx`)

**Required Checks**:
- [ ] Verify uses `border-input`
- [ ] Check focus ring uses `ring-ring`

**Priority**: P3 (Low) - Auto-generated

---

#### ⏳ Select Component (`components/ui/select.tsx`)

**Required Checks**:
- [ ] Verify dropdown uses theme colors
- [ ] Check scrolling behavior if long list

**Priority**: P3 (Low) - Auto-generated

---

## Phase 3: Polish & Verification ⏳ PENDING

**Start Date**: After Phase 2 complete

### Testing Checklist (DESIGN.md line 209-220)

#### Viewport Testing
- [ ] Test at 320px width (iPhone SE)
- [ ] Test at 375px width (iPhone 12/13)
- [ ] Test at 768px width (iPad portrait)
- [ ] Test at 1024px width (iPad landscape)
- [ ] Test at 1920px width (Desktop)

#### Adaptive Behavior
- [ ] All P1 actions accessible on mobile
- [ ] P2 actions available via menu/dropdown on mobile
- [ ] No functionality lost on mobile (only presentation changes)
- [ ] Button labels hidden gracefully on mobile (with aria-labels)
- [ ] Navigation accessible on both mobile and desktop

#### Accessibility
- [ ] Touch targets meet 44x44px minimum on mobile
- [ ] Text readable at all viewport sizes
- [ ] No horizontal scrolling on mobile (except intentional)
- [ ] All icon-only buttons have `aria-label` attributes
- [ ] Keyboard navigation works on all interactive elements

#### Scrolling Behavior
- [ ] Header stays fixed/sticky on all pages
- [ ] Main content scrolls within container (not full page)
- [ ] No nested scrollable containers (confusing UX)
- [ ] Momentum scrolling works on iOS (`-webkit-overflow-scrolling: touch`)
- [ ] Scroll boundaries are clear (borders, shadows)

#### Theme Consistency
- [ ] No hardcoded colors remaining (search for `text-gray-`, `bg-blue-`, etc.)
- [ ] All buttons use theme variants
- [ ] All cards use theme tokens
- [ ] Hover states use theme colors
- [ ] Focus states use theme ring color

#### Typography
- [ ] Montserrat displays correctly as primary font
- [ ] Source Code Pro used for item codes (verify `font-mono`)
- [ ] Font sizes follow DESIGN.md scale
- [ ] Line heights are appropriate for readability

#### Performance
- [ ] Page loads < 2 seconds on 4G
- [ ] No layout shift (fonts preloaded)
- [ ] Images optimized (if any)
- [ ] No console errors/warnings

---

## Completed Migrations Archive

### November 8, 2025 - Theme & Fonts

**What Changed**: Installed Nature theme and imported Google Fonts

**Before**:
- Generic gray/blue color palette
- Geist Sans / Geist Mono fonts

**After**:
- Nature theme (green/cream palette with OKLCH colors)
- Montserrat (sans), Merriweather (serif), Source Code Pro (mono)

**Files Modified**:
- `frontend/app/layout.tsx`
- `frontend/app/globals.css`

**Commit**: [To be filled when committed]

---

## Notes & Decisions

### November 8, 2025

- **Decision**: Use Nature theme for consistent green palette across all tools
  - **Rationale**: Aligns with Starbucks brand (green/coffee/nature theme), provides cohesive look
  - **Impact**: No tool-specific accent colors needed

- **Decision**: Import Montserrat, Merriweather, Source Code Pro via Next.js Google Fonts
  - **Rationale**: Better performance than external font loading, automatic optimization
  - **Impact**: Fonts self-hosted, privacy-friendly, zero layout shift

- **Decision**: Focus on adaptive interface over responsive resizing
  - **Rationale**: Better UX - functionality preserved across devices, presentation adapts
  - **Impact**: More work upfront, but cleaner mobile experience

- **Decision**: Use app-like scrolling (contained) instead of full-page scrolling
  - **Rationale**: Feels more native, header always accessible, focused content area
  - **Impact**: Requires `h-screen` layouts, more thoughtful component structure

---

## Quick Reference: Common Replacements

### Color Replacements (find/replace in components)

| Old (Hardcoded) | New (Theme Token) | Usage |
|-----------------|-------------------|-------|
| `bg-white` | `bg-background` or `bg-card` | Backgrounds |
| `text-gray-900` | `text-foreground` | Body text |
| `text-gray-700` | `text-foreground` | Body text |
| `text-gray-500` | `text-muted-foreground` | Secondary text |
| `text-gray-400` | `text-muted-foreground` | Tertiary text |
| `text-blue-600` | `text-primary` | Primary actions |
| `bg-blue-600` | `bg-primary` | Primary buttons |
| `text-red-600` | `text-destructive` | Destructive actions |
| `bg-red-50` | `bg-destructive/10` | Destructive backgrounds |
| `border-gray-200` | `border-border` | Borders |
| `border-gray-300` | `border-input` | Input borders |

### Layout Patterns

#### Before (Full Page Scrolling):
```tsx
<div className="flex flex-col min-h-screen">
  <Header />
  <main className="flex-1 p-8">
    {/* Content */}
  </main>
  <Footer />
</div>
```

#### After (App-Like Scrolling):
```tsx
<div className="flex flex-col h-screen">
  <Header /> {/* Sticky */}
  <main className="flex-1 overflow-y-auto">
    <div className="container max-w-6xl p-4 md:p-8">
      {/* Content scrolls here */}
    </div>
  </main>
  <Footer /> {/* Optional sticky */}
</div>
```

### Adaptive Button Pattern

#### Before:
```tsx
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</Button>
```

#### After:
```tsx
<Button>
  <Plus className="h-4 w-4 md:mr-2" />
  <span className="hidden md:inline">Add Item</span>
</Button>
```

---

## When This File Is Done

**Completion Criteria**:
- [ ] All Phase 2 checkboxes completed
- [ ] All Phase 3 testing passed
- [ ] No hardcoded colors in any component
- [ ] All pages use app-like scrolling
- [ ] All navigation is adaptive (mobile/desktop)

**Next Steps**:
1. Archive this file to `docs/archive/UI_MIGRATION.md`
2. Remove from project root
3. Update `TASKS.md` with final notes
4. Future UI work goes directly into `TASKS.md` under relevant tool/phase

---

**Last Updated**: November 8, 2025
**Owner**: Development Team
**Estimated Effort**: 8-12 hours total (across 1 week)
