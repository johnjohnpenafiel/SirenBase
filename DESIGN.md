# SirenBase - Design System & UI Guidelines

## Overview

This document defines the visual design language, UI patterns, and interaction guidelines for **SirenBase**. It ensures consistency across all three tools (Inventory Tracking, Milk Count, RTD&E) while maintaining a cohesive, mobile-first user experience.

**Purpose**: Serve as the single source of truth for all design decisions, enabling AI agents and developers to create uniform, accessible, and brand-consistent interfaces.

---

## 🎨 Design Philosophy

### Core Principles

1. **Mobile-First Always** - Design for 320px width first, scale up gracefully
2. **Speed & Simplicity** - Fast interactions, minimal cognitive load
3. **Clarity Over Aesthetics** - Functional beauty, not decorative complexity
4. **Accessibility by Default** - WCAG 2.1 AA compliance minimum
5. **Consistent But Not Boring** - Shared patterns with tool-specific personality
6. **App-Like Behavior** - Contained scrolling, fixed layouts, native-app feel

### User Experience Goals

- **Instant Feedback**: Every action has immediate visual response (< 100ms)
- **Error Prevention**: Guide users toward success, make mistakes hard
- **Progressive Disclosure**: Show what's needed now, hide complexity
- **Forgiving Interactions**: Easy undo, clear confirmations, safe defaults

### Design DNA: Foundational Truths

These are the non-negotiable principles that define SirenBase's interface philosophy. They represent the "why" behind every design decision and should guide all future UI work.

#### 1. The Interface Serves the User, Never the Reverse

The user should never fight the interface. If a button scrolls out of view, if content gets hidden behind a browser toolbar, if an action becomes unreachable — the design has failed. The interface must anticipate and prevent these frustrations before they occur.

**This means**: Critical actions are always visible and accessible. The layout accommodates the user's context (device, orientation, browser chrome) rather than demanding the user accommodate the layout.

#### 2. Design for Reality, Not Theory

Theoretical measurements lie. `100vh` claims to be "full viewport height" but ignores mobile browser toolbars. A design that looks perfect in a simulator may fail on a real device. The only truth is what users actually experience.

**This means**: Use dynamic viewport units (`dvh`) that respond to actual available space. Test on real devices, not just browser dev tools. Account for safe areas, notches, and browser UI that consume real screen space.

#### 3. Content Must Earn Its Space

Every pixel of vertical space is precious on mobile. Content that works with "Avocado" must also work with "Grilled Cheese Sandwich." If one edge case breaks the layout, the layout isn't done.

**This means**: Design for the longest reasonable content first, then ensure shorter content looks good. Use responsive spacing that compresses gracefully under pressure. Test with real-world data variations, not just ideal examples.

#### 4. Platform Constraints Are Design Partners

Safe areas, browser toolbars, and device variations aren't obstacles to fight — they're constraints to embrace. The best mobile experiences work *with* the platform, creating interfaces that feel native rather than forced.

**This means**: Respect `safe-area-inset-*` boundaries. Account for browser chrome in viewport calculations. Design touch targets that feel natural on each platform. The goal is harmony with the device, not domination over it.

#### 5. Density Adapts, Functionality Doesn't

When space is limited, reduce spacing and visual weight — never remove functionality. A compact layout with tighter gaps maintains usability; a layout that hides critical buttons breaks it.

**This means**: Mobile layouts may be denser than desktop, but they're never incomplete. Compress padding, reduce icon sizes, tighten gaps — but keep every action accessible. The user can do everything on mobile that they can on desktop.

#### 6. Scroll Intentionally, Never Accidentally

Scrolling should be a deliberate user action within clearly defined regions (lists, content areas), never an unexpected consequence of the layout. If the entire interface shifts when the user doesn't expect it, the experience feels broken.

**This means**: Use `overflow-hidden` on layout containers to prevent unintended scrolling. Define explicit scroll regions for content that may exceed viewport. Fixed elements (headers, action buttons) must remain anchored regardless of content scroll.

---

### Adaptive and Purposeful Interface Behavior

**Core Principle**: SirenBase's interface design follows three foundational priorities: **clarity**, **adaptability**, and **intent**.

Every visible element must exist for a clear purpose — either to inform, guide, or enable action. The interface should intelligently adapt to different screen sizes and contexts, preserving usability without visual clutter.

**Guiding Concept**: Display information when it adds clarity; hide, collapse, or repurpose it when focus and simplicity are more valuable.

This principle ensures that SirenBase remains intuitive and functional across devices, with a layout that responds to context rather than simply resizing.

#### Viewport Adaptation Framework

**1. Desktop Views** (>= 768px)

**Prioritize clarity and visibility**:
- Support additional informational or secondary elements that enhance orientation or context
- Ample space can be used to display both primary and secondary details, as long as readability remains high
- Show full text labels on buttons, navigation items, and actions
- Display metadata, timestamps, user info, and contextual help inline
- Use multi-column layouts to show more information at once

**Example Patterns**:
```tsx
// Desktop: Show full navigation with text labels
<nav className="hidden md:flex items-center gap-4">
  <Button variant="ghost">
    <Home className="h-4 w-4 mr-2" />
    Dashboard
  </Button>
  <Button variant="ghost">
    <Settings className="h-4 w-4 mr-2" />
    Settings
  </Button>
  <Button variant="ghost">
    <LogOut className="h-4 w-4 mr-2" />
    Logout
  </Button>
</nav>
```

**2. Mobile Views** (< 768px)

**Prioritize simplicity and focus**:
- Retain only essential, action-driven elements in view
- Move secondary or low-priority elements into menus, dropdowns, or icons to maintain a clean interface
- Preserve core functionality while reducing visual noise
- Users should still be able to perform all actions available on desktop, even if they're accessed differently
- Use full-width layouts, stack elements vertically
- Hide labels, show icons only where appropriate
- Collapse navigation into hamburger menus or bottom nav

