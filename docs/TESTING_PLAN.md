# DecisionOS — Testing Plan

## Purpose

This document defines the testing strategy for DecisionOS, including unit tests, integration tests, and manual QA processes.

---

## Testing Philosophy

**Test what matters:**
- Business logic that can't fail silently
- User-facing validation that blocks bad data
- Security boundaries
- Not: styling details, third-party SDKs, or UI copy

**No "testing later":**
- Schema tests are required before using schemas
- Repository tests for critical paths
- Manual QA checklist before release

---

## Testing Levels

### Unit Tests

**Target**: Core business logic, utilities, validation schemas  
**Location**: `src/**/*.test.ts`  
**Tools**: Jest

Priority areas:
- **Decision validation schemas** — Required, all fields tested
- **AI safety detection** — Crisis keywords, edge cases
- **Analytics sanitization** — No sensitive data leaks
- **Date/time utilities** — Period calculations

Files with tests:
| File | Test File | Coverage |
|------|-----------|----------|
| `decisionSchemas.ts` | `decisionSchemas.test.ts` | createDecision, option, review schemas |
| `aiSafety.ts` | `aiSafety.test.ts` | Crisis detection, safe content |
| `analytics.ts` | `analytics.test.ts` | Sanitization, allowed events |

### Integration Tests

**Target**: Repository functions, API clients  
**Location**: `tests/integration/`  
**Tools**: Jest + Supabase test instance (future)

Priority areas (Phase 16+):
- Decision CRUD operations
- Auth flows with real Supabase
- AI analysis pipeline (mocked Gemini)

### E2E Tests

**Target**: Critical user flows  
**Location**: `tests/e2e/`  
**Tools**: Detox or Maestro (future)

Priority flows (Phase 16+):
- Sign up → create decision → analyze
- Paywall → upgrade flow
- Decision review loop

### Manual QA

**Target**: UI states, edge cases, subjective quality  
**Location**: `docs/QA_CHECKLIST.md`

---

## Schema Test Requirements

All schemas must have tests for:
- ✅ Valid input acceptance
- ✅ Invalid input rejection
- ✅ Edge cases (empty, too long, wrong type)
- ✅ Required vs optional fields

### Decision Schema Test Coverage

**createDecisionSchema:**
- Valid decision (accepts)
- Title too short (rejects)
- Title too long (rejects)
- Invalid category (rejects)
- Importance out of range (rejects)
- Context too long (rejects)

**decisionOptionSchema:**
- Valid option (accepts)
- Title only (accepts)
- Title too short (rejects)
- Too many pros/cons (rejects)

**decisionReviewSchema:**
- Valid review (accepts)
- Minimal fields (accepts)
- Outcome notes too short (rejects)
- Invalid option ID (rejects)
- Satisfaction score out of range (rejects)

---

## Known Limitations (Phase 15)

| Area | Status | Planned |
|------|--------|---------|
| Schema tests | ✅ Complete | All schemas covered |
| Component tests | 🚫 Skipped | Not practical for MVP screens |
| Repository tests | 🚫 Skipped | Requires test DB setup |
| E2E tests | 🚫 Skipped | Requires build pipeline |
| Manual QA | ✅ Complete | QA checklist written |

**Rationale:**
- Component tests for simple UI are low ROI
- Integration tests need test infrastructure
- Manual QA covers UI states adequately for MVP

---

## Test Commands

```bash
# Run all tests
npm test

# Run with watch mode
npm test -- --watch

# Run specific test file
npm test -- decisionSchemas.test.ts

# Run with coverage
npm test -- --coverage
```

---

## Test Environments

| Environment | Purpose |
|-------------|---------|
| Local | Development testing (`npm test`) |
| CI | Automated PR checks (GitHub Actions) |
| Staging | Pre-release verification |
| Production | Smoke tests only |

---

## CI/CD Integration

```yaml
# .github/workflows/test.yml (future)
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
```

---

## Document History

| Date | Change |
|------|--------|
| 2026-05-03 | Initial structure created in Phase 0 |
| 2026-05-03 | Expanded for Phase 15 (Testing System) |
