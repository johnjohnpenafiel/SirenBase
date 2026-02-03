# Component Patterns

This document defines the standard UI components used across SirenBase. For dialog/modal patterns, see [dialogs.md](./dialogs.md).

---

## Buttons

**Base Requirements**:
- Minimum touch target: 44x44px (iOS/Android guidelines)
- Clear visual states: default, hover, active, disabled
- Loading state for async actions
- Icon support (leading/trailing)

### Button Variants

```typescript
// Primary - Main CTAs (Add Item, Save, Confirm)
<Button variant="default" size="default">
  Add Item
</Button>

// Secondary - Supporting actions (Cancel, Back)
<Button variant="secondary" size="default">
  Cancel
</Button>

// Destructive - Dangerous actions (Remove, Delete)
<Button variant="destructive" size="default">
  Remove
</Button>

// Ghost - Subtle actions (Close, Dismiss)
<Button variant="ghost" size="default">
  Close
</Button>

// Outline - Alternate secondary style
<Button variant="outline" size="default">
  View All
</Button>
```

### Button Sizes

| Size      | Class  | Height | Padding     | Use Case                    |
|-----------|--------|--------|-------------|-----------------------------||
| `sm`      | `h-9`  | 36px   | `px-3 py-2` | Compact UIs, inline actions |
| `default` | `h-11` | 44px   | `px-4 py-2` | **Standard buttons** (WCAG) |
| `lg`      | `h-13` | 52px   | `px-6 py-3` | Primary CTAs, mobile forms  |

### Icon Button Sizes

| Size       | Class     | Dimensions | Use Case                     |
|------------|-----------|------------|------------------------------|
| `icon-sm`  | `size-9`  | 36x36px    | Compact icon buttons         |
| `icon`     | `size-11` | 44x44px    | **Standard** (WCAG compliant)|
| `icon-lg`  | `size-13` | 52x52px    | Large icon buttons           |

**WCAG Compliance**: `default` and `icon` sizes meet WCAG 2.5.5 AAA touch target recommendation (44x44px).

**Default Choice**: Use `size="default"` unless space is constrained.

### Button States

- **Default**: Solid background, clear text
- **Hover**: Slightly darker background (desktop only)
- **Active**: Pressed appearance (scale down slightly)
- **Disabled**: 50% opacity, `cursor-not-allowed`
- **Loading**: Show spinner, disable interaction, keep text visible

### Mobile-Specific Rules

- **Full-width on mobile**: Buttons in forms should be `w-full` on mobile, `w-auto md:w-auto` on desktop
- **Bottom-fixed CTAs**: Primary actions (Add Item) can be fixed to bottom on mobile for thumb access
- **Icon-only on mobile**: Use `size="icon"` with `md:w-auto md:px-4` to create circular buttons on mobile that expand for text on desktop

**Example - Responsive Icon Button**:
```tsx
<Button size="icon" className="md:w-auto md:px-4">
  <Plus className="h-4 w-4 md:mr-2" />
  <span className="hidden md:inline">Add Item</span>
</Button>
```

---

## Cards

**Purpose**: Group related content, provide visual boundaries.

### Card Anatomy

```tsx
<Card>
  <CardHeader>
    <CardTitle>Item Name</CardTitle>
    <CardDescription>Optional subtitle or metadata</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions, buttons */}
  </CardFooter>
</Card>
```

### Card Styling Defaults

- **Background**: `bg-card` (white in light mode, dark gray in dark mode)
- **Border**: `border border-border` (subtle gray)
- **Rounding**: `rounded-xl` (12px) for large cards, `rounded-lg` (8px) for small cards
- **Shadow**: `shadow-none` by default with `hover:shadow-md` for interactive cards
- **Padding**:
  - `CardHeader`: `p-6` (24px)
  - `CardContent`: `px-6 py-4` (24px horizontal, 16px vertical)
  - `CardFooter`: `px-6 py-4`

### Card Patterns

**Dashboard Tool Cards**:
- Compact, dense cards following "Earned Space" philosophy
- **Top row**: Black monospace tool number badge (left) + small color icon (right, `size-5`, 400-weight color)
- **Title**: `text-lg font-semibold tracking-tight`
- **Bottom row**: Description (`text-xs text-muted-foreground`) + chevron-right navigation cue
- **Padding**: `p-4` (tight, no wasted space)
- **Hover**: `hover:shadow-md active:scale-[0.98]` (tactile, not exaggerated)
- **Grid**: `grid-cols-2 lg:grid-cols-3 gap-2` (always 2 columns on mobile)

**Inventory Item Cards**:
- Compact layout with border emphasis
- `border-[1.5px] border-border hover:border-slate-600 hover:shadow-md`
- No shadow at rest, shadow on hover

