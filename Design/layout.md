# Layout Patterns

This document defines page structure, navigation, scrolling behavior, and viewport handling for SirenBase.

---

## Viewport Height Units

**CRITICAL**: Always use `h-dvh` instead of `h-screen` for full-viewport layouts.

| Unit | CSS Equivalent | Mobile Behavior | When to Use |
|------|----------------|-----------------|-------------|
| `h-screen` | `100vh` | ❌ Includes browser toolbar height - content gets cut off | **Never** for app layouts |
| `h-dvh` | `100dvh` | ✅ Adjusts to actual visible area as browser chrome hides/shows | **Always** for full-page layouts |

**Why This Matters**: On mobile browsers, `100vh` includes the address bar height, causing content to be hidden behind it. `100dvh` (dynamic viewport height) responds to the actual visible area, ensuring buttons and content remain accessible.

```tsx
// ❌ WRONG - Content will be cut off on mobile
<div className="flex flex-col h-screen">

// ✅ CORRECT - Respects mobile browser chrome
<div className="flex flex-col h-dvh">
```

---

## Container Widths

| Type | Class | Width | Use Case |
|------|-------|-------|----------|
| Full-width mobile | `w-full` | 100% | Default mobile |
| Narrow content | `max-w-md` | 448px | Forms, login |
| Standard content | `max-w-2xl` | 672px | Tool pages |
| Wide content | `max-w-4xl` | 896px | Dashboard |
| Extra-wide | `max-w-6xl` | 1152px | History tables, admin |

**Padding**:
- Mobile: `px-4` (16px)
- Desktop: `px-6` or `px-8` (24px or 32px)

---

## Standard Page Structure

**Design Guideline**: Use **in-place list scrolling** where ONLY the data list/grid scrolls, while controls (title, buttons, filters) remain fixed and visible.

**Key Benefits**:
- Controls always accessible without scrolling back up
- Mobile-friendly: action buttons never scroll out of reach
- App-like experience with stable navigation

### Page Template

```tsx
const [isScrolled, setIsScrolled] = useState(false);

const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  setIsScrolled(e.currentTarget.scrollTop > 16);
};

return (
  <div className="flex flex-col h-dvh">
    <Header />

    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Fixed Controls - Shadow fades in when content scrolls beneath */}
      <div
        className={cn(
          "relative z-10 transition-all duration-300 ease-out",
          isScrolled
            ? "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]"
            : "shadow-[0_0px_0px_0px_rgba(0,0,0,0)]"
        )}
      >
        <div className="container max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-6">
          <h1>Page Title</h1>
          <div>{/* Action buttons, filters */}</div>
        </div>
      </div>

      {/* Scrollable Data - ONLY this scrolls */}
      <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        <div className="container max-w-6xl mx-auto px-4 md:px-8 pt-2 pb-6">
          {/* Grid, list, table content */}
        </div>
      </div>
    </main>

    <Footer />
  </div>
);
```

### Implementation Rules

1. **Root container**: `flex flex-col h-dvh`
2. **Main element**: `flex-1 flex flex-col overflow-hidden`
3. **Fixed controls**: `relative z-10` with conditional scroll shadow
4. **Scrollable area**: `flex-1 overflow-y-auto` with `onScroll` handler

---

## Dynamic Scroll Shadow

The fixed header section gains a subtle shadow when content scrolls beneath it, creating the visual effect of content sliding "under" the header.

### Specifications

| Property | Value | Rationale |
|----------|-------|-----------|
| **Activation threshold** | 16px scroll | Prevents accidental activation from micro-scrolls |
| **Transition duration** | 300ms | Smooth fade-in without sluggishness |
| **Transition easing** | ease-out | Decelerating curve feels natural |
| **Shadow (active)** | `0 4px 12px -2px rgba(0,0,0,0.08)` | Subtle downward shadow |
| **Shadow (inactive)** | `0 0 0 0 rgba(0,0,0,0)` | Explicit zero for CSS transition |
| **Content breathing room** | `pt-2` (8px) | Small gap prevents touching header |

### Implementation

```tsx
const [isScrolled, setIsScrolled] = useState(false);

const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  setIsScrolled(e.currentTarget.scrollTop > 16);
};

// Fixed header with conditional shadow
<div
  className={cn(
    "relative z-10 transition-all duration-300 ease-out",
    isScrolled
      ? "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]"
      : "shadow-[0_0px_0px_0px_rgba(0,0,0,0)]"
  )}
>
  {/* Fixed content */}
</div>

// Scrollable area with handler
<div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
  {/* Scrollable content */}
</div>
```

**Critical Notes**:
- Both shadow states MUST have explicit values for CSS transition to work
- Using `transition-shadow` alone doesn't work; use `transition-all`
- The `z-10` ensures shadow renders above scrollable content
- Don't use `border-b` — the shadow provides cleaner visual separation

