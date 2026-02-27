# Tool Redesign Guide

A standalone, copy-paste ready guide for redesigning any SirenBase tool to match the "Earned Space" design language.

---

## 1. Design Philosophy Quick Reference

Before writing any code, internalize these principles:

**"Earned Space" means:**
- **No decorative whitespace** - If a card feels empty, it needs more information or less padding
- **Black contrast anchors** - Monospace pills (`text-[10px] font-mono font-bold bg-black text-white rounded-full`) create visual rhythm
- **Small, subordinate icons** - Icons support text at 16-20px, never dominate at 40-80px
- **Tight, purposeful cards** - Padding is `p-4` to `p-5`, not `p-6` to `p-8`
- **Dense grids** - Two-column layouts on mobile for navigation targets
- **Tactile interactions** - `active:scale-[0.98]` for press feedback, `hover:shadow-md` for subtle lift

**The test:** If a screen looks like it could come from any UI component library, it doesn't match the design language yet.

---

## 2. Page Structure Foundation

### Use `h-dvh`, Never `h-screen`

| Unit | CSS Equivalent | Mobile Behavior |
|------|----------------|-----------------|
| `h-screen` | `100vh` | Content gets cut off behind browser toolbar |
| `h-dvh` | `100dvh` | Adjusts to actual visible area |

### Root Layout Template

```tsx
const [isScrolled, setIsScrolled] = useState(false);

const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  setIsScrolled(e.currentTarget.scrollTop > 16);
};

return (
  <div className="flex flex-col h-dvh">
    <Header />

    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Fixed controls with scroll shadow */}
      <div
        className={cn(
          "relative z-10 transition-all duration-300 ease-out",
          isScrolled
            ? "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]"
            : "shadow-[0_0px_0px_0px_rgba(0,0,0,0)]"
        )}
      >
        <div className="container max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-6">
          {/* Title, filters, action buttons */}
        </div>
      </div>

      {/* Scrollable content - ONLY this scrolls */}
      <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        <div className="container max-w-6xl mx-auto px-4 md:px-8 pt-2 pb-6">
          {/* Grid, list, cards */}
        </div>
      </div>
    </main>
  </div>
);
```

### Container Widths

| Type | Class | Width | Use Case |
|------|-------|-------|----------|
| Narrow | `max-w-md` | 448px | Forms, login |
| Standard | `max-w-2xl` | 672px | Tool pages |
| Wide | `max-w-4xl` | 896px | Dashboard |
| Extra-wide | `max-w-6xl` | 1152px | Admin tables |

### Padding

- **Mobile**: `px-4` (16px)
- **Desktop**: `px-6` or `px-8` (24px or 32px)

### Gap-2 Consistent Spacing

Use `flex flex-col gap-2` for consistent 8px spacing between all cards. **Never use `space-y-*`** as it can cause margin collapse issues.

```tsx
// ✅ Correct - reliable gap spacing
<div className="flex flex-col gap-2">
  <Card />
  <Card />
  <Card />
</div>

// ❌ Avoid - margin collapse issues
<div className="space-y-2">
  <Card />
  <Card />
</div>
```

**Important:** When using `flex flex-col gap-2` with sticky elements, adjust the sticky `top` value to account for the gap (see Sticky Positioning below).

---

## 3. Frosted Island Header

### When to Use

| Scenario | Use Island? |
|----------|-------------|
| Dashboard | Yes |
| Tool landing pages | Yes |
| Admin list pages | No (use scroll shadow only) |
| Forms/dialogs | No |

### Complete Implementation (with Dynamic Transparency)

