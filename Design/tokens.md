# Design Tokens

Design tokens are the foundational visual values that ensure consistency across SirenBase. They define colors, typography, spacing, and other core properties used throughout the application.

---

## Color System

**Foundation**: We use a **Vercel-inspired neutral grayscale palette** with OKLCH values for better perceptual uniformity. The palette features a clean black/white aesthetic with clear visual hierarchy through luminosity differences.

**Design Decision**: All tools share the same color palette for consistency. The neutral palette ensures professional appearance and maximum content focus.

**Key Feature**: Background (`0.99`) vs Card (`1.0`) luminosity difference creates natural elevation without relying solely on borders.

### Light Mode (Default)

```css
/* Base Colors - Clear separation between background and surfaces */
--background: oklch(0.9900 0 0);             /* Off-white (~99% lightness) */
--foreground: oklch(0 0 0);                  /* Pure black */

/* Surfaces - Pure white cards "float" above background */
--card: oklch(1 0 0);                        /* Pure white */
--card-foreground: oklch(0 0 0);
--popover: oklch(0.9900 0 0);
--popover-foreground: oklch(0 0 0);

/* Interactive Elements - Black primary for maximum contrast */
--primary: oklch(0 0 0);                     /* Pure black */
--primary-foreground: oklch(1 0 0);          /* Pure white */
--secondary: oklch(0.9400 0 0);              /* Light gray */
--secondary-foreground: oklch(0 0 0);

/* States */
--muted: oklch(0.9700 0 0);                  /* Very light gray */
--muted-foreground: oklch(0.4400 0 0);       /* Medium gray */
--accent: oklch(0.9400 0 0);                 /* Light gray */
--accent-foreground: oklch(0 0 0);
--destructive: oklch(0.6300 0.1900 23.0300); /* Red */
--destructive-foreground: oklch(1 0 0);

/* Borders & Inputs */
--border: oklch(0.9200 0 0);                 /* Subtle gray border */
--input: oklch(0.9400 0 0);                  /* Light input background */
--ring: oklch(0 0 0);                        /* Black focus ring */
```

### Dark Mode

```css
/* Base Colors - Pure black background */
--background: oklch(0 0 0);                  /* Pure black */
--foreground: oklch(1 0 0);                  /* Pure white */
--card: oklch(0.1400 0 0);                   /* Dark gray */
--card-foreground: oklch(1 0 0);
--popover: oklch(0.1800 0 0);
--popover-foreground: oklch(1 0 0);

/* Interactive Elements - White primary */
--primary: oklch(1 0 0);                     /* Pure white */
--primary-foreground: oklch(0 0 0);          /* Pure black */
--secondary: oklch(0.2500 0 0);
--secondary-foreground: oklch(1 0 0);

/* States */
--muted: oklch(0.2300 0 0);
--muted-foreground: oklch(0.7200 0 0);
--accent: oklch(0.3200 0 0);
--accent-foreground: oklch(1 0 0);
--destructive: oklch(0.6900 0.2000 23.9100);
--destructive-foreground: oklch(0 0 0);

/* Borders & Inputs */
--border: oklch(0.2600 0 0);
--input: oklch(0.3200 0 0);
--ring: oklch(0.7200 0 0);
```

### Chart Colors (for data visualization)

```css
/* Light Mode - Neutral-friendly palette */
--chart-1: oklch(0.8100 0.1700 75.3500);   /* Orange/amber */
--chart-2: oklch(0.5500 0.2200 264.5300);  /* Blue */
--chart-3: oklch(0.7200 0 0);              /* Gray */
--chart-4: oklch(0.9200 0 0);              /* Light gray */
--chart-5: oklch(0.5600 0 0);              /* Dark gray */

/* Dark Mode */
--chart-1: oklch(0.8100 0.1700 75.3500);
--chart-2: oklch(0.5800 0.2100 260.8400);
--chart-3: oklch(0.5600 0 0);
--chart-4: oklch(0.4400 0 0);
--chart-5: oklch(0.9200 0 0);
```

---

## Typography

**Font Stack**: We use **Geist** as the primary font family, loaded via the `geist` npm package. Geist is Vercel's custom font designed for clarity and modern interfaces.