---

## Title Area Island Pattern

A modern Apple-style frosted glass "island" that floats above scrollable content. The translucent effect reveals motion beneath while maintaining full legibility.

### When to Use

| Scenario | Use Island? | Notes |
|----------|-------------|-------|
| Dashboard | ✅ Yes | Primary showcase of the pattern |
| Tool landing pages | ✅ Yes | Inventory, Milk Count, RTD&E main pages |
| Admin list pages | ❌ No | Use standard scroll shadow pattern |
| Forms/dialogs | ❌ No | Not applicable |
| History/detail pages | ⚠️ Maybe | Evaluate based on content density |

### Visual Reference

```
┌─────────────────────────────────────────────────────────────┐
│  Header (Global Navigation)                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │  ← Frosted glass island
│   │ ░░  Page Title                                   ░░ │   │    • rounded-2xl corners
│   │ ░░  Subtitle or context message                  ░░ │   │    • bg-gray-100/60
│   │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │    • backdrop-blur-md
│   └─────────────────────────────────────────────────────┘   │    • border-gray-200
│                                                             │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐                     │
│   │  Card   │  │  Card   │  │  Card   │  ← Content scrolls  │
│   │         │  │         │  │         │    beneath island   │
│   └─────────┘  └─────────┘  └─────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

### Specifications

| Property | Value | Purpose |
|----------|-------|---------|
| **Positioning** | `sticky top-0 z-10` | Stays at top while content scrolls beneath |
| **Outer padding** | `px-4 md:px-8 pt-2 pb-4 md:pt-3 md:pb-6` | Inset from edges + gap from header |
| **Max width** | `max-w-6xl mx-auto` | Matches content container |
| **Border radius** | `rounded-2xl` (16px) | Apple-style soft corners |
| **Background** | `bg-gray-100/60` | Light grey at 60% opacity |
| **Blur** | `backdrop-blur-md` | 12px blur reveals content motion |
| **Border** | `border border-gray-200` | Defined edge (full opacity for stronger visual definition) |
| **Inner padding** | `px-5 py-4 md:px-6 md:py-5` | Comfortable internal spacing |
| **Scroll shadow** | `shadow-[0_4px_8px_-4px_rgba(0,0,0,0.08)]` | Bottom-only shadow on scroll |
| **Transition** | `transition-all duration-300 ease-out` | Smooth shadow appearance |

### Implementation

```tsx
<main className="flex-1 overflow-y-auto" onScroll={handleScroll}>
  {/* Sticky Frosted Island */}
  <div className="sticky top-0 z-10 px-4 md:px-8 pt-2 pb-4 md:pt-3 md:pb-6">
    <div
      className={cn(
        "max-w-6xl mx-auto rounded-2xl",
        "bg-gray-100/60 backdrop-blur-md",
        "border border-gray-200",
        "px-5 py-4 md:px-6 md:py-5",
        "transition-all duration-300 ease-out",
        isScrolled && "shadow-[0_4px_8px_-4px_rgba(0,0,0,0.08)]"
      )}
    >
      <h1 className="text-3xl font-bold mb-1 text-foreground">
        Page Title
      </h1>
      <p className="text-sm text-muted-foreground">
        Subtitle or context
      </p>
    </div>
  </div>

  {/* Content - scrolls under the island */}
  <div className="container max-w-6xl mx-auto px-4 md:px-8 pb-8">
    {/* Cards, lists, grids */}
  </div>
</main>
```

### Island Content Layout

The content inside the island follows a strict layout hierarchy. Navigation and actions sit on the **top row**, with the page title and subtitle below.

#### Structure

```
┌─────────────────────────────────────────────────────────┐
│  [← Back]                              [Action Button]  │  ← Top row
│                                                         │
│  Page Title                                             │  ← Title
│  Subtitle or context                                    │  ← Subtitle
│  [Filter] [Toggle]                                      │  ← Controls (optional)
└─────────────────────────────────────────────────────────┘
```

**Top Row Rules**:
1. Back button on the **left**, action button(s) on the **right**, using `flex items-center justify-between`
2. Back button uses the **default** `BackButton` variant: icon-only on mobile, icon + label on desktop
3. Action buttons use `size="icon" className="md:w-auto md:px-4"`: icon-only on mobile, icon + label on desktop
4. If there are no action buttons, the top row still contains only the back button (maintains consistent layout)
5. If there are multiple action buttons, group them in a `flex gap-2` container on the right

**Title Row Rules**:
1. Title and subtitle sit **below** the top row, never on the same row as the back/action buttons
2. The top row has `mb-4` spacing before the title

**Controls Row (Optional)**:
1. Filters, toggles, or secondary actions sit below the title with `mb-3` on the subtitle

#### Implementation

```tsx
{/* Top row: Back + Actions */}
<div className="flex items-center justify-between mb-4">
  <BackButton
    href="/parent-route"
    label="Parent Page"
  />
  {/* Single action button */}
  <Button
    size="icon"
    className="md:w-auto md:px-4"
    onClick={handleAction}
  >
    <Plus className="h-4 w-4 md:mr-2" />
    <span className="hidden md:inline">Add Item</span>
  </Button>
