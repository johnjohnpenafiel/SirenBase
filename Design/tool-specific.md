# Tool-Specific UI Characteristics

Each tool in SirenBase has its own personality while sharing the common design language. This document defines the unique UI elements and patterns for each tool.

---

## Tool 1: Inventory Tracking System

**Personality**: Professional, organized, efficient

### Dashboard Card

- **Icon**: Package or Clipboard
- **Title**: "Inventory Tracking"
- **Description**: "Manage basement inventory with 4-digit codes"

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

```tsx
<Card className="border-[1.5px] border-border hover:border-slate-600 hover:shadow-md transition-all">
  <CardContent className="p-4">
    <div className="flex items-start justify-between">
      <div>
        <p className="inline-block text-[10px] font-mono font-bold tracking-wide uppercase bg-secondary px-2.5 py-1 rounded-full mb-2">
          {code}
        </p>
        <p className="text-lg font-semibold">{name}</p>
        <p className="text-sm text-muted-foreground">{category}</p>
      </div>
      <Button variant="ghost" size="icon" className="text-muted-foreground">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </CardContent>
</Card>
```

---

## Tool 2: Milk Count System

**Personality**: Calm, methodical, calculator-like

### Dashboard Card

- **Icon**: Milk bottle or Calculator
- **Title**: "Milk Count"
- **Description**: "Track milk inventory with automated calculations"

### Key UI Elements

#### Count Screens

- **FOH/BOH Sections**: Separate cards with section headers
- **Milk Type Grid**: 2 columns on mobile, 3-4 on desktop
- **Input Style**: Large, number-focused inputs (`type="number"`, `inputMode="numeric"`)
- **Summary Row**: Sticky bottom on mobile, always visible

#### Milk Count Card

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

- **Icon**: Shopping bag or Sandwich
- **Title**: "RTD&E Count"
- **Description**: "Quick counts and pull list generation"

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

Used by both Milk Count and RTD&E:

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

Both Milk Count and RTD&E use sessions:

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

## Tool Color Accents (Future Enhancement)

While all tools share the neutral palette, subtle color accents can help with tool identification:

| Tool | Potential Accent | Use Case |
|------|------------------|----------|
| Inventory | Slate/Gray | Neutral, professional |
| Milk Count | Blue | Calm, methodical |
| RTD&E | Emerald/Green | Fresh, action-oriented |

**Note**: Currently not implemented. All tools use the neutral grayscale palette.