**Section Cards** (Milk Count):
- Rounded corners with border
- Section header (FOH/BOH)
- Grid of items with input fields
- Summary row at bottom

### Contextual Action Overlay

**Pattern**: Replace always-visible action buttons with an ellipsis trigger that reveals actions inside the card bounds. Reduces visual clutter while preserving fast access.

**When to use**:
- Card has discrete, infrequent actions (remove, delete, edit)
- Actions are secondary to reading the card content
- Card content is the primary focus

**When NOT to use**:
- Actions are the primary interaction (e.g., +/- counters on counting cards)
- The entire card is a single tap target (navigation cards, toggle cards)
- Inline editing patterns (click-to-edit fields)

**Behavior**:

| State | Content Layer | Overlay Layer | Trigger |
|-------|--------------|---------------|---------|
| Default | `opacity-100` | Hidden | Ellipsis button visible |
| Action mode | `opacity-30 blur-[2px] pointer-events-none` | Visible, `animate-fade-in` | Click ellipsis |
| Dismiss | Restore default | Remove | Click action, or click outside card |

**Ellipsis Trigger**:
```tsx
<Button
  variant="outline"
  size="icon"
  onClick={() => setIsActionMode(true)}
  aria-label="Item actions"
>
  <Ellipsis className="size-4" />
</Button>
```

- Positioned on the right, vertically centered (`items-center`)
- `variant="outline"`, `size="icon"` (44x44px, WCAG compliant)
- Horizontal ellipsis (`Ellipsis` from lucide-react)

**Action Overlay**:
```tsx
{isActionMode && (
  <div className={cn(
    "absolute inset-0 rounded-2xl",
    "flex items-center justify-center gap-3",
    "animate-fade-in"
  )}>
    {actions.map((action) => (
      <Button
        key={action.label}
        variant="outline"
        size="default"
        className="min-w-[120px]"
        onClick={action.onClick}
      >
        {action.icon}
        <span className="ml-2">{action.label}</span>
      </Button>
    ))}
  </div>
)}
```

- Absolute positioned within card (`relative` parent required)
- Flex centering handles 1-3 actions naturally
- `variant="outline"` for action buttons (no color emphasis)
- `min-w-[120px]` for comfortable tap targets
- Uses existing `animate-fade-in` keyframe (0.2s ease-out)

**Action Layout**:
- 1 action: centered
- 2 actions: side-by-side with `gap-3`, centered
- 3 actions: row with equal gaps

**Click-Outside Dismissal**:
```tsx
useEffect(() => {
  if (!isActionMode) return;
  function handleMouseDown(event: MouseEvent) {
    if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
      setIsActionMode(false);
    }
  }
  document.addEventListener("mousedown", handleMouseDown);
  return () => document.removeEventListener("mousedown", handleMouseDown);
}, [isActionMode]);
```

Uses `mousedown` (not `click`) to fire before focus changes, preventing race conditions.

**Reference Implementation**: `frontend/components/tools/tracking/ItemCard.tsx`

---

## Black Pill Badge

The signature visual element of SirenBase's design language. Black monospace badges provide contrast anchors that create visual rhythm across screens.

### Styling

```tsx
<span className="text-[10px] font-mono font-bold uppercase bg-black text-white px-2.5 py-1 rounded-full">
  {label}
</span>
```

| Property | Value | Purpose |
|----------|-------|---------|
| Font size | `text-[10px]` | Compact, doesn't compete with titles |
| Font | `font-mono font-bold uppercase` | Technical, precise feel |
| Background | `bg-black text-white` | Maximum contrast anchor |
| Padding | `px-2.5 py-1` | Comfortable pill shape |
| Radius | `rounded-full` | Pill shape |

### Variants

**Item code badge** (Inventory Tracking):
```tsx
<span className="text-[10px] font-mono font-bold uppercase bg-black text-white px-2.5 py-1 rounded-full">
  9674
</span>
```

**Tool number badge** (Dashboard):
```tsx
<span className="text-[10px] font-mono font-bold uppercase bg-black text-white px-2.5 py-1 rounded-full">
  01
</span>
```

**Admin badge** (amber variant for admin-only elements):
```tsx
<span className="text-[10px] font-mono font-bold uppercase bg-amber-900 text-amber-100 px-2.5 py-1 rounded-full">
  Admin
</span>
```

### When to Use

- Item identifiers (4-digit codes)
- Tool/section numbering
- Role indicators
- Any element that needs to anchor the eye and provide rhythm

### When NOT to Use

- Category labels (use the lighter `bg-neutral-200/50 border border-neutral-300` pill instead)
- Status indicators
- Large blocks of text