**Example Patterns**:
```tsx
// Mobile: Icon-only navigation, collapsed menu
<nav className="md:hidden flex items-center gap-2">
  <Button variant="ghost" size="sm" aria-label="Dashboard">
    <Home className="h-5 w-5" />
  </Button>
  <Button variant="ghost" size="sm" aria-label="Settings">
    <Settings className="h-5 w-5" />
  </Button>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" aria-label="More options">
        <MoreVertical className="h-5 w-5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>Logout</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</nav>
```

**3. Functional Consistency**

**The functionality of an element should remain consistent across views; only its presentation should adapt.**

- ✅ **Do**: Show "Add Item" button with icon + text on desktop, icon-only on mobile (same functionality)
- ✅ **Do**: Display user settings in header on desktop, move to dropdown menu on mobile (same access)
- ✅ **Do**: Show category badges inline on desktop, collapse to dropdown on mobile (same filtering)
- ❌ **Don't**: Remove features entirely on mobile (unless truly desktop-only, like keyboard shortcuts)
- ❌ **Don't**: Change button actions based on screen size (confusing)
- ❌ **Don't**: Hide critical actions without alternative access (inaccessible)

**Interaction Principles**:
- Interaction logic (like how users access settings, logout, or add new items) must feel natural and predictable regardless of device
- Elements that serve low-frequency actions or background utilities can be nested or hidden by default, freeing visible space for primary tasks
- Always provide alternative access patterns for hidden elements (menus, dropdowns, modals)

#### Practical Application Guidelines

**Information Hierarchy for Adaptation**:

| Priority Level | Desktop Display | Mobile Display | Example Elements |
|----------------|-----------------|----------------|------------------|
| **Primary** (P1) | Always visible | Always visible | Add Item button, current inventory count, primary navigation |
| **Secondary** (P2) | Visible inline | Collapsed/icon-only | User name, settings, secondary actions |
| **Tertiary** (P3) | Visible with context | Hidden in menu/modal | Help text, tooltips, advanced filters, metadata |
| **Utility** (P4) | Visible but subtle | Hidden by default | Timestamps, version info, debug info |

**Adaptive Component Patterns**:

```tsx
// Pattern 1: Responsive Button Labels
<Button className="gap-2">
  <Plus className="h-4 w-4" />
  <span className="hidden sm:inline">Add Item</span>
  {/* Mobile: Icon only, Desktop: Icon + text */}
</Button>

// Pattern 2: Adaptive Navigation
<header className="flex items-center justify-between">
  <h1>Tool Name</h1>

  {/* Desktop: Full navigation */}
  <nav className="hidden md:flex gap-4">
    <NavLink href="/dashboard">Dashboard</NavLink>
    <NavLink href="/settings">Settings</NavLink>
    <Button variant="ghost">Logout</Button>
  </nav>

  {/* Mobile: Dropdown menu */}
  <DropdownMenu className="md:hidden">
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon">
        <Menu className="h-5 w-5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem>Dashboard</DropdownMenuItem>
      <DropdownMenuItem>Settings</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Logout</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</header>

// Pattern 3: Contextual Information Display
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Item Name</CardTitle>
      {/* Desktop: Show metadata inline */}
      <span className="hidden md:inline text-sm text-muted-foreground">
        Added 2 days ago by John
      </span>
    </div>
  </CardHeader>
  <CardContent>
    {/* Mobile: Metadata in separate row if needed */}
    <p className="md:hidden text-xs text-muted-foreground mb-2">
      Added 2 days ago
    </p>
    {/* Main content */}
  </CardContent>
</Card>

// Pattern 4: Progressive Enhancement
<form className="space-y-4">
  {/* Mobile: Stack vertically */}
  {/* Desktop: Side-by-side layout */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Label htmlFor="name">Item Name</Label>
      <Input id="name" />
    </div>
    <div>
      <Label htmlFor="category">Category</Label>
      <Select id="category">...</Select>
    </div>
  </div>

  {/* Button adapts width */}
  <Button className="w-full md:w-auto">
    Submit
  </Button>
</form>
```

**Testing Checklist for Adaptive Behavior**:

- [ ] All primary actions (P1) are accessible on mobile
- [ ] Secondary actions (P2) are available via menu/dropdown on mobile
- [ ] No functionality is lost on mobile, only presentation changes
- [ ] Button labels are hidden gracefully on mobile (icons have aria-labels)
- [ ] Navigation is accessible on both mobile and desktop
- [ ] Information hierarchy is preserved across breakpoints
- [ ] Touch targets meet 44x44px minimum on mobile
- [ ] Text remains readable at all viewport sizes
- [ ] No horizontal scrolling on mobile (except intentional carousels)
- [ ] Test at 320px, 768px, 1024px, and 1920px widths

---

## 🌈 Design Tokens

### Color System

**Foundation**: We use a **Supabase-inspired mint/teal palette** with OKLCH values for better perceptual uniformity. The palette features clean neutral backgrounds with a vibrant mint/teal primary color.

**Design Decision**: All tools share the same color palette for consistency. No tool-specific accent colors.

#### Light Mode (Default)

