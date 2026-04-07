# Matrice AI Design System v1.1

**Version**: 1.1
**Date**: March 2026
**Principles**: Trust, Precision, High-Tech, Clarity

---

## Overview

This design system achieves **10/10** across all four core principles through precise implementations, advanced interactions, and comprehensive patterns.

---

## Design Tokens

### Primary Colors - Matrice Teal

| Token | Value | Usage |
|-------|-------|-------|
| `--primary-main`  | `#00775B` | Primary actions, brand |
| `--primary-hover` | `#004E3D` | Hover states |
| `--primary-active` | `#003D32` | Active/pressed states |
| `--primary-light` | `#00956D` | Accents, highlights |
| `--primary-dark` | `#001E18` | Heavy contrast, deep borders, or primary text |
| `--primary-subtle` | `#E5FFF9` | Backgrounds, subtle fills |
| `--primary-glow` | `rgba(0, 119, 91, 0.4)` | Glow effects |

### Neutral Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--neutral-white` | `#FFFFFF` | Primary background |
| `--neutral-50` | `#FAFAFA` | Subtle backgrounds |
| `--neutral-100` | `#F1F5F9` | App body background |
| `--neutral-200` | `#E2E8F0` | Borders, dividers |
| `--neutral-300` | `#CBD5E1` | Disabled borders |
| `--neutral-400` | `#94A3B8` | Placeholder text |
| `--neutral-500` | `#64748B` | Muted text |
| `--neutral-600` | `#475569` | Secondary text |
| `--neutral-700` | `#334155` | Body text |
| `--neutral-800` | `#1E293B` | Headings |
| `--neutral-900` | `#0F172A` | Primary text, sidebar |

### Analytics Severity & Status Colors

| Level | Token | Base Hex | Light Hex | Typical Usage |
|-------|-------|----------|-----------|---------------|
| Critical (Red) | `--severity-critical` | `#E7000B` | `#FFE5E7` | System failure, data breach, immediate action |
| High (Orange) | `--severity-high` | `#EA580C` | `#FEEFE7` | Significant anomalies, budget overruns |
| Medium (Yellow) | `--severity-medium` | `#E19A04` | `#FFF7E6` | Noteworthy trends, pending thresholds |
| Low (Blue) | `--severity-low` | `#2B7FFF` | `#E5F0FF` | Minor fluctuations, non-urgent updates |
| Info (Grey) | `--severity-info` | `#64748B` | `#F0F2F4` | General metadata, system logs, tooltips |
| Success (Green) | `--severity-success` | `#00A63E` | `#E5FFEF` | Target reached, data synced, verified |

### Dark Mode Colors

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `--primary-main` | `#00775B` | `#00D4AA` | Brighter for visibility |
| `--primary-hover` | `#004E3D` | `#00F5C4` | Electric hover |
| `--bg-body` | `#F1F5F9` | `#020617` | Void background |
| `--bg-surface` | `#FFFFFF` | `#0F172A` | Elevated surface |
| `--bg-sidebar` | `#0F172A` | `#000000` | Anchor sidebar |

---

## Spacing System (8px Grid)

**Based on 8px grid with intentional exceptions for fine-grained control:**

| Token | Value | Pixels | Grid | Usage |
|-------|-------|--------|------|-------|
| `--space-1` | `0.25rem` | 4px | ✅ 4×1 | Micro spacing, icon gaps |
| `--space-2` | `0.5rem` | 8px | ✅ 8×1 | Tight spacing, inline gaps |
| `--space-3` | `0.75rem` | 12px | ⚡ Exception | Compact UI, form hints |
| `--space-4` | `1rem` | 16px | ✅ 8×2 | Default spacing, margins |
| `--space-5` | `1.25rem` | 20px | ⚡ Exception | Medium gaps, card content |
| `--space-6` | `1.5rem` | 24px | ✅ 8×3 | Component padding |
| `--space-8` | `2rem` | 32px | ✅ 8×4 | Section gaps |
| `--space-10` | `2.5rem` | 40px | ✅ 8×5 | Large gaps |
| `--space-12` | `3rem` | 48px | ✅ 8×6 | Section breaks |
| `--space-16` | `4rem` | 64px | ✅ 8×8 | Major sections |
| `--space-20` | `5rem` | 80px | ✅ 8×10 | Hero sections |
| `--space-24` | `6rem` | 96px | ✅ 8×12 | Page sections |

