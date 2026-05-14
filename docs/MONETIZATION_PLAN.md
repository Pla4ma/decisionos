# DecisionOS — Monetization Plan

## Purpose

This document defines the monetization strategy, subscription tiers, paywall strategy, and RevenueCat integration for DecisionOS.

---

## Core Principle

DecisionOS is a premium product that provides genuine value. Free tier allows meaningful trial; Plus tier unlocks full capability for serious decision-makers.

---

## Subscription Tiers

### Free Tier

| Feature | Limit |
|---------|-------|
| AI analyses/month | 3 |
| Saved decisions | Unlimited |
| Basic analysis | Included |
| Basic scores | Included |
| Decision history | Last 10 decisions |
| Outcome reviews | Unlimited |
| Values profile | Basic |

### Plus Tier ($9.99/month)

| Feature | Benefit |
|---------|---------|
| AI analyses | Unlimited |
| Saved decisions | Unlimited |
| Advanced Gemini analysis | Deeper reasoning, more factors |
| Full score breakdown | All 5 dimensions with weights |
| Decision memory | Complete history + patterns |
| Review reminders | Scheduled check-ins |
| Regret simulator | "What if" scenario testing |
| Longer history | All decisions forever |
| Priority analysis | Faster AI responses |

### Future Pro Tier ($19.99/month)

| Feature | Benefit |
|---------|---------|
| Everything in Plus | All Plus features |
| PDF reports | Professional decision documents |
| Deep pattern intelligence | AI-powered decision insights |
| Voice input | Dictate decisions and options |
| Future self simulator | "What will I think in 1 year?" |
| Advanced export | JSON, CSV, PDF with metadata |
| Encrypted private journal mode | Zero-knowledge encrypted storage |

---

## RevenueCat Integration

### Products

- `decisionos_plus_monthly` — Monthly subscription ($9.99)
- `decisionos_plus_annual` — Annual subscription ($99.99, 17% discount)

### Entitlements

- `plus` — Unlocks all Plus features
- `analysis_unlimited` — Removes 3/month analysis limit

---

## Usage Limits

### Server-Side Enforcement

All limits are enforced server-side to prevent bypassing:

```
Free: 3 analyses per calendar month
Plus: Unlimited analyses
```

### Limit Check Flow

1. Client requests analysis
2. Server checks user tier via RevenueCat webhook
3. Server checks monthly usage count
4. If free tier and count >= 3: return limit_exceeded
5. If plus tier or count < 3: proceed with Gemini analysis
6. Increment usage count after successful analysis

---

## Paywall Strategy

### Soft Paywall Triggers

- After 3rd AI analysis in a month ("You've used all 3 free analyses")
- When viewing pattern insights ("Unlock with Plus")
- Regret simulator feature ("Plus feature")

### Hard Paywall

- None in MVP; soft prompts preferred
- Analysis button disabled with upgrade prompt at limit

### Paywall Copy Guidelines

- Clear, non-manipulative language
- Focus on value, not FOMO
- No countdown timers or fake urgency
- Easy dismiss with "Not now" option

---

## Implementation Files

| File | Purpose |
|------|---------|
| `src/features/monetization/monetizationTypes.ts` | Type definitions |
| `src/features/monetization/revenueCatService.ts` | RevenueCat SDK wrapper |
| `src/features/monetization/entitlementService.ts` | Entitlement checks |
| `src/features/monetization/useEntitlements.ts` | React hook for entitlements |
| `supabase/functions/check-usage-limit/` | Server-side limit enforcement |
| `app/paywall/index.tsx` | Paywall screen |

---

## Document History

| Date | Change |
|------|--------|
| 2026-05-03 | Initial structure created in Phase 0 |
| 2026-05-03 | Updated for Phase 13 (Monetization Implementation) |