</div>

{/* Title */}
<h1 className="text-2xl md:text-3xl font-bold text-foreground">
  Page Title
</h1>
<p className="text-sm text-muted-foreground">
  Subtitle or context
</p>
```

```tsx
{/* Multiple action buttons */}
<div className="flex items-center justify-between mb-4">
  <BackButton href="/parent-route" label="Parent Page" />
  <div className="flex gap-2">
    <Button variant="outline" size="icon" className="md:w-auto md:px-4" onClick={handleSecondary}>
      <History className="h-4 w-4 md:mr-2" />
      <span className="hidden md:inline">History</span>
    </Button>
    <Button size="icon" className="md:w-auto md:px-4" onClick={handlePrimary}>
      <Plus className="h-4 w-4 md:mr-2" />
      <span className="hidden md:inline">Add Item</span>
    </Button>
  </div>
</div>
```

#### Why This Pattern

- **Mobile**: Back and action buttons are compact icons, maximizing space for the title
- **Desktop**: Buttons expand to show labels for clarity
- **Consistency**: Every sub-page island looks and behaves the same way regardless of how many actions it has
- **Touch-friendly**: Buttons on the top row are easy to reach; title area below is purely informational

### Common Mistakes

❌ **Don't** nest the scroll container inside another `overflow-hidden` wrapper — blur won't work
❌ **Don't** use `position: fixed` — breaks scroll relationship
❌ **Don't** add side shadows — looks unnatural for content scrolling from below
❌ **Don't** use very dark or opaque backgrounds — defeats the translucent effect

✅ **Do** use `sticky top-0` on the outer wrapper
✅ **Do** keep scroll handler on the `main` element
✅ **Do** maintain subtle, light grey tint for the frosted effect
✅ **Do** test on mobile to ensure blur performance is acceptable

---

## Navigation

### Header (Shared Across Tools)

Frosted glass pill that floats above content. No bottom border - the pill shape and transparency provide separation.

```tsx
<header className="sticky top-0 z-50 w-full px-4 md:px-8 pt-2">
  <div className={cn(
    "max-w-6xl mx-auto h-14 flex justify-between items-center rounded-full backdrop-blur-md border border-neutral-300/80 px-2",
    "transition-all duration-300 ease-out",
    isScrolled ? "bg-white/70" : "bg-white/95"
  )}>
    {/* Left: Logo text */}
    <div className="h-11 px-5 flex items-center">
      <h1 className="text-xl font-medium text-foreground">sirenbase</h1>
    </div>
    {/* Right: Navigation icon buttons */}
    <nav className="flex items-center gap-2 pr-3 md:pr-4">
      <Button variant="outline" size="icon" className="rounded-full" />
      <Button size="icon" className="rounded-full" />
    </nav>
  </div>