```tsx
<div className="h-dvh overflow-y-auto flex flex-col gap-2" onScroll={handleScroll}>
  <Header />

  {/* Sticky Frosted Island */}
  <div className="sticky top-[72px] z-10 px-4 md:px-8">
    <div
      className={cn(
        "max-w-2xl mx-auto rounded-2xl",
        "border border-neutral-300/80",
        // Dynamic transparency: more opaque at rest, more transparent when scrolled
        isScrolled ? "bg-white/70 backdrop-blur-md" : "bg-white/95 backdrop-blur-md",
        "px-5 py-4 md:px-6 md:py-5",
        "transition-all duration-300 ease-out",
        isScrolled && "shadow-[0_4px_8px_-4px_rgba(0,0,0,0.08)]"
      )}
    >
      {/* Top row: Back + Actions */}
      <div className="flex items-center justify-between mb-4">
        <BackButton href="/dashboard" label="Dashboard" />
        <Button size="icon" className="md:w-auto md:px-4 active:scale-[0.98]" onClick={handleAction}>
          <Plus className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Add Item</span>
        </Button>
      </div>

      {/* Title */}
      <h1 className="text-xl md:text-3xl font-normal tracking-tight text-black">
        Page Title
      </h1>
      <p className="text-sm text-muted-foreground">
        Subtitle or context message
      </p>
    </div>
  </div>

  {/* Content scrolls under the island */}
  <div className="container max-w-2xl mx-auto px-4 pb-8">
    <div className="flex flex-col gap-2">
      {/* Cards, lists, grids */}
    </div>
  </div>
</div>
```

### Island Specifications

| Property | Value |
|----------|-------|
| Border radius | `rounded-2xl` (16px) |
| Background (rest) | `bg-white/95 backdrop-blur-md` |
| Background (scrolled) | `bg-white/70 backdrop-blur-md` |
| Border | `border border-neutral-300/80` |
| Inner padding | `px-5 py-4 md:px-6 md:py-5` |
| Scroll shadow | `shadow-[0_4px_8px_-4px_rgba(0,0,0,0.08)]` |

### Sticky Positioning with Flex Gap

When using `flex flex-col gap-2` on the scroll container, the sticky element's `top` value must account for both the Header height AND the gap:

| Component | Height |
|-----------|--------|
| Header | 64px (h-14 + pt-2) |
| Gap-2 | 8px |
| **Total (sticky top)** | **72px** |

```tsx
// ✅ Correct - accounts for header + gap
<div className="sticky top-[72px] z-10">

// ❌ Wrong - doesn't account for gap, causes drift when scrolling
<div className="sticky top-[64px] z-10">
```

**Why this matters:** Without the correct `top` value, the island will "drift" slightly when scrolling because the flex gap creates space that isn't accounted for in the sticky positioning.

---

## 4. Scroll Shadow Pattern

### Specifications

| Property | Value |
|----------|-------|
| Activation threshold | `scrollTop > 16` |
| Transition duration | 300ms |
| Transition easing | ease-out |
| Shadow (active) | `0 4px 12px -2px rgba(0,0,0,0.08)` |
| Shadow (inactive) | `0 0 0 0 rgba(0,0,0,0)` |

### Implementation

```tsx
const [isScrolled, setIsScrolled] = useState(false);

const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  setIsScrolled(e.currentTarget.scrollTop > 16);
};

// On the fixed header container:
<div
  className={cn(
    "relative z-10 transition-all duration-300 ease-out",
    isScrolled
      ? "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]"
      : "shadow-[0_0px_0px_0px_rgba(0,0,0,0)]"
  )}
>
```

**Critical:** Both shadow states MUST have explicit values for CSS transition to work.

---

## 5. Card Patterns

### Base Card Styling

```tsx
<div className="p-5 rounded-2xl border border-neutral-300/80 bg-card">
  {/* Card content */}
</div>
```

### Tool Card (Dashboard Grid)

```tsx
<div
  onClick={handleClick}
  className={cn(
    "p-4 border border-neutral-300/80 rounded-2xl bg-card",
    "cursor-pointer hover:shadow-md active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  )}
>
  {/* Top row: tool number badge + icon */}
  <div className="flex items-center justify-between mb-3">
    <span className="text-[10px] font-mono font-bold uppercase bg-black text-white px-2.5 py-1 rounded-full">
      01
    </span>
    <Package className="size-5 text-stone-400" />
  </div>

  {/* Title */}
  <h2 className="text-lg font-semibold tracking-tight text-foreground">
    Inventory
  </h2>

  {/* Description + chevron */}
  <div className="flex items-end justify-between mt-1">
    <p className="text-xs text-muted-foreground leading-relaxed pr-4">
      Track basement inventory
    </p>
    <ChevronRight className="size-4 text-muted-foreground/40 shrink-0" />
  </div>
</div>
```