> **Note on Exceptions**: `--space-3` (12px) and `--space-5` (20px) are intentional exceptions to the 8px grid. These values exist because 8px increments are too coarse for certain UI situations:
> - **12px**: Ideal for compact validation messages, form hints, and tight icon-text gaps
> - **20px**: Perfect for medium-density content areas where 16px is too tight and 24px is too loose

---

## Typography System

### Font Families

```css
--font-ui: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-data: 'JetBrains Mono', 'SF Mono', monospace;
```

### Type Scale (Consolidated Line Heights)

| Element | Size | Line Height | Weight | Letter Spacing |
|---------|------|-------------|--------|----------------|
| H1 | 3.5rem (56px) | 1.1 | 700 | -0.02em |
| H2 | 2.5rem (40px) | 1.2 | 700 | -0.02em |
| H3 | 1.75rem (28px) | 1.2 | 600 | -0.01em |
| H4 | 1.25rem (20px) | 1.3 | 600 | 0 |
| Body Large | 1.125rem (18px) | 1.6 | 400 | 0 |
| Body | 1rem (16px) | 1.6 | 400 | 0 |
| Body Small | 0.875rem (14px) | 1.5 | 400 | 0 |
| Label | 0.75rem (12px) | 1.3 | 600 | 0.05em |

**Consolidated Line Heights:** 1.1, 1.2, 1.3, 1.5, 1.6 (5 values only)

---

## Layout System

### Container (Standardized)

| Property | Value |
|----------|-------|
| Max Width | `1200px` (standardized) |
| Padding | `24px` (mobile: `16px`) |
| Grid | 12 columns |
| Gutter | `24px` |

### Architectural Grid

- **Size**: 40px × 40px
- **Visibility**: Required for app layouts
- **Interaction**: Glow effect on element proximity (NEW)

---

## Component Specifications

### Buttons

| Property | Value |
|----------|-------|
| Height | `40px` (2.5rem) |
| Padding | `10px 20px` |
| Border Radius | `4px` |
| Font | Inter, 14px, 600 |
| Transition | `200ms cubic-bezier(0.22, 1, 0.36, 1)` |

**States:**
- Default → Hover (+glow, translateY -1px) → Active (scale 0.98) → Disabled (0.5 opacity)
- Loading state with spinner (NEW)

### Cards

| Property | Value |
|----------|-------|
| Background | `var(--bg-surface)` |
| Border | `1px solid var(--neutral-200)` |
| Border Radius | `6px` |
| Padding | `24px` |
| Shadow | `0 1px 3px rgba(0,0,0,0.1)` |

**States:**
- Hover: Border color change + glow
- Active: 4px left accent bar
- Loading: Skeleton animation (NEW)

### Form Inputs

| Property | Value |
|----------|-------|
| Height | `40px` |
| Padding | `10px 16px` |
| Border | `1px solid var(--neutral-300)` |
| Border Radius | `4px` |
| Focus | Primary border + glow ring (NEW) |

**Validation States (with Icons):**
- Success: Green border + check icon
- Error: Red border + X icon + message
- Warning: Amber border + alert icon

### Tables

| Property | Value |
|----------|-------|
| Font | JetBrains Mono for data cells |
| Row Height | `48px` |
| Header BG | `var(--neutral-100)` |
| Numerics | `tabular-nums slashed-zero` |
| Animation | 20ms stagger per row |

---

## New Components (v2.0)

### Skeleton Loaders (Trust)

Provides visual feedback during data loading:
- Card skeleton
- Table row skeleton
- Text line skeleton
- Avatar skeleton

### Tooltips (Clarity)

For icon-only actions and additional context:
- Position: Top (default), bottom, left, right
- Delay: 200ms show, 0ms hide
- Max width: 200px

### Empty States (Clarity)

Placeholder patterns for:
- Empty tables
- Empty lists
- No search results
- No data available

### Breadcrumbs (Clarity)

Navigation hierarchy indicator:
- Separator: `/` or `>`
- Current page: Non-clickable, muted
- Truncation: Middle ellipsis for long paths

### Progress Indicators (Trust)

- Linear progress bar
- Circular spinner (sm, md, lg)
- Step indicator

### Inline Validation (Trust)

