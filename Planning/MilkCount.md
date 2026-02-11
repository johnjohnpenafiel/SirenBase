# Milk Count Tool - Feature Documentation

## Tool Overview

The **Milk Count Tool** is the second tool in SirenBase, designed to streamline the milk inventory counting and ordering process at specialty coffee retail locations. This tool replaces the manual paper logbook system with an efficient, accurate, and user-friendly digital interface.

---

## Problem Statement

### Current Challenges

Partners currently count milk inventory twice daily (night and morning shifts) using a physical logbook with multiple columns. This process is:

- **Time-consuming:** Partners must open each fridge, count by type, and manually record data
- **Error-prone:** Manual addition and calculation increase risk of mistakes
- **Inefficient:** Requires writing, adding, and calculating across multiple columns for each milk type

### Physical Logbook Format

The current paper logbook has the following columns:

- **FOH (Front of House):** Milks in beverage fridges
- **BOH (Back of House):** Milks in backup fridge
- **Delivered:** Milks delivered that morning
- **On Order:** Milks already ordered from IMS (not yet delivered)
- **Total:** FOH + BOH + Delivered
- **Par:** Target inventory level
- **Order:** Par - Total - On Order (amount to order)

### The Solution

A digital counting and ordering tool that:

- Provides guided FOH and BOH counting with +/- counters
- Offers two methods for morning counts (BOH count or direct delivered)
- Automatically calculates totals, delivered quantities, and order amounts
- Generates summary matching the paper logbook format
- Stores historical data for reference

---

## Scope & Features

### In Scope (MVP)

1. **Night Count Process (Two Sequential Screens)**
   - FOH Count Screen: +/- counters for all milk types
   - BOH Count Screen: +/- counters for all milk types
   - Session-based workflow with progress tracking
   - Data saved at store level (accessible by any partner)

2. **Morning Count Process (Single Screen)**
   - Displays previous night's BOH count (read-only)
   - Two input options per milk type:
     - **Option A:** Count current BOH → App calculates delivered
     - **Option B:** Enter delivered count directly
   - Flexible method selection per milk type

3. **Summary & Calculation**
   - Table matching paper logbook format
   - Auto-calculations: Total = FOH + BOH + Delivered, Order = Par - Total
   - Color-coded order amounts (green/amber/red)
   - Historical session viewing

4. **Par Level Management (Admin)**
   - View and edit par values per milk type
   - Track who made changes and when
   - Inline editing interface

5. **Session History**
   - View past counting sessions
   - Filter by status (completed, in-progress)
   - Navigate to view summaries

### Out of Scope (Future Enhancements)

- Export functionality to physical logbook
- Push notifications for incomplete counts
- Automated ordering integration
- Multi-store support

---

## Milk Types

| Category | Milk Types (9 Total) |
|----------|----------------------|
| **Dairy (5)** | Whole, 2%, Non-Fat, Half & Half, Heavy Cream |
| **Non-Dairy (4)** | Oat, Almond, Coconut, Soy |

---

## User Workflows

### Admin Workflow: Managing Par Levels

1. Admin logs in → Dashboard
2. Clicks "Admin Panel" card
3. Sees Admin Dashboard with module cards
4. Clicks "Milk Count Pars"
5. Views list of all milk types with current par values
6. Edits par values inline with save/cancel buttons
7. Changes saved with timestamp and user tracking

### Staff Workflow: Night Count

**Starting Night Count:**

1. Partner opens SirenBase → Dashboard
2. Clicks "Milk Count" card → Routes to `/tools/milk-count`
3. Sees session status (no session, in-progress, completed)
4. Clicks "Start Night Count" to begin
5. Session created, redirected to FOH page

**FOH Count Screen:**

```
┌─────────────────────────────────────┐
│  Night Count - FOH                  │
│  Progress: 3/9 milks counted        │
├─────────────────────────────────────┤
│                                     │
│  Dairy                              │
│  ┌─────────────────────────────┐   │
│  │ 🥛 Whole                    │   │
│  │    ┌───┐  [ 15 ]  ┌───┐    │   │
│  │    │ - │          │ + │    │   │
│  │    └───┘          └───┘    │   │
│  └─────────────────────────────┘   │
│                                     │
│  Non-Dairy                          │
│  ┌─────────────────────────────┐   │
│  │ 🌱 Oat                      │   │
│  │    ┌───┐  [  8 ]  ┌───┐    │   │
│  │    │ - │          │ + │    │   │
│  │    └───┘          └───┘    │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│         [Save & Continue to BOH]    │
└─────────────────────────────────────┘
```