### Content Card with Typography Hierarchy

```tsx
<div className="relative p-5 bg-card rounded-2xl border border-neutral-300/80">
  {/* Category pill (neutral, not black) */}
  <span className="text-xs font-medium tracking-wide capitalize bg-neutral-200/50 border border-neutral-300 px-2.5 py-1 rounded-full">
    {category}
  </span>

  {/* Item name */}
  <p className="text-xl font-normal text-gray-800 truncate mt-2">{name}</p>

  {/* Code badge + metadata */}
  <div className="flex items-center gap-2 mt-1">
    <span className="text-[10px] font-mono font-bold uppercase bg-black text-white px-2.5 py-1 rounded-full">
      {code}
    </span>
    <span className="text-xs text-muted-foreground/60">{date}</span>
  </div>
</div>
```

### Contextual Action Overlay

Replace always-visible action buttons with an ellipsis trigger:

```tsx
const [isActionMode, setIsActionMode] = useState(false);
const cardRef = useRef<HTMLDivElement>(null);

// Click-outside dismissal
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

return (
  <div ref={cardRef} className="relative p-5 bg-card rounded-2xl border border-neutral-300/80">
    {/* Content layer */}
    <div className={cn(
      "transition-all duration-200",
      isActionMode && "opacity-30 blur-[2px] pointer-events-none"
    )}>
      {/* Card content */}
      <Button variant="outline" size="icon" onClick={() => setIsActionMode(true)}>
        <Ellipsis className="size-4" />
      </Button>
    </div>

    {/* Action overlay */}
    {isActionMode && (
      <div className="absolute inset-0 rounded-2xl flex items-center justify-center gap-3 animate-fade-in">
        <Button variant="outline" size="default" className="min-w-[120px]" onClick={handleRemove}>
          <Trash2 className="size-4 mr-2" />
          Remove
        </Button>
      </div>
    )}
  </div>
);
```

---

## 6. Black Monospace Badge

The signature visual element of SirenBase.

### Standard Black Pill

```tsx
<span className="text-[10px] font-mono font-bold uppercase bg-black text-white px-2.5 py-1 rounded-full">
  {label}
</span>
```

### Amber Admin Variant

```tsx
<span className="text-[10px] font-mono font-bold uppercase bg-amber-900 text-amber-100 px-2.5 py-1 rounded-full">
  Admin
</span>
```

### Category Pill (Neutral - NOT black)

```tsx
<span className="text-xs font-medium tracking-wide capitalize bg-neutral-200/50 border border-neutral-300 px-2.5 py-1 rounded-full">
  {category}
</span>
```

### When to Use Black Badge

- Item identifiers (4-digit codes)
- Tool/section numbering
- Role indicators
- Par levels

### When NOT to Use Black Badge

- Category labels (use neutral pill)
- Status indicators
- Large blocks of text

---

## 7. Counter Component

### Structure

```
[ - ]  [  Count Input  ]  [ + ]
         Current Count
```

### Complete Implementation (Single-Tap-to-Keyboard)

