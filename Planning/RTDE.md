# RTD&E Counting System - Tool Planning Document

## Tool Overview

The **RTD&E Counting System** is the third tool in SirenBase, designed to streamline the process of restocking the Ready-to-Drink & Eat (RTD&E) display at Starbucks. This tool provides a digital counting interface, automatic pull list generation, and BOH fulfillment tracking to eliminate guesswork and reduce time wasted walking between the display and back of house.

---

## Problem Statement

### Current Challenges

Partners currently rely on the Siren's Eye visual guide to determine what the RTD&E display should contain. This process involves:

1. **Repeatedly comparing** the display to the Siren's Eye guide
2. **Walking back and forth** between the display and the back of house (BOH)
3. **Forgetting or miscounting** items during trips
4. **Using workarounds** like taking pictures or notes, which introduces inefficiencies:
   - iPad screen locks during counting
   - Need to zoom in on photos
   - Bringing incorrect quantities to restock

This process:

- **Wastes time** on multiple unnecessary trips
- **Creates confusion** about exact quantities needed
- **Causes inefficiencies** during peak hours
- **Lacks consistency** across partners

### The Solution

A digital counting and restocking tool that:

- Provides a live item list with par levels for the RTD&E display
- Offers quick +/- counting interface with direct number input
- Automatically calculates missing items and generates pull lists
- Tracks which items have been pulled from BOH
- Adapts to seasonal menu changes through admin management
- Works like a **calculator** - quick, simple, and session-based (no historical tracking)

---

## Scope & Features

### In Scope (MVP)

1. **Item Counting Interface**
   - One-item-at-a-time focus with quick navigation
   - +/- buttons for all items
   - Direct number input (type quantity) for all items
   - Live calculation of "Need" quantity (par - counted)
   - Progress indicator showing items counted
   - **Adaptive navigation**:
     - Desktop: Vertical sidebar with all items
     - Mobile: Horizontal bottom bar with scroll
   - Auto-save progress throughout counting

2. **Session Management**
   - Store-level sessions (not user-specific)
   - 30-minute session expiration
   - Resume or restart dialog if previous session exists
   - Auto-save counts as partner works
   - Immediate deletion after completion (no history)

3. **Pull List Generation**
   - Automatic calculation: `pull_quantity = par_level - counted_quantity`
   - Only shows items where quantity needed > 0
   - Checkbox tracking for items pulled from BOH
   - Visual confirmation (checkmarks, strikethrough)
   - "Mark All Complete" button to finish session

4. **Admin Item Management**
   - Add/edit/delete RTD&E items
   - Set par levels per item
   - Assign emoji/icon to each item
   - **Drag-and-drop reordering** to match physical display layout
   - Enable/disable items seasonally (active flag)

5. **Admin Dashboard Restructure** (Prerequisite)
   - Modify Admin Panel to show module cards instead of direct user management
   - Create modular admin dashboard:
     - 👥 User Management
     - 📦 RTD&E Items & Pars
     - 🥛 Milk Count Pars (placeholder for Tool 2)
   - Enables future tool admin features in organized way

### Out of Scope (Future Enhancements)

- Historical tracking or analytics (intentionally excluded - calculator-style tool)
- Integration with Siren's Eye digital guide
- Inventory depletion tracking over time
- Multi-store support
- Offline mode
- Barcode scanning for items

---

## User Workflows

### Admin Workflow: Setting Up Items

1. Admin logs in → Dashboard
2. Clicks "Admin Panel" card
3. Sees **Admin Dashboard** with module cards:
   - 👥 User Management
   - 📦 RTD&E Items & Pars
   - 🥛 Milk Count Pars
4. Clicks "RTD&E Items & Pars"
5. Sees list of current items with drag-to-reorder interface
6. Can **add new item**:
   - Enter item name (e.g., "Egg & Cheese Sandwich")
   - Select emoji/icon (🥪)
   - Set par level (e.g., 8)
   - Item auto-added to end of list
7. Can **edit existing items**:
   - Change name, icon, or par level
   - Toggle active/inactive for seasonal items
8. Can **reorder items** via drag-and-drop to match physical display
   - Example order: Lower shelf right-to-left, then upper shelf right-to-left
   - Display order determines counting sequence

### Staff Workflow: Counting & Restocking

**Starting a Count:**