6. Partner counts FOH milks for each type
7. Clicks "Save & Continue to BOH"
8. Session advances to BOH phase

**BOH Count Screen:**

9. Identical interface to FOH
10. Partner counts BOH milks for each type
11. Clicks "Save Night Count"
12. Session advances to "morning" status
13. Redirected to landing page with success message

### Staff Workflow: Morning Count

**Starting Morning Count:**

1. Different partner logs in → Dashboard
2. Opens Milk Count tool → Sees "Continue to Morning Count"
3. Clicks to open morning count page

**Morning Count Screen:**

```
┌─────────────────────────────────────┐
│  Morning Count                      │
├─────────────────────────────────────┤
│                                     │
│  🥛 Whole Milk                      │
│  Night BOH: 20                      │
│                                     │
│  Choose counting method:            │
│  ┌─────────────────────────────┐   │
│  │ ○ Count Current BOH         │   │
│  │   ┌───┐  [ 30 ]  ┌───┐     │   │
│  │   │ - │          │ + │     │   │
│  │   └───┘          └───┘     │   │
│  │   → Delivered: 10          │   │
│  │                             │   │
│  │ ○ Enter Delivered Directly  │   │
│  │   ┌───┐  [  0 ]  ┌───┐     │   │
│  │   │ - │          │ + │     │   │
│  │   └───┘          └───┘     │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│       [Calculate & Save Order]      │
└─────────────────────────────────────┘
```

4. For each milk type, partner selects method and enters count
5. Clicks "Save & Continue"
6. Session advances to on_order status, redirected to On Order page

**On Order Screen:**

7. Partner checks IMS for quantities already on order
8. Enters on_order value for each milk type (default: 0)
9. Clicks "Save & View Summary"
10. Session marked complete, redirected to summary

### Summary Screen

```
┌───────────────────────────────────────────────────┐
│  Daily Milk Count Summary                         │
│  January 12, 2026                                 │
├───────────────────────────────────────────────────┤
│                                                   │
│  Milk Type | FOH | BOH | Del | OnOrd | Tot | Par | Order │
│  ───────────────────────────────────────────────────────  │
│  Whole     | 15  | 20  | 10  |   5   | 45  | 60  |  10   │
│  2%        | 12  | 18  |  8  |   0   | 38  | 50  |  12   │
│  Oat       |  8  | 12  |  6  |   2   | 26  | 35  |   7   │
│  ...                                                      │
│                                                   │
│  Totals    | 100 | 150 | 80  |  15   | 330 | 400 |  55   │
│                                                   │
├───────────────────────────────────────────────────┤
│  [View History]  [Back to Dashboard]              │
└───────────────────────────────────────────────────┘
```

**Order Calculation Formula:**
```
Order = max(0, Par - Total - OnOrder)
```

---

## Technical Details

### Database Schema

#### milk_count_milk_types Table

```sql
CREATE TABLE milk_count_milk_types (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(20) NOT NULL,          -- 'dairy' or 'non_dairy'
    display_order INTEGER NOT NULL,         -- Position in counting list
    active BOOLEAN DEFAULT TRUE NOT NULL,   -- Enable/disable milk type
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_milk_types_active ON milk_count_milk_types(active);
```

**Key Design Decisions:**

- **Category String:** Enum-like values ('dairy', 'non_dairy')
- **Display Order:** Determines counting sequence
- **Active Flag:** Soft toggle for seasonal items

#### milk_count_par_levels Table

```sql
CREATE TABLE milk_count_par_levels (
    id VARCHAR(36) PRIMARY KEY,
    milk_type_id VARCHAR(36) NOT NULL UNIQUE REFERENCES milk_count_milk_types(id) ON DELETE CASCADE,
    par_value INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL
);
```

**Key Design Decisions:**

- **One Par Level Per Milk Type:** Unique constraint on milk_type_id
- **Audit Trail:** Tracks who updated and when
- **Cascade Delete:** Par level deleted if milk type deleted

#### milk_count_sessions Table

```sql
CREATE TABLE milk_count_sessions (
    id VARCHAR(36) PRIMARY KEY,
    session_date DATE NOT NULL UNIQUE,      -- One session per day
    status VARCHAR(20) NOT NULL DEFAULT 'night_foh',  -- State machine
    night_count_user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    morning_count_user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    night_foh_saved_at TIMESTAMP,
    night_boh_saved_at TIMESTAMP,
    morning_saved_at TIMESTAMP,
    on_order_saved_at TIMESTAMP,            -- When on order entry was completed
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_date ON milk_count_sessions(session_date);
CREATE INDEX idx_sessions_status ON milk_count_sessions(status);
```

