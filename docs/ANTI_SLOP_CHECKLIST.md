# Anti-Slop Checklist

Before marking any task or phase complete, verify every item on this checklist.

---

## Core Checks

- [ ] **No placeholder buttons** — Buttons work or are visibly disabled
- [ ] **No fake AI responses** — AI output comes from real API calls, never hardcoded
- [ ] **No TODO-only implementation** — No "implement later" comments as the only implementation
- [ ] **No file over 200 lines unless documented** — All source files under 200 lines or have explicit exception
- [ ] **No `any` unless justified** — TypeScript types are explicit, `any` has documented reason
- [ ] **UI has loading/error/empty states** — All user-facing screens handle all states
- [ ] **Data path is integrated** — Full stack path works: UI → validation → API → storage → retrieval
- [ ] **Errors are handled** — Network errors, validation errors, and AI failures have user-facing handling
- [ ] **Tests or manual QA added** — Every core feature has verification
- [ ] **Docs updated** — PHASE_LOG.md and relevant docs reflect changes
- [ ] **No secrets exposed** — API keys, tokens, and credentials are not in code
- [ ] **No sensitive text logged** — Decision content doesn't appear in logs or analytics
- [ ] **Feature works on real data** — Not just mock/demo data

---

## Phase-Specific Gates

### Phase 0: Project Control
- [ ] All docs created and non-empty
- [ ] No feature code written before rules
- [ ] 200-line file limit documented
- [ ] Anti-placeholder rules documented
- [ ] Gemini backend-only rule documented
- [ ] Monetization-from-day-one rule documented

### Phase 1: Archive Preservation
- [ ] Archive file structure preserved
- [ ] Archive documented before reuse
- [ ] No old code blindly copied
- [ ] Future-only files not in MVP
- [ ] HomeScreenV2 inspected deeply
- [ ] Archive tests not treated as current blockers

### Phase 2: Clean Foundation
- [ ] Clean app runs
- [ ] No archive imports
- [ ] Strict TypeScript enabled
- [ ] Env system exists
- [ ] File structure is clean
- [ ] No file exceeds 200 lines
- [ ] App provider setup not crammed into one file

### Phase 3: Design System
- [ ] UI components are reusable
- [ ] No giant route files
- [ ] Placeholder routes clearly marked
- [ ] No fake working buttons
- [ ] Theme tokens used
- [ ] UI QA checklist exists

---

## How to Use This Checklist

1. **Before completing a task** — Review relevant items
2. **Before completing a phase** — Run the phase-specific gate
3. **When unsure** — Default to stricter interpretation
4. **If a check fails** — Fix it before marking complete

---

## Document History

| Date | Change |
|------|--------|
| 2026-05-03 | Initial creation as part of Phase 0 |