1. Partner opens SirenBase → Dashboard
2. Clicks "RTD&E Counting" card → Routes to `/tools/rtde`
3. System checks for active session:
   - **If no session exists:** Automatically starts new session
   - **If session exists:** Shows dialog:
     ```
     "You have a count in progress (started 30 min ago).
     Resume or Start Fresh?"
     [Resume] [Start Fresh]
     ```
   - Resume: Continues from last item
   - Start Fresh: Deletes old session, starts new one
4. Count screen loads with first item (based on `display_order`)

**Counting Interface:**

```
┌─────────────────────────────────────┐
│ RTD&E Count - 3/12 items counted    │
├─────────────────────────────────────┤
│                                     │
│           🥪 Egg & Cheese           │
│              Sandwich               │
│                                     │
│         ┌───┐  [  5  ]  ┌───┐      │
│         │ - │           │ + │      │
│         └───┘           └───┘      │
│                                     │
│         Par: 8  |  Need: 3         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│ Desktop: Sidebar with all items     │
│ Mobile: Bottom scroll bar           │
│ [🍎][🥤][🧀][🥪][🥨][💧][🍫]       │
│                                     │
├─────────────────────────────────────┤
│  [← Prev]  [Generate Pull List]  [Next →]
└─────────────────────────────────────┘
```

**Counting Actions:**

- Tap +/- buttons to adjust quantity
- Click count field to type number directly
- Navigate with "Prev/Next" buttons or quick nav bar
- Click item in nav bar to jump directly
- Auto-saves on every change
- Live "Need" calculation updates immediately

**Navigation Details:**

- **Desktop:** Vertical sidebar on left/right with all items
- **Mobile:** Horizontal bottom bar with scroll
- Current item highlighted in nav
- Items show emoji/icon for quick recognition

**Generating Pull List:**

5. After counting all items (or enough items), tap "Start Pull List"
6. System validates all items are counted (shows dialog if uncounted items exist)
7. Page transitions to pulling phase (same route, phase state changes from "counting" to "pulling")

**Pull List Phase:**

```
┌─────────────────────────────────────┐
│  Pull List - 5 items needed         │
├─────────────────────────────────────┤
│ [ ] 🥪 Egg & Cheese - Pull: 3       │
│ [ ] 🥤 Cold Brew - Pull: 6          │
│ [ ] 🧀 String Cheese - Pull: 4      │
│ [ ] 💧 Water Bottles - Pull: 12     │
│ [ ] 🍫 Chocolate Bar - Pull: 2      │
├─────────────────────────────────────┤
│     [Back to Count] [Complete]      │
└─────────────────────────────────────┘
```

**Note**: This is a phase transition within the same page, not a separate route. The page re-renders to show pull list instead of counting interface.

8. Partner goes to BOH and gathers items
9. Checks boxes as they pull each item (visual confirmation)
10. Returns to display and restocks using Siren's Eye for placement
11. Taps "Complete" button
12. Shows success message:
    ```
    "RTD&E display restocking completed!
    Start another count?"
    [Start New Count] [Back to Dashboard]
    ```
13. Session and all data immediately deleted (calculator-style)

### Staff Workflow: Interrupted Count (Resume Later)

1. Partner starts counting (gets to item 5/12)
2. Gets pulled away for other tasks (30 minutes)
3. Returns, opens RTD&E tool
4. Dialog appears:
   ```
   "You have a count in progress (started 30 min ago).
   Resume or Start Fresh?"
   ```
5. **Resume:** Continues from item 5 with saved counts
6. **Start Fresh:** Deletes old session, begins new count from item 1

**Session Expiration:**

- If partner doesn't return within **30 minutes** → Session auto-expires
- Next time they open tool → Starts fresh automatically (no dialog)
- Expired sessions cleaned up automatically

---

## Technical Details

### Database Schema

#### rtde_items Table

```sql
CREATE TABLE rtde_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL,              -- Emoji (🥪, 🥤, 💧, etc.)
    par_level INTEGER NOT NULL,             -- Target quantity for display
    display_order INTEGER NOT NULL,         -- Position in counting list
    active BOOLEAN DEFAULT TRUE,            -- Enable/disable seasonally
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rtde_items_active_order ON rtde_items(active, display_order);
```

**Key Design Decisions:**

