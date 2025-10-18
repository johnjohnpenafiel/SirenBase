# Category Field Addition - SirenBase Project

**Date**: October 17, 2025
**Decision**: Add `category` field to Item model using String + Validation approach

---

## Context

During Phase 1 completion, we identified the need for item categorization to improve inventory organization and user experience. Without categories, all items appear in a flat list, making it difficult to quickly find specific types of items during daily ordering.

---

## The Need

### Problem Statement
- Inventory items need logical grouping (syrups, condiments, cups, etc.)
- Staff need to filter items by type during ordering
- Current flat list becomes unwieldy as inventory grows
- No way to organize items for future analytics or alerts

### User Story
> "As a staff member doing daily ordering, I want to filter inventory by category (e.g., just syrups, just coffee beans) so I can quickly check stock levels for specific item types without scrolling through unrelated items."

---

## Decision: Option 1 (String + Validation)

### Two Options Considered

#### Option 1: String Field with Frontend Dropdown + Backend Validation ✅ CHOSEN
```python
category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
```

**Validation happens in:**
- Frontend: Dropdown menu (prevents user typos)
- Backend: Marshmallow schema validation (prevents API bypassing)

#### Option 2: Database Enum Type ❌ NOT CHOSEN
```python
class ItemCategory(enum.Enum):
    SYRUPS = "syrups"
    # ...

category: Mapped[str] = mapped_column(SQLEnum(ItemCategory), nullable=False)
```

**Validation happens in:**
- Database: PostgreSQL enforces allowed values

---

## Why We Chose Option 1

### Flexibility During MVP
- Still learning what categories are actually needed
- Can add/remove categories without database migrations
- Faster iteration during development phase
- Categories can be adjusted based on staff feedback

