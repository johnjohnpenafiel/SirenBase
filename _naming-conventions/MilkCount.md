# Milk Count Tool - Page & Layout Naming Conventions

Reference guide for consistent naming when discussing or modifying the Milk Count tool.

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

## 2. Milk Count Landing Page

**Route**: `/tools/milk-count`
**File**: `frontend/app/tools/milk-count/page.tsx`

| Section                     | Name                            |
| --------------------------- | ------------------------------- |
| Full Page                   | **Milk Count Landing Page**     |
| Top Bar                     | **Header**                      |
| Back Button                 | **Back Button**                 |
| Title Area                  | **Page Title Section**          |
| Date Display                | **Session Date**                |
| Main Status Card            | **Session Status Card**         |
| Status Icon Container       | **Status Icon**                 |
| Status Title                | **Status Title**                |
| Status Description          | **Status Description**          |
| Primary CTA                 | **Action Button** (dynamic text)|
| Progress Details Card       | **Session Progress Card**       |
| Progress Steps              | **Progress Steps**              |
| Individual Step             | **Progress Step**               |
| View History Link           | **View Past Sessions Button**   |

**Session Status States:**

| Status      | Status Title                | Action Button Text       |
| ----------- | --------------------------- | ------------------------ |
| (none)      | No Session Today            | Start Night Count        |
| night_foh   | FOH Count In Progress       | Continue FOH Count       |
| night_boh   | BOH Count In Progress       | Continue BOH Count       |
| morning     | Morning Count Needed        | Start Morning Count      |
| on_order    | On Order Entry Needed       | Enter On Order           |
| completed   | Count Completed             | View Summary             |

---

## 3. Night Count - FOH Page

**Route**: `/tools/milk-count/night/foh`
**File**: `frontend/app/tools/milk-count/night/foh/page.tsx`

| Section              | Name                              |
| -------------------- | --------------------------------- |
| Full Page            | **FOH Count Page**                |
| Top Bar              | **Header**                        |
| Fixed Page Header    | **Page Header Bar**               |
| Back Button          | **Back Button**                   |
| Moon Icon            | **Phase Icon**                    |
| Page Title           | **Page Title** ("Night Count - FOH") |
| Subtitle             | **Page Subtitle**                 |
| Progress Text        | **Progress Counter** (X/Y Counted)|
| Progress Bar         | **Progress Bar**                  |
| Scrollable Content   | **Count List**                    |
| Dairy Section        | **Dairy Category Section**        |
| Non-Dairy Section    | **Non-Dairy Category Section**    |
| Section Header       | **Category Header**               |
| Individual Counter   | **Milk Count Card**               |
| Fixed Bottom Bar     | **Action Footer**                 |
| Bottom CTA           | **Save & Continue Button**        |

---

## 4. Night Count - BOH Page

**Route**: `/tools/milk-count/night/boh`
**File**: `frontend/app/tools/milk-count/night/boh/page.tsx`

| Section              | Name                              |
| -------------------- | --------------------------------- |
| Full Page            | **BOH Count Page**                |
| Top Bar              | **Header**                        |
| Fixed Page Header    | **Page Header Bar**               |
| Back Button          | **Back Button** (to FOH)          |
| Moon Icon            | **Phase Icon**                    |
| Page Title           | **Page Title** ("Night Count - BOH") |
| Subtitle             | **Page Subtitle**                 |
| Progress Text        | **Progress Counter**              |
| Progress Bar         | **Progress Bar**                  |
| Scrollable Content   | **Count List**                    |
| Dairy Section        | **Dairy Category Section**        |
| Non-Dairy Section    | **Non-Dairy Category Section**    |
| Section Header       | **Category Header**               |
| Individual Counter   | **Milk Count Card**               |
| Fixed Bottom Bar     | **Action Footer**                 |
| Bottom CTA           | **Save Night Count Button**       |

---

## 5. Morning Count Page

**Route**: `/tools/milk-count/morning`
**File**: `frontend/app/tools/milk-count/morning/page.tsx`

| Section                 | Name                                |
| ----------------------- | ----------------------------------- |
| Full Page               | **Morning Count Page**              |
| Top Bar                 | **Header**                          |
| Fixed Page Header       | **Page Header Bar**                 |
| Back Button             | **Back Button**                     |
| Sun Icon                | **Phase Icon**                      |
| Page Title              | **Page Title** ("Morning Count")    |
| Subtitle                | **Page Subtitle**                   |
| Progress Text           | **Progress Counter** (X/Y Updated)  |
| Progress Bar            | **Progress Bar**                    |
| Scrollable Content      | **Count List**                      |
| Instructions Box        | **Instructions Card**               |
| Dairy Section           | **Dairy Category Section**          |
| Non-Dairy Section       | **Non-Dairy Category Section**      |
| Section Header          | **Category Header**                 |
| Individual Row          | **Morning Count Row**               |
| Night BOH Display       | **Night BOH Label**                 |
| Expand Button           | **Expand Button**                   |
| Expanded Area           | **Details Panel**                   |
| Method Buttons          | **Method Toggle**                   |
| BOH Count Option        | **Count Current BOH Button**        |
| Delivered Option        | **Enter Delivered Button**          |
| Calculation Display     | **Calculation Cards**               |
| Fixed Bottom Bar        | **Action Footer**                   |
| Bottom CTA              | **Save & Continue Button**          |

