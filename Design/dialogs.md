# Dialog & Modal Patterns

This document defines the design language for dialogs, modals, and their internal content patterns used across SirenBase.

---

## Design Philosophy

**Apple-Inspired Minimalism**: Generous rounded corners, subtle backdrop blur, and clean shadow-based separation. The design prioritizes clarity and focus while maintaining a modern, polished aesthetic.

**Use Cases**:
- Confirmations (remove item, logout)
- Multi-step forms (add item flow)
- Alerts and warnings
- Information displays

---

## Dialog Container

### Anatomy

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="secondary">Cancel</Button>
      <Button variant="destructive">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Container Styling

| Property | Value | Rationale |
|----------|-------|-----------|
| **Max Width** | `sm:max-w-md` (448px) | Standard for tool dialogs |
| **Border Radius** | `rounded-2xl` (16px) | Modern Apple-style corners |
| **Border** | None | Clean separation via shadow only |
| **Shadow** | `shadow-xl shadow-black/10 dark:shadow-black/30` | Soft, diffused shadow |
| **Backdrop** | `bg-black/50 backdrop-blur-sm` | Dim + blur for focus |
| **Padding** | `p-6` (24px) | Generous internal spacing |
| **Animation** | Fade + zoom (200ms) | Smooth entrance/exit |

### Close Button

- `rounded-full` for circular shape
- `p-1` padding with `hover:bg-muted` for subtle hover state
- Positioned `top-4 right-4` with opacity transitions

### Visual Reference

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│     ┌─────────────────────────────────────────────┐     │
│     │                                             │     │
│     │         Dialog Title                  [×]   │     │  • rounded-2xl corners
│     │                                             │     │  • No visible border
│     │     Clean, spacious content with            │     │  • shadow-xl (soft)
│     │     generous padding on all sides           │     │  • backdrop-blur-sm
│     │                                             │     │
│     │         ┌──────────┐  ┌──────────┐          │     │
│     │         │  Cancel  │  │  Action  │          │     │
│     │         └──────────┘  └──────────┘          │     │
│     └─────────────────────────────────────────────┘     │
│                                                         │
│              (blurred + dimmed backdrop)                │
└─────────────────────────────────────────────────────────┘
```

### Implementation Notes

**Do NOT override** (handled by base component):
- Border radius
- Shadow styles
- Border styles
- Backdrop blur

**Safe to override**:
- Max width: `className="sm:max-w-md"` or `sm:max-w-lg`
- Additional padding if needed

### Mobile Considerations

- **Full-width on small screens**: `max-w-[calc(100%-2rem)]` ensures 16px margin
- **Bottom sheet** (future): Slide-up sheet for mobile-native feel
- **Keyboard dismissal**: ESC key closes dialog
- **Focus trap**: Tab cycles within dialog only
- **Safe areas**: Respects device safe areas via viewport units

---

## Dialog Content Patterns

These patterns define the internal structure of dialog content, extracted from polished implementations in the Inventory Tracking tool.

### Content Box (Info/Display)

Used to display information, item details, or generated values within a dialog.

**Styling**:
```
bg-muted/50 border border-border rounded-2xl px-5 py-4
```

| Property | Value | Purpose |
|----------|-------|---------|
| Background | `bg-muted/50` | Semi-transparent muted (50% opacity) |
| Border | `border border-border` | Subtle border using design token |
| Radius | `rounded-2xl` | 16px, matches dialog corners |
| Padding | `px-5 py-4` | 20px horizontal, 16px vertical |

**Example - Item Details Box**:
```tsx
<div className="bg-muted/50 border border-border rounded-2xl px-5 py-4">
  <p className="inline-block text-[10px] font-mono font-bold tracking-wide uppercase text-foreground bg-secondary px-2.5 py-1 rounded-full mb-2">
    {itemCode}
  </p>
  <p className="text-lg font-semibold text-foreground">{itemName}</p>
</div>
```

**Example - Code Display Box**:
```tsx
<div className="bg-muted/50 border border-border rounded-2xl px-5 py-4 text-center">
  <p className="text-sm text-muted-foreground mb-2">Your 4-digit code:</p>
  <div className="text-5xl font-bold font-mono text-foreground tracking-wider">
    {generatedCode}
  </div>