**Session Status State Machine:**

```
night_foh → night_boh → morning → on_order → completed
```

- **night_foh:** FOH count in progress
- **night_boh:** FOH complete, BOH in progress
- **morning:** Night complete, morning count in progress
- **on_order:** Morning complete, on order entry in progress
- **completed:** All counts complete

#### milk_count_entries Table

```sql
CREATE TABLE milk_count_entries (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL REFERENCES milk_count_sessions(id) ON DELETE CASCADE,
    milk_type_id VARCHAR(36) NOT NULL REFERENCES milk_count_milk_types(id) ON DELETE CASCADE,
    foh_count INTEGER,                      -- Night FOH count
    boh_count INTEGER,                      -- Night BOH count
    morning_method VARCHAR(20),             -- 'boh_count' or 'direct_delivered'
    current_boh INTEGER,                    -- Morning BOH count (if method = boh_count)
    delivered INTEGER,                      -- Calculated or direct delivered count
    on_order INTEGER,                       -- Quantity already on order from IMS
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE(session_id, milk_type_id)
);

CREATE INDEX idx_entries_session ON milk_count_entries(session_id);
```

**Key Design Decisions:**

- **Cascade Delete:** Entries deleted when session deleted
- **Unique Constraint:** One entry per milk type per session
- **Method Tracking:** Records which method was used for morning count
- **On Order Field:** Tracks quantities already ordered from IMS (defaults to 0)

#### Relationships

- **milk_count_milk_types → milk_count_par_levels** (one-to-one)
- **milk_count_sessions → milk_count_entries** (one-to-many)
- **milk_count_milk_types → milk_count_entries** (one-to-many)
- **users → milk_count_sessions** (one-to-many via night/morning user IDs)
- **users → milk_count_par_levels** (one-to-many via updated_by)

---

### API Endpoints

**Base Path:** `/api/milk-count/*`

#### Admin - Milk Type Endpoints

**GET `/api/milk-count/admin/milk-types`**

- **Purpose:** Get all milk types ordered by display_order
- **Auth:** Admin only (JWT + role check)
- **Query Params:**
  - `include_inactive` (optional): Include inactive types (default: false)
- **Response:**
  ```json
  {
    "milk_types": [
      {
        "id": "uuid",
        "name": "Whole",
        "category": "dairy",
        "display_order": 1,
        "active": true,
        "par_value": 30
      }
    ]
  }
  ```

**PUT `/api/milk-count/admin/milk-types/:id`**

- **Purpose:** Update milk type (display_order, active)
- **Auth:** Admin only
- **Body:**
  ```json
  {
    "display_order": 2,
    "active": true
  }
  ```
- **Response:**
  ```json
  {
    "message": "Milk type updated successfully",
    "milk_type": {...}
  }
  ```

#### Admin - Par Level Endpoints

**GET `/api/milk-count/admin/par-levels`**

- **Purpose:** Get all par levels with milk type info
- **Auth:** Admin only
- **Response:**
  ```json
  {
    "par_levels": [
      {
        "id": "uuid",
        "milk_type_id": "uuid",
        "milk_type_name": "Whole",
        "milk_type_category": "dairy",
        "par_value": 30,
        "updated_at": "2026-01-12T...",
        "updated_by_name": "John Doe"
      }
    ]
  }
  ```

**PUT `/api/milk-count/admin/par-levels/:milk_type_id`**

- **Purpose:** Update par level for a milk type
- **Auth:** Admin only
- **Body:**
  ```json
  {
    "par_value": 30
  }
  ```
- **Response:**
  ```json
  {
    "message": "Par level updated successfully",
    "par_level": {...}
  }
  ```

---

#### Session Management Endpoints

**GET `/api/milk-count/sessions/today`**

- **Purpose:** Check for today's session
- **Auth:** Required (JWT)
- **Response:**
  ```json
  {
    "session": {
      "id": "uuid",
      "date": "2026-01-12",
      "status": "night_foh",
      "night_count_user_name": "John Doe"
    }
  }
  ```
- **Or:** `{ "session": null }` if no session exists

**POST `/api/milk-count/sessions/start`**

