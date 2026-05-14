# DecisionOS — UI QA Checklist

## Purpose

Manual verification checklist for UI quality across all screens and components.

---

## Universal Checks

Apply to every screen:

- [ ] **Safe area handling** — Content respects notches, home indicators
- [ ] **Keyboard behavior** — Inputs scroll into view, keyboard dismisses appropriately
- [ ] **Loading state** — Shows loading indicator during async operations
- [ ] **Empty state** — Shows helpful message when no data exists
- [ ] **Error state** — User-friendly error display with recovery action
- [ ] **Button states** — Normal, pressed, disabled, loading all visible
- [ ] **Form validation** — Clear error messages on invalid input
- [ ] **Readable text** — Font sizes appropriate, contrast sufficient
- [ ] **Touch target size** — Minimum 44pt for interactive elements
- [ ] **Dark mode contrast** — All elements visible in dark theme
- [ ] **Navigation back behavior** — Back buttons work, gesture navigation supported
- [ ] **No fake buttons** — Every button either works or is visibly disabled

---

## Screen-Specific Checks

### Auth Screens
- [ ] Password visibility toggle works
- [ ] Error messages don't expose account existence
- [ ] Biometric prompt appears correctly

### Decision Screens
- [ ] Option add/remove updates UI immediately
- [ ] Analysis loading shows progress indication
- [ ] Score display is clear and trustworthy

### Paywall Screen
- [ ] Pricing is clear and accurate
- [ ] Restore purchases button works
- [ ] Terms/privacy links are accessible

### Settings Screen
- [ ] Toggle states persist
- [ ] Sign out confirms before action
- [ ] Delete account has clear warnings

---

## To Be Completed

This checklist will be used during Phase 3 (Design System) and Phase 7 (Polish).

---

## Document History

| Date | Change |
|------|--------|
| 2026-05-03 | Initial structure created in Phase 0 |
