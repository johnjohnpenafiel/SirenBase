# Inventory Tracking Tool - Page & Layout Naming Conventions

Reference guide for consistent naming when discussing or modifying the Inventory Tracking tool.

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

## 2. Tracking Landing Page (Redirect)

**Route**: `/tools/tracking`
**File**: `frontend/app/tools/tracking/page.tsx`

| Section         | Name                    |
| --------------- | ----------------------- |
| Full Page       | **Tracking Landing Page** (auto-redirects to Inventory Page) |
| Loading State   | **Loading Spinner**     |

*Note: This page immediately redirects to `/tools/tracking/inventory`*

---

## 3. Inventory Page

**Route**: `/tools/tracking/inventory`
**File**: `frontend/app/tools/tracking/inventory/page.tsx`

### Page Structure

| Section                  | Name                              |
| ------------------------ | --------------------------------- |
| Full Page                | **Inventory Page**                |
| Top Bar                  | **Header**                        |
| Fixed Page Header        | **Page Header Section**           |
| Back Button (filtered)   | **Back to Categories Button**     |
| Page Title               | **Page Title** ("Inventory Tracking" or category name) |
| Action Buttons           | **Action Buttons**                |
| History Button           | **History Button**                |
| Add Item Button          | **Add Item Button**               |
| View Toggle              | **View Toggle**                   |
| All Items Toggle         | **All Items Button**              |
| Categories Toggle        | **Categories Button**             |
| Scrollable Content       | **Content Area**                  |

### Categories View (Default)

| Section              | Name                              |
| -------------------- | --------------------------------- |
| View Mode            | **Categories View**               |
| Grid Layout          | **Category Grid**                 |
| Individual Card      | **Category Card**                 |
| Category Name        | **Category Name**                 |
| Item Count           | **Item Count**                    |

### All Items View

| Section              | Name                              |
| -------------------- | --------------------------------- |
| View Mode            | **All Items View**                |
| Item List            | **Item List**                     |
| Empty State          | **Empty State**                   |
| Individual Item      | **Item Card**                     |
| Item Name            | **Item Name**                     |
| Item Category        | **Item Category Label**           |
| Item Code            | **Item Code**                     |
| Remove Button        | **Remove Button**                 |

### Filtered View (Category Selected)

| Section              | Name                              |
| -------------------- | --------------------------------- |
| View Mode            | **Filtered View**                 |
| Item List            | **Filtered Item List**            |
| Individual Item      | **Item Card**                     |

---

## 4. History Page

**Route**: `/tools/tracking/history`
**File**: `frontend/app/tools/tracking/history/page.tsx`

| Section              | Name                              |
| -------------------- | --------------------------------- |
| Full Page            | **History Page**                  |
| Top Bar              | **Header**                        |
| Fixed Page Header    | **Page Header Section**           |
| Back Button          | **Back to Inventory Button**      |
| Page Title           | **Page Title** ("Audit History")  |
| Page Subtitle        | **Page Subtitle**                 |
| Filter Section       | **Filter Section**                |
| Action Filter        | **Action Filter Dropdown**        |
| Entry Count          | **Entry Count Label**             |
| Scrollable Content   | **Content Area**                  |
| Desktop View         | **History Table**                 |
| Table Header         | **Table Header Row**              |
| Table Row            | **History Row**                   |
| Mobile View          | **History Cards**                 |
| Mobile Card          | **History Card**                  |
| Action Badge         | **Action Badge** (Add/Remove)     |
| Pagination           | **Pagination Controls**           |
| Page Info            | **Page Info**                     |
| Previous Button      | **Previous Button**               |
| Next Button          | **Next Button**                   |

---

## 5. Add Item Dialog

**Component**: `AddItemDialog.tsx`
**File**: `frontend/components/tools/tracking/AddItemDialog.tsx`

### Step 1: Input Step

| Section              | Name                              |
| -------------------- | --------------------------------- |
| Dialog               | **Add Item Dialog**               |
| Step                 | **Input Step**                    |
| Dialog Title         | **Dialog Title** ("Add New Item") |
| Dialog Description   | **Dialog Description**            |
| Form                 | **Add Item Form**                 |
| Name Field           | **Item Name Field**               |
| Autocomplete         | **Item Name Autocomplete**        |
| Category Field       | **Category Field**                |
| Category Dropdown    | **Category Dropdown**             |
| Cancel Button        | **Cancel Button**                 |
| Generate Button      | **Generate Code Button**          |

### Step 2: Confirm Step

| Section              | Name                              |
| -------------------- | --------------------------------- |
| Step                 | **Confirm Step**                  |
| Dialog Title         | **Dialog Title** ("Code Generated!") |
| Dialog Description   | **Dialog Description**            |
| Code Display         | **Generated Code Display**        |
| Warning Box          | **Warning Box**                   |
| Cancel Button        | **Cancel Button**                 |
| Confirm Button       | **Confirm & Save Button**         |