- **Purpose:** Start new session for today
- **Auth:** Required (JWT)
- **Response:**
  ```json
  {
    "message": "Session started",
    "session": {...}
  }
  ```
- **Error:** `400` if session already exists for today

**GET `/api/milk-count/sessions/:id`**

- **Purpose:** Get session details with all entries
- **Auth:** Required (JWT)
- **Response:**
  ```json
  {
    "session": {...},
    "entries": [
      {
        "milk_type_id": "uuid",
        "milk_type_name": "Whole",
        "milk_type_category": "dairy",
        "foh_count": 15,
        "boh_count": 20,
        "morning_method": null,
        "current_boh": null,
        "delivered": null
      }
    ]
  }
  ```

---

#### Night Count Endpoints

**PUT `/api/milk-count/sessions/:id/night-foh`**

- **Purpose:** Save FOH counts and advance to BOH phase
- **Auth:** Required (JWT)
- **Body:**
  ```json
  {
    "counts": [
      {"milk_type_id": "uuid", "foh_count": 15},
      {"milk_type_id": "uuid", "foh_count": 12}
    ]
  }
  ```
- **Response:**
  ```json
  {
    "message": "FOH counts saved",
    "session": {...}
  }
  ```
- **Logic:**
  - Validates session status is `night_foh`
  - Updates all FOH counts
  - Advances status to `night_boh`
  - Records timestamp and user

**PUT `/api/milk-count/sessions/:id/night-boh`**

- **Purpose:** Save BOH counts and advance to morning phase
- **Auth:** Required (JWT)
- **Body:**
  ```json
  {
    "counts": [
      {"milk_type_id": "uuid", "boh_count": 20},
      {"milk_type_id": "uuid", "boh_count": 18}
    ]
  }
  ```
- **Response:**
  ```json
  {
    "message": "BOH counts saved - night count complete",
    "session": {...}
  }
  ```
- **Logic:**
  - Validates session status is `night_boh`
  - Updates all BOH counts
  - Advances status to `morning`

---

#### Morning Count Endpoint

**PUT `/api/milk-count/sessions/:id/morning`**

- **Purpose:** Save morning count data and complete session
- **Auth:** Required (JWT)
- **Body:**
  ```json
  {
    "counts": [
      {
        "milk_type_id": "uuid",
        "method": "boh_count",
        "current_boh": 30
      },
      {
        "milk_type_id": "uuid",
        "method": "direct_delivered",
        "delivered": 10
      }
    ]
  }
  ```
- **Response:**
  ```json
  {
    "message": "Morning count saved - continue to on order",
    "session": {...}
  }
  ```
- **Logic:**
  - Validates session status is `morning`
  - For `boh_count` method: Calculates `delivered = current_boh - boh_count`
  - For `direct_delivered` method: Uses provided delivered value
  - Advances status to `on_order`
  - Records timestamp and user

---

#### On Order Endpoint

**PUT `/api/milk-count/sessions/:id/on-order`**

- **Purpose:** Save on-order quantities from IMS and complete session
- **Auth:** Required (JWT)
- **Body:**
  ```json
  {
    "on_orders": [
      {"milk_type_id": "uuid", "on_order": 5},
      {"milk_type_id": "uuid", "on_order": 0}
    ]
  }
  ```
- **Response:**
  ```json
  {
    "message": "On order quantities saved - session complete",
    "session": {...}
  }
  ```
- **Logic:**
  - Validates session status is `on_order`
  - Updates on_order values for each milk type
  - Values must be non-negative integers
  - Advances status to `completed`
  - Records timestamp and user

---

#### Summary & History Endpoints

**GET `/api/milk-count/sessions/:id/summary`**

- **Purpose:** Get calculated summary for a session
- **Auth:** Required (JWT)
- **Response:**
  ```json
  {
    "session": {...},
    "summary": [
      {
        "milk_type": "Whole",
        "category": "dairy",
        "foh": 15,
        "boh": 20,
        "delivered": 10,
        "on_order": 5,
        "total": 45,
        "par": 60,
        "order": 10
      }
    ],
    "totals": {
      "total_foh": 100,
      "total_boh": 150,
      "total_delivered": 80,
      "total_on_order": 15,
      "total_inventory": 330,
      "total_order": 55
    }
  }
  ```
- **Logic:**
  - Calculates `total = foh + boh + delivered`
  - Calculates `order = max(0, par - total - on_order)`
  - Aggregates totals across all milk types

**GET `/api/milk-count/history`**