---

## 6. On Order Page

**Route**: `/tools/milk-count/on-order`
**File**: `frontend/app/tools/milk-count/on-order/page.tsx`

| Section              | Name                              |
| -------------------- | --------------------------------- |
| Full Page            | **On Order Page**                 |
| Top Bar              | **Header**                        |
| Fixed Page Header    | **Page Header Bar**               |
| Back Button          | **Back Button**                   |
| Clipboard Icon       | **Phase Icon**                    |
| Page Title           | **Page Title** ("On Order")       |
| Subtitle             | **Page Subtitle**                 |
| Progress Text        | **Progress Counter** (X/Y Entered)|
| Progress Bar         | **Progress Bar**                  |
| Scrollable Content   | **Count List**                    |
| Instructions Box     | **IMS Instructions Card**         |
| Dairy Section        | **Dairy Category Section**        |
| Non-Dairy Section    | **Non-Dairy Category Section**    |
| Section Header       | **Category Header**               |
| Individual Row       | **On Order Row**                  |
| Fixed Bottom Bar     | **Action Footer**                 |
| Bottom CTA           | **Save & View Summary Button**    |

---

## 7. Summary Page

**Route**: `/tools/milk-count/summary/[sessionId]`
**File**: `frontend/app/tools/milk-count/summary/[sessionId]/page.tsx`

| Section              | Name                              |
| -------------------- | --------------------------------- |
| Full Page            | **Summary Page**                  |
| Top Bar              | **Header**                        |
| Fixed Page Header    | **Page Header Bar**               |
| Back Button          | **Back Button**                   |
| Check Icon           | **Completion Icon**               |
| Page Title           | **Page Title** ("Milk Count Summary") |
| Date Display         | **Session Date**                  |
| Mobile View          | **Summary Cards** (card layout)   |
| Mobile Section       | **Category Section**              |
| Mobile Card          | **Summary Card**                  |
| Card Header          | **Card Header**                   |
| Card Grid            | **Data Grid**                     |
| Desktop View         | **Summary Table** (table layout)  |
| Table Header         | **Table Header Row**              |
| Category Row         | **Category Header Row**           |
| Data Row             | **Summary Row**                   |
| Order Cell           | **Order Amount** (color-coded)    |
| Totals Card          | **Totals Card**                   |
| Total Grid           | **Totals Grid**                   |
| Individual Total     | **Total Item**                    |
| Action Buttons       | **Action Buttons**                |
| History Button       | **View History Button**           |
| Dashboard Button     | **Back to Dashboard Button**      |

---

## 8. History Page

**Route**: `/tools/milk-count/history`
**File**: `frontend/app/tools/milk-count/history/page.tsx`

| Section              | Name                              |
| -------------------- | --------------------------------- |
| Full Page            | **History Page**                  |
| Top Bar              | **Header**                        |
| Fixed Page Header    | **Page Header Bar**               |
| Back Button          | **Back Button**                   |
| Page Title           | **Page Title** ("Milk Count History") |
| Subtitle             | **Page Subtitle**                 |
| Empty State          | **Empty State**                   |
| Session List         | **Session History List**          |
| Individual Card      | **History Card**                  |
| Date Icon            | **Date Badge**                    |
| Session Info         | **Session Info**                  |
| Date Label           | **Session Date Label**            |
| Full Date            | **Full Date**                     |
| Status Badge         | **Status Badge**                  |
| Chevron              | **View Indicator**                |
| Completion Info      | **Completion Details**            |
| Load More Button     | **Load More Button**              |

---

## 9. Admin - Par Levels Page

**Route**: `/admin/milk-pars`
**File**: `frontend/app/admin/milk-pars/page.tsx`

