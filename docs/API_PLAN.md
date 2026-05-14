# DecisionOS — API Plan

## Purpose

This document defines the API architecture for DecisionOS, including Supabase Edge Functions, client-side services, and integration patterns.

---

## Architecture Overview

### Backend

- **Supabase Edge Functions** — Serverless TypeScript functions
- **Supabase Auth** — Authentication and user management
- **Supabase Database** — PostgreSQL with RLS
- **Gemini API** — AI analysis (server-side only)

### Client

- **Expo / React Native** — Mobile application
- **TanStack Query** — Data fetching and caching
- **Zustand** — Local state management

---

## Edge Functions

### Implemented

| Function | Purpose | Status |
|----------|---------|--------|
| `analyze-decision` | Gemini-powered decision analysis | ✅ Phase 9 |

### Planned

| Function | Purpose | Phase |
|----------|---------|-------|
| `check-subscription` | Verify subscription status | Phase 6 |
| `sync-revenuecat` | RevenueCat webhook handler | Phase 6 |

---

## analyze-decision Edge Function

### Purpose
Analyzes a decision using Google's Gemini AI to provide structured insights and option scoring.

### Location
`supabase/functions/analyze-decision/index.ts`

### Input

```typescript
{
  decisionId: string;  // UUID of decision to analyze
}
```

### Auth Requirements
- Valid JWT in Authorization header
- User must own the decision

### Subscription Requirements
- Free tier: 3 analyses per month
- Premium: Unlimited analyses
- Checks `ai_usage_events` table for current month usage

### Gemini Usage
- **Model**: gemini-1.5-flash-latest (for speed) or gemini-1.5-pro (for complex decisions)
- **Key Location**: Server environment variable `GEMINI_API_KEY` (never client-side)
- **Temperature**: 0.3 (consistent, deterministic output)
- **Max Tokens**: 4000
- **Request Timeout**: 30 seconds

### Output Schema

```typescript
{
  optionScores: OptionScore[];
  summary: string;
  factorsConsidered: string[];
  confidenceLevel: number;  // 0-100
  uncertaintyNotes: string[];
  hiddenAssumptions: string[];
  missingInformation: string[];
  nextSteps: string[];
}

interface OptionScore {
  optionId: string;
  optionTitle: string;
  overallScore: number;  // 0-100
  scores: {
    regretRisk: number;      // 0-100 (lower is better)
    confidence: number;      // 0-100
    valuesAlignment: number;   // 0-100
    reversibility: number;     // 0-100
    risk: number;             // 0-100 (lower is better)
  };
  reasoning: string;
}
```

### Error Cases

| Error | HTTP Status | Message |
|-------|-------------|---------|
| Unauthorized | 401 | "Authentication required" |
| Decision not found | 404 | "Decision not found" |
| Not owner | 403 | "Access denied" |
| Usage limit exceeded | 429 | "Monthly analysis limit reached" |
| Options required | 400 | "At least 2 options required for analysis" |
| Gemini error | 502 | "AI service temporarily unavailable" |
| Invalid AI response | 502 | "Invalid analysis response" |

### Safety Rules

1. **No Medical/Legal/Therapy Advice**: Reject decisions with unsafe categories
2. **Uncertainty Acknowledged**: All scores include uncertainty notes
3. **Not Deterministic**: Output explicitly states scores are guidance, not guarantees
4. **Privacy**: Decision content not stored by Gemini, only ephemeral processing
5. **Rate Limiting**: 30-second timeout, 5 concurrent max per user

### Database Flow

1. Validate auth and decision ownership
2. Check usage limits via `checkAnalysisLimit()`
3. Load decision, options, and answers
4. Build prompt with context
5. Call Gemini API
6. Validate response against schema
7. Save analysis to `decision_analysis` table
8. Record usage in `ai_usage_events`
9. Update decision status to `analyzed`
10. Return analysis to client

---

## Client Services

### Implemented

| Service | Responsibility | Location |
|---------|---------------|----------|
| `decisionAnalysisService.ts` | Call Edge Function, handle errors | `src/features/decisions/` |

### Usage Pattern

```typescript
// Client calls service
const analysis = await analyzeDecision(decisionId);

// Service calls Edge Function
const { data, error } = await supabase.functions.invoke('analyze-decision', {
  body: { decisionId }
});

// On success, invalidate queries
queryClient.invalidateQueries({ queryKey: ['decision', decisionId] });
```

---

## Security Notes

### Gemini API Key
- **NEVER** in client code
- Stored as Supabase Function secret
- Rotated monthly
- Access logged

### Rate Limiting
- 3 free analyses per user per month
- Premium users: 50 analyses per month (soft limit with warnings)
- 30-second timeout on Edge Function
- 5 concurrent analyses per user max

### Data Privacy
- Decision content sent to Gemini is ephemeral
- Not used for model training (Gemini data policy)
- No decision text logged in function logs
- Only decision ID and timestamp stored in usage events

---

## Document History

| Date | Change |
|------|--------|
| 2026-05-03 | Initial structure created in Phase 0 |
| 2026-05-03 | Phase 9: Added analyze-decision documentation |
