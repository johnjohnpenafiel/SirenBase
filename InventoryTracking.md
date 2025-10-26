# Inventory Tracking System - Tool Planning Document

## Tool Overview

The **Inventory Tracking System** is the first tool in SirenBase, designed to replace the paper-based inventory tracking used in the basement of a Starbucks store. The tool provides a simple, secure, and accountable way for staff to track inventory items using 4-digit unique identifiers, eliminating the need for physical trips to the basement during daily ordering operations.

---

## Problem Statement

### Current Challenges

Partners currently maintain a paper log in the basement listing all inventory items. When ordering supplies, partners must:
1. Leave the ordering area
2. Go downstairs to the basement
3. Count physical items
4. Return upstairs to complete the order

This process:
- **Disrupts workflow** during busy ordering periods
- **Wastes time** (5-10 minutes per trip)
- **Creates confusion** when multiple items of the same type exist (which one was counted?)
- **Lacks accountability** (no record of who added/removed items)

### The Solution

A digital inventory system that:
- Tracks every item with a unique 4-digit code
- Allows real-time inventory checks from anywhere in the store
- Maintains complete history of all add/remove actions
- Eliminates ambiguity about which specific item is being referenced

---

## Scope & Features

### In Scope (MVP)

1. **Item Management**
   - Add items with auto-generated unique 4-digit codes
   - Remove items by selecting specific codes
   - View current inventory grouped by category
   - Display all codes under each item type

2. **Categorization**
   - Items organized by predefined categories:
     - Syrups, Sauces, Coffee Beans, Powders
     - Cups, Lids, Condiments, Cleaning Supplies, Other
   - Filter inventory view by category

3. **Audit & History**
   - Log all add/remove actions with timestamp
   - Track which partner performed each action
   - History page showing recent activity
   - Complete audit trail for accountability

4. **User Management** (Admin)
   - Add/remove authorized users
   - View all user accounts
   - Role-based access (admin vs staff)

### Out of Scope (Future Enhancements)

- Low stock alerts and notifications
- Bulk operations (add multiple items at once)
- Export history to CSV/PDF
- Undo/redo functionality for mistakes
- Item expiration tracking

---

## User Workflows

### Staff Workflow: Adding Items

1. Staff member receives new inventory delivery
2. Opens SirenBase → Tracking Tool
3. Clicks "Add Item"
4. Selects item category and enters item name
5. App generates unique 4-digit code (e.g., "2847")
6. Staff writes code on physical item with marker
7. Item appears in inventory list immediately

### Staff Workflow: Removing Items

1. Staff member uses an item (e.g., finishes a syrup bottle)
2. Opens SirenBase → Tracking Tool
3. Finds item in inventory list by name/category
4. Clicks "Remove" on the specific code
5. Confirms removal
6. Item marked as removed, logged in history

### Staff Workflow: Checking Inventory

1. During ordering, partner needs to know what's in basement
2. Opens SirenBase → Tracking Tool
3. Views current inventory grouped by type
4. Optionally filters by category (e.g., "Syrups")
5. Sees all items with their unique codes
6. Completes order without basement trip

### Admin Workflow: Managing Users

1. Admin opens SirenBase → Admin Panel (from dashboard)
2. Views list of all authorized users
3. Adds new partner (partner number, name, PIN, role)
4. Removes departed partners or updates access
5. Changes propagate immediately

---

## Technical Details

### Database Schema

#### tracking_items Table
```sql
id                UUID PRIMARY KEY
name              VARCHAR(255) NOT NULL
category          VARCHAR(50) NOT NULL (indexed)
code              VARCHAR(4) UNIQUE NOT NULL (indexed)
added_by          UUID FOREIGN KEY → users(id)
added_at          TIMESTAMP NOT NULL
is_removed        BOOLEAN DEFAULT FALSE
removed_at        TIMESTAMP NULL
removed_by        UUID FOREIGN KEY → users(id) NULL
```

**Key Design Decisions:**
- **Soft Delete**: Use `is_removed` flag instead of hard delete to preserve audit trail
- **Unique Codes**: 4-digit codes are globally unique (10,000 combinations)
- **Category String**: Validated against predefined list (flexible for MVP)
- **Foreign Keys**: RESTRICT on users to preserve audit trail

#### tracking_history Table
```sql
id                UUID PRIMARY KEY
action            ENUM('ADD', 'REMOVE') NOT NULL
item_name         VARCHAR(255) NOT NULL
item_code         VARCHAR(4) NOT NULL
user_id           UUID FOREIGN KEY → users(id)
timestamp         TIMESTAMP NOT NULL
notes             TEXT NULL
```