```tsx
const [isEditing, setIsEditing] = useState(false);
const [inputValue, setInputValue] = useState(currentCount.toString());
const inputRef = useRef<HTMLInputElement>(null);

// Sync input value when currentCount changes externally
useEffect(() => {
  if (!isEditing) {
    setInputValue(currentCount.toString());
  }
}, [currentCount, isEditing]);

const handleInputFocus = () => {
  setIsEditing(true);
  setTimeout(() => inputRef.current?.select(), 10);
};

const handleInputBlur = () => {
  const numValue = parseInt(inputValue, 10);
  if (!isNaN(numValue) && numValue >= 0 && numValue <= 999) {
    onCountChange(numValue);
  } else {
    setInputValue(currentCount.toString());
  }
  setIsEditing(false);
};

return (
  <div className="flex items-center justify-center gap-1 md:gap-3">
    {/* Decrement Button */}
    <Button
      onClick={() => onCountChange(Math.max(0, currentCount - 1))}
      disabled={currentCount === 0}
      variant="outline"
      size="lg"
      className={cn(
        "h-14 w-14 p-0 shrink-0 rounded-2xl",
        "border border-neutral-300/80",
        "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
        "active:scale-[0.98]",
        "disabled:opacity-30"
      )}
    >
      <Minus className="h-6 w-6" strokeWidth={2.5} />
    </Button>

    {/* Count Input - ALWAYS rendered (no button swap) */}
    <div className="w-36 md:w-40">
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputValue}
        onChange={(e) => /^\d*$/.test(e.target.value) && setInputValue(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className={cn(
          "h-14 text-[2.5rem] md:text-[2.75rem] leading-none font-bold text-center tabular-nums rounded-2xl",
          isEditing
            ? "border-2 border-primary/60 ring-4 ring-primary/10"
            : "border-transparent bg-neutral-100 cursor-pointer hover:bg-neutral-200/70"
        )}
        maxLength={3}
      />
    </div>

    {/* Increment Button */}
    <Button
      onClick={() => onCountChange(Math.min(999, currentCount + 1))}
      disabled={currentCount >= 999}
      variant="outline"
      size="lg"
      className={cn(
        "h-14 w-14 p-0 shrink-0 rounded-2xl",
        "border border-neutral-300/80",
        "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
        "active:scale-[0.98]",
        "disabled:opacity-30"
      )}
    >
      <Plus className="h-6 w-6" strokeWidth={2.5} />
    </Button>
  </div>
);
```

**Critical:** Always render the Input element. Do NOT conditionally swap between a button and input - this requires two taps on mobile.

---

## 8. Dialog Patterns

### Container Styling

| Property | Value |
|----------|-------|
| Max width | `sm:max-w-md` |
| Border radius | `rounded-2xl` |
| Shadow | `shadow-xl shadow-black/10` |
| Backdrop | `bg-black/50 backdrop-blur-sm` |
| Padding | `p-6` |

### Header Card Pattern

```tsx
<DialogHeader className="bg-gray-100 rounded-xl px-4 pt-3 pb-3">
  <DialogTitle>Dialog Title</DialogTitle>
  <DialogDescription>
    Description text explaining the purpose.
  </DialogDescription>
</DialogHeader>
```

### Warning Box Pattern

```tsx
<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
  <p className="text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
    <AlertTriangle className="size-4 mt-0.5 flex-shrink-0" />
    <span>
      <strong>Important:</strong> Warning message here.
    </span>
  </p>
</div>
```

### Content Box Pattern

```tsx
<div className="bg-muted/50 border border-border rounded-2xl px-5 py-4">
  {/* Item details, code display, etc. */}
</div>
```

### Stacked Footer Buttons

```tsx
<DialogFooter className="flex-col gap-2 sm:flex-col">
  <Button onClick={handleConfirm} className="w-full">
    Confirm & Save
  </Button>
  <Button variant="outline" onClick={handleCancel} className="w-full">
    Cancel
  </Button>
</DialogFooter>
```

**Note:** When footer has Cancel button, use `showCloseButton={false}` to hide the X.

---

## 9. Navigation Components

### BackButton Variants

```tsx
// Default: Icon-only on mobile, icon + label on desktop
<BackButton href="/dashboard" label="Dashboard" />

// Icon-only: Compact square button
<BackButton href="/dashboard" label="Dashboard" variant="icon-only" />

// Full: Always show text (admin pages)
<BackButton href="/admin" label="Back to Admin" variant="full" />
```

### BackButton Implementation

```tsx
// Default variant
<Button
  variant="outline"
  size="icon"
  onClick={handleClick}
  className="md:w-auto md:px-4"
>
  <ArrowLeft className="h-4 w-4 md:mr-2" />
  <span className="hidden md:inline">{label}</span>
</Button>
```

### Responsive Action Button

