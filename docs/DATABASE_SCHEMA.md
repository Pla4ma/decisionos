# DecisionOS — Database Schema

## Purpose

Complete documentation of the Supabase PostgreSQL database schema for DecisionOS, including tables, relationships, RLS policies, and privacy considerations.

---

## Schema Overview

DecisionOS uses a privacy-first multi-tenant architecture with Row Level Security (RLS) policies ensuring users can only access their own data. All user-generated content is isolated per-user.

---

## Tables

### profiles

Extended user profile information beyond Supabase Auth.

**Purpose:** Store user preferences and subscription state

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | - | PK, references auth.users(id) |
| created_at | timestamptz | now() | auto |
| updated_at | timestamptz | now() | auto |
| display_name | text | null | User's chosen name |
| onboarding_completed | boolean | false | Initial setup status |
| values_profile | jsonb | {} | User's identified values |
| free_analyses_used | integer | 0 | Current month usage |
| free_analyses_limit | integer | 3 | Monthly limit |
| subscription_tier | text | 'free' | 'free' or 'plus' |
| subscription_expires_at | timestamptz | null | Plus expiration |

**Relationships:**
- `id` → `auth.users(id)` — One-to-one with auth user

**RLS Policies:**
```sql
SELECT: auth.uid() = id
INSERT: auth.uid() = id
UPDATE: auth.uid() = id
DELETE: auth.uid() = id
```

**Indexes:**
- `profiles_pkey` (id)

**Privacy Notes:**
- No PII beyond display_name
- values_profile encrypted at rest

---

### decisions

Main decision records.

**Purpose:** Store user decisions with status workflow

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | gen_random_uuid() | PK |
| user_id | uuid | - | FK to profiles(id) |
| title | text | - | Decision title (5-200 chars) |
| context | text | null | Additional context |
| category | text | - | Category enum |
| status | text | 'draft' | Workflow status |
| importance | integer | 5 | 1-10 scale |
| urgency | integer | 5 | 1-10 scale |
| created_at | timestamptz | now() | auto |
| updated_at | timestamptz | now() | auto |
| scheduled_review_at | timestamptz | null | Review reminder |
| completed_at | timestamptz | null | When decision finalized |

**Relationships:**
- `user_id` → `profiles(id)` — Many-to-one
- One decision has many options, answers, analysis, reviews

**RLS Policies:**
```sql
SELECT: auth.uid() = user_id
INSERT: auth.uid() = user_id
UPDATE: auth.uid() = user_id
DELETE: auth.uid() = user_id
```

**Indexes:**
- `decisions_pkey` (id)
- `decisions_user_id_idx` (user_id)
- `decisions_status_idx` (status)
- `decisions_category_idx` (category)

**Privacy Notes:**
- Decision content is user-private
- Never logged to analytics in full
- AI analysis processes but doesn't store full text

---

### decision_options

Options/alternatives for each decision.

**Purpose:** Store decision alternatives with pros/cons

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | gen_random_uuid() | PK |
| decision_id | uuid | - | FK to decisions(id) |
| user_id | uuid | - | FK to profiles(id) |
| title | text | - | Option title |
| description | text | null | Detailed description |
| pros | text[] | {} | Array of pros |
| cons | text[] | {} | Array of cons |
| is_chosen | boolean | false | User's final choice |
| created_at | timestamptz | now() | auto |
| updated_at | timestamptz | now() | auto |

**Relationships:**
- `decision_id` → `decisions(id)` — Many-to-one
- `user_id` → `profiles(id)` — Many-to-one

**RLS Policies:**
```sql
SELECT: auth.uid() = user_id
INSERT: auth.uid() = user_id
UPDATE: auth.uid() = user_id
DELETE: auth.uid() = user_id
```

**Indexes:**
- `decision_options_pkey` (id)
- `decision_options_decision_id_idx` (decision_id)
- `decision_options_user_id_idx` (user_id)

**Privacy Notes:**
- Option content tied to private decisions
- Cascade delete with decision

