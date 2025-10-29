# Milk Count Tool - Feature Documentation

## Overview

The Milk Count Tool is a digital solution designed to streamline and automate the milk inventory counting and ordering process at Starbucks stores. This tool replaces the manual paper logbook system with an efficient, accurate, and user-friendly digital interface within SirenBase.

---

## Problem Statement

### Current Manual Process

Partners at Starbucks must count milk inventory twice daily (night and morning shifts) using a physical logbook with multiple columns. This process is:

- **Time-consuming:** Partners must open each fridge, count by type, and manually record data
- **Error-prone:** Manual addition and calculation increase risk of mistakes
- **Inefficient:** Requires writing, adding, and calculating across multiple columns for each milk type

### Physical Logbook Format

The current paper logbook has the following columns:

- **FOH (Front of House):** Milks in beverage fridges
- **BOH (Back of House):** Milks in backup fridge
- **Delivered:** Milks delivered that morning
- **Total:** FOH + BOH + Delivered
- **Par:** Target inventory level
- **Order:** Par - Total (amount to order)

### Current Workflow Steps

**Night Shift:**

1. Count Front of House (FOH) milks in beverage fridges
2. Count Back of House (BOH) milks in backup fridge
3. Record counts in physical logbook

**Morning Shift:**

1. Review night's FOH and BOH counts from logbook
2. Determine delivered milk quantity:
   - **For Dairy Milks:** Count current BOH, subtract night BOH to calculate delivered
   - **For Non-Dairy Milks:** Can directly count delivered boxes (arrive outside fridge)
3. Calculate Total = FOH + BOH + Delivered
4. Calculate Order Needed = Par - Total
5. Write order quantities

### Example Calculation

```
Whole Milk:
FOH (night): 15
BOH (night): 20
BOH (morning): 30
Delivered: 30 - 20 = 10
Total: 15 + 20 + 10 = 45

Par level: 60
Order needed: 60 - 45 = 15 milks
```

---

## Proposed Digital Solution

### Core Features

#### 1. Night Count Process (Two Sequential Screens)

**FOH Count Screen:**

- Display vertical list of all milk types with +/- counters
- Partner counts and enters FOH milks for each type
- Save and proceed to BOH screen

**BOH Count Screen:**

- Identical interface to FOH screen
- Partner counts and enters BOH milks for each type
- Final save stores both FOH and BOH counts at store level

**Key Points:**

- Simple +/- buttons for quick counting
- No fridge-by-fridge breakdown needed
- Data saved to store database (not user-specific)
- Any partner can access the saved counts next morning

#### 2. Morning Count Process (Single Screen)

**Morning Count Screen displays per milk type:**

- Previous night's BOH count (read-only reference)
- Two input options (partner chooses one):

  **Option A: BOH Count Method**

  - Input current BOH count using +/- buttons
  - App auto-calculates: `Delivered = Current BOH - Night BOH`
  - Best for dairy milks (delivered milks already in fridge)

  **Option B: Direct Delivered Count**

  - Input delivered milk count directly using +/- buttons
  - Best for non-dairy milks (boxes visible outside fridge)
  - Still allows flexibility if boxes aren't accessible

**Why Two Methods?**

- **Dairy milks** are delivered directly to BOH fridge (must stay cold) → Use Option A
- **Non-dairy milks** arrive in boxes outside → Can use Option B for faster counting
- Flexibility allows partners to use whichever method is most efficient

#### 3. Summary & Calculation

After morning save, display comprehensive summary matching logbook format:

```
Milk Type    | FOH | BOH | Delivered | Total | Par | Order
-------------|-----|-----|-----------|-------|-----|-------
Whole        | 15  | 20  | 10        | 45    | 60  | 15
2%           | 12  | 18  | 8         | 38    | 50  | 12
Oat          | 8   | 12  | 6         | 26    | 35  | 9
```

**Automatic Calculations:**

- Total = FOH + BOH + Delivered
- Order = Par - Total

**Actions Available:**

- View data to transfer to physical logbook
- View historical counts
- Start new counting cycle

#### 4. Par Level Management

**Admin/Manager Dashboard:**

- Set and update par values per milk type
- Track who made changes and when
- Adjustable as store needs change

---

## Daily Tracking Cycle

### Complete Workflow

**Night Shift (e.g., 9 PM):**

1. Partner logs into SirenBase → Milk Count Tool
2. Counts FOH milks using +/- buttons for each type
3. Saves and continues to BOH screen
4. Counts BOH milks using +/- buttons for each type
5. Saves night count → Data stored in store database
6. Visual confirmation displayed