- **Purpose:** Get historical sessions
- **Auth:** Required (JWT)
- **Query Params:**
  - `limit` (optional): Max sessions (default: 30, max: 100)
  - `offset` (optional): Pagination offset (default: 0)
  - `status` (optional): Filter by status
- **Response:**
  ```json
  {
    "sessions": [...],
    "total": 45,
    "limit": 30,
    "offset": 0
  }
  ```

---

#### Staff Endpoints

**GET `/api/milk-count/milk-types`**

- **Purpose:** Get active milk types with par levels (for counting screens)
- **Auth:** Required (JWT)
- **Response:**
  ```json
  {
    "milk_types": [
      {
        "id": "uuid",
        "name": "Whole",
        "category": "dairy",
        "display_order": 1,
        "par_value": 30
      }
    ]
  }
  ```

---

### Frontend Routes

**Base Path:** `/tools/milk-count/*`

- **`/tools/milk-count`** - Landing Page
  - Shows session status card
  - Actions: "Start Night Count", "Continue to BOH", "Start Morning Count", "View Summary"
  - Handles session state transitions

- **`/tools/milk-count/night/foh`** - FOH Count Page
  - MilkCountCard components with +/- counters
  - Grouped by dairy/non-dairy
  - Progress indicator
  - "Save & Continue to BOH" button

- **`/tools/milk-count/night/boh`** - BOH Count Page
  - Same interface as FOH
  - "Back to FOH" and "Save Night Count" buttons
  - On save → redirects to landing

- **`/tools/milk-count/morning`** - Morning Count Page
  - MorningCountRow components with method selection
  - Shows night BOH values (read-only)
  - Expandable rows showing calculations
  - "Save & Continue" button → redirects to On Order page

- **`/tools/milk-count/on-order`** - On Order Page
  - OnOrderRow components with +/- counters
  - Instructions to check IMS for on-order quantities
  - Default value is 0 for all milk types
  - "Save & View Summary" button → completes session

- **`/tools/milk-count/summary/[sessionId]`** - Summary Page
  - Table with all columns (FOH, BOH, Delivered, On Order, Total, Par, Order)
  - Mobile: Card-based layout
  - Desktop: Table layout
  - Color-coded order amounts
  - Totals row with Total On Order
  - Navigation to history

- **`/tools/milk-count/history`** - History Page
  - List of past sessions
  - Status badges (In Progress, Completed)
  - Click to view summary

### Admin Routes

**Base Path:** `/admin/*`

- **`/admin/milk-pars`** - Milk Count Pars Management
  - List all milk types with current par values
  - Inline editing with save/cancel
  - Shows last updated timestamp and user

---

### Frontend Components

**Location:** `frontend/components/tools/milk-count/`

- **MilkCountCard** - Counter component
  - Milk name, category icon (dairy/non-dairy)
  - +/- buttons with touch-friendly targets
  - Direct number input field
  - Reusable for FOH and BOH pages

- **MorningCountRow** - Morning count entry
  - Expandable row design
  - Method selection (radio buttons)
  - Shows night BOH value
  - Calculates delivered quantity live

- **OnOrderRow** - On order entry
  - Simple row with milk name and category icon
  - +/- counter for on_order value
  - Direct number input on tap
  - No method selection (simpler than MorningCountRow)

---

### Key Technical Considerations

#### Session State Machine

**Status Flow:**

```
night_foh → night_boh → morning → on_order → completed
     ↑                                  │
     └──────────────────────────────────┘ (new day, new session)
```

**State Transitions:**

- `night_foh` → `night_boh`: When FOH counts saved
- `night_boh` → `morning`: When BOH counts saved
- `morning` → `on_order`: When morning counts saved
- `on_order` → `completed`: When on order quantities saved

**State Validation:**

- Each endpoint validates current status before allowing updates
- Status advancement is automatic (not user-controlled)

#### Store-Level Data Sharing

- Sessions are date-based (one per day)
- Any authenticated partner can continue a session
- No user ownership - store-level shared data
- Tracks which user completed each phase

#### Morning Count Methods

**Option A: BOH Count Method (recommended for dairy)**

- Partner counts current BOH quantity
- App calculates: `delivered = current_boh - night_boh`
- Use when delivery is already in fridge

**Option B: Direct Delivered Method (optional for non-dairy)**

- Partner enters delivered count directly
- Best when boxes are visible outside fridge
- Flexible per milk type

#### Calculation Engine

