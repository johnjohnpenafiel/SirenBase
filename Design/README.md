# SirenBase - Design System

## Overview

This directory contains the design system documentation for **SirenBase**. It defines the visual design language, UI patterns, and interaction guidelines that ensure consistency across all three tools (Inventory Tracking, Milk Count, RTD&E) while maintaining a cohesive, mobile-first user experience.

**Purpose**: Serve as the single source of truth for all design decisions, enabling AI agents and developers to create uniform, accessible, and brand-consistent interfaces.

---

## Document Index

| Document | Purpose | When to Read |
|----------|---------|--------------|
| [tokens.md](./tokens.md) | Colors, typography, spacing, shadows, breakpoints | Setting up styles, choosing colors/fonts |
| [components.md](./components.md) | Buttons, cards, forms, inputs, lists, loading states | Building UI components |
| [dialogs.md](./dialogs.md) | Modal/dialog patterns, content boxes, warnings | Creating dialogs or modals |
| [layout.md](./layout.md) | Page structure, navigation, scrolling, viewport | Building page layouts |
| [tool-specific.md](./tool-specific.md) | Per-tool UI characteristics | Working on specific tools |
| [accessibility.md](./accessibility.md) | WCAG, keyboard nav, screen readers, performance | Accessibility review, mobile optimization |

---

## Design Philosophy

### Core Principles

1. **Mobile-First Always** - Design for 320px width first, scale up gracefully
2. **Speed & Simplicity** - Fast interactions, minimal cognitive load
3. **Density & Intentionality** - Every element earns its space; tight layouts over decorative whitespace
4. **Accessibility by Default** - WCAG 2.1 AA compliance minimum
5. **Contrast & Rhythm** - Black accent elements (badges, pills) anchor the eye and create visual cadence
6. **App-Like Behavior** - Contained scrolling, fixed layouts, native-app feel

### Design Identity: "Earned Space"

SirenBase's visual identity is defined by **density, contrast, and intentionality**. This is not a generic enterprise UI - it's a portfolio-grade operations platform where every pixel demonstrates craft.

**What this means in practice:**
- **No decorative whitespace.** If a card feels empty, it needs more information or less padding - not a larger icon.
- **Black contrast anchors.** Monospace pills and badges (`text-[10px] font-mono font-bold bg-black text-white rounded-full`) create visual rhythm across every screen. These are the signature element of the design language.
- **Small, subordinate icons.** Icons support text at 16-20px, never dominate at 40-80px. Color in icons is subtle (400-weight opacity), not pastel circles.
- **Tight, purposeful cards.** Padding is `p-4` to `p-5`, not `p-6` to `p-8`. Cards are compact with multiple pieces of information (badge + title + description + navigation cue).
- **Dense grids.** Two-column layouts on mobile for navigation targets. Single-column only when content requires full width (forms, item detail cards).
- **Tactile interactions.** `active:scale-[0.98]` for press feedback, `hover:shadow-md` for subtle lift. No exaggerated scale effects.

**The test:** If a screen looks like it could come from any UI component library, it doesn't match the design language yet. Every screen should feel as intentional as the Inventory Tracking tool's item list.

### User Experience Goals

- **Instant Feedback**: Every action has immediate visual response (< 100ms)
- **Error Prevention**: Guide users toward success, make mistakes hard
- **Progressive Disclosure**: Show what's needed now, hide complexity
- **Forgiving Interactions**: Easy undo, clear confirmations, safe defaults

---

## Design DNA: Foundational Truths

These are the non-negotiable principles that define SirenBase's interface philosophy. They represent the "why" behind every design decision and should guide all future UI work.

### 1. The Interface Serves the User, Never the Reverse

The user should never fight the interface. If a button scrolls out of view, if content gets hidden behind a browser toolbar, if an action becomes unreachable — the design has failed. The interface must anticipate and prevent these frustrations before they occur.

