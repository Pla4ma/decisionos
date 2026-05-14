# DecisionOS — Integration Checklist

## Purpose

End-to-end verification checklist for critical data flows and vertical integration paths.

---

## Vertical Integration Path

The complete data flow through all layers:

```
form → schema → repository → Supabase → RLS → query refresh → UI update
```

### 1. Form Layer (UI)

**Responsibilities:**
- Collect user input
- Display real-time validation feedback
- Handle submission state

**Checklist:**
- [ ] Input components use controlled state
- [ ] Validation errors display inline
- [ ] Submit button disabled while invalid
- [ ] Loading state shown during submission
- [ ] Error messages are human-readable

### 2. Schema Layer (Validation)

**Responsibilities:**
- Validate data before repository call
- Transform input types
- Provide clear error messages

**Checklist:**
- [ ] Zod schema validates all required fields
- [ ] Type coercion handles form strings → typed values
- [ ] Error messages are user-friendly (no jargon)
- [ ] Schema tested with valid/invalid cases
- [ ] No `any` types in validation flow

### 3. Repository Layer (Data Access)

**Responsibilities:**
- Abstract Supabase calls
- Handle errors consistently
- Return typed data

**Checklist:**
- [ ] No Supabase calls in UI components
- [ ] Repository functions return typed promises
- [ ] Errors wrapped in `RepositoryError`
- [ ] Loading states handled at call site
- [ ] Repository split under 200 lines per file

### 4. Supabase Layer (Database)

**Responsibilities:**
- Persist data
- Enforce referential integrity
- Handle concurrent access

**Checklist:**
- [ ] Migrations run without errors
- [ ] Foreign keys enforce relationships
- [ ] Cascading deletes work correctly
- [ ] Indexes improve query performance
- [ ] Connection pooling configured

### 5. RLS Layer (Security)

**Responsibilities:**
- Enforce row-level access control
- Prevent unauthorized data access
- Validate JWT tokens

**Checklist:**
- [ ] RLS enabled on all tables
- [ ] Policies restrict to `user_id = auth.uid()`
- [ ] Test user cannot read another user's data
- [ ] Test user cannot modify another user's data
- [ ] Service role bypasses RLS for edge functions

### 6. Query Refresh Layer (Cache)

**Responsibilities:**
- Invalidate stale queries
- Refetch updated data
- Update UI automatically

**Checklist:**
- [ ] TanStack Query cache keys are consistent
- [ ] Mutations invalidate related queries
- [ ] Optimistic updates improve perceived speed
- [ ] Refetch triggers on focus/background
- [ ] Cache TTL appropriate for data freshness

### 7. UI Update Layer (Render)

**Responsibilities:**
- Display fresh data
- Handle loading states
- Show error fallbacks

**Checklist:**
- [ ] Loading skeletons shown while fetching
- [ ] Empty states handled gracefully
- [ ] Error states provide retry options
- [ ] Success states confirm actions
- [ ] Transitions are smooth

---

## Feature-Specific Checklists

### Decision Flow

- [ ] Create decision screen validates input via `createDecisionSchema`
- [ ] `createDecision` repository function saves to Supabase
- [ ] RLS policy `user_id = auth.uid()` enforced
- [ ] TanStack Query invalidates `['decisions', 'list']`
- [ ] List screen refetches and displays new decision
- [ ] Detail screen loads via `getDecisionById` with all relations
- [ ] Analysis request calls edge function (server-side Gemini)
- [ ] Response validated against `decisionAnalysisSchema`
- [ ] `saveDecisionAnalysis` stores scores
- [ ] Outcome review calls `saveDecisionReview`

### Auth Flow

- [ ] Sign up creates user in Supabase Auth
- [ ] Sign in succeeds with valid credentials
- [ ] Sign out clears local state and TanStack Query cache
- [ ] Token refresh works silently
- [ ] RLS policies enforce user isolation

### Subscription Flow

- [ ] RevenueCat SDK initializes correctly
- [ ] Purchase button opens native sheet
- [ ] Successful purchase grants entitlements
- [ ] Webhook syncs to Supabase `subscriptions` table
- [ ] `checkAnalysisLimit` reads from `profiles` table
- [ ] Restore purchases works

### AI Analysis Flow

- [ ] Analysis button checks usage limits first
- [ ] Edge Function receives validated payload
- [ ] Gemini API called server-side (no client key)
- [ ] Response validated against `decisionAnalysisSchema`
- [ ] `saveDecisionAnalysis` stores structured scores
- [ ] Client displays scores with explanations from `decisionScoreExplanations`
- [ ] Error cases handled gracefully with retry

---

## Testing the Vertical Path

### Manual Test: Create Decision

1. **Form:** Enter title "Should I move to Berlin?"
2. **Schema:** Verify validation passes (title 5-200 chars)
3. **Repository:** `createDecision` called with typed input
4. **Supabase:** Row created in `decisions` table
5. **RLS:** Verify `user_id` matches auth user
6. **Query Refresh:** `['decisions', 'list']` cache invalidated
7. **UI Update:** List screen shows new decision

### Manual Test: RLS Enforcement

1. Sign in as User A, create a decision
2. Sign out, sign in as User B
3. Attempt to query User A's decision ID directly
4. **Expected:** Empty result (RLS blocks access)
5. Attempt to update User A's decision
6. **Expected:** Permission denied

---

## Document History

| Date | Change |
|------|--------|
| 2026-05-03 | Initial structure created in Phase 0 |
| 2026-05-03 | Complete vertical path documentation (Phase 5) |