**Reference Implementations**:
- `frontend/components/tools/tracking/ItemCard.tsx` - Item code badges
- `frontend/components/shared/ToolCard.tsx` - Tool number badges

---

## Forms & Inputs

### Input Fields

**Base Styling**:
```tsx
<Input
  type="text"
  placeholder="Enter item name"
  className="w-full"
/>
```

- **Height**: 44px (mobile-friendly, WCAG compliant)
- **Padding**: `px-3 py-2` (12px horizontal, 8px vertical)
- **Border**: `border border-input` (light gray)
- **Focus**: `ring-2 ring-ring ring-offset-2` (visible focus indicator)
- **Disabled**: `opacity-50 cursor-not-allowed`
- **Error**: `border-destructive ring-destructive`

### Labels

```tsx
<Label htmlFor="item-name" className="text-sm font-medium">
  Item Name
</Label>
```

- Always associate labels with inputs using `htmlFor`
- Position above input (mobile-first)
- Optional indicator `(Optional)` in muted color if field is optional
- Required indicator `*` if field is required (or assume all required by default)

### Form Layout

**Mobile (< 768px)**:
- Single column layout
- Full-width inputs
- Labels stacked above inputs
- 16px gap between fields

**Desktop (>= 768px)**:
- Two-column layouts where appropriate (e.g., item code + category)
- Consistent alignment
- Keyboard tab order flows logically

### Validation & Error Messages

- **Inline errors**: Show below input, red text (`text-destructive`), small (`text-sm`)
- **Error state**: Red border on input
- **Success state** (optional): Green checkmark icon trailing
- **Real-time validation**: Validate on blur, not on every keystroke (reduce noise)

**Example**:
```tsx
<div className="space-y-1">
  <Label htmlFor="pin">PIN</Label>
  <Input
    id="pin"
    type="password"
    className={cn(error && "border-destructive")}
  />
  {error && <p className="text-sm text-destructive">{error}</p>}
</div>
```

### Input Optimization

**Keyboard Types**:
```tsx
// Numeric PIN entry
<Input type="password" inputMode="numeric" pattern="\d{4}" />

// Item code entry
<Input type="text" inputMode="numeric" pattern="\d{4}" />

// Email
<Input type="email" inputMode="email" />

// Search
<Input type="search" inputMode="search" />
```

**Autofocus**: Use cautiously
- ✅ Good: Auto-focus first input in dialog
- ❌ Bad: Auto-focus on page load (triggers mobile keyboard)

### Numeric Counter Inputs (Single-Tap-to-Keyboard)

**Pattern**: Numeric input fields should open the keyboard immediately on first tap.

**Problem Solved**: The default browser behavior for inputs can require two taps:
1. First tap selects/highlights content
2. Second tap opens keyboard

This creates friction in counting workflows where speed is critical.

**Implementation**:
```tsx
// ✅ CORRECT: Always-rendered input with onFocus handler
const [isEditing, setIsEditing] = useState(false);
const [inputValue, setInputValue] = useState(value.toString());
const inputRef = useRef<HTMLInputElement>(null);

const handleInputFocus = () => {
  setIsEditing(true);
  // Select all text when focused (slight delay ensures mobile compatibility)
  setTimeout(() => inputRef.current?.select(), 10);
};

<Input
  ref={inputRef}
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  value={inputValue}
  onFocus={handleInputFocus}
  onBlur={handleInputBlur}
  className={cn(
    "text-3xl font-bold text-center tabular-nums rounded-2xl",
    isEditing
      ? "border-2 border-primary/60"
      : "border-transparent bg-muted/30 hover:bg-muted/50 cursor-pointer"
  )}
/>
```

**Anti-Pattern**:
```tsx
// ❌ INCORRECT: Conditional button/input swap (requires two taps)
{isEditing ? (
  <Input ref={inputRef} ... />
) : (
  <button onClick={() => setIsEditing(true)}>
    {value}
  </button>
)}
```

**Key Principles**:
1. **Always render the Input** - Don't swap between button and input
2. **Use `onFocus` handler** - Browser natively opens keyboard on focus
3. **Auto-select content** - Use `setTimeout(() => inputRef.current?.select(), 10)` so typing replaces existing value
4. **Conditional styling** - Use `isEditing` state only for visual styling, not for DOM structure

**Styling States**:
- **Not editing**: Transparent border, muted background, cursor-pointer
- **Editing**: Visible border (primary color), optional ring/glow

**Reference Implementations**:
- `frontend/components/tools/rtde/RTDECountCard.tsx` - Original implementation
- `frontend/components/tools/milk-count/MilkCountCard.tsx` - Counting rows
- `frontend/components/tools/milk-count/OnOrderRow.tsx` - Order quantity input
- `frontend/components/tools/milk-count/MorningCountRow.tsx` - Morning count input

