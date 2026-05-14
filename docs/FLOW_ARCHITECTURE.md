# DecisionOS — Flow Architecture
This document is the single source of truth for every screen, every state transition, and every system interaction. 
If a flow isn't here, it doesn't exist.

---

## 1. THE THREE DAILY MODES

```
                    ┌─────────────────────────────────────┐
                    │      APP OPENS (Home Screen)         │
                    │         "Daily Briefing"             │
                    └─────────────────────────────────────┘
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
            ┌────────────┐ ┌────────┐ ┌────────┐
            │  CLARITY   │ │ DECIDE │ │REFLECT │
            │  PRACTICE  │ │ (3 min)│ │ (2 min)│
            │  (2 min)   │ │        │ │        │
            └────────────┘ └────────┘ └────────┘
                 │              │          │
                 ▼              ▼          ▼
            All paths lead back to Daily Briefing
            After practice → inbox feels natural
            After decide → practice feels earned
            After reflect → patterns feel insightful
```

**The app has exactly three daily modes. Every user action falls into one of these three.**

| Mode | Time | Purpose | Entry Point |
|------|------|---------|-------------|
| **PRACTICE** | 2 min | Sharpen clarity muscle, build streak | Daily Clarity Practice card (always first on home) |
| **DECIDE** | 3+ min | Make or advance a real decision | Decision Inbox, Quick Decision, Full Analysis |
| **REFLECT** | 2 min | Review outcomes, capture lessons | Quick Review prompt, Full Review, Future Self messages |

---

## 2. COMPLETE SCREEN MAP

Every route, its purpose, its inputs, and its valid transitions.

```
ROUTE MAP (expo-router file-based):
═══════════════════════════════════

/                                   → Daily Briefing (Home)
  │
  ├── /auth/sign-in                 → Email/password login
  ├── /auth/sign-up                 → Registration
  │
  ├── /onboarding                   → Welcome + values + privacy
  │   ├── /onboarding/privacy       → Privacy promises
  │   └── /onboarding/values        → Values selection
  │
  ├── /decisions                    → Full decision history list
  │   ├── /decisions/new            → Create decision (3 modes)
  │   │   ├── ?quick=true           → Quick Mode (2 min)
  │   │   ├── ?practice=true        → Practice Mode (scenarios)
  │   │   └── (no param)            → Full Mode (guided flow)
  │   └── /decisions/[id]           → Decision detail
  │       ├── /decisions/[id]/analysis      → AI analysis report
  │       ├── /decisions/[id]/commit        → Choose option + predict
  │       ├── /decisions/[id]/schedule      → Set review reminder
  │       └── /decisions/[id]/review        → Full outcome review
  │
  ├── /paywall                      → Upgrade to Plus/Pro
  └── /settings                     → Account, privacy, data
```

### Decision Status State Machine

```
                    ┌─────────┐
                    │  DRAFT  │ ← Also: Decision Inbox → convert to decision
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │QUESTIONS│ ← (skipped in Quick Mode)
                    └────┬────┘
                         │
              ┌──────────▼──────────┐
              │ READY_FOR_ANALYSIS  │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │      ANALYZED       │ ← AI analysis complete, scores ready
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │       CHOSEN        │ ← User committed to an option
              └──────────┬──────────┘
                         │
              ╔══════════╪══════════╗
              ║ 48h later║          ║
              ║ ┌────────▼──────┐   ║
              ║ │ QUICK_REVIEW  │   ║ ← Emoji check-in (10 seconds)
              ║ └────────┬──────┘   ║
              ║          │          ║
              ╚══════════╪══════════╝
                         │
              ┌──────────▼──────────┐
              │  REVIEW_SCHEDULED   │ ← 7-90 day timer set
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │      REVIEWED       │ ← Full outcome captured
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │      ARCHIVED       │ ← Moved to graveyard
              └─────────────────────┘
```

---

## 3. SYSTEM INTERACTION MAP

How every system connects to every other system. This is the data flow.