```tsx
<Button size="icon" className="md:w-auto md:px-4" onClick={handleAction}>
  <Plus className="h-4 w-4 md:mr-2" />
  <span className="hidden md:inline">Add Item</span>
</Button>
```

---

## 10. Progress Indicators

### Progress Bar

```tsx
<div className="flex items-center gap-2">
  <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
    <div
      className="h-full bg-emerald-500 transition-all duration-300"
      style={{ width: `${(completed / total) * 100}%` }}
    />
  </div>
  <span className="text-sm text-muted-foreground tabular-nums">
    {completed}/{total}
  </span>
</div>
```

### Progress Text Pattern

```tsx
<div className="flex items-center justify-between text-sm">
  <span className="text-muted-foreground">Progress</span>
  <span className="font-medium">{completed} of {total} items</span>
</div>
```

---

## 11. Loading and Saving States

### Skeleton Loader

```tsx
<div className="p-5 rounded-2xl border border-neutral-300/80 bg-card">
  <div className="h-4 w-20 bg-muted animate-pulse rounded-full mb-3" />
  <div className="h-6 w-40 bg-muted animate-pulse rounded mb-2" />
  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
</div>
```

### Button Loading State

```tsx
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? "Saving..." : "Save"}
</Button>
```

### Subtle Saving Indicator

```tsx
<div className="h-3 flex items-center justify-center">
  <span
    className={cn(
      "text-[10px] font-medium text-neutral-400",
      "transition-opacity duration-500 ease-in-out",
      saving ? "opacity-100" : "opacity-0"
    )}
  >
    Saving...
  </span>
</div>
```

---

## 12. Responsive Patterns

### Icon-Only Mobile, Label Desktop

```tsx
<Button size="icon" className="md:w-auto md:px-4">
  <Plus className="h-4 w-4 md:mr-2" />
  <span className="hidden md:inline">Add Item</span>
</Button>
```

### Grid Breakpoints

```tsx
// Dashboard tools: 2-col mobile, 3-col desktop
<div className="grid grid-cols-2 lg:grid-cols-3 gap-2">

// Item cards: 1-col mobile, 2-col desktop
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

### Sidebar + Content Layout

```tsx
<div className="flex h-dvh">
  {/* Desktop sidebar */}
  <aside className="hidden md:flex w-64 flex-col border-r">
    {/* Navigation */}
  </aside>

  {/* Main content */}
  <main className="flex-1 flex flex-col overflow-hidden">
    {/* Content */}
  </main>

  {/* Mobile drawer (controlled by state) */}
</div>
```

---

## 13. Fixed Bottom Action Bar

For pages with a primary action button fixed at the bottom (counting phases, forms, wizards).

### Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Scrollable content above]                                 │
├─────────────────────────────────────────────────────────────┤ ← border-t
│                         pt-3 (12px)                         │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              [ Primary Action Button ]              │   │ ← h-11 (44px)
│   └─────────────────────────────────────────────────────┘   │
│                         pb-6 (24px)                         │
│                         + pb-safe                           │ ← Device safe area
└─────────────────────────────────────────────────────────────┘
```

### Complete Implementation

```tsx
{/* Fixed Bottom Action Bar */}
<div className="fixed bottom-0 left-0 right-0 border-t border-neutral-300/80 bg-card pb-safe">
  <div className="container max-w-2xl mx-auto px-4 pt-3 pb-6">
    <Button
      onClick={handleAction}
      disabled={loading}
      className="w-full h-11 font-semibold active:scale-[0.98]"
      size="lg"
    >
      Primary Action
      <ArrowRight className="ml-2 size-4" />
    </Button>
  </div>
</div>
```

### Specifications

| Property | Value | Purpose |
|----------|-------|---------|
| Position | `fixed bottom-0 left-0 right-0` | Stays at bottom of viewport |
| Background | `bg-card` | Solid white (not translucent) |
| Border | `border-t border-neutral-300/80` | Subtle top separator |
| Safe area | `pb-safe` | Respects device home indicator |
| Top padding | `pt-3` (12px) | Compact spacing above button |
| Bottom padding | `pb-6` (24px) | Extra space for thumb reach |
| Button height | `h-11` (44px) | WCAG touch target minimum |
| Button feedback | `active:scale-[0.98]` | Tactile press response |