</div>
```

### Warning/Caution Box

Used to highlight important information or warnings that require user attention.

**Styling**:
```
bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4
```

| Property | Value | Purpose |
|----------|-------|---------|
| Background (light) | `bg-amber-50` | Light amber tint |
| Background (dark) | `dark:bg-amber-900/20` | Dark amber at 20% opacity |
| Border (light) | `border-amber-200` | Amber border for emphasis |
| Border (dark) | `dark:border-amber-800` | Dark mode amber border |
| Radius | `rounded-2xl` | 16px, matches content boxes |
| Padding | `p-4` | 16px uniform padding |

**Warning Text Layout**:
```tsx
<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
  <p className="text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
    <AlertTriangle className="size-4 mt-0.5 flex-shrink-0" />
    <span>
      <strong>Important:</strong> Write this code on the item before confirming.
      Once confirmed, the item will be added to your inventory.
    </span>
  </p>
</div>
```

**Warning Icon Styling**:
- Icon: `AlertTriangle` from lucide-react
- Size: `size-4` (16px)
- Alignment: `mt-0.5` for text baseline alignment
- Shrink: `flex-shrink-0` to prevent icon compression

### Content Spacing

**Main content wrapper**: Use `space-y-3` for consistent vertical spacing between content boxes.

```tsx
<div className="space-y-3">
  {/* Content box */}
  <div className="bg-muted/50 border border-border rounded-2xl px-5 py-4">
    ...
  </div>

  {/* Warning box */}
  <div className="bg-amber-50 dark:bg-amber-900/20 ...">
    ...
  </div>
</div>
```

---

## Dialog Footer Patterns

### Stacked Buttons (Recommended for Tool Dialogs)

Full-width buttons stacked vertically, primary action first.

**Styling**:
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

| Property | Value | Purpose |
|----------|-------|---------|
| Layout | `flex-col` | Vertical stack |
| Gap | `gap-2` | 8px between buttons |
| Button width | `w-full` | Full-width buttons |
| Order | Primary first | Most important action at top |

### Inline Buttons (Alternative for Simple Dialogs)

Side-by-side buttons for simple confirmation dialogs.

```tsx
<DialogFooter>
  <Button variant="outline" onClick={handleCancel}>
    Cancel
  </Button>
  <Button onClick={handleConfirm}>
    Generate Code
  </Button>
</DialogFooter>
```

---

## Typography Within Dialogs

### Code/Badge Display

**Small badge (item codes)**:
```
text-[10px] font-mono font-bold tracking-wide uppercase text-foreground bg-secondary px-2.5 py-1 rounded-full mb-2
```

**Large code display**:
```
text-5xl font-bold font-mono text-foreground tracking-wider
```

### Labels & Descriptions

| Element | Class |
|---------|-------|
| Label/caption | `text-sm text-muted-foreground mb-2` |
| Item name | `text-lg font-semibold text-foreground` |
| Warning text | `text-sm text-amber-900 dark:text-amber-200` |

---

## Complete Example

Here's a complete dialog implementation following all patterns:

```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Remove Item?</DialogTitle>
      <DialogDescription>
        Are you sure you want to remove this item from inventory?
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-3">
      {/* Item details box */}
      <div className="bg-muted/50 border border-border rounded-2xl px-5 py-4">
        <p className="inline-block text-[10px] font-mono font-bold tracking-wide uppercase text-foreground bg-secondary px-2.5 py-1 rounded-full mb-2">
          {itemCode}
        </p>
        <p className="text-lg font-semibold text-foreground">{itemName}</p>
      </div>

      {/* Warning box */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
        <p className="text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="size-4 mt-0.5 flex-shrink-0" />
          <span>
            This action will mark the item as removed and create a history entry.
            You can view removed items in the history log.
          </span>
        </p>
      </div>
    </div>

    <DialogFooter className="flex-col gap-2 sm:flex-col">
      <Button onClick={handleConfirm} disabled={isLoading} className="w-full">
        {isLoading ? 'Removing...' : 'Remove Item'}
      </Button>
      <Button variant="outline" onClick={handleCancel} disabled={isLoading} className="w-full">
        Cancel
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Quick Reference

| Element | Styling |
|---------|---------|
| **Dialog width** | `sm:max-w-md` |
| **Content box** | `bg-muted/50 border border-border rounded-2xl px-5 py-4` |
| **Warning box** | `bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4` |
| **Warning icon** | `AlertTriangle` with `size-4 mt-0.5 flex-shrink-0` |
| **Warning text** | `text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2.5` |
| **Footer layout** | `flex-col gap-2 sm:flex-col` with `w-full` buttons |
| **Content spacing** | `space-y-3` |
| **Code badge** | `text-[10px] font-mono font-bold tracking-wide uppercase bg-secondary px-2.5 py-1 rounded-full` |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 20, 2026 | Initial extraction from DESIGN.md; added Dialog Content Patterns (content boxes, warning boxes) |

**Last Updated**: January 20, 2026