---

## Lists & Tables

### Card-Based Lists

**Pattern**: Card-based list on mobile, optional table on desktop

**Mobile (< 768px)**:
```tsx
<div className="space-y-2">
  {items.map(item => (
    <Card key={item.code}>
      {/* Item content */}
    </Card>
  ))}
</div>
```

**Desktop (>= 768px)**:
- Optional: Convert to table layout for denser information
- Sortable columns
- Sticky header

### Empty States

Always design empty states:
- Icon (48x48px, muted)
- Message (e.g., "No items in inventory")
- CTA button (e.g., "Add Your First Item")

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Package className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold">No items yet</h3>
  <p className="text-sm text-muted-foreground mb-4">
    Add your first item to get started
  </p>
  <Button>Add Item</Button>
</div>
```

---

## Loading States

### Spinner Component

```tsx
<div className="flex items-center justify-center py-8">
  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
</div>
```

### Skeleton Loaders (preferred for lists)

```tsx
<Card>
  <CardHeader>
    <div className="h-5 w-32 bg-muted animate-pulse rounded" />
  </CardHeader>
  <CardContent>
    <div className="h-4 w-full bg-muted animate-pulse rounded" />
  </CardContent>
</Card>
```

### Button Loading State

```tsx
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? "Loading..." : "Submit"}
</Button>
```

---

## Toasts & Notifications

**Library**: Sonner (already installed)

**Usage**:
```tsx
import { toast } from "sonner";

// Success
toast.success("Item added successfully");

// Error
toast.error("Failed to add item");

// Info
toast.info("Session expires in 5 minutes");

// Warning
toast.warning("Please save your changes");
```

**Positioning**: Top-right on desktop, top-center on mobile

**Duration**: 3 seconds (success/info), 5 seconds (error/warning)

---

## Iconography

**Primary Library**: Lucide React (via ShadCN)

### Size Guidelines

| Size        | Dimension | Use Case                                 |
|-------------|-----------|------------------------------------------|
| `h-3 w-3`   | 12px      | Inline with small text                   |
| `h-4 w-4`   | 16px      | **Default** - Button icons, inputs       |
| `h-5 w-5`   | 20px      | Dashboard tool cards, section headers    |
| `h-6 w-6`   | 24px      | Navigation icons                         |
| `h-8 w-8`   | 32px      | Loading spinners, empty states           |
| `h-12 w-12` | 48px      | Large empty states only                  |

**Note**: Icons should support text, never dominate. Dashboard tool cards use `size-5` (20px) icons, not large circles. Color is subtle (400-weight: `text-stone-400`, `text-emerald-400`, etc.).

### Common Icons

| Icon Name       | Use Case                          |
|-----------------|-----------------------------------|
| `Plus`          | Add item, add user                |
| `X`             | Close, remove, delete             |
| `Trash2`        | Delete action                     |
| `LogOut`        | Logout                            |
| `Package`       | Inventory tracking tool           |
| `Milk`          | Milk count tool (or Calculator)   |
| `ShoppingBag`   | RTD&E tool                        |
| `Search`        | Search functionality              |
| `ChevronDown`   | Dropdown indicator                |
| `Loader2`       | Loading spinner                   |
| `AlertCircle`   | Error/warning messages            |
| `CheckCircle2`  | Success messages                  |
| `AlertTriangle` | Warning/caution                   |

### Icon Usage Rules

- **Always add `aria-hidden="true"`** for decorative icons
- **Add `aria-label`** for icon-only buttons
- **Consistent sizing**: Use Tailwind classes (`h-4 w-4`) not inline styles
- **Color**: Inherit from parent text color or use muted (`text-muted-foreground`)

```tsx
// Decorative icon (hidden from screen readers)
<Plus className="h-4 w-4" aria-hidden="true" />

// Icon-only button (needs label)
<Button aria-label="Remove item">
  <X className="h-4 w-4" />
</Button>
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 20, 2026 | Initial extraction from DESIGN.md |
| 1.0.1 | Jan 18, 2026 | WCAG touch target compliance for buttons (44px minimum) |
| 1.1.0 | Jan 27, 2026 | Added Single-Tap-to-Keyboard pattern for numeric counter inputs |
| 2.0.0 | Feb 2, 2026 | Updated dashboard card pattern to "Earned Space" design; added Black Pill Badge pattern; updated icon size guidelines (subordinate icons, no large circles) |
| 1.2.0 | Jan 31, 2026 | Added Contextual Action Overlay pattern for card actions |

**Last Updated**: February 2, 2026