- **Icon as Emoji:** Simple string field (10 chars) for Unicode emoji
- **Display Order:** Determines counting sequence (matches physical layout)
- **Active Flag:** Soft toggle for seasonal items (preserves data)
- **No Categories:** Items organized purely by display_order (no grouping needed)

#### rtde_count_sessions Table

```sql
CREATE TABLE rtde_count_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'in_progress',  -- 'in_progress', 'completed', 'expired'
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL             -- started_at + 30 minutes
);

CREATE INDEX idx_rtde_sessions_user_status ON rtde_count_sessions(user_id, status);
CREATE INDEX idx_rtde_sessions_expires ON rtde_count_sessions(expires_at);
```

**Key Design Decisions:**

- **User-Specific Sessions:** Each partner has their own active session
- **30-Minute Expiration:** `expires_at = started_at + 30 minutes`
- **Status Tracking:** In progress, completed, or expired
- **No Historical Retention:** Sessions deleted immediately after completion

#### rtde_session_counts Table

```sql
CREATE TABLE rtde_session_counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES rtde_count_sessions(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES rtde_items(id) ON DELETE CASCADE,
    counted_quantity INTEGER NOT NULL DEFAULT 0,
    is_pulled BOOLEAN DEFAULT FALSE,          -- Marked as pulled in BOH
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(session_id, item_id)               -- One count per item per session
);

CREATE INDEX idx_rtde_counts_session ON rtde_session_counts(session_id);
```

**Key Design Decisions:**

- **Cascade Deletion:** Counts deleted when session deleted (no orphans)
- **Unique Constraint:** Prevents duplicate counts for same item in session
- **Pull Tracking:** `is_pulled` flag for BOH fulfillment tracking
- **Default Zero:** Uncounted items default to 0

#### Relationships

- **users → rtde_count_sessions** (one-to-many: one user can have one active session)
- **rtde_count_sessions → rtde_session_counts** (one-to-many: one session has many item counts)
- **rtde_items → rtde_session_counts** (one-to-many: one item can be in many sessions)

---

### API Endpoints

**Base Path**: `/api/rtde/*`

#### Admin - Item Management Endpoints

**GET `/api/rtde/admin/items`**

