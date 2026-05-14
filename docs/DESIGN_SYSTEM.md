# DecisionOS — Design System

## Purpose

This document defines the visual design language, UI patterns, and component guidelines for DecisionOS.

---

## Design Philosophy

### Feel

DecisionOS should feel:
- **Calm** — Not frantic or overwhelming
- **Premium** — Worth paying for
- **Trustworthy** — Reliable and honest
- **Intelligent** — AI-enhanced but human-centered
- **Reflective** — Encourages thoughtful consideration
- **Personal** — Respects individual context

### Avoid

- Cheap neon overload
- Childish gamification
- Generic chatbot styling
- Corporate dashboard clutter
- Fake futuristic UI

---

## Design Tokens

### Colors

Located in `src/theme/colors.ts`:

```typescript
colors.background.primary    // #0D0D0F - Main background
colors.background.secondary    // #16171A - Card backgrounds
colors.background.tertiary    // #1E1F23 - Elevated surfaces
colors.background.elevated    // #25262B - Highest surfaces

colors.text.primary           // #F5F5F7 - Main text
colors.text.secondary         // #A1A1AA - Secondary text
colors.text.tertiary          // #71717A - Disabled/hint text
colors.text.disabled          // #52525B - Non-interactive
colors.text.inverse          // #0D0D0F - Text on light backgrounds

colors.accent.primary         // #5EE7D4 - Primary teal accent
colors.accent.secondary       // #7C9CEE - Secondary indigo accent
colors.accent.muted          // rgba(94, 231, 212, 0.15) - Accent backgrounds

colors.status.success         // #4ADE80 - Success states
colors.status.warning         // #FBBF24 - Warning states
colors.status.error          // #F87171 - Error states
colors.status.info           // #60A5FA - Information states

colors.border.primary         // rgba(255,255,255,0.08) - Default borders
colors.border.secondary       // rgba(255,255,255,0.04) - Subtle dividers
colors.border.accent         // rgba(94,231,212,0.3) - Accent borders
```

### Spacing

Located in `src/theme/spacing.ts`:

```typescript
spacing.xs    // 4px
spacing.sm    // 8px
spacing.md    // 16px
spacing.lg    // 24px
spacing.xl    // 32px
spacing.xxl   // 48px
spacing.xxxl  // 64px

touchTargets.minHeight  // 44px minimum touch target
screenPadding.horizontal // 20px horizontal screen padding
```

### Typography

Located in `src/theme/typography.ts`:

```typescript
typography.size.xxs  // 11px
typography.size.xs   // 13px
typography.size.sm   // 15px
typography.size.md   // 17px (body)
typography.size.lg   // 20px
typography.size.xl   // 24px
typography.size.xxl  // 32px
typography.size.xxxl // 40px

typography.preset.h1      // 32px / bold / 40px line
 typography.preset.h2      // 24px / semibold / 32px line
typography.preset.h3      // 20px / semibold / 28px line
typography.preset.body    // 17px / regular / 24px line
typography.preset.bodySmall // 15px / regular / 22px line
typography.preset.caption // 13px / regular / 18px line
typography.preset.label   // 13px / semibold / 18px line + tracking
```

### Border Radius

Located in `src/theme/radius.ts`:

```typescript
radius.none  // 0
radius.sm    // 6px
radius.md    // 12px (default)
radius.lg    // 16px
radius.xl    // 24px
radius.full  // 9999px (pills, circles)
```

### Shadows

Located in `src/theme/shadows.ts`:

```typescript
shadows.none  // No shadow
shadows.sm    // Subtle elevation
shadows.md    // Standard elevation
shadows.lg    // Prominent elevation
shadows.xl    // Maximum elevation (modals)
```

---

## Components

### Button

`src/components/ui/Button.tsx`

**Variants:** `primary` | `secondary` | `ghost` | `danger`
**Sizes:** `small` | `medium` | `large`
**States:** normal, pressed, disabled, loading

### Card

`src/components/ui/Card.tsx`

**Variants:** `default` | `elevated` | `outlined`
**Padding:** `none` | `small` | `medium` | `large`
**Props:** `onPress` for tappable cards

### TextField

`src/components/ui/TextField.tsx`

**Features:** Label, placeholder, error message, helper text, disabled state
**Types:** Text, email, secure entry

### TextArea

`src/components/ui/TextArea.tsx`

**Features:** Multi-line input, character counter, validation

### Badge

`src/components/ui/Badge.tsx`

**Variants:** `default` | `success` | `warning` | `error` | `info` | `accent`

### Screen

`src/components/ui/Screen.tsx`

**Features:** Safe area handling, scrollable option, keyboard avoiding

### State Components

- `LoadingState` — Full-screen and inline loading indicators
- `ErrorState` — Error display with retry action
- `EmptyState` — Display when no content exists

### Divider

`src/components/ui/Divider.tsx`

**Orientations:** `horizontal` | `vertical`

---

## File Organization

```
src/theme/
├── colors.ts      // Color palette tokens
├── spacing.ts     // Spacing and touch target tokens
├── typography.ts  // Font size, weight, and preset tokens
├── radius.ts      // Border radius tokens
├── shadows.ts     // Shadow/elevation tokens
└── index.ts       // Theme exports

src/components/ui/
├── Screen.tsx         // Safe area container
├── Button.tsx         // Action buttons
├── Card.tsx           // Surface containers
├── TextField.tsx      // Single-line inputs
├── TextArea.tsx       // Multi-line inputs
├── Badge.tsx          // Status indicators
├── LoadingState.tsx   // Loading states
├── ErrorState.tsx     // Error states
├── EmptyState.tsx     // Empty states
├── Divider.tsx        // Visual separators
└── index.ts           // Component exports
```

---

## Document History

| Date | Change |
|------|--------|
| 2026-05-03 | Initial structure created in Phase 0 |
| 2026-05-03 | Complete design tokens and component documentation (Phase 3) |