### Why Asymmetric Padding

- **`pt-3` (12px)**: Tight top padding keeps the bar compact
- **`pb-6` (24px)**: Larger bottom padding provides:
  1. Visual anchoring (heavier bottom feels stable)
  2. Thumb-friendly spacing on mobile
  3. Breathing room before device safe area kicks in
- **`pb-safe`**: Adds `env(safe-area-inset-bottom)` for notched devices

### Common Mistakes

```tsx
// ❌ Wrong - symmetric padding feels cramped at bottom
<div className="... py-3">

// ❌ Wrong - translucent background for action bars
<div className="... bg-background/95 backdrop-blur">

// ❌ Wrong - forgot safe area padding
<div className="fixed bottom-0 ... bg-card">
  <div className="px-4 py-3">  // No pb-safe!

// ✅ Correct
<div className="fixed bottom-0 left-0 right-0 border-t border-neutral-300/80 bg-card pb-safe">
  <div className="container max-w-2xl mx-auto px-4 pt-3 pb-6">
```

---

## 14. Tool Color Accents

| Tool | Color | Icon Class |
|------|-------|------------|
| Inventory | Stone | `text-stone-400` |
| RTD&E | Emerald | `text-emerald-400` |
| Milk Order | Sky | `text-sky-400` |
| Admin | Amber | `text-amber-400` |

### Rules

- Color appears **only** on small icons (`size-5`)
- **Never** use as large circles or backgrounds
- Black pill badge is always primary visual anchor
- Category pills use neutral styling, not tool accent colors

---

## 15. Pre-Implementation Checklist

### Before Starting

- [ ] Read `Design/README.md` for design philosophy
- [ ] Check `Design/components.md` for component patterns
- [ ] Check `Design/dialogs.md` if building modals
- [ ] Review existing tool implementations for reference
- [ ] Identify which pages need frosted island vs scroll shadow only
- [ ] Plan mobile layout first (320px width)
- [ ] List all interactive states (hover, active, disabled, loading)
- [ ] Identify where black badges should appear

### During Development

- [ ] Use `h-dvh` for all full-viewport layouts
- [ ] Use `flex flex-col gap-2` for card spacing (not `space-y-*`)
- [ ] Implement scroll shadow on fixed headers
- [ ] Use dynamic transparency: `bg-white/95` at rest, `bg-white/70` when scrolled
- [ ] Calculate sticky `top` value correctly (header height + gap)
- [ ] Use `active:scale-[0.98]` for tap feedback
- [ ] Ensure touch targets are minimum 44x44px (size-11)
- [ ] Test counter inputs open keyboard on single tap
- [ ] Use `tabular-nums` for all numeric displays
- [ ] Bottom action bars use `pb-safe` and asymmetric padding (`pt-3 pb-6`)
- [ ] Bottom action bars use solid `bg-card` (not translucent)

### Final Review

- [ ] No `h-screen` anywhere (search for it)
- [ ] No `space-y-*` in card containers (use `flex flex-col gap-2`)
- [ ] All cards use `rounded-2xl` and `border-neutral-300/80`
- [ ] Black badges appear on item codes and tool numbers
- [ ] Category pills use neutral styling (not black)
- [ ] Icons are 16-20px (`size-4` to `size-5`), never larger
- [ ] Padding is `p-4` or `p-5`, not `p-6` or larger
- [ ] Grid is 2-col on mobile for navigation cards
- [ ] Sticky elements don't drift when scrolling (correct `top` value)
- [ ] Fixed bottom bars have `pb-safe` and asymmetric padding
- [ ] Test on real mobile device, not just dev tools

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Feb 4, 2026 | Initial creation |
| 1.1.0 | Feb 4, 2026 | Added Gap-2 Spacing, Dynamic Transparency, Sticky Positioning, Fixed Bottom Action Bar patterns |

**Last Updated**: February 4, 2026
