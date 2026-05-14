# DecisionOS — Rules

Strict rules that apply to every phase of development. Violations must be corrected immediately.

---

## No Fake Features

If a feature is not ready, make it visibly disabled and documented. Never pretend it works.

- Buttons must work or be visibly disabled
- Forms must validate real inputs
- API calls must handle loading, success, and error states
- Gemini analysis must come from the backend route, never hardcoded text
- Paywall must not pretend to charge if RevenueCat is not connected
- Analytics must not log sensitive content
- Authentication must use real Supabase auth

---

## No Client-Side Gemini Keys

The `GEMINI_API_KEY` must never be exposed to the client.

- Gemini API calls happen in Supabase Edge Functions only
- Client code never imports `GEMINI_API_KEY`
- AI responses are validated on the server before sending to client

---

## No Archive Deletion

The archive folder `THIRD APP/` contains reference material. Do not delete it.

- Inspect before referencing
- Document useful patterns
- Copy small patterns only when appropriate
- Never delete archive files without explicit permission

---

## No Full NeuroFlow in MVP

The MVP is DecisionOS, not the complete NeuroFlow ecosystem.

- Build the decision product first
- Resist scope creep into adjacent domains
- Future NeuroFlow features are documented but not implemented

---

## No Slop

Shallow, vague, rushed, or placeholder work is prohibited.

Banned phrases and patterns:
- "TODO: implement later"
- "Coming soon"
- "Mock response"
- "Placeholder analysis"
- "Fake score"
- "Hardcoded user"
- "Temporary button"
- "Any type everywhere"
- "Basic screen for now"
- "Will connect later"

---

## 200-Line File Limit

No source file should exceed 200 lines without explicit exception documentation.

Applies to:
- `.ts`
- `.tsx`
- `.js`
- `.jsx`
- `.sql` where practical

When a file approaches 200 lines, split it:
- Component too large → split child components
- Screen too large → extract hooks/components/helpers
- Service too large → split repository, parser, client, types
- Schema too large → split domain schemas
- Prompt too large → split prompt builders and constants

Exception format (avoid if possible):
```
// FILE LENGTH EXCEPTION:
// Reason:
// Refactor plan:
```

---

## No Sensitive Analytics

Decision text is sensitive. Never log full content to:
- Analytics events
- Console logs in production
- Crash logs
- External tracking
- Payment metadata

Log only:
- Decision ID (not content)
- Feature usage counts
- Generic event types

---

## No Placeholder Production Flows

Production-critical paths must be fully functional before release:
- Authentication
- Payment/subscription
- Data persistence
- AI analysis pipeline

If a flow is incomplete, gate it behind a feature flag or disable the entry point.

---

## Ask Before Destructive Changes

Destructive actions require explicit user permission:
- Deleting files
- Overwriting code
- Mass refactors
- Database migrations that drop data
- API breaking changes

---

## Build Working Vertical Slices

Implement complete features end-to-end, not horizontal layers.

Good:
```
Create Decision screen
→ validation schema
→ repository function
→ Supabase insert
→ RLS policy
→ list screen reload
→ detail screen opens
```

Bad:
```
Build all UI screens first
Build all API routes second
Connect them later
```

---

## Document History

| Date | Change |
|------|--------|
| 2026-05-03 | Initial creation as part of Phase 0 |