```css
/* Base Colors - Clean neutral backgrounds */
--background: oklch(0.9911 0 0);             /* Near-white */
--foreground: oklch(0.2046 0 0);             /* Dark gray */

/* Surfaces */
--card: oklch(0.9911 0 0);                   /* Near-white */
--card-foreground: oklch(0.2046 0 0);
--popover: oklch(0.9911 0 0);
--popover-foreground: oklch(0.4386 0 0);     /* Medium gray */

/* Interactive Elements - Mint/teal primary */
--primary: oklch(0.8348 0.1302 160.9080);    /* Vibrant mint */
--primary-foreground: oklch(0.2626 0.0147 166.4589);  /* Dark teal */
--secondary: oklch(0.9940 0 0);              /* Off-white */
--secondary-foreground: oklch(0.2046 0 0);

/* States */
--muted: oklch(0.9461 0 0);                  /* Light gray */
--muted-foreground: oklch(0.2435 0 0);       /* Dark gray */
--accent: oklch(0.9461 0 0);                 /* Light gray */
--accent-foreground: oklch(0.2435 0 0);
--destructive: oklch(0.5523 0.1927 32.7272); /* Red */
--destructive-foreground: oklch(0.9934 0.0032 17.2118);

/* Borders & Inputs */
--border: oklch(0.9037 0 0);                 /* Subtle gray border */
--input: oklch(0.9731 0 0);                  /* Light input background */
--ring: oklch(0.8348 0.1302 160.9080);       /* Mint focus ring */
```

#### Dark Mode

```css
/* Base Colors - Dark neutral backgrounds */
--background: oklch(0.1822 0 0);             /* Near-black */
--foreground: oklch(0.9288 0.0126 255.5078); /* Off-white with slight blue */
--card: oklch(0.2046 0 0);                   /* Dark gray */
--card-foreground: oklch(0.9288 0.0126 255.5078);
--popover: oklch(0.2603 0 0);
--popover-foreground: oklch(0.7348 0 0);

/* Interactive Elements */
--primary: oklch(0.4365 0.1044 156.7556);    /* Deep teal */
--primary-foreground: oklch(0.9213 0.0135 167.1556);  /* Light mint */
--secondary: oklch(0.2603 0 0);
--secondary-foreground: oklch(0.9851 0 0);

/* States */
--muted: oklch(0.2393 0 0);
--muted-foreground: oklch(0.7122 0 0);
--accent: oklch(0.3132 0 0);
--accent-foreground: oklch(0.9851 0 0);
--destructive: oklch(0.3123 0.0852 29.7877);
--destructive-foreground: oklch(0.9368 0.0045 34.3092);

/* Borders & Inputs */
--border: oklch(0.2809 0 0);
--input: oklch(0.2603 0 0);
--ring: oklch(0.8003 0.1821 151.7110);
```

#### Chart Colors (for data visualization)

```css
/* Light Mode - Diverse color palette */
--chart-1: oklch(0.8348 0.1302 160.9080);  /* Mint (primary) */
--chart-2: oklch(0.6231 0.1880 259.8145);  /* Blue */
--chart-3: oklch(0.6056 0.2189 292.7172);  /* Purple */
--chart-4: oklch(0.7686 0.1647 70.0804);   /* Orange */
--chart-5: oklch(0.6959 0.1491 162.4796);  /* Teal */

/* Dark Mode */
--chart-1: oklch(0.8003 0.1821 151.7110);
--chart-2: oklch(0.7137 0.1434 254.6240);
--chart-3: oklch(0.7090 0.1592 293.5412);
--chart-4: oklch(0.8369 0.1644 84.4286);
--chart-5: oklch(0.7845 0.1325 181.9120);
```

### Typography

**Font Stack**: We use **Montserrat** as the primary UI font, loaded via Next.js font optimization. System defaults are used for serif and monospace to minimize bundle size.

```css
--font-sans: Montserrat, sans-serif        /* Primary UI font (loaded via next/font) */
--font-serif: ui-serif, Georgia, serif     /* System serif (rarely used) */
--font-mono: monospace                     /* System monospace (item codes) */
```

**Implementation Note**: Montserrat is imported in `app/layout.tsx` using `next/font/google` for optimal loading performance. Serif and monospace fonts use system defaults since they're rarely needed in this UI-focused application.

#### Font Sizes (Mobile-First)

| Token          | Mobile (Base) | Desktop (md+) | Usage                          |
|----------------|---------------|---------------|--------------------------------|
| `text-xs`      | 0.75rem (12px)| 0.75rem       | Labels, captions, metadata     |
| `text-sm`      | 0.875rem (14px)| 0.875rem     | Body text, form inputs         |
| `text-base`    | 1rem (16px)   | 1rem          | Default body, paragraphs       |
| `text-lg`      | 1.125rem (18px)| 1.125rem     | Subheadings, emphasized text   |
| `text-xl`      | 1.25rem (20px)| 1.25rem       | Section headings               |
| `text-2xl`     | 1.5rem (24px) | 1.875rem (30px)| Page titles                   |
| `text-3xl`     | 1.875rem (30px)| 2.25rem (36px)| Hero headings (dashboard)     |

#### Font Weights

- **Normal (400)**: Body text, form inputs
- **Medium (500)**: Button text, emphasized labels
- **Semibold (600)**: Subheadings, section headers
- **Bold (700)**: Page titles, important CTAs

#### Line Heights

- **Tight (1.25)**: Headings, titles
- **Normal (1.5)**: Body text, paragraphs
- **Relaxed (1.75)**: Long-form content (rare in this app)

### Spacing Scale

**Base Unit**: 4px (0.25rem)

| Token  | Value    | Usage                                    |
|--------|----------|------------------------------------------|
| `0`    | 0        | Reset spacing                            |
| `1`    | 4px      | Minimal gaps (icon to text)              |
| `2`    | 8px      | Tight spacing (button padding)           |
| `3`    | 12px     | Comfortable gaps (form fields)           |
| `4`    | 16px     | **Default spacing** (cards, sections)    |
| `6`    | 24px     | Section separation                       |
| `8`    | 32px     | Major layout gaps                        |
| `12`   | 48px     | Page-level spacing (headers, footers)    |
| `16`   | 64px     | Extra-large gaps (rare)                  |

