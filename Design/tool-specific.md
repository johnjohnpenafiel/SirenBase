# Tool-Specific UI Characteristics

Each tool in SirenBase has its own personality while sharing the common design language. This document defines the unique UI elements and patterns for each tool.

---

## Tool 1: Inventory Tracking System

**Personality**: Dense, precise, technical

### Dashboard Card

- **Tool number**: `01` (black pill badge)
- **Icon**: `Package` at `size-5 text-stone-400` (top-right)
- **Title**: "Inventory"
- **Description**: "Track basement inventory"

### Key UI Elements

#### Add Item Flow

- Two-step dialog using [dialog patterns](./dialogs.md)
- Step 1: Item name (with autocomplete), category dropdown
- Step 2: Review + generated code display (monospace, large)
- Auto-focus first input on dialog open

#### Item Display Modes

- **Compact**: List view, small cards
- **Comfortable**: Default spacing
- **Spacious**: Large cards with more padding

#### Category Badges

```tsx
<span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
  {category}
</span>
```

- Small pills (`text-xs`, `px-2 py-1`, `rounded-full`)
- Muted background (`bg-secondary` or `bg-muted`)
- Use consistent theme colors (no category-specific colors for simplicity)

#### Item Code Display

```tsx
<span className="font-mono text-lg font-bold tracking-wide">
  {code}
</span>
```

- Monospace font (`font-mono`)
- Larger text (`text-lg` or `text-xl`)
- High contrast for readability
- Copy-to-clipboard button on hover (desktop)

### Item Card Pattern

