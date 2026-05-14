# DecisionOS — Security Rules

## Purpose

This document defines security policies, data handling rules, and privacy protections for DecisionOS.

---

## Core Security Principles

1. **User data is sacred** — Decision content is private and sensitive
2. **Defense in depth** — Security at multiple layers (client, server, database)
3. **Transparency** — Clear privacy claims, no fake security theater
4. **AI safety** — Prevent harmful advice in sensitive domains

---

## Data Classification

### Sensitive Data (Decision Content) — HIGHEST PROTECTION

- Decision titles and descriptions
- Options being considered
- Context and background information
- User answers to guided questions
- Outcome notes and lessons learned
- Pros/cons for each option

**Handling Requirements:**
- ✅ Encrypted in transit (TLS 1.3)
- ✅ Encrypted at rest (Supabase default)
- ✅ **Never logged to analytics**
- ✅ **Never exposed in error messages**
- ✅ Row Level Security enforced
- ✅ User can export/delete (future feature)

### Personal Data — HIGH PROTECTION

- User ID (UUID)
- Email address
- Display name
- Subscription tier
- Account creation date

**Handling Requirements:**
- ✅ Protected by RLS
- ✅ Only user and system can access
- ✅ No email sharing with third parties
- ✅ Anonymized in analytics

### Usage Data — ANONYMIZED

- Feature usage counts (no content)
- Timing metrics (no content)
- Device type (anonymous)
- Session duration (no content)

**Handling Requirements:**
- ✅ Anonymized where possible
- ✅ No decision content in events
- ✅ Used for product improvement only
- ✅ No sale to third parties

---

## Specific Security Rules

### 1. Gemini API Key — SERVER-ONLY

```
❌ NEVER: Store Gemini key in client code
❌ NEVER: Expose key in environment variables accessible to client
✅ ALWAYS: Keep key in Edge Functions only
✅ ALWAYS: Rotate key if compromised
```

### 2. Analytics — NO SENSITIVE CONTENT

**Allowed Events:**
```
decision_created              (count only, no title)
decision_analyzed             (count only, no content)
decision_option_chosen        (count only)
decision_reviewed             (count only)
paywall_viewed                (count only)
subscription_started          (count only)
```

**Forbidden in Analytics:**
```
❌ Decision titles
❌ Full context text
❌ Option descriptions
❌ User answers/reflections
❌ Outcome notes
❌ Lessons learned
```

### 3. Row Level Security — REQUIRED

All tables must have RLS enabled:
```sql
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_reviews ENABLE ROW LEVEL SECURITY;
```

Policies must enforce: `user_id = auth.uid()`

### 4. Secure Session Storage

- Supabase Auth manages JWT tokens
- Tokens stored securely (AsyncStorage with encryption on native)
- Session expires after appropriate timeout
- Biometric auth encouraged at device level

### 5. AI Safety Detection — ACTIVE

Detect and handle these categories:

```
self-harm                → Crisis resources, no analysis
medical emergency        → Medical disclaimer, no advice
legal emergency          → Legal disclaimer, no advice
abuse/crisis             → Crisis resources, no analysis
mental health crisis     → Mental health resources, no analysis
investment advice        → Financial advisor disclaimer, no advice
```

**Rules:**
- Client-side pre-check for immediate response
- Server-side validation as backup
- Safe fallback message with resources
- Never overclaim detection accuracy

### 6. No Fake Privacy Claims

```
❌ "Military-grade encryption" (unless actually true)
❌ "100% secure" (impossible claim)
❌ "We never see your data" (we do, but protect it)
❌ "End-to-end encrypted" (not currently true)

✅ "Encrypted in transit and at rest"
✅ "Row Level Security enforced"
✅ "Your decision content stays private"
✅ "Export and delete coming soon"
```

### 7. Future Features (Disabled, Not Fake)

These features are planned but not implemented in MVP:

```
📋 Data Export (coming soon)
📋 Data Delete (coming soon)
📋 End-to-End Encryption (future)
📋 Biometric App Lock (future)
📋 Private Journal Mode (Pro tier, future)
```

**Rule:** Features must be visibly disabled, not fake-functional.

---

## Crisis Resources

When safety detection triggers, provide these resources:

```
National Suicide Prevention Lifeline: 988
Crisis Text Line: Text HOME to 741741
National Domestic Violence Hotline: 1-800-799-7233
SAMHSA National Helpline: 1-800-662-4357
```

---

## Incident Response

If security breach suspected:

1. Immediately rotate API keys
2. Review access logs
3. Assess data exposure
4. Notify affected users if required
5. Document and remediate

---

## Document History

| Date | Change |
|------|--------|
| 2026-05-03 | Initial structure created in Phase 0 |
| 2026-05-03 | Expanded for Phase 14 (Security, Privacy, Safety Guardrails) |