**Default Pattern**: Use `4` (16px) as baseline, adjust up/down as needed.

### Border Radius

**Base Radius**: 8px (0.5rem) - Defined in `--radius` by Nature theme

| Token        | Value              | Usage                              |
|--------------|--------------------|------------------------------------|
| `rounded-sm` | `calc(var(--radius) - 4px)` = 4px | Small buttons, pills       |
| `rounded-md` | `calc(var(--radius) - 2px)` = 6px | Inputs, small cards        |
| `rounded-lg` | `var(--radius)` = 8px     | Default buttons, cards             |
| `rounded-xl` | `calc(var(--radius) + 4px)` = 12px | Large cards, modals       |
| `rounded-full` | 9999px           | Circular elements (avatars, icons) |

**Consistency Rule**: Use `rounded-lg` (8px) for most elements unless there's a specific reason to deviate.

### Shadows (Elevation)

Shadows create depth and hierarchy. Use sparingly for mobile performance.

| Level   | Tailwind Class | Usage                                  |
|---------|----------------|----------------------------------------|
| None    | `shadow-none`  | Flat elements, minimal UI              |
| Small   | `shadow-sm`    | Subtle lift (cards, inputs on hover)   |
| Medium  | `shadow-md`    | **Default cards**, dropdowns, popovers |
| Large   | `shadow-lg`    | Modals, dialogs, important overlays    |
| XL      | `shadow-xl`    | Maximum emphasis (rare)                |

**Default**: Use `shadow-md` for cards, `shadow-lg` for modals.

### Breakpoints

Mobile-first responsive design:

| Breakpoint | Min Width | Target Devices              | Usage                          |
|------------|-----------|-----------------------------|--------------------------------|
| Base       | 0         | Mobile (320px - 639px)      | Default styles                 |
| `sm`       | 640px     | Large phones, small tablets | Minor adjustments              |
| `md`       | 768px     | Tablets, landscape phones   | Layout shifts (columns, grids) |
| `lg`       | 1024px    | Laptops, desktops           | Desktop optimizations          |
| `xl`       | 1280px    | Large desktops              | Max-width containers           |

**Design Rule**: Always design for 320px width first, then progressively enhance.

---

## 🧩 Component Patterns

### Buttons

**Base Requirements**:
- Minimum touch target: 44x44px (iOS/Android guidelines)
- Clear visual states: default, hover, active, disabled
- Loading state for async actions
- Icon support (leading/trailing)

#### Button Variants

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

#### Button Sizes

| Size      | Height | Padding (x/y) | Font Size | Use Case                    |
|-----------|--------|---------------|-----------|-----------------------------|
| `sm`      | 36px   | 12px / 8px    | `text-sm` | Compact UIs, inline actions |
| `default` | 44px   | 16px / 12px   | `text-base`| **Standard buttons**        |
| `lg`      | 52px   | 20px / 14px   | `text-lg` | Primary CTAs, mobile forms  |

**Default Choice**: Use `size="default"` unless space is constrained.

#### Button States

- **Default**: Solid background, clear text
- **Hover**: Slightly darker background (desktop only)
- **Active**: Pressed appearance (scale down slightly)
- **Disabled**: 50% opacity, `cursor-not-allowed`
- **Loading**: Show spinner, disable interaction, keep text visible

#### Mobile-Specific Rules

- **Full-width on mobile**: Buttons in forms should be `w-full` on mobile, `w-auto md:w-auto` on desktop
- **Bottom-fixed CTAs**: Primary actions (Add Item) can be fixed to bottom on mobile for thumb access
- **Icon-only on mobile** (optional): Hide button text on mobile, show icon only if space-constrained

**Example**:
```tsx
<Button className="w-full md:w-auto">
  <Plus className="h-4 w-4 md:mr-2" />
  <span className="hidden md:inline">Add Item</span>
</Button>
```

### Cards

**Purpose**: Group related content, provide visual boundaries.

#### Card Anatomy

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

#### Card Styling Defaults

- **Background**: `bg-card` (white in light mode, dark gray in dark mode)
- **Border**: `border border-border` (subtle gray)
- **Rounding**: `rounded-xl` (12px) for large cards, `rounded-lg` (8px) for small cards
- **Shadow**: `shadow-none` by default with `hover:shadow-md` for interactive cards
- **Padding**:
  - `CardHeader`: `p-6` (24px)
  - `CardContent`: `px-6 py-4` (24px horizontal, 16px vertical)
  - `CardFooter`: `px-6 py-4`

#### Tool-Specific Card Patterns

**Dashboard Tool Cards**:
- Large, clickable cards with `hover:shadow-md` transition
- Icon at top (48x48px)
- Tool name (text-2xl, semibold)
- Brief description (text-sm, muted)
- Subtle hover effect (scale 1.02, shadow increase)

**Inventory Item Cards**:
- Compact layout with border emphasis
- `border-[1.5px] border-border hover:border-slate-600 hover:shadow-md`
- No shadow at rest, shadow on hover

**Milk Count Section Cards**:
- Rounded corners with border
- Section header (FOH/BOH)
- Grid of milk types with input fields
- Summary row at bottom

### Forms & Inputs

#### Input Fields

**Base Styling**:
```tsx
<Input
  type="text"
  placeholder="Enter item name"
  className="w-full"
/>
```

- **Height**: 44px (mobile-friendly)
- **Padding**: `px-3 py-2` (12px horizontal, 8px vertical)
- **Border**: `border border-input` (light gray)
- **Focus**: `ring-2 ring-ring ring-offset-2` (visible focus indicator)
- **Disabled**: `opacity-50 cursor-not-allowed`
- **Error**: `border-destructive ring-destructive`