- **Purpose**: Get all RTD&E items ordered by display_order
- **Auth**: Admin only (JWT + role check)
- **Response**:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "name": "Egg & Cheese Sandwich",
        "icon": "🥪",
        "par_level": 8,
        "display_order": 1,
        "active": true
      },
      {
        "id": "uuid",
        "name": "Cold Brew",
        "icon": "🥤",
        "par_level": 12,
        "display_order": 2,
        "active": true
      }
    ]
  }
  ```

**POST `/api/rtde/admin/items`**

- **Purpose**: Create new RTD&E item
- **Auth**: Admin only
- **Body**:
  ```json
  {
    "name": "Egg & Cheese Sandwich",
    "icon": "🥪",
    "par_level": 8
  }
  ```
- **Response**: Returns created item with auto-assigned display_order (end of list)
- **Validation**:
  - Name: Required, max 100 characters
  - Icon: Required, max 10 characters (emoji)
  - Par level: Required, positive integer

**PUT `/api/rtde/admin/items/:id`**

- **Purpose**: Update existing RTD&E item
- **Auth**: Admin only
- **Body**:
  ```json
  {
    "name": "Egg & Cheese Sandwich",
    "icon": "🥪",
    "par_level": 10,
    "active": true
  }
  ```
- **Response**: Returns updated item

**DELETE `/api/rtde/admin/items/:id`**

- **Purpose**: Delete RTD&E item
- **Auth**: Admin only
- **Logic**:
  - If item never used in sessions → Hard delete
  - If item used in sessions → Soft delete (set `active = false`)
- **Response**: Success message

**PUT `/api/rtde/admin/items/reorder`**

- **Purpose**: Update display order for multiple items (drag-and-drop)
- **Auth**: Admin only
- **Body**:
  ```json
  {
    "item_orders": [
      { "id": "uuid-1", "display_order": 1 },
      { "id": "uuid-2", "display_order": 2 },
      { "id": "uuid-3", "display_order": 3 }
    ]
  }
  ```
- **Response**: Success message
- **Logic**: Updates `display_order` for all provided items in single transaction

---

#### Counting - Session Management Endpoints

**GET `/api/rtde/sessions/active`**

- **Purpose**: Check for active session for current user
- **Auth**: Required (JWT)
- **Response**:
  ```json
  {
    "session": {
      "id": "uuid",
      "started_at": "2025-11-21T10:30:00Z",
      "expires_at": "2025-11-21T14:30:00Z",
      "items_counted": 3,
      "total_items": 12
    }
  }
  ```
- **Or**: `{ "session": null }` if no active session

**POST `/api/rtde/sessions/start`**

- **Purpose**: Start new counting session or resume existing
- **Auth**: Required (JWT)
- **Body**:
  ```json
  {
    "action": "new"  // or "resume"
  }
  ```
- **Logic**:
  - If `action = "new"` → Delete any existing session, create new one
  - If `action = "resume"` → Return existing session ID (error if none exists)
  - Set `expires_at = started_at + 30 minutes`
- **Response**:
  ```json
  {
    "session_id": "uuid",
    "expires_at": "2025-11-21T14:30:00Z"
  }
  ```

**GET `/api/rtde/sessions/:id`**

- **Purpose**: Get session details with all item counts
- **Auth**: Required (JWT, must own session)
- **Response**:
  ```json
  {
    "session": {
      "id": "uuid",
      "started_at": "2025-11-21T10:30:00Z",
      "expires_at": "2025-11-21T14:30:00Z",
      "status": "in_progress"
    },
    "items": [
      {
        "item_id": "uuid",
        "name": "Egg & Cheese Sandwich",
        "icon": "🥪",
        "par_level": 8,
        "display_order": 1,
        "counted_quantity": 5,
        "need_quantity": 3,        // Calculated: par - counted
        "is_pulled": false
      },
      {
        "item_id": "uuid",
        "name": "Cold Brew",
        "icon": "🥤",
        "par_level": 12,
        "display_order": 2,
        "counted_quantity": 6,
        "need_quantity": 6,
        "is_pulled": false
      }
    ]
  }
  ```
- **Logic**:
  - Returns all active items ordered by `display_order`
  - Calculates `need_quantity` on the fly
  - Includes counts from `rtde_session_counts` (0 if not yet counted)

**PUT `/api/rtde/sessions/:id/count`**

- **Purpose**: Update count for specific item in session
- **Auth**: Required (JWT, must own session)
- **Body**:
  ```json
  {
    "item_id": "uuid",
    "counted_quantity": 5
  }
  ```
- **Logic**:
  - Upsert into `rtde_session_counts` (create if doesn't exist, update if exists)
  - Validate: quantity >= 0
- **Response**: Success message with updated count

---

#### Pull List Endpoints

**GET `/api/rtde/sessions/:id/pull-list`**

- **Purpose**: Generate pull list (items where need_quantity > 0)
- **Auth**: Required (JWT, must own session)
- **Response**:
  ```json
  {
    "pull_list": [
      {
        "item_id": "uuid",
        "name": "Egg & Cheese Sandwich",
        "icon": "🥪",
        "need_quantity": 3,
        "is_pulled": false
      },
      {
        "item_id": "uuid",
        "name": "Cold Brew",
        "icon": "🥤",
        "need_quantity": 6,
        "is_pulled": false
      }
    ],
    "total_items": 5,
    "items_pulled": 0
  }
  ```
- **Logic**:
  - Calculate `need_quantity = par_level - counted_quantity`
  - Only include items where `need_quantity > 0`
  - Count how many items have `is_pulled = true`

**PUT `/api/rtde/sessions/:id/pull`**

- **Purpose**: Mark item as pulled or unpulled
- **Auth**: Required (JWT, must own session)
- **Body**:
  ```json
  {
    "item_id": "uuid",
    "is_pulled": true
  }
  ```
- **Logic**: Update `is_pulled` flag in `rtde_session_counts`
- **Response**: Success message

**POST `/api/rtde/sessions/:id/complete`**

- **Purpose**: Mark session as complete and delete all data
- **Auth**: Required (JWT, must own session)
- **Logic**:
  1. Set `status = 'completed'`
  2. Set `completed_at = NOW()`
  3. **Immediately delete session** (cascade deletes all counts)
- **Response**:
  ```json
  {
    "message": "RTD&E display restocking completed!"
  }
  ```

---

#### Background Jobs

**Cron Job: Clean Expired Sessions**

- **Frequency**: Every hour (or every 30 minutes)
- **Logic**:
  ```sql
  DELETE FROM rtde_count_sessions
  WHERE status = 'in_progress'
    AND expires_at < NOW();
  ```
- **Purpose**: Remove expired sessions to keep database clean

---

### Frontend Routes

**Base Path**: `/tools/rtde/*`

- **`/tools/rtde`** - Main RTD&E tool entry point

  - Checks for active session via `GET /api/rtde/sessions/active`
  - Shows resume/restart dialog if session exists
  - Routes to session page or starts new session

- **`/tools/rtde/session/:sessionId`** - Unified session workflow with phase-based rendering

  - **Phase 1: Counting**
    - One-item-at-a-time focus with adaptive navigation
    - Desktop: RTDESessionSidebar (left sidebar with all items)
    - Mobile: RTDEMobileDrawer (bottom drawer with item list)
    - Prev/Next navigation and quick jump bar
    - Auto-save on every count change
    - "Start Pull List" button transitions to pulling phase
    - Validates all items counted before transition (shows dialog if uncounted)

  - **Phase 2: Pulling**
    - Shows items needing restocking (need_quantity > 0)
    - Checkboxes for marking items as pulled
    - "Back to Count" button returns to counting phase
    - "Complete" button finishes session (confirmation dialog)

  - **Implementation Note**: Same route, different UI based on `phase` state ("counting" | "pulling")

---

### Admin Routes

**Base Path**: `/admin/*`

- **`/admin`** - Admin Dashboard (NEW - Prerequisite)

  - Grid of module cards:
    - 👥 User Management
    - 📦 RTD&E Items & Pars
    - 🥛 Milk Count Pars (placeholder)
  - Replaces direct user management screen

- **`/admin/users`** - User Management (moved from `/admin`)

  - Existing user CRUD functionality
  - No changes to functionality, just relocated

- **`/admin/rtde-items`** - RTD&E Items & Pars Management
  - List view with drag-and-drop reordering
  - Add/edit/delete items
  - Set par levels
  - Toggle active/inactive

---

### Key Technical Considerations

#### Session Expiration Logic

**30-Minute Window:**

- `expires_at = started_at + 30 minutes`
- Long enough for interrupted workflows
- Short enough to keep database clean
- Prevents stale data accumulation

**Expiration Handling:**

- Backend: Cron job cleans expired sessions hourly
- Frontend: Check expiration before resuming session
- If expired → Automatically start fresh (no dialog)

#### Resume vs. Start Fresh Logic

**Dialog Trigger:**

- Show dialog only if active session exists AND hasn't expired
- Dialog text: "You have a count in progress (started X minutes ago). Resume or Start Fresh?"

**Resume Action:**

- Use existing `session_id`
- Load saved counts from `rtde_session_counts`
- Navigate to current/last item

**Start Fresh Action:**

- Delete existing session (cascade deletes counts)
- Create new session
- Start from first item (display_order = 1)

#### Calculator-Style Data Handling

**No Historical Tracking:**

- Sessions deleted immediately after completion
- No "view past counts" feature
- No analytics or reporting
- Pure utility tool for current restocking task

**Rationale:**

- RTD&E restocking is ephemeral (happens multiple times daily)
- No business need for historical data
- Keeps database clean and performant
- Matches user mental model (like a calculator)

#### Adaptive Navigation

**Desktop Layout:**

- Vertical sidebar (left or right side)
- Shows all items as vertical list
- Current item highlighted
- Click to jump to any item

**Mobile Layout:**

- Horizontal bottom bar
- Scrollable left-right
- Shows emoji icons only (save space)
- Current item highlighted
- Tap to jump to any item

**Responsive Breakpoint:**

- Desktop: > 768px width
- Mobile: ≤ 768px width

#### Direct Number Input

**All Items Support Typing:**

- Click/tap count field to activate keyboard
- Type number directly (especially useful for bulk items like waters)
- +/- buttons always available as alternative
- Validate: Must be non-negative integer

**Use Cases:**

- Waters: Type "24" instead of tapping + 24 times
- Any item: Faster for partners who prefer typing

#### Drag-and-Drop Reordering

**Admin Interface:**

- Use `dnd-kit` or `react-beautiful-dnd` library
- Visual drag handle on each item row
- Real-time reordering in UI
- Save button to persist changes
- Batch update `display_order` via `/api/rtde/admin/items/reorder`

**Display Order Importance:**

- Determines counting sequence for partners
- Matches physical display layout (e.g., lower shelf right-to-left, upper shelf right-to-left)
- Improves counting efficiency and accuracy

---

## User Interface Design

### Mobile-First Design Philosophy

- **Primary Target**: Mobile devices (phones/tablets used on the floor)
- **Touch Targets**: Minimum 44x44px for all interactive elements
- **Large Counters**: Prominent display of current count and need quantity
- **Adaptive Layout**: Sidebar on desktop, bottom bar on mobile
- **Fast Input**: +/- buttons for quick adjustments, typing for bulk entry

### Counting Interface

**Desktop Layout (> 768px):**

```
┌──────────┬──────────────────────────────┐
│          │  RTD&E Count - 3/12 items    │
│  Items   ├──────────────────────────────┤
│  List    │                              │
│          │        🥪 Egg & Cheese       │
│ 🥪 (3)   │           Sandwich           │
│ 🥤 (6)   │                              │
│ 🧀       │      ┌───┐ [ 5 ] ┌───┐      │
│ 💧       │      │ - │       │ + │      │
│ 🍫       │      └───┘       └───┘      │
│          │                              │
│          │      Par: 8  |  Need: 3     │
│          │                              │
│          ├──────────────────────────────┤
│          │  [← Prev] [Pull List] [Next →]
└──────────┴──────────────────────────────┘
```

**Mobile Layout (≤ 768px):**

```
┌──────────────────────────────────────┐
│  RTD&E Count - 3/12 items counted    │
├──────────────────────────────────────┤
│                                      │
│         🥪 Egg & Cheese              │
│            Sandwich                  │
│                                      │
│       ┌───┐   [ 5 ]   ┌───┐         │
│       │ - │           │ + │         │
│       └───┘           └───┘         │
│                                      │
│       Par: 8  |  Need: 3            │
│                                      │
├──────────────────────────────────────┤
│ [🥪][🥤][🧀][💧][🍫][🥨][🍎]       │ ← Scroll
└──────────────────────────────────────┘
│  [← Prev] [Pull List] [Next →]      │
└──────────────────────────────────────┘
```

**Key Features:**

- **Current Item Display**: Large emoji/icon, item name, current count
- **Par & Need Display**: Always visible for context
- **Count Input**: 
  - Tap +/- for increment/decrement
  - Click/tap count number to type directly
- **Navigation**:
  - Prev/Next buttons for sequential flow
  - Quick jump bar (sidebar or bottom bar)
  - Items show count badge if counted
- **Progress Indicator**: "3/12 items counted" at top

### Pull List Screen

**Layout:**

```
┌─────────────────────────────────────┐
│  Pull List - 5 items needed         │
├─────────────────────────────────────┤
│                                     │
│ [ ] 🥪 Egg & Cheese - Pull: 3       │
│                                     │
│ [ ] 🥤 Cold Brew - Pull: 6          │
│                                     │
│ [ ] 🧀 String Cheese - Pull: 4      │
│                                     │
│ [ ] 💧 Water Bottles - Pull: 12     │
│                                     │
│ [ ] 🍫 Chocolate Bar - Pull: 2      │
│                                     │
├─────────────────────────────────────┤
│   [Back to Count]    [Complete]     │
└─────────────────────────────────────┘
```

**Features:**

- List of items needing restocking only
- Checkbox for each item (mark as pulled)
- Visual feedback: Checked items show checkmark, possibly strikethrough
- "Back to Count" allows corrections before completing
- "Complete" button:
  - Shows confirmation: "Mark session as complete?"
  - On confirm: Deletes session, shows success message

### Admin - RTD&E Items Management

**Layout:**

```
┌─────────────────────────────────────┐
│  RTD&E Items & Par Levels           │
│                          [+ Add Item]│
├─────────────────────────────────────┤
│                                     │
│ ⋮⋮ 🥪 Egg & Cheese   Par: 8  [Edit]│
│                                     │
│ ⋮⋮ 🥤 Cold Brew      Par: 12 [Edit]│
│                                     │
│ ⋮⋮ 🧀 String Cheese  Par: 6  [Edit]│
│                                     │
│ ⋮⋮ 💧 Water Bottles  Par: 24 [Edit]│
│                                     │
└─────────────────────────────────────┘
```

**Features:**

- **Drag Handle** (⋮⋮): Drag to reorder items
- **Item Display**: Icon, name, par level
- **Edit Button**: Opens modal/drawer to edit item
- **Add Item Button**: Opens form to add new item
- **Active Toggle**: Show/hide inactive items (filter toggle)

**Add/Edit Item Modal:**

```
┌─────────────────────────────────────┐
│  Add RTD&E Item              [✕]    │
├─────────────────────────────────────┤
│                                     │
│  Item Name:                         │
│  [Egg & Cheese Sandwich      ]      │
│                                     │
│  Icon/Emoji:                        │
│  [🥪                          ]      │
│                                     │
│  Par Level:                         │
│  [ 8                          ]      │
│                                     │
│  Active:  [✓] Enabled               │
│                                     │
├─────────────────────────────────────┤
│         [Cancel]        [Save]      │
└─────────────────────────────────────┘
```

**Validation:**

- Name: Required, max 100 characters
- Icon: Required, max 10 characters (suggest emoji picker)
- Par Level: Required, positive integer
- Active: Toggle (default true)

### Admin Dashboard (Prerequisite)

**Layout:**

```
┌─────────────────────────────────────┐
│  Admin Panel                        │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────┬───────────┐          │
│  │     👥    │    📦     │          │
│  │   User    │   RTD&E   │          │
│  │Management │Items/Pars │          │
│  └───────────┴───────────┘          │
│                                     │
│  ┌───────────┐                      │
│  │     🥛    │                      │
│  │Milk Count │                      │
│  │   Pars    │                      │
│  └───────────┘                      │
│                                     │
└─────────────────────────────────────┘
```

**Purpose:**

- Replaces direct user management screen
- Enables modular admin features per tool
- Future-proof for additional tools

---

## Testing Strategy

### Backend Tests

**Test Coverage Required**:

- ✅ **Models** (`tests/test_rtde_models.py`):
  - Item creation, validation
  - Session creation with expiration calculation
  - Session count upsert logic
  - Cascade deletions

- ✅ **Items Admin** (`tests/test_rtde_admin.py`):
  - Get all items (ordered by display_order)
  - Create item with validation
  - Update item (name, par, active)
  - Delete item (hard vs soft)
  - Reorder items (batch update)
  - Authorization checks (admin only)

- ✅ **Session Management** (`tests/test_rtde_sessions.py`):
  - Check active session (exists/doesn't exist)
  - Start new session
  - Resume existing session
  - Session expiration logic
  - Update item count
  - Authorization checks (must own session)

- ✅ **Pull List** (`tests/test_rtde_pull_list.py`):
  - Generate pull list (only items with need > 0)
  - Mark item as pulled/unpulled
  - Complete session (deletes data)
  - Validation (quantities non-negative)

- ✅ **Cron Jobs** (`tests/test_rtde_cleanup.py`):
  - Expired session cleanup
  - Doesn't delete active sessions

### Frontend Tests (Phase 3)

- Component tests for CountingPage, PullListPage, AdminItemsPage
- Integration tests for counting workflow
- E2E tests for complete count → pull → complete flow
- Adaptive layout tests (desktop vs mobile)
- Drag-and-drop reordering tests

---

## Performance Considerations

### Database Indexes

**Indexed Columns**:

- `rtde_items.display_order` (used for ordering item lists)
- `rtde_items.active` (used for filtering)
- `rtde_count_sessions.user_id` + `status` (composite, for active session lookup)
- `rtde_count_sessions.expires_at` (used by cleanup cron job)
- `rtde_session_counts.session_id` (foreign key, frequently joined)

### API Response Times

**Targets**:

- GET `/api/rtde/admin/items`: < 200ms (typical 20-50 items)
- POST `/api/rtde/admin/items`: < 300ms
- GET `/api/rtde/sessions/:id`: < 300ms (includes items + counts join)
- PUT `/api/rtde/sessions/:id/count`: < 200ms (single upsert)
- GET `/api/rtde/sessions/:id/pull-list`: < 300ms (filtered calculation)

**Optimizations**:

- Eager load items with counts (reduce N+1 queries)
- Index on display_order for fast sorting
- Limit active sessions per user (only 1 allowed)
- Cleanup cron job runs off-peak hours if possible

### Session Cleanup

**Cron Job Efficiency**:

- Run every hour (or 30 minutes)
- Single DELETE query with timestamp filter
- No need for pagination (typically < 100 expired sessions per run)
- Monitor query performance and adjust frequency if needed

---

## Security Considerations

### Authentication & Authorization

- All endpoints require valid JWT token
- Admin endpoints (`/api/rtde/admin/*`) require `role = 'admin'`
- Session endpoints validate user owns the session
- No cross-user session access allowed

### Input Validation

- Item names: Max 100 characters, required, sanitize HTML
- Icons: Max 10 characters (emoji validation optional)
- Par levels: Positive integers only
- Counted quantities: Non-negative integers only
- Display order: Positive integers, unique per item

### Data Protection

- User IDs tracked but not exposed in responses
- Session data deleted immediately after completion (no retention)
- No sensitive PII stored in RTD&E tables

### Audit Considerations

- No audit trail for RTD&E actions (intentional - calculator-style tool)
- Admin item changes could log to general admin audit trail (future)

---

## Future Enhancements (Post-MVP)

### Phase 2 Possibilities

1. **Analytics Dashboard** (Optional - contradicts calculator philosophy)
   - Track restocking frequency
   - Identify high-turnover items
   - Optimize par levels based on trends

2. **Integration with Siren's Eye**
   - Display Siren's Eye visual guide in app
   - Highlight items on visual guide as counted

3. **Low Stock Alerts**
   - Notify when specific items consistently below par
   - Suggest par level adjustments

4. **Barcode Scanning**
   - Scan item barcodes for faster counting
   - Auto-populate quantities from scanner

5. **Multi-User Collaboration**
   - Allow multiple partners to count simultaneously
   - Divide display into zones

---

## Build Order & Dependencies

### Phase 1: Admin Dashboard Restructure (PREREQUISITE)

**Timeline:** 1-2 days
**Priority:** Must complete before RTD&E tool

**Tasks:**

- [ ] Modify `/app/admin` route to show module cards
- [ ] Create User Management module card → Routes to `/admin/users`
- [ ] Move existing user management UI to `/admin/users`
- [ ] Create RTD&E Items module card → Routes to `/admin/rtde-items`
- [ ] Create Milk Count Pars module card (placeholder) → Routes to `/admin/milk-pars`
- [ ] Test admin dashboard navigation
- [ ] Update documentation

**Rationale:**

- RTD&E tool requires item/par management
- Milk Count tool will need par management
- Build infrastructure now to avoid rework
- Relatively small task that unlocks two tools

### Phase 2: RTD&E Admin Module

**Timeline:** 2-3 days
**Dependencies:** Phase 1 complete

**Tasks:**

- [ ] Database: Create `rtde_items` table and migration
- [ ] Backend: Implement item CRUD endpoints
- [ ] Backend: Implement reorder endpoint
- [ ] Backend: Write tests (models, admin endpoints)
- [ ] Frontend: Build item list with drag-and-drop (`dnd-kit`)
- [ ] Frontend: Build add/edit item modal
- [ ] Frontend: Integrate with backend API
- [ ] Test admin functionality end-to-end

### Phase 3: RTD&E Counting Tool

**Timeline:** 5-7 days
**Dependencies:** Phase 2 complete

**Tasks:**

- [ ] Database: Create `rtde_count_sessions` and `rtde_session_counts` tables
- [ ] Backend: Implement session management endpoints
- [ ] Backend: Implement counting endpoints
- [ ] Backend: Implement pull list endpoints
- [ ] Backend: Create session cleanup cron job
- [ ] Backend: Write tests (sessions, counts, pull list)
- [ ] Frontend: Build counting interface (adaptive layout)
- [ ] Frontend: Build pull list screen
- [ ] Frontend: Implement session resume/restart logic
- [ ] Frontend: Integrate with backend API
- [ ] Test complete workflow end-to-end
- [ ] Mobile device testing
- [ ] Performance optimization

---

## Related Documentation

- **Overall Architecture**: See `PLANNING.md` for multi-tool system design
- **Tool 1 Planning**: See `Planning/InventoryTracking.md`
- **Tool 2 Planning**: See `Planning/MilkCount.md`
- **Design System**: See `DESIGN.md` for UI guidelines
- **Development Guidelines**: See `CLAUDE.md`

---

**Document Version:** 2.0
**Last Updated:** 2025-11-21
**Status:** Complete Planning - Ready for Phase 1 (Admin Dashboard Restructure)
**Part of:** SirenBase Multi-Tool Platform (Tool 3 of 3)