| Section              | Name                              |
| -------------------- | --------------------------------- |
| Full Page            | **Par Levels Page**               |
| Top Bar              | **Header**                        |
| Fixed Page Header    | **Page Header Section**           |
| Back Button          | **Back Button** (to Admin Panel)  |
| Page Title           | **Page Title** ("Milk Count Pars")|
| Subtitle             | **Page Subtitle**                 |
| Scrollable Content   | **Content Area**                  |
| Info Card            | **Formula Info Card**             |
| Dairy Section        | **Dairy Category Section**        |
| Non-Dairy Section    | **Non-Dairy Category Section**    |
| Section Header       | **Category Header**               |
| Individual Row       | **Par Level Row**                 |
| Category Icon        | **Category Icon**                 |
| Milk Name            | **Milk Type Label**               |
| Audit Info           | **Audit Info** (updated by/date)  |
| View Mode            | **Par Value Display**             |
| Edit Mode            | **Inline Editor**                 |
| Par Input            | **Par Value Input**               |
| Save Button          | **Save Button**                   |
| Cancel Button        | **Cancel Button**                 |

---

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      DASHBOARD PAGE                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     HEADER                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │ TOOL CARD  │ │ TOOL CARD  │ │ TOOL CARD  │             │
│  │ Inventory  │ │ Milk Count │←│   RTD&E    │             │
│  └────────────┘ └──────┬─────┘ └────────────┘             │
└────────────────────────┼────────────────────────────────────┘
                         ↓ Click
┌─────────────────────────────────────────────────────────────┐
│               MILK COUNT LANDING PAGE                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     HEADER                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ← Back    Milk Count                               │   │
│  │            Today's Date                              │   │
│  └─────────────────────────────────────────────────────┘   │
│              ┌─────────────────────┐                       │
│              │  SESSION STATUS     │                       │
│              │      CARD           │                       │
│              │  [Status Icon]      │                       │
│              │  Status Title       │                       │
│              │  Description        │                       │
│              │  [ ACTION BUTTON ]  │                       │
│              └─────────────────────┘                       │
│              ┌─────────────────────┐                       │
│              │  SESSION PROGRESS   │                       │
│              │      CARD           │                       │
│              │  1. FOH ✓           │                       │
│              │  2. BOH ✓           │                       │
│              │  3. Morning ●       │                       │
│              │  4. On Order ○      │                       │
│              └─────────────────────┘                       │
│              [ View Past Sessions ]                        │
└─────────────────────────────────────────────────────────────┘
                         ↓ Start Night Count
┌─────────────────────────────────────────────────────────────┐
│                    FOH COUNT PAGE                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     HEADER                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ← Back  🌙 Night Count - FOH           3/9 Counted │   │
│  │  ════════════════════════ 33%                       │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  DAIRY CATEGORY SECTION                              │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │ MILK COUNT CARD - Whole                     │    │   │
│  │  │ [🥛] Whole        [−] [ 15 ] [+]           │    │   │
│  │  │      Dairy                                  │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  NON-DAIRY CATEGORY SECTION                          │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │ MILK COUNT CARD - Oat                       │    │   │
│  │  │ [🌿] Oat          [−] [  8 ] [+]           │    │   │
│  │  │      Non-Dairy                              │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          [ Save & Continue to BOH → ]               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    BOH COUNT PAGE                           │
│  (Same structure as FOH COUNT PAGE)                        │
│  Title: "Night Count - BOH"                                │
│  CTA: [ ✓ Save Night Count ]                               │
└─────────────────────────────────────────────────────────────┘
                         ↓ Returns to Landing (status: morning)
                         ↓ Continue to Morning
┌─────────────────────────────────────────────────────────────┐
│                  MORNING COUNT PAGE                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     HEADER                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ← Back  ☀️ Morning Count               5/9 Updated │   │
│  │  ════════════════════════════════ 55%               │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  INSTRUCTIONS CARD                                   │   │
│  │  How to count: ...                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  MORNING COUNT ROW - Whole                          │   │
│  │  [🥛] Whole          [−] [ 30 ] [+]  [▼]           │   │
│  │       Night BOH: 20                                 │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  DETAILS PANEL (expanded)                   │   │   │
│  │  │  [Count Current BOH] [Enter Delivered]      │   │   │
│  │  │  Current BOH: 30    Delivered: 10           │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          [ Save & Continue → ]                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    ON ORDER PAGE                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     HEADER                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ← Back  📋 On Order                    2/9 Entered │   │
│  │  ════════════════ 22%                               │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  IMS INSTRUCTIONS CARD                              │   │
│  │  Check IMS for on-order quantities: ...             │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ON ORDER ROW - Whole                               │   │
│  │  [🥛] Whole              [−] [ 5 ] [+]             │   │
│  │       Currently on order                            │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          [ Save & View Summary → ]                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                     SUMMARY PAGE                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     HEADER                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ← Back  ✓ Milk Count Summary                       │   │
│  │  Wednesday, January 15, 2026                        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  SUMMARY TABLE (Desktop)            │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │ Milk | FOH | BOH | Del | OnOrd | Tot | Par | Order │ │
│  │  ├───────────────────────────────────────────────┤  │   │
│  │  │ 🥛 Dairy                                      │  │   │
│  │  │ Whole | 15 | 20 | 10 |  5  | 45 | 60 | [10]  │  │   │
│  │  │ 🌿 Non-Dairy                                  │  │   │
│  │  │ Oat   |  8 | 12 |  6 |  2  | 26 | 35 | [ 7]  │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  TOTALS CARD                        │   │
│  │  FOH: 100  BOH: 150  Delivered: 80  On Order: 15   │   │
│  │  Total Inventory: 330          Total Order: 55     │   │
│  └─────────────────────────────────────────────────────┘   │
│         [View History]  [Back to Dashboard]                │
└─────────────────────────────────────────────────────────────┘
```

---

## Session Status State Machine

```
night_foh → night_boh → morning → on_order → completed
    ↑                                    │
    └────────────────────────────────────┘ (new day, new session)