#### Labels

```tsx
<Label htmlFor="item-name" className="text-sm font-medium">
  Item Name
</Label>
```

- Always associate labels with inputs using `htmlFor`
- Position above input (mobile-first)
- Optional indicator `(Optional)` in muted color if field is optional
- Required indicator `*` if field is required (or assume all required by default)

#### Form Layout

**Mobile (< 768px)**:
- Single column layout
- Full-width inputs
- Labels stacked above inputs
- 16px gap between fields

**Desktop (>= 768px)**:
- Two-column layouts where appropriate (e.g., item code + category)
- Consistent alignment
- Keyboard tab order flows logically

#### Validation & Error Messages

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

### Dialogs & Modals

**Use Cases**:
- Confirmations (remove item, logout)
- Multi-step forms (add item flow)
- Alerts and warnings

#### Dialog Anatomy

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

#### Dialog Styling

- **Max Width**: `sm:max-w-md` (448px on desktop)
- **Padding**: `p-6` (24px)
- **Shadow**: `shadow-lg` (elevated)
- **Backdrop**: Semi-transparent overlay (`bg-black/50`)
- **Animation**: Fade in + scale up (via Radix UI)

#### Mobile Considerations

- **Full-screen on mobile** (optional): For complex dialogs, use full-screen modal on mobile
- **Bottom sheet** (future): Slide-up sheet for mobile-native feel
- **Keyboard dismissal**: ESC key closes dialog
- **Focus trap**: Tab cycles within dialog only

### Navigation

#### Header (Shared Across Tools)

**Anatomy**:
```tsx
<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
  <div className="container flex h-16 items-center justify-between px-4">
    <div className="flex items-center gap-4">
      <Logo /> {/* SirenBase branding */}
      <h1 className="text-xl font-semibold">Tool Name</h1>
    </div>
    <nav className="flex items-center gap-2">
      <Button variant="ghost" size="sm">Home</Button>
      <Button variant="ghost" size="sm">Logout</Button>
    </nav>
  </div>
</header>
```

**Styling**:
- **Height**: 64px (16 in Tailwind spacing)
- **Sticky**: `sticky top-0` with backdrop blur
- **Border**: Bottom border (`border-b`)
- **Background**: Semi-transparent with blur for modern look

#### Footer (Optional)

- **Minimal**: Copyright, version number
- **Sticky bottom** (optional): Only if page content is short

### Lists & Tables

#### Inventory Item List

**Pattern**: Card-based list on mobile, table on desktop

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

#### Empty States

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

### Loading States

**Spinner Component**:
```tsx
<div className="flex items-center justify-center py-8">
  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
</div>
```

**Skeleton Loaders** (preferred for lists):
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

**Button Loading State**:
```tsx
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? "Loading..." : "Submit"}
</Button>
```

### Toasts & Notifications

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

## 🎭 Tool-Specific UI Characteristics

### Tool 1: Inventory Tracking System

**Personality**: Professional, organized, efficient

**Key UI Elements**:

1. **Dashboard Card**:
   - Icon: Package or Clipboard
   - Title: "Inventory Tracking"
   - Description: "Manage basement inventory with 4-digit codes"

2. **Add Item Flow**:
   - Two-step dialog
   - Step 1: Item name (with autocomplete), category dropdown
   - Step 2: Review + generated code display (monospace, large)
   - Auto-focus first input on dialog open

3. **Item Display Modes**:
   - **Compact**: List view, small cards
   - **Comfortable**: Default spacing
   - **Spacious**: Large cards with more padding

4. **Category Badges**:
   - Small pills (`text-xs`, `px-2 py-1`, `rounded-full`)
   - Muted background (`bg-secondary` or `bg-muted`)
   - Use consistent theme colors (no category-specific colors for simplicity)

5. **Item Code Display**:
   - Monospace font (`font-mono`)
   - Larger text (`text-lg` or `text-xl`)
   - High contrast for readability
   - Copy-to-clipboard button on hover (desktop)

### Tool 2: Milk Count System

**Personality**: Calm, methodical, calculator-like

**Key UI Elements**:

1. **Dashboard Card**:
   - Icon: Milk bottle or Calculator
   - Title: "Milk Count"
   - Description: "Track milk inventory with automated calculations"

2. **Count Screens**:
   - **FOH/BOH Sections**: Separate cards with section headers
   - **Milk Type Grid**: 2 columns on mobile, 3-4 on desktop
   - **Input Style**: Large, number-focused inputs (`type="number"`, `inputMode="numeric"`)
   - **Summary Row**: Sticky bottom on mobile, always visible

3. **Calculator Interface**:
   - Large buttons (56px height on mobile)
   - Number pad layout (optional for mobile)
   - Immediate calculation feedback (live totals)

4. **Session Summary**:
   - Card-based layout
   - Clear sections: Night Count, Morning Count, Delivered, Order Qty
   - Print-friendly design (matches paper logbook format)

### Tool 3: RTD&E Counting System

**Personality**: Fresh, dynamic, fast-paced

**Key UI Elements**:

1. **Dashboard Card**:
   - Icon: Shopping bag or Sandwich
   - Title: "RTD&E Count"
   - Description: "Quick counts and pull list generation"

2. **Counting Interface**:
   - **+/- Buttons**: Large (48px), easy to tap
   - **Current Count Display**: Center, large text (`text-2xl`)
   - **Item Name**: Above count, clear font
   - **Quick Navigation**: Swipe between items (mobile) or arrow keys (desktop)