**Morning Shift (e.g., 6 AM):**

1. Different partner logs into SirenBase → Milk Count Tool
2. Opens morning count screen
3. For each milk type, sees previous night's BOH count
4. Chooses counting method:
   - Dairy: Counts current BOH (app calculates delivered)
   - Non-dairy: Counts delivered boxes directly (or uses BOH method if preferred)
5. Clicks "Calculate & Save Order"
6. Reviews summary with all calculated values
7. Exports/copies data to physical logbook

**Cycle Completion:**

- System marks daily log as complete
- Historical data archived
- New counting cycle begins for next night
- Partners can view past counts anytime

---

## User Interface Considerations

### Night Count Screens

#### FOH Count Screen

**Layout:**

- Screen title: "Night Count - Front of House (FOH)"
- Vertical list of all milk types:
  - Whole
  - 2%
  - Half & Half (H&H)
  - Heavy Cream
  - Oat
  - Almond
  - Coconut
  - Soy

**Per Milk Type:**

- Milk name/label
- **[−]** button | **Count Display** (large, centered) | **[+]** button
- Default value: 0

**Bottom Actions:**

- "Save & Continue to BOH" button
- Saves FOH counts and navigates to BOH screen
- Toast notification: "FOH count saved"

#### BOH Count Screen

**Layout:**

- Screen title: "Night Count - Back of House (BOH)"
- Identical milk list and interface as FOH screen

**Per Milk Type:**

- Same +/- counter interface

**Bottom Actions:**

- "Back to FOH" button (optional, allows corrections)
- "Save Night Count" button (primary action)
- Saves both FOH and BOH to store database
- Confirmation: "Night count complete!"
- Returns to dashboard or shows summary

### Morning Count Screen

**Layout:**

- Screen title: "Morning Count - Calculate Delivery"
- Vertical list of all milk types

**Per Milk Type Display:**

```
┌─────────────────────────────────────────┐
│ Whole Milk                              │
│ Night BOH: 20 (greyed out, read-only)   │
│                                         │
│ Choose counting method:                 │
│                                         │
│ ○ Current BOH Count                     │
│   [−] [  0  ] [+]                       │
│   → Delivered: 0 (calculated)           │
│                                         │
│ ○ Direct Delivered Count                │
│   [−] [  0  ] [+]                       │
│                                         │
└─────────────────────────────────────────┘
```

**Features:**

- Radio buttons or tabs to select method
- Only one method active per milk type
- If Option A selected: Shows calculated delivered count
- Visual indicator (color/icon) showing which method was used

**Method Explanations:**

- Option A label: "Current BOH Count (for dairy)"
- Option B label: "Delivered Count (for non-dairy boxes)"
- Helper text or tooltips available

**Bottom Actions:**

- "Calculate & Save Order" button (primary)
- When clicked, validates all inputs and shows summary

### Summary Screen

**Layout:**

- Screen title: "Daily Milk Count Summary"
- Table displaying all milk types with calculated values
- Matches physical logbook format exactly

**Table Columns:**

- Milk Type
- FOH (from night)
- BOH (from night)
- Delivered (calculated or entered)
- Total (FOH + BOH + Delivered)
- Par (preset value)
- Order (Par - Total)

**Visual Design:**

- Highlight Order column (final result)
- Use color coding for low/adequate stock levels
- Clear, readable table format

**Action Buttons:**

- **"Export to Book"** - Copy formatted data or print view
- **"View History"** - See past daily counts
- **"Start New Count"** - Begin next night cycle
- **"Back to Edit"** - Return to morning count if corrections needed

**Purpose:**
Provides complete data transfer to physical logbook for official Starbucks recordkeeping and delivery verification.

### Admin/Manager Dashboard

**Par Level Management:**

- List view of all milk types with current par values
- Edit mode: Change par value with +/- or direct input
- Save button with confirmation
- Display: Last updated timestamp and user

**Historical Data View:**

- Date range picker
- Table showing past counts per day
- Filter by milk type

---

## Technical Considerations

### Data Structure Requirements