```

| Status      | Phase Icon | Color   | Landing Page Shows              |
| ----------- | ---------- | ------- | ------------------------------- |
| (none)      | Moon       | Slate   | Empty Session State             |
| night_foh   | Moon       | Blue    | FOH Count In Progress           |
| night_boh   | Moon       | Indigo  | BOH Count In Progress           |
| morning     | Sun        | Amber   | Morning Count Needed            |
| on_order    | Clipboard  | Purple  | On Order Entry Needed           |
| completed   | Check      | Green   | Count Completed                 |

---

## Quick Reference Table

| User Action                     | Page/Component Name                       |
| ------------------------------- | ----------------------------------------- |
| Login → See tools               | **Dashboard Page**                        |
| Click Milk Count card           | **Milk Count Landing Page**               |
| Click "Start Night Count"       | → **FOH Count Page**                      |
| Count FOH milks                 | **Milk Count Cards** in **Category Sections** |
| Click "Save & Continue to BOH"  | → **BOH Count Page**                      |
| Count BOH milks                 | **Milk Count Cards**                      |
| Click "Save Night Count"        | → **Landing Page** (status: morning)      |
| Click "Start Morning Count"     | → **Morning Count Page**                  |
| Enter morning values            | **Morning Count Rows** with **Method Toggle** |
| Click "Save & Continue"         | → **On Order Page**                       |
| Enter on-order quantities       | **On Order Rows**                         |
| Click "Save & View Summary"     | → **Summary Page**                        |
| Click "View History"            | → **History Page**                        |
| Click history item              | → **Summary Page** (for that session)     |
| Admin: Edit par levels          | **Par Levels Page** with **Inline Editor** |

---

## Component File Mapping

| Name                      | File Path                                                    |
| ------------------------- | ------------------------------------------------------------ |
| Header                    | `frontend/components/shared/Header.tsx`                      |
| Landing Page              | `frontend/app/tools/milk-count/page.tsx`                     |
| FOH Count Page            | `frontend/app/tools/milk-count/night/foh/page.tsx`           |
| BOH Count Page            | `frontend/app/tools/milk-count/night/boh/page.tsx`           |
| Morning Count Page        | `frontend/app/tools/milk-count/morning/page.tsx`             |
| On Order Page             | `frontend/app/tools/milk-count/on-order/page.tsx`            |
| Summary Page              | `frontend/app/tools/milk-count/summary/[sessionId]/page.tsx` |
| History Page              | `frontend/app/tools/milk-count/history/page.tsx`             |
| Par Levels Page (Admin)   | `frontend/app/admin/milk-pars/page.tsx`                      |
| Milk Count Card           | `frontend/components/tools/milk-count/MilkCountCard.tsx`     |
| Morning Count Row         | `frontend/components/tools/milk-count/MorningCountRow.tsx`   |
| On Order Row              | `frontend/components/tools/milk-count/OnOrderRow.tsx`        |

---

## UI Element Naming Patterns

### Counter Components
All counter components follow a similar pattern:

| Element           | Name                |
| ----------------- | ------------------- |
| Category Icon     | **Category Icon**   |
| Milk Name         | **Milk Type Label** |
| Decrement Button  | **Minus Button**    |
| Count Display     | **Count Display**   |
| Count Input       | **Count Input** (edit mode) |
| Increment Button  | **Plus Button**     |

### Progress Indicators
| Element           | Name                        |
| ----------------- | --------------------------- |
| Numeric Progress  | **Progress Counter** (X/Y)  |
| Visual Progress   | **Progress Bar**            |
| Progress Label    | **Progress Label**          |

### Color Coding (Summary)
| Condition         | Color  | Meaning              |
| ----------------- | ------ | -------------------- |
| order = 0         | Green  | At or above par      |
| order 1-3         | Amber  | Close to par         |
| order > 3         | Red    | Below par, order more|