**All calculations server-side:**

- `delivered = current_boh - boh_count` (for boh_count method)
- `total = foh + boh + delivered`
- `order = max(0, par - total - on_order)`
- Totals aggregated across all milk types (including total_on_order)

---

## User Interface Design

### Mobile-First Design Philosophy

- **Primary Target:** Mobile devices (phones/tablets)
- **Touch Targets:** Minimum 44x44px for all interactive elements
- **Card-Based Layout:** Large, touch-friendly counters
- **Responsive Tables:** Cards on mobile, tables on desktop
- **Color Coding:** Green (at/above par), amber (close), red (below par)

### Design Patterns

- **Progress Indicators:** X/9 milks counted
- **Grouped Lists:** Dairy and non-dairy sections
- **Inline Editing:** Par levels editable inline
- **Expandable Rows:** Morning count method selection
- **Status Badges:** Session status visualization

---

## Testing Strategy

### Backend Tests (68/68 tests passing)

**Test Coverage:**

- ✅ **Models** (`tests/test_milk_count_models.py`):
  - MilkType, MilkCountParLevel, MilkCountSession, MilkCountEntry
  - Relationships and cascade behavior
  - Session status methods
  - Calculation methods

- ✅ **Admin Endpoints** (`tests/test_milk_count_admin.py`):
  - Get milk types (with/without inactive)
  - Update milk type (display_order, active)
  - Get par levels
  - Update par level
  - Authorization checks (admin only)

- ✅ **Session Endpoints** (`tests/test_milk_count_sessions.py`):
  - Get today's session
  - Start new session
  - Get session with entries
  - Save FOH counts
  - Save BOH counts
  - Status validation

- ✅ **Morning Count** (`tests/test_milk_count_morning.py`):
  - BOH count method
  - Direct delivered method
  - Mixed methods per session
  - Delivered calculation
  - Session completion

- ✅ **Summary & History** (`tests/test_milk_count_summary.py`):
  - Summary calculations
  - Totals aggregation
  - History pagination
  - Status filtering

### Frontend Tests (Planned)

- Component tests for MilkCountCard, MorningCountRow
- Integration tests for counting workflows
- E2E tests for complete night → morning → summary flow

---

## Performance Considerations

### Database Indexes

**Indexed Columns:**

- `milk_count_milk_types.active` (filtering active types)
- `milk_count_sessions.session_date` (unique, daily lookup)
- `milk_count_sessions.status` (status filtering)
- `milk_count_entries.session_id` (foreign key join)

### API Response Times

**Targets:**

- GET `/api/milk-count/milk-types`: < 200ms
- GET `/api/milk-count/sessions/today`: < 200ms
- PUT `/api/milk-count/sessions/:id/night-foh`: < 300ms
- GET `/api/milk-count/sessions/:id/summary`: < 300ms

---

## Security Considerations

### Authentication & Authorization

- All endpoints require valid JWT token
- Admin endpoints (`/admin/*`) require `role = 'admin'`
- Staff can view/update sessions they work on
- No cross-store data access (single-store system)

### Input Validation

- Count values: Non-negative integers only
- Par values: Non-negative integers only
- Method: Must be 'boh_count' or 'direct_delivered'
- Session status: State machine validation

### Data Protection

- User IDs tracked for audit trail
- Session data retained for history
- No sensitive PII in milk count tables

---

## Future Enhancements (Post-MVP)

### Phase 2 Possibilities

1. **Export Functionality**
   - Generate PDF matching paper logbook
   - Copy/print formatted summary

2. **Push Notifications**
   - Remind partners to complete morning count
   - Alert when session incomplete at shift end

3. **Par Level Optimization**
   - Suggest par adjustments based on historical data
   - Track ordering patterns over time

4. **Auto-Complete Suggestions**
   - Pre-fill counts based on previous sessions
   - Pattern recognition for typical values

---

## Related Documentation

- **Overall Architecture:** See `PLANNING.md` for multi-tool system design
- **Tool 1 Planning:** See `Planning/InventoryTracking.md`
- **Tool 3 Planning:** See `Planning/RTDE.md`
- **Design System:** See `Design/README.md` for UI guidelines
- **Development Guidelines:** See `CLAUDE.md`

---

**Document Version:** 3.1
**Last Updated:** 2026-01-13
**Status:** Implementation Complete - Backend (with On Order feature), Frontend (all pages including On Order)
**Part of:** SirenBase Multi-Tool Platform (Tool 2 of 3)