```javascript
MilkCountSession {
  id: string (unique identifier)
  storeId: string (which store)
  date: Date (date of count)
  status: "night_pending" | "morning_pending" | "completed"

  nightCount: {
    whole: { foh: number, boh: number },
    twoPercent: { foh: number, boh: number },
    halfAndHalf: { foh: number, boh: number },
    heavyCream: { foh: number, boh: number },
    oat: { foh: number, boh: number },
    almond: { foh: number, boh: number },
    coconut: { foh: number, boh: number },
    soy: { foh: number, boh: number }
  },

  morningCount: {
    milkType: {
      method: "boh_count" | "direct_delivered",
      currentBOH?: number (if using boh_count method),
      delivered: number (calculated or direct)
    }
  },

  calculatedTotals: {
    milkType: {
      total: number,
      orderNeeded: number
    }
  },

  completedBy: {
    nightCountUser: string (user ID),
    morningCountUser: string (user ID)
  },

  timestamps: {
    nightCountSaved: DateTime,
    morningCountSaved: DateTime,
    completed: DateTime
  }
}

ParLevels {
  storeId: string
  milkType: string
  parValue: number
  lastUpdated: DateTime
  updatedBy: string (user ID)
}

MilkTypes {
  id: string
  name: string
  category: "dairy" | "non_dairy"
  displayOrder: number
}
```

### Key Technical Features

**Session State Management:**

- Track current phase: night FOH, night BOH, morning, or completed
- Persist state between screens and sessions
- Allow navigation back to previous steps for corrections

**Store-Level Data Sharing:**

- All counts saved at store level (not user-specific)
- Any authenticated partner at the store can access
- Prevents data loss from shift changes

**Input Validation:**

- Ensure all fields have valid numeric values
- Prevent negative numbers
- Confirm before overwriting existing counts

**Auto-Save & Recovery:**

- Auto-save counts as they're entered (prevent data loss)
- Recover partial counts if user navigates away
- Clear indication of saved vs. unsaved state

**Conflict Resolution:**

- Handle edge case of multiple users counting simultaneously
- Lock session when in use or use last-write-wins with warning
- Display who is currently counting (if applicable)

**Calculation Engine:**

- Real-time calculation of delivered milks (Option A)
- Real-time calculation of totals and order amounts
- Validation that calculations match logbook formulas

**Historical Data:**

- Store all daily counts permanently
- Index by date for quick retrieval
- Enable trend analysis and reporting

**Export Functionality:**

- Format data to match physical logbook
- Include all columns: FOH, BOH, Delivered, Total, Par, Order

---

## Benefits of Digital Solution

### Efficiency Gains

- **Faster Counting:** Simple +/- interface, no writing or column management
- **Automatic Math:** Eliminates manual calculation errors
- **Flexible Methods:** Choice of counting method based on milk type and situation
- **Better Handoffs:** Seamless data transfer between night and morning shifts

### Operational Improvements

- **Historical Insights:** Analyze ordering patterns over time
- **Delivery Verification:** Compare calculated vs. actual deliveries
- **Accountability:** Track who performed counts and when
- **Consistency:** Standardized process across all partners
- **Accessibility:** Mobile-friendly for counting on the floor

### Manager Value

- **Data-Driven Decisions:** Optimize par levels based on actual usage trends
- **Reduce Waste:** Better inventory management reduces spoilage
- **Time Savings:** Partners spend less time on manual inventory tasks
- **Accuracy Monitoring:** Identify counting discrepancies and training needs
- **Audit Trail:** Complete record for compliance and review

### Physical Logbook Integration

- Digital tool complements (not replaces) official logbook
- Easy data export for required recordkeeping
- Reduces transcription errors when filling physical book
- Provides backup/verification of physical records

---

## Implementation Priority

This feature is planned as the **second major tool** in SirenBase's multi-tool architecture, following the existing tracking system.

### Development Phases

**Phase 1: Core Counting Features**

- Night FOH and BOH count screens
- Morning count with dual input methods
- Basic summary display
- Store-level data persistence

**Phase 2: Calculations & Summary**

- Auto-calculation of delivered milks
- Order quantity calculation
- Complete summary screen with all columns
- Export functionality

**Phase 3: Admin & Historical**

- Par level management interface
- Historical data view
- Data export (CSV/Excel)
- User tracking and audit trails

**Phase 4: Polish & Optimization**

- Mobile optimization
- Auto-save and recovery
- Improved validation and error handling
- Performance optimization

---

## Related Documentation

- See `PLANNING.md` for overall SirenBase architecture
- Multi-tool dashboard design (card grid navigation)
- Store authentication and role management

---

**Document Version:** 2.0
**Last Updated:** October 25, 2025
**Status:** Planning Phase - Ready for Implementation
**Part of:** SirenBase Multi-Tool Platform (Tool 2 of 3)