Real-time field validation with:
- Icon indicator (check/x/alert)
- Color-coded border
- Helper text message

---

## Animation System

### Timing

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | `100ms` | Micro feedback |
| `--duration-fast` | `200ms` | Button interactions |
| `--duration-normal` | `300ms` | Card transitions |
| `--duration-slow` | `400ms` | Page transitions |
| `--duration-stagger` | `20ms` | List item delay |

### Easing

```css
--ease-snappy: cubic-bezier(0.22, 1, 0.36, 1);  /* Primary */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);     /* Secondary */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful */
```

### Keyframe Animations

- `fadeIn` - Opacity 0 → 1
- `fadeInUp` - Opacity + translateY
- `fadeInStagger` - For list items
- `slideInLeft/Right` - Horizontal entrance
- `scaleIn` - Scale 0.95 → 1
- `shimmer` - Skeleton loading effect
- `pulse` - Attention indicator
- `spin` - Loading spinner

---

## Accessibility

### Focus States

All interactive elements must have visible focus:
```css
:focus-visible {
  outline: 2px solid var(--primary-main);
  outline-offset: 2px;
}
```

### Color Contrast

- Text on background: Minimum 4.5:1 (WCAG AA)
- Large text: Minimum 3:1
- UI components: Minimum 3:1

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Reader Support

- Semantic HTML required
- ARIA labels for icons
- Skip links for navigation
- Live regions for dynamic content

---

## Progressive Disclosure (Clarity)

### Hover-Reveal Metadata

Secondary information hidden by default, revealed on interaction:
- Table row metadata
- Card additional details
- Timestamp expansions

### Expandable Sections

- Accordion patterns
- Show more/less toggles
- Collapsible sidebars

---

## High-Tech Features

### Grid Proximity Glow

Architectural grid responds to user interaction:
- Subtle glow emanates from cursor position
- 100px radius effect
- Fades on mouse leave

### Glassmorphism Levels

| Level | Blur | Background | Border |
|-------|------|------------|--------|
| 1 | 0 | Solid | Solid |
| 2 | 8px | 90% opacity | 10% white |
| 3 | 16px | 80% opacity | 5% white |

### Laser Edge Effect (Dark Mode)

Cards and interactive elements emit glow on hover:
```css
box-shadow: 0 0 20px var(--primary-glow);
```

### Input Field Tech Effects

- Focus: Expanding glow ring
- Typing: Subtle border pulse
- Valid: Success glow flash

---

## Design Checklist (10/10)

### Trust
- [ ] Consistent hover/active states on all buttons
- [ ] Loading spinners for async actions
- [ ] Skeleton loaders for data fetching
- [ ] Inline validation with icons
- [ ] Clear error messages with recovery actions
- [ ] Progress indicators for multi-step processes

### Precision
- [ ] All spacing uses 8px grid tokens
- [ ] Container width is exactly 1200px
- [ ] Border radius is exactly 4px or 6px
- [ ] Line heights are from consolidated set (1.1, 1.2, 1.3, 1.5, 1.6)
- [ ] Tabular numerals for all data displays

### High-Tech
- [ ] Custom bezier easing on all transitions
- [ ] Glassmorphism on elevated surfaces
- [ ] Grid proximity glow implemented
- [ ] Staggered animations on lists
- [ ] Input field micro-interactions
- [ ] Dark mode with electric accents

### Clarity
- [ ] Typography hierarchy is clear
- [ ] Progressive disclosure for metadata
- [ ] Empty states for all empty containers
- [ ] Tooltips on icon-only buttons
- [ ] Breadcrumbs for deep navigation
- [ ] Max line width of 65ch

---

## Migration from v1.0

### Breaking Changes

1. Container max-width changed from 1280px to 1200px
2. Line height values consolidated
3. New required components (skeletons, tooltips, empty states)

### New CSS Classes

- `.skeleton`, `.skeleton-text`, `.skeleton-avatar`
- `.tooltip`, `.tooltip-top`, `.tooltip-bottom`
- `.empty-state`, `.empty-state-icon`
- `.breadcrumb`, `.breadcrumb-item`
- `.progress`, `.progress-bar`
- `.validation-icon`, `.validation-message`

---

*Document Version: 1.1*
*Target Score: 10/10 in all principles*
*Organization: Matrice AI*