**This means**: Critical actions are always visible and accessible. The layout accommodates the user's context (device, orientation, browser chrome) rather than demanding the user accommodate the layout.

### 2. Design for Reality, Not Theory

Theoretical measurements lie. `100vh` claims to be "full viewport height" but ignores mobile browser toolbars. A design that looks perfect in a simulator may fail on a real device. The only truth is what users actually experience.

**This means**: Use dynamic viewport units (`dvh`) that respond to actual available space. Test on real devices, not just browser dev tools. Account for safe areas, notches, and browser UI that consume real screen space.

### 3. Content Must Earn Its Space

Every pixel of vertical space is precious on mobile. Content that works with "Avocado" must also work with "Grilled Cheese Sandwich." If one edge case breaks the layout, the layout isn't done.

**This means**: Design for the longest reasonable content first, then ensure shorter content looks good. Use responsive spacing that compresses gracefully under pressure. Test with real-world data variations, not just ideal examples.

### 4. Platform Constraints Are Design Partners

Safe areas, browser toolbars, and device variations aren't obstacles to fight — they're constraints to embrace. The best mobile experiences work *with* the platform, creating interfaces that feel native rather than forced.

**This means**: Respect `safe-area-inset-*` boundaries. Account for browser chrome in viewport calculations. Design touch targets that feel natural on each platform. The goal is harmony with the device, not domination over it.

### 5. Density Adapts, Functionality Doesn't

When space is limited, reduce spacing and visual weight — never remove functionality. A compact layout with tighter gaps maintains usability; a layout that hides critical buttons breaks it.

**This means**: Mobile layouts may be denser than desktop, but they're never incomplete. Compress padding, reduce icon sizes, tighten gaps — but keep every action accessible. The user can do everything on mobile that they can on desktop.

### 6. Scroll Intentionally, Never Accidentally

Scrolling should be a deliberate user action within clearly defined regions (lists, content areas), never an unexpected consequence of the layout. If the entire interface shifts when the user doesn't expect it, the experience feels broken.

**This means**: Use `overflow-hidden` on layout containers to prevent unintended scrolling. Define explicit scroll regions for content that may exceed viewport. Fixed elements (headers, action buttons) must remain anchored regardless of content scroll.

---

## Adaptive and Purposeful Interface Behavior

**Core Principle**: SirenBase's interface design follows three foundational priorities: **clarity**, **adaptability**, and **intent**.

Every visible element must exist for a clear purpose — either to inform, guide, or enable action. The interface should intelligently adapt to different screen sizes and contexts, preserving usability without visual clutter.

**Guiding Concept**: Display information when it adds clarity; hide, collapse, or repurpose it when focus and simplicity are more valuable.

This principle ensures that SirenBase remains intuitive and functional across devices, with a layout that responds to context rather than simply resizing.

### Viewport Adaptation Framework

**1. Desktop Views** (>= 768px)

**Prioritize clarity and visibility**:
- Support additional informational or secondary elements that enhance orientation or context
- Ample space can be used to display both primary and secondary details, as long as readability remains high
- Show full text labels on buttons, navigation items, and actions
- Display metadata, timestamps, user info, and contextual help inline
- Use multi-column layouts to show more information at once

**2. Mobile Views** (< 768px)

**Prioritize simplicity and focus**:
- Retain only essential, action-driven elements in view
- Move secondary or low-priority elements into menus, dropdowns, or icons to maintain a clean interface
- Preserve core functionality while reducing visual noise
- Users should still be able to perform all actions available on desktop, even if they're accessed differently
- Use full-width layouts, stack elements vertically
- Hide labels, show icons only where appropriate
- Collapse navigation into hamburger menus or bottom nav

**3. Functional Consistency**

**The functionality of an element should remain consistent across views; only its presentation should adapt.**

