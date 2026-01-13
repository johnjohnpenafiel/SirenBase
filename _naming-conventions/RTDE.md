# RTDE Tool - Page & Layout Naming Conventions

Reference guide for consistent naming when discussing or modifying the RTD&E tool.

---

## 1. Dashboard Page

**Route**: `/dashboard`
**File**: `frontend/app/dashboard/page.tsx`

| Section         | Name                    |
| --------------- | ----------------------- |
| Full Page       | **Dashboard Page**      |
| Top Bar         | **Header** (global)     |
| Welcome Area    | **Page Title Section**  |
| Cards Grid      | **Tool Selection Grid** |
| Individual Card | **Tool Card**           |

---

## 2. RTDE Landing Page

**Route**: `/tools/rtde`
**File**: `frontend/app/tools/rtde/page.tsx`

| Section           | Name                                           |
| ----------------- | ---------------------------------------------- |
| Full Page         | **RTDE Landing Page** (or **RTDE Entry Page**) |
| Top Bar           | **Header**                                     |
| Center Content    | **Hero Section**                               |
| Icon Container    | **Tool Icon**                                  |
| Title + Subtitle  | **Page Title Section**                         |
| Instructions Box  | **How It Works Section**                       |
| Main CTA          | **Start Session Button**                       |
| Popup (if exists) | **Resume Session Dialog**                      |

---

## 3. RTDE Session Page - Counting Phase

**Route**: `/tools/rtde/session/[sessionId]`
**File**: `frontend/app/tools/rtde/session/[sessionId]/page.tsx`
**Phase Component**: `RTDECountingPhase.tsx`

| Section              | Name                                    |
| -------------------- | --------------------------------------- |
| Full Page            | **Session Page**                        |
| Active Phase         | **Counting Phase**                      |
| Top Bar              | **Header**                              |
| Desktop Left Panel   | **Session Sidebar**                     |
| Item List in Sidebar | **Item Navigation List**                |
| Sidebar CTA          | **Start Pull List Button**              |
| Mobile Bottom Sheet  | **Mobile Drawer** (or **Items Drawer**) |
| Top Card w/ Progress | **Progress Card**                       |
| Progress Bar         | **Progress Bar**                        |
| Main Card (center)   | **Count Card**                          |
| +/- Buttons          | **Counter Controls**                    |
| Bottom Bar           | **Navigation Footer**                   |
| Nav Buttons          | **Previous/Next Buttons**               |
| Last Item CTA        | **Start Pull Button**                   |
| Mobile CTA           | **Items List Button** (opens drawer)    |

**Dialogs during Counting**:

- **Uncounted Items Dialog** - warns about items with no count

---

## 4. RTDE Session Page - Pulling Phase

**Route**: `/tools/rtde/session/[sessionId]` (same route, different phase)
**Phase Component**: `RTDEPullingPhase.tsx`

| Section              | Name                                    |
| -------------------- | --------------------------------------- |
| Active Phase         | **Pulling Phase**                       |
| Top Card w/ Progress | **Pull Progress Card**                  |
| Header Text          | **Pull Header** ("Pull Items from BOH") |
| Progress Bar         | **Pull Progress Bar**                   |
| Scrollable List      | **Pull List**                           |
| Individual Row       | **Pull List Item**                      |
| Checkbox             | **Pulled Checkbox**                     |
| Empty State          | **All At Par State**                    |
| Desktop CTA          | **Complete Button** (in header)         |
| Mobile CTA           | **Complete Session Button** (bottom)    |

**Dialogs during Pulling**:

- **Complete Session Dialog** - confirms session deletion

---

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      DASHBOARD PAGE                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     HEADER                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               PAGE TITLE SECTION                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │ TOOL CARD  │ │ TOOL CARD  │ │ TOOL CARD  │             │
│  │ Inventory  │ │ Milk Count │ │   RTD&E    │←── Click    │
│  └────────────┘ └────────────┘ └────────────┘             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   RTDE LANDING PAGE                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     HEADER                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                    ┌────────────┐                          │
│                    │ TOOL ICON  │                          │
│                    └────────────┘                          │
│                 PAGE TITLE SECTION                         │
│              ┌─────────────────────┐                       │
│              │  HOW IT WORKS       │                       │
│              │     SECTION         │                       │
│              └─────────────────────┘                       │
│              [  START NEW SESSION  ] ← Click               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               SESSION PAGE - COUNTING PHASE                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     HEADER                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌──────────────┬──────────────────────────────────────┐   │
│  │   SESSION    │        ┌─────────────────┐           │   │
│  │   SIDEBAR    │        │  PROGRESS CARD  │           │   │
│  │              │        └─────────────────┘           │   │
│  │ ┌──────────┐ │                                      │   │
│  │ │ NAV LIST │ │        ┌─────────────────┐           │   │
│  │ │ - Item 1 │ │        │   COUNT CARD    │           │   │
│  │ │ - Item 2 │ │        │  [−] 5 [+]      │           │   │
│  │ │ - Item 3 │ │        └─────────────────┘           │   │
│  │ └──────────┘ │                                      │   │
│  │              │        ┌─────────────────┐           │   │
│  │ [START PULL] │        │ NAVIGATION      │           │   │
│  └──────────────┴────────│ FOOTER          │───────────┘   │
│                          │ [Prev] [Next]   │               │
│                          └─────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                              ↓ (Click "Start Pull")
┌─────────────────────────────────────────────────────────────┐
│               SESSION PAGE - PULLING PHASE                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     HEADER                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PULL PROGRESS CARD          [Complete]             │   │
│  │  ═══════════════════  75%                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   PULL LIST                          │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │ ☑ PULL LIST ITEM - Sandwich (Need: 3)         │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │ ☐ PULL LIST ITEM - Juice (Need: 5)            │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│              [ COMPLETE SESSION BUTTON ]                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    Back to RTDE Landing Page
```

---

## Quick Reference Table

| User Action               | Page/Component Name                                         |
| ------------------------- | ----------------------------------------------------------- |
| Login → See tools         | **Dashboard Page**                                          |
| Click RTD&E card          | **RTDE Landing Page**                                       |
| Click "Start New Session" | → **Session Page**                                          |
| Counting items            | **Counting Phase**                                          |
| View all items (mobile)   | **Mobile Drawer**                                           |
| Click "Start Pull"        | → **Pulling Phase**                                         |
| Check off items           | **Pull List**                                               |
| Click "Complete"          | **Complete Session Dialog** → back to **RTDE Landing Page** |

---

## Component File Mapping

| Name                   | File Path                                                 |
| ---------------------- | --------------------------------------------------------- |
| Header                 | `frontend/components/shared/Header.tsx`                   |
| Session Page           | `frontend/app/tools/rtde/session/[sessionId]/page.tsx`    |
| Counting Phase         | `frontend/components/tools/rtde/RTDECountingPhase.tsx`    |
| Pulling Phase          | `frontend/components/tools/rtde/RTDEPullingPhase.tsx`     |
| Session Sidebar        | `frontend/components/tools/rtde/RTDESessionSidebar.tsx`   |
| Mobile Drawer          | `frontend/components/tools/rtde/RTDEMobileDrawer.tsx`     |
| Count Card             | `frontend/components/tools/rtde/RTDECountCard.tsx`        |
| Pull List Item         | `frontend/components/tools/rtde/RTDEPullListItem.tsx`     |
| Resume Session Dialog  | `frontend/components/tools/rtde/ResumeSessionDialog.tsx`  |
| Uncounted Items Dialog | `frontend/components/tools/rtde/UncountedItemsDialog.tsx` |