**Purpose**: Complete audit log of all inventory changes

#### Relationships
- **users → tracking_items** (one-to-many: one user can add many items)
- **users → tracking_history** (one-to-many: one user has many history entries)

---

### API Endpoints

**Base Path**: `/api/tracking/*`

#### Item Endpoints

**GET `/api/tracking/items`**
- **Purpose**: Get all active items
- **Query Params**:
  - `category` (optional): Filter by category
  - `include_removed` (optional): Include soft-deleted items
- **Auth**: Required (JWT)
- **Response**:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "name": "Vanilla Syrup",
        "category": "syrups",
        "code": "2847",
        "added_by": "uuid",
        "added_at": "2025-10-23T14:30:00Z",
        "is_removed": false
      }
    ]
  }
  ```

**POST `/api/tracking/items`**
- **Purpose**: Add new item
- **Auth**: Required (JWT)
- **Body**:
  ```json
  {
    "name": "Vanilla Syrup",
    "category": "syrups"
  }
  ```
- **Response**: Returns created item with generated code
- **Side Effect**: Creates history entry with action="ADD"

**DELETE `/api/tracking/items/<code>`**
- **Purpose**: Remove item (soft delete)
- **Auth**: Required (JWT)
- **Response**: Success message
- **Side Effect**: Sets `is_removed=true`, creates history entry with action="REMOVE"

#### History Endpoints

**GET `/api/tracking/history`**
- **Purpose**: Get recent history entries
- **Query Params**:
  - `limit` (optional, default 100, max 500): Number of entries
  - `user_id` (optional): Filter by user
  - `action` (optional): Filter by ADD or REMOVE
- **Auth**: Required (JWT)
- **Response**:
  ```json
  {
    "history": [
      {
        "id": "uuid",
        "action": "ADD",
        "item_name": "Vanilla Syrup",
        "item_code": "2847",
        "user_name": "John Smith",
        "timestamp": "2025-10-23T14:30:00Z"
      }
    ]
  }
  ```

---

### Frontend Routes

**Base Path**: `/tools/tracking/*`

- **`/tools/tracking/inventory`** - Main inventory page
  - List of items grouped by category
  - Add/remove item functionality
  - Category filter dropdown

- **`/tools/tracking/history`** - Audit log page
  - Reverse chronological list of all actions
  - Filter by user or action type

- **`/tools/tracking/admin`** - Admin user management (DEPRECATED)
  - **Note**: Admin functionality moved to global `/admin` route
  - This route may redirect to `/admin` or be removed

---

### Key Technical Considerations

#### 4-Digit Code Generation

**Algorithm** (in `backend/app/utils/helpers.py`):
1. Generate random 4-digit number (1000-9999)
2. Check if code already exists in `tracking_items` table
3. If collision, retry up to 10 times
4. If still no unique code, raise error (unlikely with 10,000 combinations)

**Edge Cases**:
- Database nearing 9,000+ items (code exhaustion risk)
- Mitigation: Monitor usage, expand to 5 digits if needed

#### Category Validation

**Predefined Categories** (in `backend/app/constants.py`):
```python
ITEM_CATEGORIES = [
    'syrups', 'sauces', 'coffee_beans', 'powders',
    'cups', 'lids', 'condiments', 'cleaning_supplies', 'other'
]
```

**Validation**:
- Backend: Marshmallow schema validates category against list
- Frontend: Dropdown only shows valid categories

#### Soft Delete Strategy

**Why Soft Delete?**
- Preserve complete audit trail
- Allows "undo" functionality in future
- Historical reports remain accurate

**Implementation**:
- `is_removed` flag defaults to `false`
- DELETE endpoint sets flag to `true`, records timestamp and user
- GET `/items` excludes removed items by default
- Use `include_removed=true` query param to see all items

#### Audit Logging

**When History Entries Are Created**:
- Every POST `/api/tracking/items` (action="ADD")
- Every DELETE `/api/tracking/items/<code>` (action="REMOVE")

**What Is Logged**:
- Item name and code
- Action type (ADD or REMOVE)
- User who performed action
- Exact timestamp

---

## User Interface Design

### Inventory Page

**Layout**:
- Header: "Inventory Tracking"
- Category filter dropdown (All, Syrups, Sauces, etc.)
- "Add Item" button (prominent, top-right)
- Item list grouped by category

**Item Display**:
- Group items by name (e.g., "Vanilla Syrup")
- Show all codes under each item name
- Example:
  ```
  Vanilla Syrup
  └─ Code 2847 [Remove]
  └─ Code 1293 [Remove]
  └─ Code 5721 [Remove]
  ```

**Add Item Modal**:
- Input: Item name
- Dropdown: Category selection
- Button: "Generate Code & Add"
- Success: Display generated code, prompt to write on item

**Remove Confirmation**:
- Dialog: "Remove Vanilla Syrup (Code 2847)?"
- Buttons: "Cancel" | "Remove"

### History Page

**Layout**:
- Header: "Audit History"
- Filter options: User, Action type (ADD/REMOVE), Date range
- Table: Recent actions in reverse chronological order

**Table Columns**:
- Timestamp
- Partner Name
- Action (ADD or REMOVE)
- Item Name
- Code

### Admin User Management

**Note**: Admin functionality now handled globally at `/admin` route (see main PLANNING.md)

Tool-specific admin features (if any) will use same global admin role check.

---

## Testing Strategy

### Backend Tests (66/66 tests passing)

**Test Coverage**:
- ✅ **Models** (`tests/test_models.py`):
  - Item creation, code uniqueness
  - Soft delete functionality
  - History entry creation

- ✅ **Utilities** (`tests/test_utils.py`):
  - Code generation algorithm
  - Category validation
  - Format helpers

- ✅ **Auth** (`tests/test_auth.py`):
  - Login with valid/invalid credentials
  - Signup flow
  - JWT token validation

- ✅ **Items** (`tests/test_items.py`):
  - Create item with valid/invalid category
  - Get items with/without filtering
  - Delete item (existing/non-existent)
  - Authorization checks

- ✅ **History** (`tests/test_history.py`):
  - Get history with/without filters
  - Action filtering (ADD/REMOVE)
  - Limit parameter validation

- ✅ **Admin** (`tests/test_admin.py`):
  - Get users list
  - Create user (staff and admin)
  - Delete user with safeguards
  - Authorization checks

### Frontend Tests (TODO in Phase 3)

- Component tests for InventoryPage, HistoryPage
- Integration tests for add/remove workflows
- E2E tests for complete user flows

---

## Performance Considerations

### Database Indexes

**Indexed Columns**:
- `tracking_items.code` (unique, frequently queried)
- `tracking_items.category` (used for filtering)
- `tracking_items.is_removed` (used for filtering active items)
- `tracking_history.timestamp` (used for sorting)

### API Response Times

**Targets**:
- GET `/items`: < 200ms (typical 20-50 items)
- POST `/items`: < 300ms (includes code generation)
- DELETE `/items/<code>`: < 200ms
- GET `/history`: < 300ms (100 entries)

**Optimizations**:
- Use SQLAlchemy eager loading for user names
- Limit history queries to reasonable defaults (100 entries)
- Index frequently filtered columns

---

## Security Considerations

### Authentication

- All endpoints require valid JWT token (except login)
- Tokens expire after 24 hours
- Partner numbers treated as sensitive PII

### Authorization

- Staff role: Can add/remove items, view history
- Admin role: All staff permissions + user management
- Tool-specific admin features use global admin role check

### Input Validation

- Item names: Max 255 characters, required
- Categories: Must match predefined list
- Codes: Exactly 4 digits, auto-generated (not user input)

### Audit Trail

- Every action logged with user ID and timestamp
- History entries immutable (no edits/deletes)
- Soft deletes preserve complete record

---

## Future Enhancements (Post-MVP)

### Phase 2 Possibilities

1. **Low Stock Alerts**
   - Set minimum quantities per item type
   - Notify when inventory drops below threshold

2. **Bulk Operations**
   - Add multiple items at once (batch deliveries)
   - Remove multiple items (batch usage)

3. **Undo Functionality**
   - Reverse accidental removals
   - Restore items from history

4. **Export & Reporting**
   - Export history to CSV/PDF
   - Usage analytics (most used items, trends)

5. **Item Expiration Tracking**
   - Record expiration dates
   - Alert before items expire

---

## Related Documentation

- **Overall Architecture**: See `PLANNING.md` for multi-tool system design
- **Database Schema Details**: See `backend/app/models/`
- **API Implementation**: See `backend/app/routes/tracking.py`
- **Test Suite**: See `backend/tests/`
- **Category Field Decision**: See `UpdateLogs/CATEGORY_FIELD_DECISION.md`

---

**Document Version:** 1.0
**Last Updated:** October 26, 2025
**Status:** Backend Complete (66/66 tests passing), Frontend In Progress
**Part of:** SirenBase Multi-Tool Platform (Tool 1 of 3)