3. **Pull List View**:
   - Checkbox list for BOH fulfillment
   - Item name + quantity needed
   - Strikethrough on completion
   - Progress indicator (X of Y items pulled)

4. **Siren's Eye Integration** (future):
   - Image previews of display planogram
   - Side-by-side view: image + count inputs

---

## 📱 Mobile-First Patterns

### Touch Targets

**Minimum Size**: 44x44px (iOS/Android guidelines)

**Spacing Between Targets**: Minimum 8px gap to prevent mis-taps

**Common Violations to Avoid**:
- Small icon buttons (< 44px)
- Densely packed links in navigation
- Close buttons too small or in corners

### Gestures

**Supported Gestures**:
- Tap: Primary interaction
- Long-press: Context menu or additional options (use sparingly)
- Swipe: Navigate between items (RTD&E count), dismiss toasts

**Not Supported** (avoid):
- Pinch-to-zoom (should not be necessary)
- Double-tap (confusing, use single tap)
- Hover states on mobile (use `:active` instead)

### Mobile Navigation Patterns

**Bottom Navigation** (optional for future):
- Fixed bottom bar with 3-5 primary actions
- Icons + labels (labels can be hidden for more space)
- Active state with color change

**Tab Bar** (current):
- Top-aligned tabs for view switching (Compact/Comfortable/Spacious)
- Underline active tab
- Scrollable on small screens

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

### Performance Budgets (Mobile)

- **Page Load**: < 2 seconds on 4G connection
- **First Contentful Paint**: < 1.5 seconds
- **Time to Interactive**: < 3 seconds
- **Animation Frame Rate**: 60fps minimum (16ms per frame)

---

## ♿ Accessibility Guidelines

### Color Contrast

**WCAG 2.1 AA Requirements**:
- Normal text (< 18pt): 4.5:1 contrast ratio
- Large text (>= 18pt or 14pt bold): 3:1 contrast ratio
- UI components & icons: 3:1 contrast ratio

**Testing**: Use browser DevTools or online contrast checkers

### Keyboard Navigation

**Requirements**:
- All interactive elements focusable via Tab
- Logical tab order (top to bottom, left to right)
- Visible focus indicators (`:focus-visible` ring)
- Skip to main content link (optional)
- Escape key closes dialogs

**Focus Indicators**:
```css
/* Default focus ring (from globals.css) */
* {
  @apply outline-ring/50;
}

/* Enhanced focus for interactive elements */
button:focus-visible,
a:focus-visible {
  @apply ring-2 ring-ring ring-offset-2;
}
```

### Screen Readers

**ARIA Labels**:
```tsx
// Icon-only button
<Button aria-label="Remove item">
  <X className="h-4 w-4" />
</Button>

// Loading state
<Button disabled aria-busy="true">
  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
  Loading...
</Button>
```

**Semantic HTML**:
- Use `<button>` for actions, `<a>` for navigation
- Use `<nav>`, `<main>`, `<header>`, `<footer>` landmarks
- Use `<h1>` - `<h6>` in logical hierarchy
- Use `<label>` for all form inputs

### Alt Text & Hidden Content

**Images**:
```tsx
<img src="/logo.png" alt="SirenBase logo" />
```

**Decorative Icons**:
```tsx
<Plus className="h-4 w-4" aria-hidden="true" />
```

**Visually Hidden Text** (for screen readers):
```tsx
<span className="sr-only">Loading...</span>
<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
```

---

## 🎬 Animation & Transitions

### Guiding Principles

- **Subtle, Not Distracting**: Animations enhance UX, don't dominate it
- **Fast**: Durations 150-300ms for most transitions
- **Purposeful**: Every animation has a reason (feedback, hierarchy, delight)
- **Respect User Preferences**: Honor `prefers-reduced-motion`

### Standard Durations

| Duration | Use Case                                   |
|----------|--------------------------------------------|
| 150ms    | Hover effects, button state changes        |
| 200ms    | Fade in/out, slide in/out                  |
| 300ms    | Dialog open/close, page transitions        |
| 500ms    | Loading spinners, skeleton loaders         |

### Common Animations

**Fade In**:
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.fade-in {
  animation: fadeIn 200ms ease-in;
}
```

**Scale on Hover** (Dashboard cards):
```tsx
<Card className="transition-transform hover:scale-102 duration-200">
```

**Loading Spinner** (using tw-animate-css):
```tsx
<Loader2 className="h-8 w-8 animate-spin" />
```

**Reduced Motion**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📐 Layout Patterns

### Container Widths

**Max Widths**:
- **Full-width mobile**: `w-full` (no max-width)
- **Narrow content**: `max-w-md` (448px) - Forms, login
- **Standard content**: `max-w-2xl` (672px) - Tool pages
- **Wide content**: `max-w-4xl` (896px) - Dashboard
- **Extra-wide**: `max-w-6xl` (1152px) - History tables

**Padding**:
- Mobile: `px-4` (16px)
- Desktop: `px-6` or `px-8` (24px or 32px)

### Grid Layouts

**Dashboard Tool Cards** (2x2 on mobile, 3 columns on desktop):
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <ToolCard />
  <ToolCard />
  <ToolCard />
</div>
```

**Inventory Item Grid** (1 column mobile, 2 columns desktop):
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

### Viewport Height Units (CRITICAL for Mobile)

**⚠️ ALWAYS use `h-dvh` instead of `h-screen` for full-viewport layouts.**

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

### Scrolling Behavior (App-Like Experience)

**Design Guideline**: Use **in-place list scrolling** where ONLY the data list/grid scrolls, while controls (title, buttons, filters) remain fixed and visible.

**Key Benefits**:
- Controls always accessible without scrolling back up
- Mobile-friendly: action buttons never scroll out of reach
- App-like experience with stable navigation