```
DAILY BRIEFING (Home Screen)
════════════════════════════
│
├── [1] Daily Clarity Practice
│       ↓ completes → updates daily_practices table
│       ↓ streak → visible on home streak badge
│       ↓ response → feeds pattern recognition
│       ↓ skip → resets tomorrow
│
├── [2] Future Self Messages
│       ↓ generated weekly → stored in future_self_messages
│       ↓ read → updates DQ (shows engagement)
│       ↓ tone adapts to DQ archetype
│       ↓ content references recent decisions
│
├── [3] Pattern Insights
│       ↓ generated after 3+ decisions
│       ↓ reads from bias_detection_events
│       ↓ reads from decisions (category, velocity)
│       ↓ dismissed → supressed for 30 days
│       ↓ actionable → suggests behavior change
│
├── [4] Decision Inbox
│       ↓ add → stored in decision_inbox
│       ↓ tap → /decisions/new with pre-filled thought
│       ↓ convert → creates decision, marks processed
│       ↓ archive → hidden from inbox
│
├── [5] Quick Review Prompt
│       ↓ shows when decision is 48h past "chosen"
│       ↓ emoji picker → creates quick_review record
│       ↓ updates prediction calibration (DQ data point)
│       ↓ daily_check_in (streak)
│
├── [6] Daily Streak Banner
│       ↓ check-in → daily_check_in RPC
│       ↓ streak → used by Future Self letter generation
│       ↓ at risk → warning state
│
├── [7] Open Decisions List
│       ↓ each row → /decisions/[id]
│       ↓ status dot reflects state machine
│
├── [8] Quick Actions
│       ↓ "Quick Decision" → /decisions/new?quick=true
│       ↓ "Full Analysis" → /decisions/new
│       ↓ "History" → /decisions
│
└── [9] All data refreshes on pull-to-refresh
```

### Decision Creation Flow (3 modes)

```
USER INTENT: "I need to decide something"
                    │
                    ▼
          ┌─────────────────────┐
          │  How much time?     │
          └──────┬──────────────┘
                 │
     ┌───────────┼──────────────┐
     ▼           ▼              ▼
┌─────────┐ ┌──────────┐ ┌──────────┐
│ QUICK   │ │ FULL     │ │ JOURNAL  │
│ (2 min) │ │ (10 min) │ │ (5 min)  │
└────┬────┘ └────┬─────┘ └────┬─────┘
     │           │            │
     ▼           ▼            ▼
┌─────────┐ ┌──────────┐ ┌──────────┐
│Title +  │ │Step 1-4: │ │Write     │
│2options │ │Basics →  │ │freely,   │
│→submit  │ │Options → │ │auto-     │
│         │ │Questions │ │extract   │
│         │ │→ Review  │ │decision  │
└────┬────┘ └────┬─────┘ └────┬─────┘
     │           │            │
     └───────────┼────────────┘
                 ▼
          ┌──────────────┐
          │ ready_for_   │
          │ analysis     │
          └──────┬───────┘
                 ▼
          ┌──────────────┐
          │ AI Analysis  │ ← Edge Function calls Gemini
          │ (5-10 sec)   │
          └──────┬───────┘
                 ▼
          ┌──────────────┐
          │   analyzed   │
          │ Show Scores  │
          └──────┬───────┘
```

---

## 4. THE DAILY CLARITY PRACTICE LOOP

This is the most important loop in the app. It fires once per day, every day.