---

## 6. Remove Item Dialog

**Component**: `RemoveItemDialog.tsx`
**File**: `frontend/components/tools/tracking/RemoveItemDialog.tsx`

| Section              | Name                              |
| -------------------- | --------------------------------- |
| Dialog               | **Remove Item Dialog**            |
| Dialog Title         | **Dialog Title** ("Remove Item?") |
| Dialog Description   | **Dialog Description**            |
| Item Details Box     | **Item Details Box**              |
| Item Name            | **Item Name**                     |
| Item Code            | **Item Code**                     |
| Warning Box          | **Warning Box**                   |
| Cancel Button        | **Cancel Button**                 |
| Remove Button        | **Remove Item Button**            |

---

## 7. Item Name Autocomplete

**Component**: `ItemNameAutocomplete.tsx`
**File**: `frontend/components/tools/tracking/ItemNameAutocomplete.tsx`

| Section              | Name                              |
| -------------------- | --------------------------------- |
| Component            | **Item Name Autocomplete**        |
| Input Field          | **Name Input**                    |
| Loading Indicator    | **Loading Spinner**               |
| Dropdown             | **Suggestions Dropdown**          |
| Individual Item      | **Suggestion Item**               |
| Item Name            | **Suggestion Name**               |
| Item Code            | **Suggestion Code** (existing only) |
| Source Badge         | **Source Badge** (Existing/Suggested) |
| No Results           | **No Results Message**            |

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
│  │ Inventory ←│ │ Milk Count │ │   RTD&E    │             │
│  └──────┬─────┘ └────────────┘ └────────────┘             │
└─────────┼───────────────────────────────────────────────────┘
          ↓ Click
┌─────────────────────────────────────────────────────────────┐
│                    INVENTORY PAGE                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     HEADER                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Inventory Tracking      [History] [+ Add Item]     │   │
│  │  [ All Items ] [ Categories ]                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ══════════════ CATEGORIES VIEW (default) ═══════════════  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  CATEGORY GRID                       │   │
│  │  ┌──────────────┐  ┌──────────────┐                 │   │
│  │  │ CATEGORY     │  │ CATEGORY     │                 │   │
│  │  │ CARD         │  │ CARD         │                 │   │
│  │  │ Syrups       │  │ Sauces       │                 │   │
│  │  │ 12           │  │ 8            │                 │   │
│  │  │ items        │  │ items        │                 │   │
│  │  └──────────────┘  └──────────────┘                 │   │
│  │  ┌──────────────┐  ┌──────────────┐                 │   │
│  │  │ Coffee Beans │  │ Powders      │                 │   │
│  │  │ 5            │  │ 3            │                 │   │
│  │  └──────────────┘  └──────────────┘                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          ↓ Click Category Card
┌─────────────────────────────────────────────────────────────┐
│                    INVENTORY PAGE                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     HEADER                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ← Back to Categories                               │   │
│  │  Syrups                  [History] [+ Add Item]     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ═══════════════════ FILTERED VIEW ═══════════════════════ │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   ITEM LIST                          │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │ ITEM CARD                                     │  │   │
│  │  │ Vanilla Syrup                    [Remove]     │  │   │
│  │  │ Syrups                                        │  │   │
│  │  │ Code: 2847                                    │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │ ITEM CARD                                     │  │   │
│  │  │ Caramel Syrup                    [Remove]     │  │   │
│  │  │ Syrups                                        │  │   │
│  │  │ Code: 3912                                    │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          ↓ Click "+ Add Item"
┌─────────────────────────────────────────────────────────────┐
│                   ADD ITEM DIALOG                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                INPUT STEP                            │   │
│  │  Add New Item                                        │   │
│  │  Enter item details to generate a unique 4-digit code│   │
│  │                                                       │   │
│  │  Item Name:                                          │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │ ITEM NAME AUTOCOMPLETE                        │  │   │
│  │  │ [Vanilla Sy...]                               │  │   │
│  │  │ ┌─────────────────────────────────────────┐   │  │   │
│  │  │ │ SUGGESTIONS DROPDOWN                    │   │  │   │
│  │  │ │ Vanilla Syrup (Code: 2847) [Existing]   │   │  │   │
│  │  │ │ Vanilla Bean Syrup         [Suggested]  │   │  │   │
│  │  │ └─────────────────────────────────────────┘   │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  Category:                                           │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │ CATEGORY DROPDOWN                             │  │   │
│  │  │ [Syrups ▼]                                    │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │            [Cancel]  [Generate Code]                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          ↓ Click "Generate Code"
┌─────────────────────────────────────────────────────────────┐
│                   ADD ITEM DIALOG                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                CONFIRM STEP                          │   │
│  │  Code Generated!                                     │   │
│  │  Write this code on the physical item with a marker  │   │
│  │                                                       │   │
│  │                Your 4-digit code:                    │   │
│  │               ┌────────────────┐                     │   │
│  │               │   GENERATED    │                     │   │
│  │               │   CODE DISPLAY │                     │   │
│  │               │     5847       │                     │   │
│  │               └────────────────┘                     │   │
│  │                                                       │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │ WARNING BOX                                    │  │   │
│  │  │ ⚠️ Write this code on the item before confirming│  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │            [Cancel]  [Confirm & Save]                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    HISTORY PAGE                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     HEADER                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ← Back to Inventory                                │   │
│  │  Audit History                                       │   │
│  │  Complete record of all inventory actions           │   │
│  │                                                       │   │
│  │  [All Actions ▼]           Showing 45 entries       │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                HISTORY TABLE (Desktop)               │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │ Date & Time | Partner | Action | Item | Code  │  │   │
│  │  ├───────────────────────────────────────────────┤  │   │
│  │  │ Jan 15...  | John S. | [+Add] | Vanilla| 2847 │  │   │
│  │  │ Jan 14...  | Jane D. | [−Rem] | Caramel| 3912 │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PAGINATION CONTROLS                                 │   │
│  │  Page 1 of 3            [← Previous] [Next →]       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## View Modes