```css
--font-sans: Geist, sans-serif             /* Primary UI font (loaded via geist package) */
--font-serif: Georgia, serif               /* System serif (rarely used) */
--font-mono: Geist Mono, monospace         /* Monospace for codes (loaded via geist package) */
```

**Implementation Note**: Both Geist Sans and Geist Mono are imported in `app/layout.tsx` using the `geist` package for optimal loading performance. This provides consistent typography for both UI text and code displays (like item codes).

### Font Sizes (Mobile-First)

| Token          | Mobile (Base) | Desktop (md+) | Usage                          |
|----------------|---------------|---------------|--------------------------------|
| `text-xs`      | 0.75rem (12px)| 0.75rem       | Labels, captions, metadata     |
| `text-sm`      | 0.875rem (14px)| 0.875rem     | Body text, form inputs         |
| `text-base`    | 1rem (16px)   | 1rem          | Default body, paragraphs       |
| `text-lg`      | 1.125rem (18px)| 1.125rem     | Subheadings, emphasized text   |
| `text-xl`      | 1.25rem (20px)| 1.25rem       | Section headings               |
| `text-2xl`     | 1.5rem (24px) | 1.875rem (30px)| Page titles                   |
| `text-3xl`     | 1.875rem (30px)| 2.25rem (36px)| Hero headings (dashboard)     |

### Font Weights

- **Normal (400)**: Body text, form inputs
- **Medium (500)**: Button text, emphasized labels
- **Semibold (600)**: Subheadings, section headers
- **Bold (700)**: Page titles, important CTAs

### Line Heights

- **Tight (1.25)**: Headings, titles
- **Normal (1.5)**: Body text, paragraphs
- **Relaxed (1.75)**: Long-form content (rare in this app)

---

## Spacing Scale

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

---

## Border Radius

**Base Radius**: 8px (0.5rem) - Defined in `--radius`

| Token        | Value              | Usage                              |
|--------------|--------------------|---------------------------------------|
| `rounded-sm` | `calc(var(--radius) - 4px)` = 4px | Small buttons, pills       |
| `rounded-md` | `calc(var(--radius) - 2px)` = 6px | Inputs, small cards        |
| `rounded-lg` | `var(--radius)` = 8px     | Default buttons, cards             |
| `rounded-xl` | `calc(var(--radius) + 4px)` = 12px | Large cards, modals       |
| `rounded-2xl`| 16px               | Apple-style dialogs, content boxes    |
| `rounded-full` | 9999px           | Circular elements (avatars, icons) |

**Consistency Rule**: Use `rounded-lg` (8px) for most elements unless there's a specific reason to deviate.

---

## Shadows (Elevation)

Shadows create depth and hierarchy. Use sparingly for mobile performance.

| Level   | Tailwind Class | Usage                                  |
|---------|----------------|----------------------------------------|
| None    | `shadow-none`  | Flat elements, minimal UI              |
| Small   | `shadow-sm`    | Subtle lift (cards, inputs on hover)   |
| Medium  | `shadow-md`    | Dropdowns, popovers                    |
| Large   | `shadow-lg`    | Modals, dialogs, important overlays    |
| XL      | `shadow-xl`    | Maximum emphasis (rare)                |

**Default**: Cards use `shadow-none` with `hover:shadow-md`. Modals use `shadow-lg`.

### Scroll Shadow Pattern

For fixed headers with scrollable content beneath:

| State | Shadow Value |
|-------|-------------|
| Inactive | `shadow-[0_0px_0px_0px_rgba(0,0,0,0)]` |
| Active (scrolled) | `shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]` |

**Transition**: `transition-all duration-300 ease-out`
**Threshold**: Activate after 16px scroll

---

## Breakpoints

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

## Quick Reference

```tsx
// Common token usage examples

// Spacing
<div className="p-4 gap-3 mb-6">        {/* 16px, 12px, 24px */}

// Typography
<h1 className="text-2xl font-bold">     {/* 24px, bold */}
<p className="text-sm text-muted-foreground">  {/* 14px, gray */}

// Colors
<Button className="bg-primary text-primary-foreground">
<Card className="bg-card border-border">

// Shadows
<Card className="shadow-none hover:shadow-md">
<Dialog className="shadow-lg">

// Radius
<Button className="rounded-lg">         {/* 8px */}
<Dialog className="rounded-2xl">        {/* 16px */}
```