```
┌─────────────────────────────────────────────────────────────────┐
│                    DAILY CLARITY PRACTICE                        │
│                                                                  │
│  ┌────────────┐    ┌───────────┐    ┌─────────────┐             │
│  │  PROMPT    │ →  │  WRITE    │ →  │  REFLECT    │ → COMPLETE │
│  │  (read)    │    │  (free)   │    │  (1 insight)│            │
│  └────────────┘    └───────────┘    └─────────────┘             │
│       │                  │                  │                    │
│       ▼                  ▼                  ▼                    │
│  Type cycled       Response saved     Reflection saved          │
│  daily:            to DB             to DB                      │
│  - morning_reflect                                            │
│  - daily_dilemma                                               │
│  - values_check                                                │
│  - bias_spotting                                               │
│  - future_self_message                                         │
│                                                                  │
│  AFTER COMPLETE:                                                 │
│  - Streak incremented                                            │
│  - daily_check_in RPC (streak)                                   │
│  - Response data → pattern recognition weights                   │
│  - If streak % 7 == 0 → Future Self letter generated             │
│                                                                  │
│  IF SKIPPED:                                                     │
│  - Recorded as incomplete (is_completed = false)                 │
│  - Same prompt will NOT show again (daily_practices has UNIQUE)  │
│  - Tomorrow = new prompt                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. THE FUTURE SELF LOOP (Weekly)

```
┌──────────────────────────────────────────────────────────┐
│                  FUTURE SELF LOOP                         │
│                                                          │
│  TRIGGER: Weekly (Sunday) OR user milestone              │
│           (first review, DQ archetype change, etc.)      │
│                                                          │
│  GENERATION:                                             │
│  1. Check: no message sent in last 7 days                │
│  2. Read: user's DQ score, archetype, streak,            │
│     overdue reviews, recent decisions                    │
│  3. Select: tone based on DQ (low=stern, high=encourage) │
│  4. Write: template letter with personalized context     │
│  5. Insert: into future_self_messages table              │
│  6. User sees: on home screen as unread message          │
│                                                          │
│  CONSUMPTION:                                            │
│  - User taps card → reads full message                   │
│  - markAsRead() → badge clears                           │
│  - User can dismiss (archive)                            │
│  - Unread count shows on home screen                     │
│                                                          │
│  DATA FEEDS (what the message references):               │
│  - dq.overall (your score improved to X)                 │
│  - dq.archetype (as a GAMBLER you should...)             │
│  - streak.current (you've practiced X days in a row)     │
│  - decisions pending review (you haven't checked Y)      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 6. PATTERN RECOGNITION LOOP (Event-Driven)

```
┌────────────────────────────────────────────────────────────┐
│                  PATTERN RECOGNITION                        │
│                                                             │
│  TRIGGERS (any of these):                                   │
│  - Decision reviewed (status → "reviewed")                  │
│  - Bias detected (bias_detection_events insert)             │
│  - 3rd+ decision created                                   │
│  - Manual refresh from home screen                         │
│                                                             │
│  GENERATION (usePatternRecognition.refreshInsights):        │
│  1. Query last 20 decisions                                 │
│  2. Analyze by category, velocity, satisfaction             │
│  3. Check bias detection events for recurring biases        │
│  4. Generate PatternInsight[] from analysis                 │
│  5. Insert any NEW insights (no duplicates)                 │
│                                                             │
│  TYPES OF INSIGHTS GENERATED:                               │
│  - CATEGORY_TENDENCY: "Your X decisions aren't satisfying"  │
│  - VELOCITY_PATTERN: "You rush high-stakes decisions"       │
│  - BIAS_PATTERN: "Confirmation bias keeps appearing"         │
│  - SATISFACTION_TREND: "Your satisfaction is improving"      │
│                                                             │
│  CONSUMPTION:                                               │
│  - Card appears on home screen below Future Self            │
│  - Shows severity badge (mild/moderate/significant)         │
│  - Dismiss → is_dismissed = true, hidden from home          │
│  - Tap action → navigates to relevant screen                │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 7. DECISION INBOX LOOP

```
┌────────────────────────────────────────────────────────────┐
│                 DECISION INBOX                              │
│                                                             │
│  CAPTURE (multiple entry points):                           │
│  - Home screen inbox card: type + press +                   │
│  - Quick capture from anywhere: (future: widget)            │
│  - Share extension from other apps (future)                 │
│                                                             │
│  PROCESSING:                                                │
│  - Each item has category auto-detected from text           │
│  - Unprocessed items shown with dot indicator               │
│  - Tap item → navigates to /decisions/new?thought=X         │
│  - When decision created → markProcessed(id, decisionId)    │
│  - Archive → hidden, not deleted                            │
│                                                             │
│  EDGE CASES:                                                │
│  - Duplicate thought: based on 80% string similarity        │
│  - Empty thought: rejected (min 3 chars)                    │
│  - Stale items: auto-archive after 30 days (future)        │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 8. COMPLETE DATA FLOW DIAGRAM

```
                         ┌───────────┐
                         │  SUPABASE │
                         └─────┬─────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                     │
          ▼                    ▼                     ▼
   ┌────────────┐      ┌──────────────┐     ┌─────────────┐
   │  READS     │      │   WRITES     │     │  EDGE FUNCS │
   │ (queries)  │      │ (mutations)  │     │  (Deno)     │
   └────────────┘      └──────────────┘     └─────────────┘
          │                    │                     │
          ▼                    ▼                     ▼
   ┌─────────────────────────────────────────────────────┐
   │                 ZUSTAND STORES                       │
   │  ┌──────────────┐  ┌──────────────────────┐        │
   │  │ appStore     │  │ decisionDraftStore   │        │
   │  │ (isLoaded)   │  │ (multi-step draft)   │        │
   │  └──────────────┘  └──────────────────────┘        │
   └─────────────────────────────────────────────────────┘
          │                    │
          ▼                    ▼
   ┌─────────────────────────────────────────────────────┐
   │                    REACT QUERY                       │
   │  (auto-caching, background refresh, stale-while-    │
   │   revalidate, optimistic updates, error recovery)   │
   │                                                     │
   │  Query Keys:                                        │
   │  ['decisions']      ['decision', id]                │
   │  ['options', id]    ['analysis', id]                │
   │  ['review', id]     ['streak', userId]              │
   │  ['dailyStreak']    ['dailyPractice']               │
   │  ['futureSelf']     ['patternInsights']             │
   │  ['decisionInbox']  ['journalEntries']              │
   │  ['dq']             ['chapters']                    │
   │  ['graveyard']      ['cbmi']                        │
   │  ['secondOpinion']  ['challenges']                  │
   └─────────────────────────────────────────────────────┘
          │
          ▼
   ┌─────────────────────────────────────────────────────┐
   │                  UI LAYER                            │
   │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
   │  │ Screens  │  │Components│  │ Custom Hooks     │  │
   │  │ (routes) │  │(reusable)│  │ (business logic) │  │
   │  └──────────┘  └──────────┘  └──────────────────┘  │
   └─────────────────────────────────────────────────────┘
```

---

## 9. NAVIGATION DECISION TREE

For every user action, the exact navigation target:

| User Action | Target Route | Animation |
|------------|-------------|-----------|
| Tap "Quick Decision" | `/decisions/new?quick=true` | slide from right |
| Tap "Full Analysis" | `/decisions/new` | slide from right |
| Tap decision row | `/decisions/[id]` | slide from right |
| Tap "Start Writing" (practice) | (stays on home) | inline expand |
| Tap "Read" (Future Self) | (stays on home) | inline expand |
| Tap inbox item | `/decisions/new?thought=X` | slide from right |
| Tap quick review emoji | (stays on home) | dismiss card |
| Tap "Review" | `/decisions/[id]/review` | slide from right |
| Tap "Schedule" | `/decisions/[id]/schedule` | slide from right |
| Tap "Settings gear" | `/settings` | slide from right |
| Tap "Upgrade" | `/paywall` | modal |
| Pull to refresh | (stays on home) | refresh indicator |
| Notification tap | `/decisions/[id]` | deep link |
| Tap streak banner | (stays on home) | checkIn() call |

---

## 10. ERROR STATES & EDGE CASES

Every screen handles these four states consistently (pattern from ErrorState.tsx):

```
┌────────────────────────────────────────────┐
│            SCREEN STATE MACHINE             │
│                                             │
│  isLoading → show LoadingState component    │
│       │                                     │
│       ▼                                     │
│  error → show ErrorState + retry button     │
│       │                                     │
│       ▼                                     │
│  empty → show EmptyState + action CTA       │
│       │                                     │
│       ▼                                     │
│  data → render content                      │
│                                             │
└────────────────────────────────────────────┘
```

### Edge Case Matrix

| Scenario | Behavior |
|----------|----------|
| No decisions exist | "Clarity Practice" card first, then "Inbox" with CTA "Capture your first thought" |
| Daily practice already done | Show "✓ Today's Practice Complete" card with streak count |
| All inbox items processed | Show "Nothing pending — capture a new thought" |
| No Future Self messages | Card is absent (not shown as empty state) |
| No pattern insights | Card is absent |
| Network offline | ErrorState with "No internet" and cached data from React Query |
| AI analysis fails | ErrorState with "Analysis failed — tap to retry" |
| Navigation to nonexistent decision | ErrorState "Decision not found" with back button |
| Quick review already submitted | Card absent — prompt won't show again for this decision |
| Streak at 0 | "Start your streak" CTA on banner |

---

## 11. ROUTE CONSTANTS

These constants should be used for ALL navigation to prevent broken links.

```
ROUTES = {
  HOME: '/',
  SIGN_IN: '/auth/sign-in',
  SIGN_UP: '/auth/sign-up',
  ONBOARDING: '/onboarding',
  ONBOARDING_PRIVACY: '/onboarding/privacy',
  ONBOARDING_VALUES: '/onboarding/values',
  DECISIONS_LIST: '/decisions',
  DECISIONS_NEW: '/decisions/new',
  DECISIONS_NEW_QUICK: '/decisions/new?quick=true',
  DECISIONS_NEW_PRACTICE: '/decisions/new?practice=true',
  DECISION_DETAIL: (id: string) => `/decisions/${id}`,
  DECISION_ANALYSIS: (id: string) => `/decisions/${id}/analysis`,
  DECISION_COMMIT: (id: string) => `/decisions/${id}/commit`,
  DECISION_SCHEDULE: (id: string) => `/decisions/${id}/schedule`,
  DECISION_REVIEW: (id: string) => `/decisions/${id}/review`,
  PAYWALL: '/paywall',
  SETTINGS: '/settings',
} as const;
```

---

## 12. RETENTION ARCHITECTURE SUMMARY

How every system maps to the retention curve:

```
D1 (Day 1):  Daily Clarity Practice (2 min) → Immediate value
            Decision Inbox capture → Low friction first use
            Quick Decision (2 min) → First full loop in 5 min total

D7 (Day 7):  Daily streak at risk → Loss aversion
            Future Self letter arrives → Emotional connection
            Quick Review prompt → First completed loop

D30 (Month 1): Pattern insights fire → "The app knows me"
              DQ archetype progression visible → Identity investment
              Life Chapter grade → Macro narrative

D90 (Month 3): Deep pattern history → Switching cost (data moat)
              Future Self persona relationship → Emotional moat
              Second Opinion network → Network effect
              Decision Graveyard collection → Nostalgia / sunk cost

LTV:        Plus conversion when free analyses exhausted
            Pro conversion when pattern insights become valuable
            Retention driven by: practice streak + future self + data moat
```

---

*This document is the source of truth for all navigation and flow decisions.
If a screen, transition, or state is not documented here, it does not belong in the codebase.*