#### Standard Page Structure

```tsx
const [isScrolled, setIsScrolled] = useState(false);

const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  // 16px threshold - shadow appears after intentional scroll, not accidental touch
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

#### Dynamic Scroll Shadow

**This is the standard pattern for ALL pages with fixed headers and scrollable content.**

The fixed header section gains a subtle shadow when content scrolls beneath it, creating the visual effect of content sliding "under" the header rather than a harsh cut-off. This replaces the older pattern of using `border-b` separators.

##### When to Use

Apply this pattern to any page where:
- A title, toolbar, or filter section remains fixed at the top
- Content below scrolls independently
- There's a visual boundary between fixed and scrollable areas

**Examples**: Dashboard, Admin pages, Inventory tracking, History pages, any tool with a scrollable list/grid.

##### Visual Specifications

| Property | Value | Rationale |
|----------|-------|-----------|
| **Activation threshold** | 16px scroll | Prevents accidental activation from micro-scrolls or touches |
| **Transition duration** | 300ms | Smooth fade-in without feeling sluggish |
| **Transition easing** | ease-out | Decelerating curve feels natural and polished |
| **Shadow (active)** | `0 4px 12px -2px rgba(0,0,0,0.08)` | Subtle downward shadow, visible but not harsh |
| **Shadow (inactive)** | `0 0 0 0 rgba(0,0,0,0)` | Explicit zero values required for CSS transition |
| **Content breathing room** | `pt-2` (8px) | Small gap prevents content from touching header |

##### Technical Implementation

**Required imports:**
```tsx
import { useState } from "react";
import { cn } from "@/lib/utils";
```

**State and handler:**
```tsx
const [isScrolled, setIsScrolled] = useState(false);

const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  // 16px threshold - shadow appears after intentional scroll, not accidental touch
  setIsScrolled(e.currentTarget.scrollTop > 16);
};
```

**Fixed header with conditional shadow:**
```tsx
<div
  className={cn(
    "relative z-10 transition-all duration-300 ease-out",
    isScrolled
      ? "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]"
      : "shadow-[0_0px_0px_0px_rgba(0,0,0,0)]"
  )}
>
  {/* Fixed content: title, buttons, filters */}
</div>
```

**Scrollable area with handler:**
```tsx
<div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
  <div className="container max-w-6xl mx-auto px-4 md:px-8 pt-2 pb-6">
    {/* Scrollable content */}
  </div>
</div>
```

**Critical notes:**
- Both shadow states MUST have explicit values for CSS transition to work
- Using `transition-shadow` alone doesn't work; use `transition-all`
- The `z-10` ensures shadow renders above scrollable content
- Don't use `border-b` — the shadow provides a cleaner visual separation

##### Pages Using This Pattern

Track implementation status:
- [x] Dashboard (`app/dashboard/page.tsx`)
- [x] Admin Users (`app/admin/users/page.tsx`)
- [x] Admin Milk Pars (`app/admin/milk-pars/page.tsx`)
- [x] Admin RTDE Items (`app/admin/rtde-items/page.tsx`)
- [x] Inventory Tracking (`app/tools/tracking/inventory/page.tsx`)
- [x] Inventory History (`app/tools/tracking/history/page.tsx`)
- [x] RTDE Pulling Phase (`components/tools/rtde/RTDEPullingPhase.tsx`)

#### Implementation Rules

1. **Root container**: `flex flex-col h-dvh`
2. **Main element**: `flex-1 flex flex-col overflow-hidden`
3. **Fixed controls**: `relative z-10` with conditional scroll shadow
4. **Scrollable area**: `flex-1 overflow-y-auto` with `onScroll` handler

#### Mobile-Specific Requirements

**Safe Area Insets** (for notched devices):
```tsx
// Bottom navigation or fixed buttons
<div className="pb-4 pb-safe">
  <Button>Action</Button>
</div>
```

The `pb-safe` utility adds `padding-bottom: env(safe-area-inset-bottom)` to respect iOS safe areas.

**Touch Optimization**: Already configured in `globals.css` with `-webkit-overflow-scrolling: touch`.

#### Quick Reference

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

#### What NOT to Do

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

## 🔍 Iconography

### Icon Library

**Primary**: Lucide React (already installed via ShadCN)

**Size Guidelines**:

| Size        | Dimension | Use Case                                 |
|-------------|-----------|------------------------------------------|
| `h-3 w-3`   | 12px      | Inline with small text                   |
| `h-4 w-4`   | 16px      | **Default** - Button icons, inputs       |
| `h-5 w-5`   | 20px      | Larger buttons, section headers          |
| `h-6 w-6`   | 24px      | Tool cards, navigation                   |
| `h-8 w-8`   | 32px      | Loading spinners, empty states           |
| `h-12 w-12` | 48px      | Dashboard tool icons, large empty states |

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

### Icon Usage Rules

- **Always add `aria-hidden="true"`** for decorative icons
- **Add `aria-label`** for icon-only buttons
- **Consistent sizing**: Use Tailwind classes (`h-4 w-4`) not inline styles
- **Color**: Inherit from parent text color or use muted (`text-muted-foreground`)

---

## 🚀 Performance Optimization

### Image Optimization

**Next.js Image Component**:
```tsx
import Image from "next/image";

<Image
  src="/logo.png"
  alt="SirenBase logo"
  width={48}
  height={48}
  priority // For above-the-fold images
/>
```

**Guidelines**:
- Always use `next/image` for static images
- Provide `width` and `height` to prevent layout shift
- Use `priority` for hero images, omit for below-fold
- Optimize image file sizes (use WebP format)

### Code Splitting

**Lazy Loading**:
```tsx
import { lazy, Suspense } from "react";