</header>
```

**Styling**:
- **Height**: 56px (`h-14`)
- **Shape**: `rounded-full` pill
- **Sticky**: `sticky top-0 z-50` with `pt-2` gap from viewport edge
- **Background**: Dynamic opacity based on scroll (`bg-white/95` at rest, `bg-white/70` when scrolled)
- **Blur**: `backdrop-blur-md` for frosted glass effect
- **Border**: `border border-neutral-300/80` (not `border-b`)
- **Nav buttons**: `rounded-full` icon buttons (outline for secondary, filled for primary)

### Footer (Optional)

- **Minimal**: Copyright, version number
- **Sticky bottom** (optional): Only if page content is short

### Fixed Bottom Action Bar

For pages with a primary action button fixed at the bottom (counting phases, forms, wizards). Uses asymmetric padding to account for device safe areas and thumb ergonomics.

#### Visual Reference

```
┌─────────────────────────────────────────────────────────────┐
│  [Scrollable content above]                                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤ ← border-t
│                         pt-3 (12px)                         │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              [ Primary Action Button ]              │   │ ← h-11 (44px)
│   └─────────────────────────────────────────────────────┘   │
│                         pb-6 (24px)                         │
│                         + pb-safe                           │ ← Device safe area
└─────────────────────────────────────────────────────────────┘
```

#### Specifications

| Property | Value | Purpose |
|----------|-------|---------|
| **Position** | `fixed bottom-0 left-0 right-0` | Stays at bottom of viewport |
| **Background** | `bg-card` | Matches card white (not translucent) |
| **Border** | `border-t border-neutral-300/80` | Subtle top separator |
| **Safe area** | `pb-safe` | Respects device home indicator |
| **Top padding** | `pt-3` (12px) | Compact spacing above button |
| **Bottom padding** | `pb-6` (24px) | Extra space for thumb reach + visual weight |
| **Button height** | `h-11` (44px) | WCAG touch target minimum |
| **Button feedback** | `active:scale-[0.98]` | Tactile press response |

#### Implementation

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

#### Why Asymmetric Padding

- **`pt-3` (12px)**: Tight top padding keeps the bar compact
- **`pb-6` (24px)**: Larger bottom padding provides:
  1. Visual anchoring (heavier bottom feels stable)
  2. Thumb-friendly spacing on mobile
  3. Breathing room before device safe area kicks in
- **`pb-safe`**: Adds `env(safe-area-inset-bottom)` for notched devices (iPhone home indicator)

#### Common Mistakes

❌ **Don't** use symmetric `py-3` — feels cramped at bottom
❌ **Don't** use translucent `bg-background/95` — action bars should be solid
❌ **Don't** forget `pb-safe` — button gets obscured on notched devices
❌ **Don't** use `border-b` — there's nothing below the bar

✅ **Do** use `bg-card` for solid white background
✅ **Do** use `pt-3 pb-6` asymmetric padding
✅ **Do** add `pb-safe` on outer container
✅ **Do** ensure button is full-width (`w-full`) with `h-11`

---

## Grid Layouts

### Dashboard Tool Cards

Dense 2-column grid on mobile, 3 columns on desktop. Navigation targets don't need full-width single-column layout.

```tsx
<div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
  <ToolCard />
  <ToolCard />
  <ToolCard />
</div>
```

### Item Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <ItemCard />
  <ItemCard />
</div>
```

### Flexbox Patterns

**Horizontal Layout with Space Between**:
```tsx
<div className="flex items-center justify-between">
  <h2>Items</h2>
  <Button>Add</Button>
</div>
```

**Vertical Stack with Gaps**:
```tsx
<div className="flex flex-col gap-4">
  <Card />
  <Card />
</div>
```

---

## Mobile-Specific Requirements

### Safe Area Insets

For notched devices:
```tsx
<div className="pb-4 pb-safe">
  <Button>Action</Button>
</div>
```

The `pb-safe` utility adds `padding-bottom: env(safe-area-inset-bottom)` to respect iOS safe areas.

### Touch Optimization

Already configured in `globals.css` with `-webkit-overflow-scrolling: touch`.

---

## Quick Reference

| Pattern | Implementation |
|---------|----------------|
| Full-page layout | `h-dvh` on root container |
| Fixed header/footer | Outside the scrollable area |
| Scrollable content | `flex-1 overflow-y-auto` with `onScroll` handler |
| Scroll shadow (active) | `shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]` |
| Scroll shadow (inactive) | `shadow-[0_0px_0px_0px_rgba(0,0,0,0)]` |
| Scroll shadow transition | `transition-all duration-300 ease-out` |
| Scroll threshold | `scrollTop > 16` (16px before activation) |
| Modal body | `max-h-[80vh] overflow-y-auto` |
| Safe area padding | `pb-safe` utility class |

---

## What NOT to Do

❌ **Avoid**:
- Using `h-screen` for full-viewport layouts (use `h-dvh`)
- Full-page scrolling where controls scroll out of view
- Adding `border-b` between fixed controls and scrollable content
- Multiple nested scrollable containers
- Making the entire `<main>` scrollable instead of just the data section

✅ **Do**:
- Use `h-dvh` for all full-viewport layouts
- Keep action buttons and filters fixed (always visible)
- Use `pb-safe` on bottom-fixed elements
- Test on real mobile devices (not just browser dev tools)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 20, 2026 | Initial extraction from DESIGN.md |
| 2.1.0 | Feb 4, 2026 | Added Fixed Bottom Action Bar pattern with asymmetric padding and safe area handling |
| 2.0.0 | Feb 2, 2026 | Updated dashboard grid to `grid-cols-2 lg:grid-cols-3`; updated header to frosted glass pill pattern; aligned with "Earned Space" design language |
| 1.2.0 | Jan 30, 2026 | Added Island Content Layout rules (top row nav + actions, title below) |
| 1.1.0 | Jan 30, 2026 | Island border updated from `border-gray-200/50` to `border-gray-200` (full opacity) |
| — | Jan 16, 2026 | Title Area Island Pattern added (pre-extraction) |
| — | Dec 14, 2025 | Dynamic Scroll Shadow Pattern added (pre-extraction) |

**Last Updated**: February 4, 2026
