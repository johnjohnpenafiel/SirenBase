# Accessibility & Performance

This document covers accessibility requirements, mobile-first patterns, animations, and performance optimization for SirenBase.

---

## Color Contrast

### WCAG 2.1 AA Requirements

| Content Type | Minimum Contrast Ratio |
|--------------|------------------------|
| Normal text (< 18pt) | 4.5:1 |
| Large text (>= 18pt or 14pt bold) | 3:1 |
| UI components & icons | 3:1 |

**Testing Tools**:
- Browser DevTools (Accessibility panel)
- Online contrast checkers
- Lighthouse audits

### Verified Contrasts

Our Vercel-inspired palette meets WCAG AA:

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Body text on background | Pure black on off-white (21:1) | Pure white on pure black (21:1) |
| Muted text | Medium gray on off-white (7.5:1) | Light gray on black (8:1) |
| Primary button | White on black (21:1) | Black on white (21:1) |

---

## Keyboard Navigation

### Requirements

- All interactive elements focusable via Tab
- Logical tab order (top to bottom, left to right)
- Visible focus indicators (`:focus-visible` ring)
- Skip to main content link (optional)
- Escape key closes dialogs

### Focus Indicators

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

### Tool-Specific Keyboard Support

**RTD&E Counting**:
- Arrow keys: Navigate between items
- +/- keys: Increment/decrement count
- Enter: Confirm current item
- Tab: Move to next interactive element

**Dialogs**:
- Escape: Close dialog
- Tab: Cycle through focusable elements
- Focus trap: Tab stays within dialog

---

## Screen Readers

### ARIA Labels

```tsx
// Icon-only button - requires label
<Button aria-label="Remove item">
  <X className="h-4 w-4" />
</Button>

// Loading state
<Button disabled aria-busy="true">
  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
  Loading...
</Button>
```

### Semantic HTML

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

**Visually Hidden Text** (for screen readers only):
```tsx
<span className="sr-only">Loading...</span>
<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
```

### Live Regions

For dynamic content updates:
```tsx
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

---

## Animation & Transitions

### Guiding Principles

- **Subtle, Not Distracting**: Animations enhance UX, don't dominate it
- **Fast**: Durations 150-300ms for most transitions
- **Purposeful**: Every animation has a reason (feedback, hierarchy, delight)
- **Respect User Preferences**: Honor `prefers-reduced-motion`

### Standard Durations

| Duration | Use Case |
|----------|----------|
| 150ms | Hover effects, button state changes |
| 200ms | Fade in/out, slide in/out |
| 300ms | Dialog open/close, page transitions |
| 500ms | Loading spinners, skeleton loaders |

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

**Loading Spinner**:
```tsx
<Loader2 className="h-8 w-8 animate-spin" />
```

### Reduced Motion

Always respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Mobile-First Patterns

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

See [components.md](./components.md#input-optimization) for keyboard types and autofocus guidelines.

---

## Performance Optimization

### Performance Budgets

| Metric | Target |
|--------|--------|
| Page Load | < 2 seconds on 4G |
| First Contentful Paint | < 1.5 seconds |
| Time to Interactive | < 3 seconds |
| Animation Frame Rate | 60fps (16ms per frame) |

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

**Route-Based Splitting**: Next.js automatically code-splits by route.

### Reducing Bundle Size

**Tree-shaking**: Import only what you need:
```tsx
// ✅ Good
import { Button } from "@/components/ui/button";

// ❌ Bad
import * as UI from "@/components/ui";
```

**Dynamic Imports**: Load heavy libraries only when needed:
```tsx
const handleExport = async () => {
  const { exportToPDF } = await import("@/lib/export");
  exportToPDF(data);
};
```

### Animation Performance

- Use `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left` (triggers layout)
- Use `will-change` sparingly for complex animations
- Test on low-end devices

---

## Quick Reference Checklist

Use this checklist when implementing new UI:

### Accessibility
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] All interactive elements focusable via keyboard
- [ ] Visible focus indicators on all elements
- [ ] ARIA labels on icon-only buttons
- [ ] Semantic HTML structure
- [ ] Form inputs have associated labels

### Mobile
- [ ] Touch targets >= 44x44px
- [ ] Tested on 320px width
- [ ] No horizontal scrolling (except intentional carousels)
- [ ] Text remains readable at all viewport sizes
- [ ] Tested on real mobile devices

### Performance
- [ ] Images optimized with next/image
- [ ] Heavy components lazy loaded
- [ ] Animations use transform/opacity
- [ ] Respects `prefers-reduced-motion`

### States
- [ ] Loading states implemented
- [ ] Error states with recovery options
- [ ] Empty states designed
- [ ] Responsive at 320px, 768px, 1024px, 1920px

---

## Documentation Updates

**ALWAYS update design docs when**:
- Adding new component patterns
- Changing spacing, colors, or typography
- Establishing new interaction patterns
- Making tool-specific UI decisions
- Discovering accessibility improvements

**HOW to update**:
1. Make the change in code
2. Test it works as intended
3. Immediately document in appropriate design doc
4. Include before/after if changing existing pattern

**Commit together**:
- Code changes + design doc update in same commit
- Reference design doc in commit message

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 20, 2026 | Initial extraction from DESIGN.md |
| — | Jan 18, 2026 | WCAG touch target compliance documented (pre-extraction) |

**Last Updated**: January 20, 2026