const HeavyComponent = lazy(() => import("./heavy-component"));

<Suspense fallback={<Loader />}>
  <HeavyComponent />
</Suspense>
```

**Route-Based Splitting**: Next.js automatically code-splits by route

### Reducing Bundle Size

- **Tree-shaking**: Import only what you need from libraries
  ```tsx
  // ✅ Good
  import { Button } from "@/components/ui/button";

  // ❌ Bad
  import * as UI from "@/components/ui";
  ```

- **Dynamic Imports**: Load heavy libraries only when needed
  ```tsx
  const handleExport = async () => {
    const { exportToPDF } = await import("@/lib/export");
    exportToPDF(data);
  };
  ```

---

## 📝 Documentation Updates

### When to Update This File

**ALWAYS update DESIGN.md when**:
- Adding new component patterns (new card style, new button variant)
- Changing spacing, colors, or typography scales
- Establishing new interaction patterns (gestures, animations)
- Making tool-specific UI decisions (Milk Count calculator layout)
- Discovering accessibility improvements

**HOW to update**:
1. Make the change in code
2. Test it works as intended
3. Immediately document the decision in DESIGN.md
4. Include before/after if it's a change to existing pattern

**Commit together**:
- Code changes + DESIGN.md update in same commit
- Reference DESIGN.md in commit message: "Add destructive button variant (see DESIGN.md)"

---

## 🎓 Quick Reference Checklist

Use this checklist when implementing new UI:

- [ ] **Mobile-first**: Designed for 320px first?
- [ ] **Touch targets**: All interactive elements >= 44x44px?
- [ ] **Spacing**: Using 4px scale (4, 8, 12, 16, 24, 32)?
- [ ] **Typography**: Font sizes from defined scale?
- [ ] **Colors**: Using design tokens (no hardcoded colors)?
- [ ] **Contrast**: WCAG AA compliance (4.5:1 for text)?
- [ ] **Focus states**: Visible keyboard focus indicators?
- [ ] **Loading states**: Spinner or skeleton loader shown?
- [ ] **Error states**: Clear error messages with recovery?
- [ ] **Empty states**: Designed for "no data" scenarios?
- [ ] **Responsive**: Tested on mobile, tablet, desktop?
- [ ] **Accessibility**: ARIA labels, semantic HTML, keyboard nav?
- [ ] **Animations**: Respectful of `prefers-reduced-motion`?
- [ ] **Performance**: Images optimized, code split where needed?

---

## 🔗 Related Documentation

- **Overall Architecture**: `PLANNING.md` - Multi-tool system design
- **Root Guidelines**: `CLAUDE.md` - Project-wide development rules
- **Frontend Guidelines**: `frontend/CLAUDE.md` - Next.js/TypeScript conventions
- **Task Tracking**: `TASKS.md` - Current work items
- **Bug Tracking**: `BUGS.md` - Known issues and fixes

---

**Last Updated**: December 14, 2025
**Version**: 3.5.1
**Maintainer**: Development Team

**Change Log**:
- **v3.5.1** (Dec 14, 2025): **Dynamic Scroll Shadow Pattern** — Expanded documentation for the scroll shadow pattern as the standard for all scrollable sections:
  - Added "When to Use" guidelines for applying the pattern
  - Added Visual Specifications table with timing, threshold, and shadow values
  - Added complete Technical Implementation section with code snippets
  - Added "Pages Using This Pattern" checklist for tracking implementation
  - Updated Quick Reference table with detailed scroll shadow entries
  - This pattern replaces `border-b` separators for cleaner visual boundaries
- **v3.5.0** (Dec 14, 2025): **MAJOR AUDIT & CORRECTIONS** — Fixed documentation to match actual codebase implementation:
  - **Color System**: Corrected from "Nature Theme" to actual Supabase-inspired mint/teal palette. Updated all OKLCH values to match `globals.css`.
  - **Typography**: Fixed font stack documentation. Removed claims about Merriweather and Source Code Pro (never implemented). Documented actual fonts: Montserrat (loaded via next/font), system serif, system monospace.
  - **Viewport Height**: Added critical "Viewport Height Units" section. **ALWAYS use `h-dvh` instead of `h-screen`** for mobile-safe layouts. Added comparison table explaining why `100vh` fails on mobile.
  - **Scrolling Section**: Condensed from 264 lines to ~100 lines. Removed redundant examples. Updated all code examples to use `h-dvh`.
  - **Card Shadows**: Changed default from `shadow-md` to `shadow-none` with `hover:shadow-md` to match actual implementation.
  - Removed outdated "Nature theme" references from 5 component files.
- **v3.4.0** (Dec 14, 2025): Added "Design DNA: Foundational Truths" section — six non-negotiable principles that define the interface philosophy. Extracted from mobile viewport fixes: (1) Interface serves user, never reverse (2) Design for reality, not theory (3) Content must earn its space (4) Platform constraints are design partners (5) Density adapts, functionality doesn't (6) Scroll intentionally, never accidentally.
- **v3.3.0** (Dec 12, 2025): Version sync with project-wide cleanup. No design changes.
- **v1.4.0** (Nov 9, 2025): Completely rewrote scrolling behavior section with "infinity pool" in-place scrolling pattern.
- **v1.3.0** (Nov 8, 2025): Added "Adaptive and Purposeful Interface Behavior" philosophy with viewport adaptation framework.
- **v1.2.0** (Nov 8, 2025): Added scrolling behavior guidelines. Added 6th core principle: "App-Like Behavior".
- **v1.1.0** (Nov 8, 2025): Initial theme setup with ShadCN. Changed base radius from 10px to 8px.
- **v1.0.0** (Nov 8, 2025): Initial design system documentation.