| Mode              | Description                               | Navigation                     |
| ----------------- | ----------------------------------------- | ------------------------------ |
| **Categories**    | Grid of category cards with item counts   | Default view, toggle button    |
| **All Items**     | List of all items across all categories   | Toggle button                  |
| **Filtered**      | List of items in selected category        | Click category card            |

---

## Quick Reference Table

| User Action                     | Page/Component Name                       |
| ------------------------------- | ----------------------------------------- |
| Login → See tools               | **Dashboard Page**                        |
| Click Inventory Tracking card   | → **Inventory Page** (Categories View)    |
| Toggle to "All Items"           | **All Items View**                        |
| Toggle to "Categories"          | **Categories View**                       |
| Click category card             | → **Filtered View** (that category)       |
| Click "← Back to Categories"    | → **Categories View**                     |
| Click "+ Add Item"              | **Add Item Dialog** (Input Step)          |
| Click "Generate Code"           | → **Add Item Dialog** (Confirm Step)      |
| Click "Confirm & Save"          | Item saved, dialog closes                 |
| Click "Remove" on item          | **Remove Item Dialog**                    |
| Confirm removal                 | Item removed (soft delete)                |
| Click "History"                 | → **History Page**                        |
| Filter by action                | **Action Filter Dropdown**                |
| Navigate pages                  | **Pagination Controls**                   |

---

## Component File Mapping

| Name                      | File Path                                                    |
| ------------------------- | ------------------------------------------------------------ |
| Header                    | `frontend/components/shared/Header.tsx`                      |
| Tracking Landing (redirect)| `frontend/app/tools/tracking/page.tsx`                       |
| Inventory Page            | `frontend/app/tools/tracking/inventory/page.tsx`             |
| History Page              | `frontend/app/tools/tracking/history/page.tsx`               |
| Add Item Dialog           | `frontend/components/tools/tracking/AddItemDialog.tsx`       |
| Remove Item Dialog        | `frontend/components/tools/tracking/RemoveItemDialog.tsx`    |
| Item Name Autocomplete    | `frontend/components/tools/tracking/ItemNameAutocomplete.tsx`|

---

## Item Categories

| Category Key       | Display Name        |
| ------------------ | ------------------- |
| syrups             | Syrups              |
| sauces             | Sauces              |
| coffee_beans       | Coffee Beans        |
| powders            | Powders             |
| cups               | Cups                |
| lids               | Lids                |
| condiments         | Condiments          |
| cleaning_supplies  | Cleaning Supplies   |
| other              | Other               |

---

## UI Element Naming Patterns

### Item Card Elements
| Element           | Name                |
| ----------------- | ------------------- |
| Item Name         | **Item Name**       |
| Category Label    | **Item Category Label** |
| Code Display      | **Item Code**       |
| Remove Action     | **Remove Button**   |

### Action Badges (History)
| Action  | Badge               |
| ------- | ------------------- |
| ADD     | **Add Badge** (green) |
| REMOVE  | **Remove Badge** (red/destructive) |

### Dialog Patterns
| Element           | Name                |
| ----------------- | ------------------- |
| Title             | **Dialog Title**    |
| Description       | **Dialog Description** |
| Warning           | **Warning Box**     |
| Primary Action    | **Primary Button**  |
| Secondary Action  | **Cancel Button**   |