- ✅ **Do**: Show "Add Item" button with icon + text on desktop, icon-only on mobile (same functionality)
- ✅ **Do**: Display user settings in header on desktop, move to dropdown menu on mobile (same access)
- ✅ **Do**: Show category badges inline on desktop, collapse to dropdown on mobile (same filtering)
- ❌ **Don't**: Remove features entirely on mobile (unless truly desktop-only, like keyboard shortcuts)
- ❌ **Don't**: Change button actions based on screen size (confusing)
- ❌ **Don't**: Hide critical actions without alternative access (inaccessible)

### Information Hierarchy for Adaptation

| Priority Level | Desktop Display | Mobile Display | Example Elements |
|----------------|-----------------|----------------|------------------|
| **Primary** (P1) | Always visible | Always visible | Add Item button, current inventory count, primary navigation |
| **Secondary** (P2) | Visible inline | Collapsed/icon-only | User name, settings, secondary actions |
| **Tertiary** (P3) | Visible with context | Hidden in menu/modal | Help text, tooltips, advanced filters, metadata |
| **Utility** (P4) | Visible but subtle | Hidden by default | Timestamps, version info, debug info |

---

## Design Workflow

### When Creating New UI

1. Check relevant design docs ([tokens.md](./tokens.md), [components.md](./components.md), [layout.md](./layout.md))
2. Follow established patterns
3. If no pattern exists, implement and document

### When Extracting Patterns

When you identify 2+ implementations with consistent styling, extract the pattern:

1. Identify the repeatable attributes across implementations
2. Document in the appropriate design doc with:
   - Pattern name
   - Use cases
   - Styling specifications (table format preferred)
   - Code examples
   - Common mistakes to avoid

### When Updating Patterns

1. Update the design doc FIRST
2. Then update implementations to match
3. Note changes in the Change Log below

### Cross-References

- Reference other design docs using relative links: `[see tokens](./tokens.md)`
- Reference specific sections with anchors: `[buttons](./components.md#buttons)`

---

## Testing Checklist for Adaptive Behavior

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

## Related Documentation

- **Overall Architecture**: `PLANNING.md` - Multi-tool system design
- **Root Guidelines**: `CLAUDE.md` - Project-wide development rules
- **Frontend Guidelines**: `frontend/CLAUDE.md` - Next.js/TypeScript conventions
- **Task Tracking**: `TASKS.md` - Current work items
- **Bug Tracking**: `BUGS.md` - Known issues and fixes

---

## Change Log

- **v6.0.0** (Feb 2, 2026): **DESIGN IDENTITY** — Added "Earned Space" design identity section; updated core principles to reflect density/contrast/intentionality philosophy; replaced generic "Clarity Over Aesthetics" and "Consistent But Not Boring" with specific, actionable principles
- **v5.0.0** (Jan 20, 2026): **MAJOR RESTRUCTURE** — Reorganized monolithic DESIGN.md into modular Design/ directory:
  - Split ~1,700 line file into 7 focused documents
  - Added Design Workflow section for pattern documentation process
  - Added Dialog Content Patterns (extracted from Inventory Tracking dialogs)
  - Improved AI agent efficiency with modular context loading
- **v4.0.1** (Jan 18, 2026): WCAG Touch Target Compliance — Fixed Input and Select components to meet 44px minimum
- **v4.0.0** (Jan 17, 2026): MAJOR THEME CHANGE — Vercel Theme with neutral grayscale palette, Geist font
- **v3.7.0** (Jan 16, 2026): Title Area Island Pattern — Frosted glass island for page titles
- **v3.6.0** (Dec 21, 2025): Apple-Inspired Modal Redesign — rounded-2xl, shadow-xl, backdrop-blur
- **v3.5.1** (Dec 14, 2025): Dynamic Scroll Shadow Pattern documentation
- **v3.5.0** (Dec 14, 2025): MAJOR AUDIT — Color system, typography, viewport height corrections
- **v3.4.0** (Dec 14, 2025): Design DNA: Foundational Truths section

---

**Last Updated**: February 2, 2026
**Version**: 6.0.0
**Maintainer**: Development Team