### Adequate Protection
- Frontend dropdown prevents 99% of user errors (can't type "syrup" instead of "syrups")
- Backend validation prevents API bypassing
- Database still indexed for performance
- Same user experience as Enum approach

### Lower Overhead
- No migrations needed when adding new categories (e.g., "pastries")
- Just update the constants list in both frontend and backend
- Simpler development workflow during MVP phase

### Future Flexibility
- Can migrate to Enum later if needed (after categories stabilize)
- Allows A/B testing of category names
- Easier to experiment with category hierarchies

---

## Defined Categories

### Initial Category List
```python
ITEM_CATEGORIES = [
    'syrups',
    'sauces',
    'coffee_beans',
    'powders',
    'cups',
    'lids',
    'condiments',
    'cleaning_supplies',
    'other'
]
```

### Category Definitions
- **syrups**: Vanilla, Caramel, Hazelnut, Sugar-Free variants
- **sauces**: Mocha, White Mocha, Caramel Drizzle
- **coffee_beans**: Pike Place, Espresso Roast, Decaf, seasonal blends
- **powders**: Matcha, Chai, Hot Chocolate, protein powders
- **cups**: Hot cups, cold cups (various sizes)
- **lids**: Hot lids, cold lids, sippy lids, dome lids
- **condiments**: Sugar packets, sweeteners, cinnamon, cocoa
- **cleaning_supplies**: Sanitizer, cleaning tablets, towels, brushes
- **other**: Catch-all for miscellaneous items

### Excluded Categories
- ~~**milk**~~: Refrigerated items not stored in basement inventory

---

## Implementation Strategy

### Backend Implementation (Phase 1)

1. **Create Constants File** (`backend/app/constants.py`)
   ```python
   ITEM_CATEGORIES = [
       'syrups',
       'sauces',
       'coffee_beans',
       'powders',
       'cups',
       'lids',
       'condiments',
       'cleaning_supplies',
       'other'
   ]
   ```

2. **Update Item Model** (`backend/app/models/item.py`)
   ```python
   category: Mapped[str] = mapped_column(
       String(50),
       nullable=False,
       index=True  # For efficient filtering
   )
   ```

3. **Add Backend Validation** (in Marshmallow schemas)
   ```python
   from marshmallow import validates, ValidationError
   from app.constants import ITEM_CATEGORIES

   class ItemCreateSchema(Schema):
       category = fields.Str(
           required=True,
           validate=validate.OneOf(ITEM_CATEGORIES)
       )
   ```

4. **Create Migration**
   - Add category column with NOT NULL constraint
   - Add index on category for filtering performance

5. **Update Seed Script**
   - Assign categories to test items
   - Ensure all items have valid categories

### Frontend Implementation (Phase 3)

1. **Create Constants File** (`frontend/src/lib/constants.ts`)
   ```typescript
   export const ITEM_CATEGORIES = [
       'syrups',
       'sauces',
       'coffee_beans',
       'powders',
       'cups',
       'lids',
       'condiments',
       'cleaning_supplies',
       'other'
   ] as const;

   export type ItemCategory = typeof ITEM_CATEGORIES[number];
   ```

2. **Add Item Form - Category Dropdown**
   ```typescript
   <Select name="category" required>
     <option value="">Select a category...</option>
     {ITEM_CATEGORIES.map(cat => (
       <option key={cat} value={cat}>
         {formatCategory(cat)}
       </option>
     ))}
   </Select>
   ```

3. **Inventory Page - Category Filtering**
   ```typescript
   // Filter dropdown
   <Select onChange={(e) => setSelectedCategory(e.target.value)}>
     <option value="all">All Categories</option>
     {ITEM_CATEGORIES.map(cat => (
       <option key={cat} value={cat}>
         {formatCategory(cat)}
       </option>
     ))}
   </Select>

   // Display items grouped by category or filtered
   ```

4. **Display Formatting Utility**
   ```typescript
   function formatCategory(category: string): string {
     return category
       .split('_')
       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
       .join(' ');
   }
   // 'coffee_beans' → 'Coffee Beans'
   // 'cleaning_supplies' → 'Cleaning Supplies'
   ```

---

## Benefits

### User Experience
- ✅ Clear organization of inventory items
- ✅ Fast filtering by category during ordering
- ✅ Prevents user mistakes (dropdown, not text input)
- ✅ Consistent categorization across system

### Developer Experience
- ✅ No migrations needed for category changes
- ✅ Easy to add new categories as needs evolve
- ✅ Simple validation logic
- ✅ Shared constants between frontend/backend

### Performance
- ✅ Indexed for fast filtering queries
- ✅ Efficient GROUP BY operations
- ✅ Quick category-based analytics

### Future Features Enabled
- Category-specific low stock alerts
- Analytics per category
- Category-based ordering workflows
- Bulk operations by category

---

## Trade-offs Accepted

### What We Gave Up (vs Enum)
- ⚠️ Not enforced at database level (only frontend + backend validation)
- ⚠️ Requires maintaining category list in 2 places (frontend + backend)
- ⚠️ Theoretically possible to have inconsistent data if validation bypassed

### Why These Are Acceptable
- Frontend dropdown + backend validation provides adequate protection
- Maintaining 2 simple lists is minimal overhead
- We control the API (no public access)
- Can migrate to Enum after categories stabilize

---

## Migration Path to Enum (Future)

If categories stabilize and we want stronger enforcement:

1. Document final category list
2. Create ItemCategory Enum in Python
3. Create migration:
   - Add temporary enum column
   - Copy data from string column
   - Drop string column
   - Rename enum column
4. Update validation to use Enum
5. Update frontend (no changes needed - still uses same values)

**Estimated effort**: 1-2 hours
**When to consider**: After 6+ months of stable category usage

---

## Action Items

### Phase 1 (Database) - CURRENT
- [x] Create this decision document
- [ ] Create backend constants file
- [ ] Add category field to Item model
- [ ] Create migration for category column
- [ ] Update seed script with categories
- [ ] Apply migration and verify
- [ ] Update PLANNING.md with schema change
- [ ] Update TASKS.md Phase 1

### Phase 3 (Frontend) - FUTURE
- [ ] Create frontend constants file
- [ ] Add category dropdown to "Add Item" form
- [ ] Implement category filtering on Inventory page
- [ ] Create formatCategory utility function
- [ ] Test category validation (frontend + backend)
- [ ] Ensure error messages guide users to valid categories

### Documentation
- [ ] Update API documentation with category field
- [ ] Document category definitions for staff
- [ ] Add category examples to README

---

## Success Criteria

### Phase 1 (Backend)
- ✅ All items have a category
- ✅ Database indexed on category column
- ✅ Backend validation rejects invalid categories
- ✅ Migration applied successfully

### Phase 3 (Frontend)
- ✅ Users can only select from predefined categories
- ✅ Category filter works on inventory page
- ✅ Category displays in readable format ("Coffee Beans" not "coffee_beans")
- ✅ No validation errors when creating items

### Overall
- ✅ Staff can filter inventory by category
- ✅ Items logically grouped and organized
- ✅ No incorrect/misspelled categories in database

---

## Future Considerations

### Potential Enhancements
- **Hierarchical Categories**: Parent/child categories (e.g., "Beverages" > "Syrups")
- **Custom Categories**: Allow admins to add custom categories
- **Category Icons**: Visual icons for each category
- **Category Colors**: Color-coding for quick visual recognition
- **Multi-Category**: Items belonging to multiple categories (unlikely needed)

### When to Revisit
- If category list grows beyond 15-20 items
- If staff request hierarchical organization
- If we need category-level permissions/access control
- After 6 months of usage (evaluate stability)

---

**Conclusion**: The String + Validation approach provides the right balance of flexibility, safety, and simplicity for the MVP phase. It enables proper item organization while maintaining development agility. The frontend dropdown ensures users cannot make mistakes, and backend validation provides a safety net.