---

### decision_answers

User's answers to guided questions.

**Purpose:** Store structured decision context from guided flow

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | gen_random_uuid() | PK |
| decision_id | uuid | - | FK to decisions(id) |
| user_id | uuid | - | FK to profiles(id) |
| question_key | text | - | Question identifier |
| answer | text | - | User's answer |
| created_at | timestamptz | now() | auto |
| updated_at | timestamptz | now() | auto |

**Relationships:**
- `decision_id` → `decisions(id)` — Many-to-one
- `user_id` → `profiles(id)` — Many-to-one

**RLS Policies:**
```sql
SELECT: auth.uid() = user_id
INSERT: auth.uid() = user_id
UPDATE: auth.uid() = user_id
DELETE: auth.uid() = user_id
```

**Indexes:**
- `decision_answers_pkey` (id)
- `decision_answers_decision_id_idx` (decision_id)
- `decision_answers_user_id_idx` (user_id)

**Privacy Notes:**
- Answers may contain sensitive personal context
- Never included in analytics/logs

---

### decision_analysis

AI-generated analysis results.

**Purpose:** Store Gemini AI analysis with scores

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | gen_random_uuid() | PK |
| decision_id | uuid | - | FK to decisions(id) |
| user_id | uuid | - | FK to profiles(id) |
| option_scores | jsonb | {} | Structured scores per option |
| summary | text | - | AI-generated summary |
| factors_considered | text[] | {} | Key factors analyzed |
| confidence_level | integer | 0 | 0-100 AI confidence |
| created_at | timestamptz | now() | auto |

**Relationships:**
- `decision_id` → `decisions(id)` — One-to-one
- `user_id` → `profiles(id)` — Many-to-one

**RLS Policies:**
```sql
SELECT: auth.uid() = user_id
INSERT: auth.uid() = user_id
UPDATE: auth.uid() = user_id
DELETE: auth.uid() = user_id
```

**Indexes:**
- `decision_analysis_pkey` (id)
- `decision_analysis_decision_id_idx` (decision_id)
- `decision_analysis_user_id_idx` (user_id)

**Privacy Notes:**
- Analysis references but doesn't duplicate decision content
- AI processing happens server-side
- No decision text sent to third-party analytics

---

### decision_reviews

Post-decision outcome tracking.

**Purpose:** Store decision outcomes for learning loop

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | gen_random_uuid() | PK |
| decision_id | uuid | - | FK to decisions(id) |
| user_id | uuid | - | FK to profiles(id) |
| chosen_option_id | uuid | - | FK to decision_options(id) |
| outcome_notes | text | - | What happened |
| satisfaction_score | integer | null | 1-10 satisfaction |
| would_choose_same | boolean | null | Retrospective choice |
| lessons_learned | text | null | Insights for future |
| created_at | timestamptz | now() | auto |
| updated_at | timestamptz | now() | auto |

**Relationships:**
- `decision_id` → `decisions(id)` — One-to-one
- `chosen_option_id` → `decision_options(id)` — Many-to-one
- `user_id` → `profiles(id)` — Many-to-one

**RLS Policies:**
```sql
SELECT: auth.uid() = user_id
INSERT: auth.uid() = user_id
UPDATE: auth.uid() = user_id
DELETE: auth.uid() = user_id
```

**Indexes:**
- `decision_reviews_pkey` (id)
- `decision_reviews_decision_id_idx` (decision_id)
- `decision_reviews_user_id_idx` (user_id)

**Privacy Notes:**
- Outcome data helps personal pattern learning
- Never shared or used for training

---

### subscriptions

RevenueCat subscription sync.

**Purpose:** Track subscription state from RevenueCat

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | gen_random_uuid() | PK |
| user_id | uuid | - | FK to profiles(id) |
| revenuecat_customer_id | text | - | RevenueCat identifier |
| tier | text | 'free' | 'free' or 'plus' |
| expires_at | timestamptz | null | Subscription expiration |
| created_at | timestamptz | now() | auto |
| updated_at | timestamptz | now() | auto |