Uses the Contextual Action Overlay pattern (see [components.md](./components.md#contextual-action-overlay)) with ellipsis trigger instead of always-visible action buttons.

```tsx
<div className="relative p-5 bg-card rounded-2xl border border-neutral-300/80">
  {/* Content layer */}
  <div className="flex items-center justify-between">
    <div className="flex-1 min-w-0">
      {/* Category pill */}
      <span className="text-xs font-medium tracking-wide capitalize bg-neutral-200/50 border border-neutral-300 px-2.5 py-1 rounded-full">
        {category}
      </span>
      {/* Item name */}
      <p className="text-xl font-normal text-gray-800 truncate mt-2">{name}</p>
      {/* Code badge + date */}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] font-mono font-bold uppercase bg-black text-white px-2.5 py-1 rounded-full">
          {code}
        </span>
        <span className="text-xs text-muted-foreground/60">{date}</span>
      </div>
    </div>
    {/* Ellipsis trigger for actions */}
    <Button variant="outline" size="icon" onClick={() => setIsActionMode(true)}>
      <Ellipsis className="size-4" />
    </Button>
  </div>
  {/* Action overlay (shown on ellipsis click) */}
</div>
```

**Reference Implementation**: `frontend/components/tools/tracking/ItemCard.tsx`

---

## Tool 2: Milk Order System

**Personality**: Calm, methodical, calculator-like

### Dashboard Card

- **Tool number**: `03` (black pill badge)
- **Icon**: `Milk` at `size-5 text-sky-400` (top-right)
- **Title**: "Milk Order"
- **Description**: "Milk counting with automated calculations"

### Key UI Elements

#### Count Screens

- **FOH/BOH Sections**: Separate cards with section headers
- **Milk Type Grid**: 2 columns on mobile, 3-4 on desktop
- **Input Style**: Large, number-focused inputs (`type="number"`, `inputMode="numeric"`)
- **Summary Row**: Sticky bottom on mobile, always visible

#### Milk Order Card

```tsx
<Card className="p-4">
  <div className="flex items-center justify-between mb-3">
    <span className="font-medium">{milkType}</span>
    <span className="text-sm text-muted-foreground">Par: {par}</span>
  </div>
  <div className="flex items-center gap-3">
    <Button size="icon" variant="outline" onClick={decrement}>
      <Minus className="h-4 w-4" />
    </Button>
    <Input
      type="number"
      inputMode="numeric"
      value={count}
      className="text-center text-xl font-bold w-20"
    />
    <Button size="icon" variant="outline" onClick={increment}>
      <Plus className="h-4 w-4" />
    </Button>
  </div>
</Card>
```

#### Calculator Interface

- Large buttons (56px height on mobile)
- Number pad layout (optional for mobile)
- Immediate calculation feedback (live totals)

#### Session Summary

- Card-based layout
- Clear sections: Night Count, Morning Count, Delivered, Order Qty
- Print-friendly design (matches paper logbook format)

### Section Header Pattern

```tsx
<div className="flex items-center gap-2 mb-4">
  <div className="h-px flex-1 bg-border" />
  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
    {sectionName}
  </span>
  <div className="h-px flex-1 bg-border" />
</div>
```

---

## Tool 3: RTD&E Counting System

**Personality**: Fresh, dynamic, fast-paced

### Dashboard Card

- **Tool number**: `02` (black pill badge)
- **Icon**: `ShoppingBasket` at `size-5 text-emerald-400` (top-right)
- **Title**: "RTD&E"
- **Description**: "Display restocking with pull lists"

### Key UI Elements

#### Counting Interface

```tsx
<div className="flex flex-col items-center gap-4 py-8">
  <h2 className="text-xl font-semibold text-center">{itemName}</h2>

  <div className="flex items-center gap-6">
    <Button size="lg" variant="outline" onClick={decrement} className="h-14 w-14">
      <Minus className="h-6 w-6" />
    </Button>

    <div className="text-center">
      <div className="text-4xl font-bold">{count}</div>
      <div className="text-sm text-muted-foreground">
        Need: {Math.max(0, par - count)}
      </div>
    </div>

    <Button size="lg" variant="outline" onClick={increment} className="h-14 w-14">
      <Plus className="h-6 w-6" />
    </Button>
  </div>
</div>
```

- **+/- Buttons**: Large (48-56px), easy to tap
- **Current Count Display**: Center, large text (`text-4xl`)
- **Item Name**: Above count, clear font
- **Need Indicator**: Shows calculated pull quantity
- **Quick Navigation**: Arrow key support (desktop), swipe between items (future)

#### Pull List View

```tsx
<div className="space-y-2">
  {pullItems.map(item => (
    <div
      key={item.id}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border",
        item.pulled && "bg-muted/50 line-through text-muted-foreground"
      )}
    >
      <Checkbox
        checked={item.pulled}
        onCheckedChange={() => togglePulled(item.id)}
      />
      <span className="flex-1">{item.name}</span>
      <span className="font-mono font-bold">{item.quantity}</span>
    </div>
  ))}
</div>
```

- Checkbox list for BOH fulfillment
- Item name + quantity needed
- Strikethrough on completion (`line-through`)
- Progress indicator (X of Y items pulled)

#### Progress Indicator

```tsx
<div className="flex items-center gap-2">
  <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
    <div
      className="h-full bg-primary transition-all"
      style={{ width: `${(pulled / total) * 100}%` }}
    />
  </div>
  <span className="text-sm text-muted-foreground">
    {pulled}/{total}
  </span>
</div>
```

### Navigation Pattern

RTD&E uses a phase-based navigation instead of separate routes:

- **Desktop**: Sidebar with phase indicators
- **Mobile**: Bottom drawer with phase selection
- Phases: Counting → Pull List → Complete

### Item Selection Highlight

```tsx
<div
  className={cn(
    "p-3 rounded-lg border cursor-pointer transition-all",
    isSelected
      ? "border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]"
      : "border-border hover:border-slate-400"
  )}
>
  {/* Item content */}
</div>
```

- Emerald glow border for selected item
- Subtle hover state for unselected items

---

## Shared Patterns Across Tools

### Counter Component

Used by both Milk Order and RTD&E:

```tsx
interface CounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'default' | 'lg';
}

// Size variants
const sizes = {
  sm: { button: 'h-9 w-9', text: 'text-lg' },
  default: { button: 'h-11 w-11', text: 'text-2xl' },
  lg: { button: 'h-14 w-14', text: 'text-4xl' },
};
```

### Session Management UI

Both Milk Order and RTD&E use sessions:

- **Active Session Banner**: Shows current session status
- **Resume Prompt**: Dialog to continue or start fresh
- **Session Expiration**: Visual countdown or warning

### Data Summary Cards

Common pattern for displaying count totals:

```tsx
<Card className="p-4">
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p className="text-sm text-muted-foreground">Total Items</p>
      <p className="text-2xl font-bold">{total}</p>
    </div>
    <div>
      <p className="text-sm text-muted-foreground">Items Needed</p>
      <p className="text-2xl font-bold text-amber-600">{needed}</p>
    </div>
  </div>
</Card>
```

---

## Tool Color Accents

Each tool has a subtle color accent used only for small icons (`size-5`, 400-weight color). Color is subordinate to the black/white/neutral palette - it provides differentiation at a glance, not decoration.

| Tool | Accent Color | Icon Color Class | Use Case |
|------|-------------|-----------------|----------|
| Inventory | Stone | `text-stone-400` | Neutral, grounded |
| RTD&E | Emerald | `text-emerald-400` | Fresh, action-oriented |
| Milk Order | Sky | `text-sky-400` | Calm, methodical |
| Admin | Amber | `text-amber-400` | Attention, restricted |

**Rules**:
- Color appears only on small icons (`size-5`) and never as large circles or backgrounds
- The black pill badge is always the primary visual anchor; color is secondary
- Category pills within tools use neutral styling (`bg-neutral-200/50 border border-neutral-300`), not tool accent colors

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | Feb 2, 2026 | Updated dashboard card specs to match "Earned Space" design language; updated item card to use contextual action overlay; updated tool color accents from "future enhancement" to active implementation with rules |
| 1.0.0 | Jan 20, 2026 | Initial extraction from DESIGN.md |

**Last Updated**: February 2, 2026