**Relationships:**
- `user_id` → `profiles(id)` — One-to-one

**RLS Policies:**
```sql
SELECT: auth.uid() = user_id
INSERT: auth.uid() = user_id
UPDATE: auth.uid() = user_id
DELETE: auth.uid() = user_id
```

**Indexes:**
- `subscriptions_pkey` (id)
- `subscriptions_user_id_idx` (user_id)
- `subscriptions_revenuecat_idx` (revenuecat_customer_id)

**Privacy Notes:**
- Minimal data synced from RevenueCat
- No payment details stored

---

### ai_usage_events

AI analysis usage tracking.

**Purpose:** Track free tier usage and billing

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | gen_random_uuid() | PK |
| user_id | uuid | - | FK to profiles(id) |
| decision_id | uuid | - | FK to decisions(id) |
| event_type | text | - | 'analysis', 'follow_up' |
| created_at | timestamptz | now() | auto |

**Relationships:**
- `user_id` → `profiles(id)` — Many-to-one
- `decision_id` → `decisions(id)` — Many-to-one

**RLS Policies:**
```sql
SELECT: auth.uid() = user_id
INSERT: service_role only (edge function)
```

**Indexes:**
- `ai_usage_events_pkey` (id)
- `ai_usage_events_user_id_idx` (user_id)
- `ai_usage_events_created_at_idx` (created_at)

**Privacy Notes:**
- No decision content stored
- Only metadata for usage tracking

---

### decision_pattern_insights

Personal decision pattern analysis.

**Purpose:** Store insights for user's decision patterns

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | gen_random_uuid() | PK |
| user_id | uuid | - | FK to profiles(id) |
| insight_type | text | - | 'strength', 'bias', 'pattern', 'suggestion' |
| title | text | - | Short insight title |
| description | text | - | Detailed explanation |
| evidence_count | integer | 0 | Number of decisions supporting |
| created_at | timestamptz | now() | auto |
| updated_at | timestamptz | now() | auto |

**Relationships:**
- `user_id` → `profiles(id)` — Many-to-one

**RLS Policies:**
```sql
SELECT: auth.uid() = user_id
INSERT: auth.uid() = user_id
UPDATE: auth.uid() = user_id
DELETE: auth.uid() = user_id
```

**Indexes:**
- `decision_pattern_insights_pkey` (id)
- `decision_pattern_insights_user_id_idx` (user_id)

**Privacy Notes:**
- Insights are personal and private
- Generated from user's own history only

---

## Entity Relationships

```
profiles (1)
├── decisions (n)
│   ├── decision_options (n)
│   ├── decision_answers (n)
│   ├── decision_analysis (1)
│   └── decision_reviews (1)
├── ai_usage_events (n)
├── decision_pattern_insights (n)
└── subscriptions (1)
```

## RLS Strategy Summary

**Universal Policy:** All user-owned tables enforce `user_id = auth.uid()`

**Exceptions:**
- `ai_usage_events` — Insert restricted to service_role (edge functions)
- All tables have RLS enabled by default

## Indexes Summary

**Every table has:**
- Primary key index
- `user_id` index for RLS performance
- Foreign key indexes for join performance

**Additional indexes:**
- `decisions`: status, category for filtering
- `ai_usage_events`: created_at for time-range queries

## Privacy & Security

**Data Classification:**
- **Highly Sensitive:** decision.content, decision_answers.answer, decision_reviews.outcome_notes
- **Sensitive:** decision_options.title, profiles.values_profile
- **Internal:** analysis scores, usage metadata

**Never Logged:**
- Full decision text
- User answers
- Outcome notes

**Encrypted at Rest:**
- All user-generated content via Supabase default

---

## Document History

| Date | Change |
|------|--------|
| 2026-05-03 | Initial structure created in Phase 0 |
| 2026-05-03 | Complete schema documentation (Phase 5) |
