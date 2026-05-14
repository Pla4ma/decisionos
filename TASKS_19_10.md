# TASKS.md — DecisionOS 19/10 Windsurf Execution System

> **Project:** DecisionOS  
> **Future ecosystem:** NeuroFlow  
> **Core promise:** Make better life decisions before they become regrets.  
> **AI provider:** Gemini  
> **Monetization:** Required from day one  
> **Platform:** Mobile-first  
> **Execution style:** Phased, strict, verification-heavy, anti-slop, production-minded  
> **Archive source:** The current project only contains the archived folder from the zip: `THIRD APP/` with `HomeScreenV2.tsx`, `productivity/`, `services/`, and `tests/`.

---

# 0. MASTER OPERATING INSTRUCTIONS FOR WINDSURF

## 0.0 The mission

Build **DecisionOS**, a serious AI-powered decision coach and decision memory system.

DecisionOS must not become:

- a generic Gemini wrapper
- a random chatbot
- a giant unfocused life OS
- a fake demo app
- a pile of pretty screens with no working flows
- a rushed archive refactor
- a productivity app pretending to be a decision app

DecisionOS must become:

- a structured decision intelligence product
- a privacy-first decision journal
- a personalized decision review system
- a monetizable mobile app
- the first focused product that can later expand into NeuroFlow

The winning loop is:

```txt
Create Decision
→ Add Options
→ Answer Guided Questions
→ Gemini Analysis
→ View Scores
→ Choose Option
→ Save Decision
→ Review Outcome Later
→ Learn Personal Pattern
```

---

# 1. GLOBAL ANTI-SLOP RULES

These rules apply to **every phase**.

## 1.1 No slop rule

Do not produce shallow, vague, rushed, fake, or placeholder work.

Bad work examples:

```txt
"TODO: implement later"
"Coming soon"
"Mock response"
"Placeholder analysis"
"Fake score"
"Hardcoded user"
"Temporary button"
"Any type everywhere"
"Basic screen for now"
"Will connect later"
```

If a feature is not ready, make it visibly disabled and documented.

## 1.2 No fake functionality

A screen cannot pretend to be functional if it is not.

Rules:

- Buttons must either work or be visibly disabled.
- Forms must validate real inputs.
- API calls must handle loading, success, and error states.
- Gemini analysis must come from the backend route, not hardcoded text.
- Paywall must not pretend to charge if RevenueCat is not connected.
- Analytics must not log sensitive content.
- Authentication must use real Supabase auth.

## 1.3 200-line source file limit

No source file should exceed **200 lines**.

This applies to:

```txt
.ts
.tsx
.js
.jsx
.sql where practical
```

If a file approaches 200 lines, split it.

Required splitting patterns:

```txt
Component too large → split child components
Screen too large → extract hooks/components/helpers
Service too large → split repository, parser, client, types
Schema too large → split domain schemas
Prompt too large → split prompt builders and constants
```

Exceptions require a comment in the file header:

```txt
// FILE LENGTH EXCEPTION:
// Reason:
// Refactor plan:
```

But avoid exceptions.

## 1.4 Anti-compression rule

Do not compress complex work into one giant file or one giant function.

Bad:

```txt
DecisionScreen.tsx contains UI, validation, Supabase calls, Gemini calls, paywall logic, and analytics.
```

Good:

```txt
DecisionScreen.tsx
useDecisionForm.ts
decisionRepository.ts
decisionSchemas.ts
DecisionOptionList.tsx
DecisionSubmitBar.tsx
```

## 1.5 One responsibility per file

Each file should answer one question:

```txt
What is this file responsible for?
```

If the answer uses “and” more than once, split the file.

## 1.6 Required acceptance criteria

Every task must have acceptance criteria.

Do not mark a task complete unless the acceptance criteria are met.

## 1.7 Required verification gate

Every phase has a **Verification Gate**.

A phase is not done until:

- the app builds or the relevant command passes
- TypeScript has no new avoidable errors
- files follow 200-line rule
- no placeholders remain in completed areas
- documentation is updated
- UI states exist where relevant
- tests exist where relevant
- integration path is verified

## 1.8 Required implementation notes

At the end of each phase, update:

```txt
docs/PHASE_LOG.md
```

With:

```md
## Phase X Completed

### What was built

### Files created

### Files changed

### Known limitations

### Tests/verification performed

### Follow-up tasks
```

## 1.9 No destructive archive changes

Do not delete archive files.

Allowed:

- inspect
- document
- copy small useful patterns
- move archive into `/archive` if safe
- reference archive files in notes

Not allowed without explicit user permission:

- delete
- overwrite
- mass refactor
- flatten archive
- rename large archive trees carelessly

## 1.10 UI quality rule

Every user-facing screen must have:

```txt
loading state
empty state where applicable
error state
success path
back navigation where applicable
safe area handling
keyboard handling where applicable
clear primary action
clear secondary/cancel action where applicable
```

## 1.11 Integration rule

If a feature touches multiple layers, verify the full path.

Example:

```txt
Create Decision screen
→ validation schema
→ repository function
→ Supabase insert
→ RLS policy
→ list screen reload
→ detail screen opens
```

Do not stop after UI.

## 1.12 Testing rule

For every core feature, add at least one of:

```txt
unit test
schema test
repository test
component test
manual QA checklist entry
```

For MVP-critical flows, add multiple.

## 1.13 Gemini safety rule

Gemini must never be treated as always correct.

All Gemini output must be:

- structured
- schema-validated
- checked for missing fields
- displayed with uncertainty
- prevented from giving medical/legal/crisis/investment advice
- stored only after validation

## 1.14 Privacy rule

Decision text is sensitive.

Never log full user decision content to:

- analytics
- console in production
- crash logs
- external tracking
- payment metadata

## 1.15 Monetization rule

Monetization must be part of the architecture from the beginning.

Do not bolt it on later.

Must include:

- free plan limits
- RevenueCat service foundation
- entitlement checks
- server-side usage limit
- paywall route
- UI showing remaining free analyses

## 1.16 Depth target

Each phase should represent roughly **2 hours of careful work**, not a rushed 5-minute pass.

For each phase:

- inspect
- implement
- split files properly
- integrate
- verify
- document
- test where practical

If a phase is too large, stop at the phase boundary and document what remains.

---

# 2. GLOBAL QUALITY BAR

## 2.1 Engineering quality

Required:

```txt
TypeScript strict mode
No avoidable `any`
Zod validation for forms and AI output
Clean feature folders
No giant files
No duplicate business logic
Centralized error handling
Environment variable validation
RLS on all user-owned tables
Backend Gemini calls only
```

## 2.2 Product quality

Required:

```txt
Clear value proposition
No generic chatbot UX
Decision-specific screens
Saved decision history
Outcome review loop
Scores explained in plain English
Privacy-first onboarding
Monetization visible but not predatory
```

## 2.3 UI quality

Required:

```txt
Dark premium style
Readable typography
Consistent spacing
Reusable cards/buttons/inputs
Real loading/error/empty states
Mobile-friendly forms
Keyboard-aware screens
Accessible touch targets
No cluttered dashboards
```

## 2.4 Business quality

Required:

```txt
Free plan
Plus plan
Usage limits
Paywall
Subscription architecture
RevenueCat integration plan
Analytics events without sensitive text
```

---

# 3. REQUIRED PROJECT FILES

Create these early and keep them updated:

```txt
TASKS.md
docs/PROJECT_CONTEXT.md
docs/RULES.md
docs/SKILLS.md
docs/MVP_SCOPE.md
docs/ARCHIVE_NOTES.md
docs/DATABASE_SCHEMA.md
docs/API_PLAN.md
docs/MONETIZATION_PLAN.md
docs/SECURITY_RULES.md
docs/DESIGN_SYSTEM.md
docs/ROADMAP.md
docs/TESTING_PLAN.md
docs/PHASE_LOG.md
docs/ANTI_SLOP_CHECKLIST.md
docs/UI_QA_CHECKLIST.md
docs/INTEGRATION_CHECKLIST.md
.env.example
```

---

# 4. PHASE EXECUTION FORMAT

Every phase follows this structure:

```txt
Phase goal
Estimated depth target
Tasks
Subtasks
Acceptance criteria
Anti-slop checklist
Verification gate
Phase log update
```

Windsurf must not skip the verification gate.

---

# PHASE 0 — PROJECT CONTROL, CONTEXT, AND ANTI-SLOP SYSTEM

## Phase goal

Set up the project brain before writing app code.

DecisionOS starts as a brand-new project with only an archive folder. This phase creates the rules and guardrails that stop Windsurf from rushing, generating slop, or overbuilding the wrong product.

## Estimated depth target

Spend the equivalent of a careful 2-hour setup.

Do not rush.

---

## 0.1 Create documentation structure

### Task

Create:

```txt
docs/
```

Inside it, create:

```txt
PROJECT_CONTEXT.md
RULES.md
SKILLS.md
MVP_SCOPE.md
ARCHIVE_NOTES.md
DATABASE_SCHEMA.md
API_PLAN.md
MONETIZATION_PLAN.md
SECURITY_RULES.md
DESIGN_SYSTEM.md
ROADMAP.md
TESTING_PLAN.md
PHASE_LOG.md
ANTI_SLOP_CHECKLIST.md
UI_QA_CHECKLIST.md
INTEGRATION_CHECKLIST.md
```

### Acceptance criteria

- Every file exists.
- Every file has a real heading and purpose section.
- No file is empty.
- No app feature work begins before these exist.

---

## 0.2 Write `docs/PROJECT_CONTEXT.md`

### Required content

```txt
Product: DecisionOS
Future ecosystem: NeuroFlow
Core promise: Make better life decisions before they become regrets.
AI provider: Gemini
Platform: mobile-first
Monetization: required from day one
```

### Must explain

DecisionOS is not:

```txt
generic chatbot
therapy app
medical app
legal app
investment advisor
full NeuroFlow life OS
```

DecisionOS is:

```txt
structured decision analyzer
decision memory system
personal clarity tool
outcome review loop
first product in a future NeuroFlow ecosystem
```

### Acceptance criteria

- The reader understands what to build.
- The reader understands what not to build.
- The document separates MVP from future vision.

---

## 0.3 Write `docs/RULES.md`

### Required sections

```md
# Rules

## No fake features
## No client-side Gemini keys
## No archive deletion
## No full NeuroFlow in MVP
## No slop
## 200-line file limit
## No sensitive analytics
## No placeholder production flows
## Ask before destructive changes
## Build working vertical slices
```

### Acceptance criteria

- Rules are command-style.
- Rules are strict.
- File explicitly bans fake AI outputs.

---

## 0.4 Write `docs/SKILLS.md`

### Required behavior

Windsurf must behave like:

```txt
senior mobile engineer
product strategist
privacy-first architect
monetization-aware developer
strict TypeScript engineer
QA-minded tester
careful archive inspector
```

### Required workflow

```txt
inspect before editing
implement small safe changes
split large files
validate all AI output
write acceptance criteria
add tests/checklists
document assumptions
surface blockers
avoid overbuilding
```

### Acceptance criteria

- File teaches Windsurf how to operate.
- File explicitly tells Windsurf not to compress work.

---

## 0.5 Write `docs/ANTI_SLOP_CHECKLIST.md`

### Required checklist

```md
# Anti-Slop Checklist

Before marking any task complete:

- [ ] No placeholder buttons
- [ ] No fake AI responses
- [ ] No TODO-only implementation
- [ ] No file over 200 lines unless documented
- [ ] No `any` unless justified
- [ ] UI has loading/error/empty states
- [ ] Data path is integrated
- [ ] Errors are handled
- [ ] Tests or manual QA added
- [ ] Docs updated
- [ ] No secrets exposed
- [ ] No sensitive text logged
- [ ] Feature works on real data
```

### Acceptance criteria

- Checklist exists.
- Checklist is referenced in every phase verification gate.

---

## 0.6 Write `docs/MVP_SCOPE.md`

### MVP includes

```txt
auth
onboarding
home screen
create decision
add options
guided questions
Gemini analysis
decision scores
saved history
decision detail
decision review/check-in
settings
dark mode
RevenueCat foundation
free usage limits
Plus plan
safe analytics
privacy basics
```

### MVP excludes

```txt
full NeuroFlow
team features
enterprise
marketplace
blockchain
quantum
AR/VR
social feed
public profiles
medical advice
legal advice
mental health crisis support
investment advice
full habit tracker
full finance tracker
```

### Acceptance criteria

- MVP scope is sharp.
- Excluded features are clearly banned from MVP 1.

---

## Phase 0 anti-slop checklist

- [ ] All docs created.
- [ ] No empty docs.
- [ ] No feature code written before rules.
- [ ] 200-line file limit documented.
- [ ] Anti-placeholder rules documented.
- [ ] Gemini backend-only rule documented.
- [ ] Monetization-from-day-one rule documented.

## Phase 0 verification gate

Run/check:

```txt
docs exist
TASKS.md exists
ANTI_SLOP_CHECKLIST.md exists
RULES.md contains no-fake-feature rule
PROJECT_CONTEXT.md clearly defines DecisionOS
MVP_SCOPE.md bans full NeuroFlow MVP
```

Manual verification:

- Open each doc file.
- Confirm every file has meaningful content.
- Confirm no app code was rushed before context.

Phase 0 is complete only if all docs exist and no required doc is empty.

---

# PHASE 1 — ARCHIVE INSPECTION AND PRESERVATION

## Phase goal

Preserve the archive, document it, and identify what can inspire DecisionOS without letting old code pollute the new app.

## Estimated depth target

Roughly 2 hours.

Do not rush archive inspection. The goal is not to import code. The goal is to understand what exists.

---

## 1.1 Locate archive root

### Task

Find the archive folder.

Expected:

```txt
THIRD APP/
```

Expected contents:

```txt
HomeScreenV2.tsx
productivity/
services/
tests/
```

### Acceptance criteria

- Archive root is identified.
- Exact folder name is recorded in `docs/ARCHIVE_NOTES.md`.
- No files are deleted.

---

## 1.2 Move archive into `/archive` if safe

### Task

If the old folder is at project root and safe to move, create:

```txt
archive/
```

Move:

```txt
THIRD APP/
```

to:

```txt
archive/THIRD APP/
```

### Rules

- Preserve folder structure.
- Do not flatten.
- Do not rename files.
- If unsure, document first and ask.

### Acceptance criteria

- Archive remains intact.
- No file count unexpectedly drops.
- Project source folders stay clean.

---

## 1.3 Create archive inventory

### Task

In `docs/ARCHIVE_NOTES.md`, document:

```txt
archive root
folder list
file count estimate
most relevant files
future-only files
MVP-banned files
tests/reference files
```

### Acceptance criteria

- Archive notes include real observed folder names.
- Notes do not rely only on assumptions.

---

## 1.4 High-value DecisionOS inspiration files

### Task

Document these as high-value references:

```txt
HomeScreenV2.tsx
productivity/ai/PersonalizedAICoach.ts
productivity/ai/PredictiveAnalyticsEngine.ts
productivity/analytics/ProductivityAnalytics.ts
productivity/core/ProductivityEngine.ts
productivity/goals/GoalTrackingService.ts
productivity/habits/HabitFormationService.ts
productivity/monetization/RealMonetizationService.ts
productivity/progression/RealProgressionService.ts
productivity/repositories/GoalRepository.ts
productivity/repositories/ProductivityRepository.ts
productivity/simulation/PredictiveLifeSimulation.ts
productivity/stores/ProductivityStore.ts
productivity/ui/components/GoalCreationForm.tsx
productivity/ui/hooks/useProductivity.ts
productivity/validation/ProductivityValidators.ts
services/auth.ts
services/supabaseAuth.ts
services/realtime.ts
services/DataAnalyticsService.ts
services/ArtificialIntelligenceService.ts
services/CyberSecurityService.ts
services/CloudComputingService.ts
```

### How to use

Use for inspiration only:

```txt
architecture ideas
naming ideas
UI patterns
validation ideas
repository patterns
monetization ideas
analytics concepts
```

Do not copy blindly.

### Acceptance criteria

- These files are listed in archive notes.
- Each is marked with possible use.
- No production import yet.

---

## 1.5 Future NeuroFlow inspiration files

### Task

Document these as later-stage references:

```txt
productivity/biometric/BiometricOptimizationSystem.ts
productivity/collaboration/CollaborationService.ts
productivity/collaboration/RealTimeCollaborationSystem.ts
productivity/enterprise/TeamAnalyticsSystem.ts
productivity/gamification/RealWorldRewardsSystem.ts
productivity/impact/ImpactMeasurementSystem.ts
productivity/integration/VEXProductivitySystem.ts
productivity/neuro/NeuroProductivitySystem.ts
productivity/security/AdvancedSecuritySystem.ts
productivity/verification/ElevenTenComprehensiveAudit.ts
productivity/verification/ElevenTenVerification.ts
```

### Acceptance criteria

- Marked as future only.
- Not imported into MVP.
- Not allowed to distract current build.

---

## 1.6 MVP-banned distraction files

### Task

Document these as archive-only for MVP:

```txt
productivity/blockchain/BlockchainAchievementSystem.ts
productivity/immersive/ARVREnvironments.ts
productivity/marketplace/GlobalProductivityMarketplace.ts
productivity/quantum/QuantumProductivityAlgorithms.ts
services/AdvancedMaterialsService.ts
services/BiotechnologyService.ts
services/BlockchainService.ts
services/DigitalTwinService.ts
services/EdgeComputingService.ts
services/EnvironmentalScienceService.ts
services/HolographicDisplayService.ts
services/InternetOfThingsService.ts
services/MedicalResearchService.ts
services/NanotechnologyService.ts
services/NeuralInterfaceService.ts
services/QuantumComputingService.ts
services/RoboticsAutomationService.ts
services/RoboticsService.ts
services/SpaceExplorationService.ts
services/VirtualRealityService.ts
```

### Acceptance criteria

- Explicitly banned from MVP.
- Listed in `ARCHIVE_NOTES.md`.
- No production code references them.

---

## 1.7 Inspect `HomeScreenV2.tsx` deeply

### Task

Read and summarize useful patterns from `HomeScreenV2.tsx`.

Look for:

```txt
component composition
hero card pattern
recommendation logic
quick action rail
daily check-in pattern
progress preview
state management pattern
navigation assumptions
styling assumptions
```

### Output

Add to `ARCHIVE_NOTES.md`:

```md
## HomeScreenV2 Useful Patterns

### Keep
### Adapt
### Avoid
### DecisionOS version
```

### Acceptance criteria

- Notes distinguish “keep” vs “adapt” vs “avoid.”
- DecisionOS home direction is documented.

---

## 1.8 Old tests policy

### Task

Document old `tests/` folder as reference only.

### Rules

- Do not treat old tests as current tests.
- Do not waste time fixing tests for missing old repositories.
- Use them later as testing inspiration.

### Acceptance criteria

- Old tests are documented.
- No old tests block MVP foundation.

---

## Phase 1 anti-slop checklist

- [ ] Archive file structure preserved.
- [ ] Archive documented before reuse.
- [ ] No old code blindly copied.
- [ ] Future-only files are not in MVP.
- [ ] HomeScreenV2 inspected deeply.
- [ ] Archive tests are not treated as current blockers.

## Phase 1 verification gate

Check:

```txt
docs/ARCHIVE_NOTES.md exists
archive root documented
HomeScreenV2 notes exist
MVP-banned files listed
high-value files listed
future-only files listed
```

Manual verification:

- Confirm archive folder still exists.
- Confirm no archive files were deleted.
- Confirm `src/` does not import archive files.

Update `docs/PHASE_LOG.md`.

---

# PHASE 2 — CLEAN APP FOUNDATION

## Phase goal

Create a clean Expo/React Native foundation with strict TypeScript, routing, environment handling, and clean folders.

## Estimated depth target

Roughly 2 hours.

Do not mix archive code into the clean foundation.

---

## 2.1 Confirm or initialize Expo TypeScript app

### Task

Check whether project has:

```txt
package.json
app.json or app.config.ts
app/
src/
```

If not, initialize a clean Expo TypeScript app.

### Required

```txt
Expo
React Native
TypeScript
Expo Router
```

### Acceptance criteria

- App can run.
- Initial route loads.
- TypeScript is configured.
- No archive code is imported.

---

## 2.2 Install core dependencies

### Required dependencies

```txt
expo-router
react-native-safe-area-context
react-native-screens
react-native-gesture-handler
react-native-reanimated
zustand
@tanstack/react-query
react-hook-form
zod
@supabase/supabase-js
expo-secure-store
expo-constants
```

### Monetization and analytics

```txt
react-native-purchases
posthog-react-native
```

### Optional styling

Choose one:

```txt
nativewind + tailwindcss
```

or:

```txt
custom theme tokens only
```

### Acceptance criteria

- Dependencies install.
- App still runs.
- No dependency errors.
- Choice of styling approach documented in `DESIGN_SYSTEM.md`.

---

## 2.3 Configure TypeScript strict mode

### Task

Update `tsconfig.json`.

Required:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Acceptance criteria

- Strict mode enabled.
- Avoidable `any` not introduced.
- New types are explicit.

---

## 2.4 Create source structure

### Task

Create:

```txt
app/
src/components/ui/
src/components/decisions/
src/components/home/
src/features/auth/
src/features/decisions/
src/features/ai/
src/features/monetization/
src/features/onboarding/
src/features/settings/
src/lib/
src/store/
src/theme/
src/types/
supabase/functions/
supabase/migrations/
```

### Acceptance criteria

- Structure exists.
- Folders are purposeful.
- No giant “utils” dumping ground.

---

## 2.5 Create environment handling

### Task

Create:

```txt
.env.example
src/lib/env.ts
```

### Required env variables

```txt
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_POSTHOG_KEY=
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=

# Server-only:
GEMINI_API_KEY=
```

### Rules

- `GEMINI_API_KEY` is never imported client-side.
- `env.ts` validates public env values.
- Missing env values produce readable errors.

### Acceptance criteria

- `.env.example` exists.
- Secrets are not committed.
- Env handling is centralized.

---

## 2.6 Create base app providers

### Task

Create providers:

```txt
src/lib/queryClient.ts
src/lib/analytics.ts
src/lib/errors.ts
```

Set up:

```txt
TanStack Query Provider
SafeAreaProvider
Gesture handler root
App error boundary if practical
```

### Acceptance criteria

- Providers are wired in `app/_layout.tsx`.
- App boots without errors.
- Query client has sane defaults.

---

## Phase 2 anti-slop checklist

- [ ] Clean app runs.
- [ ] No archive imports.
- [ ] Strict TypeScript enabled.
- [ ] Env system exists.
- [ ] File structure is clean.
- [ ] No file exceeds 200 lines.
- [ ] App provider setup is not crammed into one huge file.

## Phase 2 verification gate

Run/check:

```txt
npm install or equivalent completed
npx expo start works
npx tsc --noEmit
```

Manual verification:

- Open app.
- Confirm initial route loads.
- Confirm no Gemini key appears in client code.
- Confirm archive remains separate.

Update `docs/PHASE_LOG.md`.

---

# PHASE 3 — DESIGN SYSTEM AND APP SHELL

## Phase goal

Build a premium, calm, reusable UI foundation.

## Estimated depth target

Roughly 2 hours.

Do not build final features yet. Build the UI language and navigation shell.

---

## 3.1 Write `docs/DESIGN_SYSTEM.md`

### Required style

```txt
Clean Apple-style with dark premium AI aesthetic.
```

The app should feel:

```txt
calm
premium
trustworthy
intelligent
reflective
personal
```

Avoid:

```txt
cheap neon overload
childish gamification
generic chatbot styling
corporate dashboard clutter
fake futuristic UI
```

### Acceptance criteria

- Typography rules documented.
- Spacing rules documented.
- Color rules documented.
- Components documented.

---

## 3.2 Create theme token files

### Task

Create:

```txt
src/theme/colors.ts
src/theme/spacing.ts
src/theme/typography.ts
src/theme/radius.ts
src/theme/shadows.ts
```

### Acceptance criteria

- Tokens are exported.
- Components use tokens.
- No random magic colors in screens.

---

## 3.3 Create base UI components

### Task

Create:

```txt
src/components/ui/Screen.tsx
src/components/ui/Button.tsx
src/components/ui/Card.tsx
src/components/ui/TextField.tsx
src/components/ui/TextArea.tsx
src/components/ui/Badge.tsx
src/components/ui/LoadingState.tsx
src/components/ui/ErrorState.tsx
src/components/ui/EmptyState.tsx
src/components/ui/Divider.tsx
```

### Rules

- Each file under 200 lines.
- Components support variants only if needed.
- Do not over-generalize.
- Do not create a giant component library.

### Acceptance criteria

- Button has disabled/loading states.
- TextField/TextArea show validation errors.
- Screen handles safe area.
- Card supports basic layout.

---

## 3.4 Create route shell

### Task

Create routes:

```txt
app/_layout.tsx
app/index.tsx
app/onboarding/index.tsx
app/onboarding/privacy.tsx
app/onboarding/values.tsx
app/auth/sign-in.tsx
app/auth/sign-up.tsx
app/decisions/index.tsx
app/decisions/new.tsx
app/decisions/[id].tsx
app/decisions/[id]/analysis.tsx
app/decisions/[id]/review.tsx
app/paywall/index.tsx
app/settings/index.tsx
```

### Rules

- Placeholder route screens are allowed only as navigation scaffolding.
- Any placeholder must say “Scaffold only — not implemented.”
- Do not make fake interactive features.

### Acceptance criteria

- User can navigate between key routes.
- No broken route imports.
- No route file exceeds 200 lines.

---

## 3.5 Create UI QA checklist

### Task

Write:

```txt
docs/UI_QA_CHECKLIST.md
```

Required checklist:

```txt
safe area
keyboard behavior
loading state
empty state
error state
button states
form validation
readable text
touch target size
dark mode contrast
navigation back behavior
no fake buttons
```

### Acceptance criteria

- Checklist exists.
- Future phases reference it.

---

## Phase 3 anti-slop checklist

- [ ] UI components are reusable.
- [ ] No giant route files.
- [ ] Placeholder routes are clearly marked.
- [ ] No fake working buttons.
- [ ] Theme tokens used.
- [ ] UI QA checklist exists.

## Phase 3 verification gate

Run/check:

```txt
npx tsc --noEmit
npx expo start
```

Manual verification:

- Open each route.
- Confirm no route crashes.
- Confirm base components render.
- Confirm dark theme reads well.

Update `docs/PHASE_LOG.md`.

---

# PHASE 4 — DECISION DOMAIN MODEL, VALIDATION, AND BUSINESS LOGIC

## Phase goal

Define DecisionOS domain models before building database and AI.

## Estimated depth target

Roughly 2 hours.

This phase prevents random stringly-typed decision logic later.

---

## 4.1 Create decision types

### Task

Create:

```txt
src/features/decisions/decisionTypes.ts
```

Required:

```ts
export type DecisionCategory =
  | "school"
  | "career"
  | "money"
  | "moving"
  | "business"
  | "personal_goals"
  | "other";

export type DecisionStatus =
  | "draft"
  | "questions"
  | "ready_for_analysis"
  | "analyzed"
  | "chosen"
  | "review_scheduled"
  | "reviewed";
```

Define:

```txt
Decision
DecisionOption
DecisionAnswer
DecisionAnalysis
DecisionReview
DecisionScoreName
DecisionPatternInsight
```

### Acceptance criteria

- Types are explicit.
- No unsafe categories as primary MVP categories.
- Types align with planned database schema.

---

## 4.2 Create decision schemas

### Task

Create:

```txt
src/features/decisions/decisionSchemas.ts
```

Required schemas:

```txt
createDecisionSchema
decisionOptionSchema
decisionAnswerSchema
decisionAnalysisSchema
decisionReviewSchema
```

### Acceptance criteria

- Required fields are enforced.
- Min 2 options rule exists.
- Max 5 options rule exists.
- User-friendly validation messages exist.

---

## 4.3 Create business rules file

### Task

Create:

```txt
src/features/decisions/decisionRules.ts
```

Rules:

```txt
minimum options = 2
maximum options = 5
free monthly analyses = 3
allowed categories list
unsafe category handling
score range 0–100
review options: 1 week, 1 month, 3 months, custom
```

### Acceptance criteria

- Business constants are centralized.
- No duplicated magic numbers.

---

## 4.4 Create score explanation system

### Task

Create:

```txt
src/features/decisions/decisionScoreExplanations.ts
```

Scores:

```txt
Regret Risk
Confidence
Values Alignment
Reversibility
Risk
```

Each score must have:

```txt
plain-English meaning
high score meaning
low score meaning
warning copy
```

### Acceptance criteria

- Scores are explainable.
- UI can display tooltips/help text.
- Scores are not presented as guaranteed truth.

---

## 4.5 Create tests for schemas

### Task

Create schema tests for:

```txt
createDecisionSchema
decisionOptionSchema
decisionReviewSchema
```

### Acceptance criteria

- Valid input passes.
- Invalid input fails.
- Option count rules tested.
- Score ranges tested.

---

## Phase 4 anti-slop checklist

- [ ] Types exist.
- [ ] Schemas exist.
- [ ] Business rules centralized.
- [ ] Tests exist for validation.
- [ ] No magic category strings scattered.
- [ ] No file exceeds 200 lines.

## Phase 4 verification gate

Run/check:

```txt
npx tsc --noEmit
npm test if configured
```

Manual verification:

- Read types and schemas.
- Confirm MVP categories are safe.
- Confirm validation messages are human-readable.

Update `docs/PHASE_LOG.md`.

---

# PHASE 5 — SUPABASE DATABASE, RLS, AND REPOSITORY FOUNDATION

## Phase goal

Create the real persistence layer with privacy-first database design.

## Estimated depth target

Roughly 2 hours.

Do not build screens that save fake local data. Build the real path.

---

## 5.1 Write `docs/DATABASE_SCHEMA.md`

### Task

Document tables:

```txt
profiles
decisions
decision_options
decision_answers
decision_analysis
decision_reviews
subscriptions
ai_usage_events
decision_pattern_insights
```

For each table:

```txt
purpose
columns
relationships
RLS rules
indexes
privacy notes
```

### Acceptance criteria

- Database plan is understandable.
- RLS strategy is documented.

---

## 5.2 Create Supabase client

### Task

Create:

```txt
src/lib/supabase.ts
```

### Rules

- Use anon key only.
- No service role key client-side.
- Handle missing env values.

### Acceptance criteria

- Client initializes.
- No secret exposure.

---

## 5.3 Create migrations

### Task

Create SQL migration files in:

```txt
supabase/migrations/
```

Tables:

```txt
profiles
decisions
decision_options
decision_answers
decision_analysis
decision_reviews
subscriptions
ai_usage_events
decision_pattern_insights
```

### Required fields

Every user-owned table needs:

```txt
id
user_id
created_at
updated_at where useful
```

### Acceptance criteria

- Migrations are split logically.
- SQL is readable.
- Tables have foreign keys.
- Indexes added for user_id and decision_id.

---

## 5.4 Enable RLS policies

### Task

Enable RLS on all tables.

Policy:

```txt
Users can only access rows where user_id = auth.uid().
profiles.id = auth.uid().
```

### Acceptance criteria

- RLS enabled.
- Select/insert/update/delete policies exist where needed.
- User cannot access another user’s rows.

---

## 5.5 Create repository layer

### Task

Create:

```txt
src/features/decisions/decisionRepository.ts
```

If it exceeds 200 lines, split into:

```txt
decisionReadRepository.ts
decisionWriteRepository.ts
decisionAnalysisRepository.ts
decisionReviewRepository.ts
```

Required functions:

```txt
createDecision
updateDecision
getDecisionById
getUserDecisions
deleteDecision
addDecisionOption
updateDecisionOption
deleteDecisionOption
saveDecisionAnswers
saveDecisionAnalysis
chooseDecisionOption
scheduleDecisionReview
saveDecisionReview
```

### Acceptance criteria

- Repository is typed.
- Errors are wrapped consistently.
- Screens do not call Supabase directly.
- File length rule respected.

---

## 5.6 Create integration checklist

### Task

Write:

```txt
docs/INTEGRATION_CHECKLIST.md
```

Include vertical path:

```txt
form → schema → repository → Supabase → RLS → query refresh → UI update
```

### Acceptance criteria

- Checklist exists.
- Future phases use it.

---

## Phase 5 anti-slop checklist

- [ ] Real database schema exists.
- [ ] RLS exists.
- [ ] Repository layer exists.
- [ ] Screens will not call Supabase directly.
- [ ] No service role key in client.
- [ ] Integration checklist exists.
- [ ] Files split under 200 lines.

## Phase 5 verification gate

Run/check:

```txt
npx tsc --noEmit
Supabase migrations apply successfully
RLS policies reviewed
```

Manual verification:

- Test a user cannot query another user’s data.
- Confirm repository functions are not giant.
- Confirm schema and database docs match.

Update `docs/PHASE_LOG.md`.

---

# PHASE 6 — AUTH AND PRIVACY-FIRST ONBOARDING

## Phase goal

Build real authentication and onboarding that explains privacy, memory, and product boundaries.

## Estimated depth target

Roughly 2 hours.

---

## 6.1 Create auth feature files

### Task

Create:

```txt
src/features/auth/authTypes.ts
src/features/auth/authService.ts
src/features/auth/useAuth.ts
```

Required methods:

```txt
signUp
signIn
signOut
getCurrentUser
listenToAuthChanges
```

### Acceptance criteria

- Auth logic is centralized.
- Screens do not duplicate auth code.
- Errors are user-friendly.

---

## 6.2 Build sign-in and sign-up screens

### Routes

```txt
app/auth/sign-in.tsx
app/auth/sign-up.tsx
```

### Requirements

```txt
email/password fields
validation
loading state
error state
navigation between sign-in/sign-up
```

### Acceptance criteria

- User can create account.
- User can sign in.
- User can sign out.
- Invalid credentials show helpful error.

---

## 6.3 Build onboarding intro

### Route

```txt
app/onboarding/index.tsx
```

Must explain:

```txt
DecisionOS helps you think clearly through important decisions.
DecisionOS saves decisions so you can review outcomes later.
DecisionOS is not a doctor, lawyer, therapist, emergency resource, or investment advisor.
```

### Acceptance criteria

- Onboarding sets correct expectations.
- No overclaiming.
- User can continue.

---

## 6.4 Build privacy onboarding

### Route

```txt
app/onboarding/privacy.tsx
```

Must explain:

```txt
Your decisions are private.
Decision text is not used for analytics.
AI runs through secure backend functions.
Memory is optional.
```

### Acceptance criteria

- Privacy is understandable.
- No fake privacy claims.
- User can continue.

---

## 6.5 Build values and memory preference onboarding

### Route

```txt
app/onboarding/values.tsx
```

Allow user to choose values:

```txt
stability
growth
freedom
money
family
health
learning
peace
achievement
creativity
```

Ask:

```txt
Allow DecisionOS to learn from your past reviewed decisions to personalize future analysis?
```

Options:

```txt
Yes, personalize future analysis
Not now
```

### Acceptance criteria

- Values save to profile or profile metadata.
- Memory preference saves.
- User can change later.

---

## Phase 6 anti-slop checklist

- [ ] Auth uses real Supabase.
- [ ] No fake user.
- [ ] Onboarding explains boundaries.
- [ ] Memory consent exists.
- [ ] Loading/error states exist.
- [ ] Forms validate.
- [ ] No file over 200 lines.

## Phase 6 verification gate

Run/check:

```txt
npx tsc --noEmit
auth flow manual test
```

Manual QA:

```txt
sign up
sign in
sign out
invalid password
complete onboarding
skip memory
enable memory
```

Update `docs/PHASE_LOG.md`.

---

# PHASE 7 — DECISION HOME SCREEN V1

## Phase goal

Build a real DecisionOS home screen using `HomeScreenV2.tsx` as inspiration, not as production code.

## Estimated depth target

Roughly 2 hours.

---

## 7.1 Inspect and adapt HomeScreenV2 patterns

### Task

From the archive, extract ideas only:

```txt
hero card
recommendation engine
quick actions
daily check-in
preview card
```

Document:

```txt
what to keep
what to avoid
what to adapt for DecisionOS
```

### Acceptance criteria

- `ARCHIVE_NOTES.md` updated.
- No blind copy-paste.
- DecisionOS home purpose is clear.

---

## 7.2 Create home components

### Task

Create:

```txt
src/components/home/DecisionHomeHeader.tsx
src/components/home/DailyClarityCard.tsx
src/components/home/RecommendedActionCard.tsx
src/components/home/PendingDecisionCard.tsx
src/components/home/DecisionQuickActions.tsx
src/components/home/RecentInsightCard.tsx
```

### Home question

```txt
What decision needs clarity right now?
```

### Acceptance criteria

- Components are small.
- Components are reusable.
- Components handle empty data.
- No fake actions.

---

## 7.3 Create home recommendation hook

### Task

Create:

```txt
src/features/decisions/useHomeDecisionRecommendation.ts
```

Priority:

```txt
1. review due
2. draft missing options
3. ready for analysis
4. analyzed but not chosen
5. create first decision
```

### Acceptance criteria

- Hook uses real decision data.
- Empty state works.
- Recommendation is not hardcoded after repository exists.

---

## 7.4 Build `app/index.tsx`

### Task

Implement actual home screen.

Must show:

```txt
greeting
daily clarity card
recommended action
pending decisions
quick actions
recent insight if available
free usage remaining if relevant
```

### Acceptance criteria

- Home screen loads for authenticated user.
- Empty state encourages first decision.
- User can navigate to create decision.
- User can navigate to decisions history.

---

## Phase 7 anti-slop checklist

- [ ] Home is DecisionOS-specific.
- [ ] Not a generic dashboard.
- [ ] No fake recommendation.
- [ ] Empty state exists.
- [ ] Actions navigate correctly.
- [ ] Components under 200 lines.
- [ ] Archive pattern documented.

## Phase 7 verification gate

Run/check:

```txt
npx tsc --noEmit
npx expo start
```

Manual QA:

```txt
new user home
user with draft decision
user with analyzed decision
user with review due
quick actions navigation
```

Update `docs/PHASE_LOG.md`.

---

# PHASE 8 — CREATE DECISION FLOW

## Phase goal

Build the core decision intake experience.

## Estimated depth target

Roughly 2 hours.

---

## 8.1 Build decision draft store

### Task

Create:

```txt
src/store/decisionDraftStore.ts
```

Purpose:

```txt
hold temporary form state across multi-step create flow
```

### Acceptance criteria

- Draft state persists during navigation.
- Draft can reset after save.
- Store is not used as permanent database.

---

## 8.2 Build new decision form

### Route

```txt
app/decisions/new.tsx
```

Fields:

```txt
title
category
deadline optional
context
desired outcome
biggest fear optional
inaction outcome
```

### Acceptance criteria

- Uses React Hook Form.
- Uses Zod validation.
- Saves decision to Supabase.
- Handles loading/error/success.

---

## 8.3 Build options step

### Task

Create components:

```txt
src/components/decisions/DecisionOptionEditor.tsx
src/components/decisions/DecisionOptionList.tsx
```

Rules:

```txt
minimum 2 options
maximum 5 options
option label required
description optional
```

### Acceptance criteria

- User can add/edit/remove options.
- User cannot proceed with fewer than 2 options.
- Options save correctly.

---

## 8.4 Build guided questions step

### Task

Create:

```txt
src/components/decisions/DecisionQuestionForm.tsx
src/features/decisions/defaultDecisionQuestions.ts
```

Starter questions:

```txt
What matters most in this decision?
What are you afraid might happen?
What would future-you thank you for?
What is the cost of waiting?
Which option feels easiest right now?
Which option seems best long-term?
What information are you missing?
```

### Acceptance criteria

- Answers save.
- Required questions are clear.
- Optional questions can be skipped.
- User can proceed to analysis readiness.

---

## 8.5 Create decision readiness state

### Task

After decision, options, and questions are saved, set:

```txt
status = "ready_for_analysis"
```

### Acceptance criteria

- Decision status updates.
- Home screen recommendation picks it up.
- Analysis button becomes available.

---

## Phase 8 anti-slop checklist

- [ ] Real form validation.
- [ ] Real database save.
- [ ] No fake local-only complete flow.
- [ ] Options min/max enforced.
- [ ] Status updates correctly.
- [ ] UI handles loading/error.
- [ ] Files under 200 lines.

## Phase 8 verification gate

Run/check:

```txt
npx tsc --noEmit
schema tests
```

Manual QA:

```txt
create valid decision
try empty title
try one option only
add 5 options
try 6th option
save answers
confirm decision appears in history/home
```

Update `docs/PHASE_LOG.md`.

---

# PHASE 9 — GEMINI BACKEND ANALYSIS

## Phase goal

Build real Gemini-powered analysis through secure Supabase Edge Functions.

## Estimated depth target

Roughly 2 hours.

---

## 9.1 Write `docs/API_PLAN.md`

### Required routes

```txt
analyze-decision
generate-clarifying-questions
review-decision
check-usage-limit
```

For each route document:

```txt
input
auth requirements
subscription requirements
Gemini usage
output schema
error cases
safety rules
```

### Acceptance criteria

- API plan is complete.
- Gemini key location is documented as server-only.

---

## 9.2 Create Gemini schemas

### Task

Create:

```txt
src/features/ai/geminiSchemas.ts
```

Schemas:

```txt
geminiDecisionAnalysisSchema
geminiClarifyingQuestionsSchema
geminiDecisionReviewSchema
```

### Acceptance criteria

- Scores are 0–100.
- Required arrays have min lengths where practical.
- Invalid Gemini output fails safely.

---

## 9.3 Create prompt builders

### Task

Create:

```txt
src/features/ai/geminiPrompts.ts
```

If over 200 lines, split:

```txt
decisionAnalysisPrompt.ts
decisionReviewPrompt.ts
clarifyingQuestionsPrompt.ts
```

### Prompt must require

```txt
JSON only
direct calm honest tone
no future certainty
no medical/legal/therapy/investment advice
option comparison
hidden assumptions
missing info
next steps
uncertainty
score explanations
```

### Acceptance criteria

- Prompt is specific to DecisionOS.
- Prompt does not ask for generic advice.
- Prompt requires structured output.

---

## 9.4 Create `analyze-decision` Edge Function

### Task

Create:

```txt
supabase/functions/analyze-decision/
```

Backend flow:

```txt
validate auth
load decision
verify ownership
check usage limit
load options
load answers
load memory insights only if enabled
build prompt
call Gemini
validate response
save analysis
record usage event
return analysis
```

### Acceptance criteria

- Unauthenticated users rejected.
- Users cannot analyze another user’s decision.
- Gemini output validated.
- Analysis saved to database.
- Usage event saved.
- Errors handled safely.

---

## 9.5 Build client analysis service

### Task

Create:

```txt
src/features/decisions/decisionAnalysisService.ts
```

Purpose:

```txt
call Supabase Edge Function
handle loading/error
return typed analysis
```

### Acceptance criteria

- Client does not call Gemini directly.
- Client handles function errors.
- Client invalidates relevant queries.

---

## Phase 9 anti-slop checklist

- [ ] Gemini key server-only.
- [ ] No fake AI text.
- [ ] Output schema validation.
- [ ] Usage checked before analysis.
- [ ] Analysis stored.
- [ ] Errors handled.
- [ ] Prompt is DecisionOS-specific.
- [ ] Files split under 200 lines.

## Phase 9 verification gate

Run/check:

```txt
npx tsc --noEmit
Gemini schema tests
Edge function local test if possible
```

Manual QA:

```txt
analyze valid decision
analyze unauthenticated blocked
analyze decision with missing options blocked
Gemini failure shows error
invalid AI response handled
analysis appears in database
```

Update `docs/PHASE_LOG.md`.

---

# PHASE 10 — STRUCTURED ANALYSIS UI

## Phase goal

Display Gemini results as a premium decision report, not a chatbot response.

## Estimated depth target

Roughly 2 hours.

---

## 10.1 Create score components

### Task

Create:

```txt
src/components/decisions/DecisionScoreCard.tsx
src/components/decisions/DecisionScoreRow.tsx
src/components/decisions/RegretRiskBadge.tsx
src/components/decisions/ConfidenceBadge.tsx
```

### Acceptance criteria

- Scores visually clear.
- Scores have labels and explanations.
- No score presented as guaranteed truth.

---

## 10.2 Create report components

### Task

Create:

```txt
src/components/decisions/DecisionReportHeader.tsx
src/components/decisions/RecommendationCard.tsx
src/components/decisions/OptionComparisonCard.tsx
src/components/decisions/TradeoffsCard.tsx
src/components/decisions/HiddenAssumptionsCard.tsx
src/components/decisions/NextStepsCard.tsx
src/components/decisions/CautionNotesCard.tsx
```

### Acceptance criteria

- Each component under 200 lines.
- Report is scannable.
- No giant text dump.

---

## 10.3 Build analysis screen

### Route

```txt
app/decisions/[id]/analysis.tsx
```

Must show:

```txt
recommendation
summary
scores
option comparison
tradeoffs
hidden assumptions
missing info
next steps
caution notes
choose option action
keep thinking action
```

### Acceptance criteria

- Loads real analysis.
- Can trigger analysis if none exists and ready.
- Handles loading/error/empty states.
- User can choose option.

---

## Phase 10 anti-slop checklist

- [ ] Analysis is structured.
- [ ] Not chatbot transcript.
- [ ] All score meanings clear.
- [ ] Loading/error states exist.
- [ ] User actions work.
- [ ] Components under 200 lines.

## Phase 10 verification gate

Run/check:

```txt
npx tsc --noEmit
component tests if practical
```

Manual QA:

```txt
view no-analysis state
run analysis
view analysis
choose option
handle Gemini error
handle invalid decision id
```

Update `docs/PHASE_LOG.md`.

---

# PHASE 11 — DECISION HISTORY AND DETAIL

## Phase goal

Make saved decisions easy to revisit and continue.

## Estimated depth target

Roughly 2 hours.

---

## 11.1 Build decisions list screen

### Route

```txt
app/decisions/index.tsx
```

Show:

```txt
title
category
status
updated date
deadline if any
top score if analyzed
review due badge
```

### Acceptance criteria

- List loads real decisions.
- Empty state exists.
- Pull-to-refresh if practical.
- Tapping opens detail.

---

## 11.2 Build decision card

### Task

Create:

```txt
src/components/decisions/DecisionCard.tsx
```

### Acceptance criteria

- Card handles multiple statuses.
- Card does not contain business logic.
- Card under 200 lines.

---

## 11.3 Build decision detail screen

### Route

```txt
app/decisions/[id].tsx
```

Show:

```txt
decision title
category
context
options
answers
status
latest analysis summary
chosen option
review date
actions based on status
```

### Acceptance criteria

- Loads by id.
- Handles missing/unauthorized decision.
- Actions are status-aware.

---

## Phase 11 anti-slop checklist

- [ ] Real history loads.
- [ ] Empty state exists.
- [ ] Detail actions reflect status.
- [ ] Unauthorized access handled.
- [ ] No giant detail file.
- [ ] No direct Supabase calls in screen.

## Phase 11 verification gate

Run/check:

```txt
npx tsc --noEmit
```

Manual QA:

```txt
new user empty history
user with drafts
user with analyzed decisions
open detail
bad id handling
refresh list after create
```

Update `docs/PHASE_LOG.md`.

---

# PHASE 12 — DECISION CHOICE AND REVIEW LOOP

## Phase goal

Build the outcome review loop that makes DecisionOS meaningfully different from generic AI chat.

## Estimated depth target

Roughly 2 hours.

---

## 12.1 Choose option

### Task

Allow user to choose an option after analysis.

Update:

```txt
chosen_option_id
status = "chosen"
```

### Acceptance criteria

- Choice saves.
- UI shows chosen option.
- User can schedule review.

---

## 12.2 Schedule review

### Task

After choosing, ask:

```txt
When should DecisionOS check back in?
```

Options:

```txt
1 week
1 month
3 months
custom date
```

Update:

```txt
review_at
status = "review_scheduled"
```

### Acceptance criteria

- Review date saves.
- Home screen shows due review when date arrives.
- History shows review scheduled.

---

## 12.3 Build review screen

### Route

```txt
app/decisions/[id]/review.tsx
```

Fields:

```txt
what happened
outcome rating
regret level
would choose again
lesson learned
allow memory insight from this review
```

### Acceptance criteria

- Review saves.
- Status becomes reviewed.
- User can opt into memory.
- No review without chosen option.

---

## 12.4 Create basic memory insight foundation

### Task

If memory enabled, save simple pattern insight.

Examples:

```txt
User reported lower regret when choosing reversible options.
User values stability in career decisions.
User regrets rushed money decisions.
```

### Acceptance criteria

- Memory only if consented.
- Insight is not creepy.
- Insight references reviewed decisions.
- User can disable memory later.

---

## Phase 12 anti-slop checklist

- [ ] Choice saves.
- [ ] Review date saves.
- [ ] Review screen works.
- [ ] Memory respects consent.
- [ ] Home reflects due reviews.
- [ ] No fake “learning.”
- [ ] Files under 200 lines.

## Phase 12 verification gate

Run/check:

```txt
npx tsc --noEmit
review schema tests
```

Manual QA:

```txt
choose option
schedule 1 week review
schedule custom review
complete review
disable memory
enable memory
confirm insight saved only when allowed
```

Update `docs/PHASE_LOG.md`.

---

# PHASE 13 — MONETIZATION AND REVENUECAT

## Phase goal

Add monetization architecture from day one.

## Estimated depth target

Roughly 2 hours.

---

## 13.1 Write `docs/MONETIZATION_PLAN.md`

### Plans

Free:

```txt
3 analyzed decisions/month
Basic analysis
Basic scores
Limited history
```

Plus:

```txt
$9.99/month
Unlimited decisions
Advanced Gemini analysis
Full score breakdown
Decision memory
Review reminders
Regret simulator
Longer history
```

Future Pro:

```txt
$19.99/month
PDF reports
Deep pattern intelligence
Voice input
Future self simulator
Advanced export
Encrypted private journal mode
```

### Acceptance criteria

- Free/Plus/Future Pro documented.
- MVP only builds Free + Plus foundation.

---

## 13.2 Create monetization files

### Task

Create:

```txt
src/features/monetization/monetizationTypes.ts
src/features/monetization/revenueCatService.ts
src/features/monetization/entitlementService.ts
src/features/monetization/useEntitlements.ts
```

If any file exceeds 200 lines, split.

### Acceptance criteria

- Entitlement checks are centralized.
- RevenueCat logic not scattered.
- Client can check Free vs Plus.

---

## 13.3 Create server-side usage limit

### Task

Create:

```txt
supabase/functions/check-usage-limit/
```

Rules:

```txt
free users get 3 analyses/month
Plus users unlimited
server decides, not client only
```

### Acceptance criteria

- Free limit enforced server-side.
- Client displays remaining analyses.
- Plus users bypass limit.
- Old decisions remain viewable.

---

## 13.4 Create paywall route

### Route

```txt
app/paywall/index.tsx
```

Must show:

```txt
DecisionOS Plus
Unlimited decisions
Advanced analysis
Full decision memory
Review reminders
Regret simulator
$9.99/month
```

### Acceptance criteria

- Paywall exists.
- Copy is clear.
- UI does not feel scammy.
- Paywall links from limit state.

---

## 13.5 Integrate monetization with analysis

### Task

Before Gemini analysis:

```txt
check entitlement
check usage limit
allow or show paywall
```

### Acceptance criteria

- Free limit blocks new analyses after quota.
- Plus entitlement unlocks.
- Limit is checked before Gemini cost.

---

## Phase 13 anti-slop checklist

- [ ] Monetization plan exists.
- [ ] RevenueCat foundation exists.
- [ ] Server-side usage limit exists.
- [ ] Paywall route exists.
- [ ] Analysis checks usage.
- [ ] No client-only paywall enforcement.
- [ ] No manipulative paywall copy.

## Phase 13 verification gate

Run/check:

```txt
npx tsc --noEmit
usage limit function test if possible
```

Manual QA:

```txt
free user with 0 analyses
free user after 3 analyses
Plus user
paywall navigation
old decisions still accessible after limit
```

Update `docs/PHASE_LOG.md`.

---

# PHASE 14 — SECURITY, PRIVACY, AND SAFETY GUARDRAILS

## Phase goal

Protect users and prevent unsafe advice patterns.

## Estimated depth target

Roughly 2 hours.

---

## 14.1 Write `docs/SECURITY_RULES.md`

### Must include

```txt
Gemini key server-only
no sensitive analytics
RLS required
users only access own rows
secure session storage
no fake privacy claims
future export/delete
future encryption
future biometric lock
```

### Acceptance criteria

- Security rules exist.
- They are specific to DecisionOS.

---

## 14.2 Create safe analytics wrapper

### Task

Create:

```txt
src/lib/analytics.ts
```

Allowed events:

```txt
decision_created
decision_analyzed
decision_option_chosen
decision_reviewed
paywall_viewed
subscription_started
```

Forbidden:

```txt
full title
full context
full options
answers
private reflection text
```

### Acceptance criteria

- Analytics wrapper prevents sensitive payloads.
- Screens use wrapper, not raw analytics calls.

---

## 14.3 Create AI safety detection helper

### Task

Create:

```txt
src/features/ai/aiSafety.ts
```

Detect broad unsafe categories:

```txt
self-harm
medical emergency
legal emergency
abuse/crisis
mental health crisis
investment advice request
```

### Rules

- Do not overclaim detection.
- Use as pre-check and prompt guardrail.
- Backend also enforces.

### Acceptance criteria

- Crisis-like content does not get normal decision scores.
- Safe fallback copy exists.
- User is directed to appropriate real-world support when needed.

---

## 14.4 Add privacy settings

### Route

```txt
app/settings/index.tsx
```

Include:

```txt
memory enabled toggle
privacy explanation
sign out
future export/delete disabled but documented
```

### Acceptance criteria

- User can change memory preference.
- Sign out works.
- Future privacy features are clearly disabled/not fake.

---

## Phase 14 anti-slop checklist

- [ ] Security docs exist.
- [ ] Analytics does not log sensitive text.
- [ ] Safety helper exists.
- [ ] Memory toggle works.
- [ ] No fake encryption claims.
- [ ] RLS verified again.

## Phase 14 verification gate

Run/check:

```txt
npx tsc --noEmit
manual privacy review
```

Manual QA:

```txt
toggle memory off
toggle memory on
try sensitive/crisis-like decision
check analytics payloads
sign out
```

Update `docs/PHASE_LOG.md`.

---

# PHASE 15 — TESTING SYSTEM AND QUALITY CHECKS

## Phase goal

Make MVP stable and prevent regressions.

## Estimated depth target

Roughly 2 hours.

---

## 15.1 Write `docs/TESTING_PLAN.md`

### Required sections

```txt
unit tests
schema tests
repository tests
component tests
edge function tests
manual QA
release checklist
known limitations
```

### Acceptance criteria

- Testing plan exists.
- Critical flows are listed.

---

## 15.2 Add schema tests

### Test

```txt
createDecisionSchema
decisionOptionSchema
decisionAnalysisSchema
decisionReviewSchema
geminiDecisionAnalysisSchema
```

### Acceptance criteria

- Valid cases pass.
- Invalid cases fail.
- AI malformed output fails.

---

## 15.3 Add component tests where practical

### Test candidates

```txt
Button
TextField
DecisionCard
DecisionScoreCard
```

### Acceptance criteria

- Component states render.
- Disabled/loading states tested.

---

## 15.4 Add manual QA checklist

### Required flow

```txt
sign up
sign in
complete onboarding
create decision
add options
answer questions
run Gemini analysis
view report
choose option
schedule review
complete review
hit free limit
view paywall
toggle memory
sign out
```

### Acceptance criteria

- QA checklist is in docs.
- Known bugs are tracked.

---

## Phase 15 anti-slop checklist

- [ ] Tests exist for schemas.
- [ ] UI components tested where practical.
- [ ] Manual QA checklist exists.
- [ ] Known bugs documented.
- [ ] No “testing later” excuse.

## Phase 15 verification gate

Run/check:

```txt
npx tsc --noEmit
npm test
manual QA checklist started
```

Update `docs/PHASE_LOG.md`.

---

# PHASE 16 — MVP POLISH AND UX DEPTH

## Phase goal

Make the MVP feel real, calm, and trustworthy.

## Estimated depth target

Roughly 2 hours.

---

## 16.1 Improve loading states

### Required

```txt
saving decision
loading decisions
analyzing with Gemini
checking subscription
saving review
```

### Acceptance criteria

- No silent loading.
- Gemini loading feels calm and premium.

---

## 16.2 Improve empty states

### Required

```txt
no decisions yet
no analysis yet
no reviews due
no internet
free limit reached
```

### Acceptance criteria

- Empty states have useful next action.
- No blank screens.

---

## 16.3 Improve error states

### Required

```txt
auth error
network error
database error
Gemini error
invalid AI response
subscription check error
unauthorized decision
```

### Acceptance criteria

- Errors are readable.
- Errors avoid sensitive details.
- Retry path exists where useful.

---

## 16.4 Copywriting pass

### Tone

```txt
direct
calm
honest
premium
reflective
not robotic
not therapist-like
not fake motivational
```

### Acceptance criteria

- No generic placeholder copy.
- No “lorem ipsum.”
- No overpromising.

---

## 16.5 UI consistency pass

### Check

```txt
spacing
cards
buttons
typography
score colors
safe area
keyboard
dark contrast
```

### Acceptance criteria

- UI feels like one product.
- No random styles.
- No screen feels unfinished.

---

## Phase 16 anti-slop checklist

- [ ] Loading states polished.
- [ ] Empty states polished.
- [ ] Error states polished.
- [ ] Copy reviewed.
- [ ] UI consistency reviewed.
- [ ] No placeholders.

## Phase 16 verification gate

Run/check:

```txt
npx tsc --noEmit
npx expo start
manual UI QA
```

Update `docs/PHASE_LOG.md`.

---

# PHASE 17 — DIFFERENTIATION FEATURES THAT SEPARATE DECISIONOS FROM CHATGPT

## Phase goal

Strengthen the product identity without overbuilding.

## Estimated depth target

Roughly 2 hours.

---

## 17.1 Score explanation modals/help

### Task

For each score:

```txt
Regret Risk
Confidence
Values Alignment
Reversibility
Risk
```

Add explanation UI.

### Acceptance criteria

- User understands each score.
- App does not present scores as absolute truth.

---

## 17.2 Decision memory callout

### Task

If memory enabled and insights exist, show:

```txt
Based on your past reviewed decisions...
```

### Rules

- Must be based on stored insight.
- Must not feel creepy.
- Must not reveal private content unexpectedly.

### Acceptance criteria

- Memory callout appears only when valid.
- Hidden when memory disabled.

---

## 17.3 Review loop highlight

### Task

Make the review loop visible in the app.

Example copy:

```txt
DecisionOS gets better when you review what actually happened.
```

### Acceptance criteria

- User understands why review matters.
- Review is not buried.

---

## Phase 17 anti-slop checklist

- [ ] Differentiation is real.
- [ ] Not just chat UI.
- [ ] Scores explained.
- [ ] Memory respects consent.
- [ ] Review loop is visible.

## Phase 17 verification gate

Run/check:

```txt
npx tsc --noEmit
manual UX review
```

Update `docs/PHASE_LOG.md`.

---

# PHASE 18 — ROADMAP AND FUTURE PARKING LOT

## Phase goal

Document future ideas so Windsurf does not build them now.

## Estimated depth target

Roughly 2 hours.

---

## 18.1 Write `docs/ROADMAP.md`

### Stages

```txt
Stage 1 — DecisionOS MVP
Stage 2 — Decision Memory
Stage 3 — Regret Simulator
Stage 4 — Goal Conversion
Stage 5 — Future Self Simulator
Stage 6 — NeuroFlow Expansion
```

### Acceptance criteria

- Future scope is documented.
- MVP remains focused.

---

## 18.2 Future feature parking lot

Document but do not build:

```txt
goal tracking
habit tracking
weekly review
future self simulation
productivity patterns
life dashboard
study mode
career roadmap
finance reflection
relationship category with guardrails
voice input
PDF reports
encrypted private journal
biometric lock
web dashboard
team accountability
```

### Acceptance criteria

- Future ideas are preserved.
- None are in MVP code unless required.

---

## 18.3 Archive-to-roadmap mapping

### Task

Map old archive files to possible roadmap stages.

Example:

```txt
PredictiveLifeSimulation.ts → Future Self Simulator
GoalTrackingService.ts → Goal Conversion
HabitFormationService.ts → NeuroFlow Expansion
TeamAnalyticsSystem.ts → Team Accountability Later
AdvancedSecuritySystem.ts → Private Journal/Security Later
```

### Acceptance criteria

- Archive value is not lost.
- Future use is organized.

---

## Phase 18 anti-slop checklist

- [ ] Roadmap exists.
- [ ] Future ideas parked.
- [ ] Archive mapped.
- [ ] No future feature built early.

## Phase 18 verification gate

Check:

```txt
docs/ROADMAP.md complete
ARCHIVE_NOTES.md updated with roadmap mapping
MVP_SCOPE.md still bans future features
```

Update `docs/PHASE_LOG.md`.

---

# PHASE 19 — FINAL MVP READINESS CHECK

## Phase goal

Verify DecisionOS is ready for private testing.

## Estimated depth target

Roughly 2 hours.

---

## 19.1 Product readiness checklist

Required:

```txt
user can sign up
user can sign in
user can complete onboarding
user can create decision
user can add options
user can answer questions
user can run Gemini analysis
user can view structured report
user can choose option
user can schedule review
user can complete review
user can view history
user can access settings
free usage limit works
paywall exists
memory preference works
```

### Acceptance criteria

- Every item manually tested.
- Bugs documented.

---

## 19.2 Technical readiness checklist

Required:

```txt
TypeScript passes
app builds
no exposed secrets
env documented
migrations applied
RLS tested
Gemini function works
RevenueCat foundation works
analytics safe
schema tests pass
manual QA completed
```

### Acceptance criteria

- No critical blocker remains.
- Known limitations documented.

---

## 19.3 Anti-slop final scan

### Search for banned terms

Search codebase for:

```txt
TODO
placeholder
mock
fake
hardcoded
coming soon
lorem
any
console.log
GEMINI_API_KEY
```

### Rules

- TODO allowed only with issue-style explanation.
- Mock allowed only in tests.
- `any` allowed only with comment justification.
- `console.log` not allowed in production paths.
- `GEMINI_API_KEY` must not appear in client source.

### Acceptance criteria

- Slop scan completed.
- Violations fixed or documented.

---

## 19.4 200-line file scan

### Task

Check all source files.

Rules:

- No source file over 200 lines unless justified.
- Split large screens/components.

### Acceptance criteria

- Long files refactored.
- Exceptions documented.

---

## Phase 19 anti-slop checklist

- [ ] Full manual QA complete.
- [ ] TypeScript passes.
- [ ] Tests pass.
- [ ] Slop scan complete.
- [ ] File length scan complete.
- [ ] Secrets scan complete.
- [ ] Known limitations documented.

## Phase 19 verification gate

Run/check:

```txt
npx tsc --noEmit
npm test
grep/search banned terms
file length scan
manual QA checklist
```

Update `docs/PHASE_LOG.md`.

---

# PHASE 20 — PRIVATE TESTER PREP

## Phase goal

Prepare app for real user feedback without pretending it is finished.

## Estimated depth target

Roughly 2 hours.

---

## 20.1 Create tester script

### Task

Create:

```txt
docs/PRIVATE_TESTER_SCRIPT.md
```

Include:

```txt
what the app does
what testers should try
what feedback to give
known limitations
privacy note
```

### Acceptance criteria

- Tester instructions are clear.
- Testers know this is MVP.

---

## 20.2 Create feedback questions

### Required questions

```txt
Was the decision flow clear?
Did the analysis feel useful?
Did the scores make sense?
Did anything feel generic like ChatGPT?
Did anything feel unsafe or overconfident?
Would you use this for a real decision?
What would make you pay?
What confused you?
```

### Acceptance criteria

- Feedback questions exist.
- They focus on product usefulness.

---

## 20.3 Create launch notes draft

### Task

Create:

```txt
docs/MVP_LAUNCH_NOTES.md
```

Include:

```txt
what works
what does not work yet
who it is for
privacy boundaries
how to report bugs
```

### Acceptance criteria

- Launch notes are honest.
- No fake claims.

---

## Phase 20 anti-slop checklist

- [ ] Tester script exists.
- [ ] Feedback questions exist.
- [ ] Launch notes exist.
- [ ] Limitations are honest.
- [ ] App not overclaimed.

## Phase 20 verification gate

Manual verification:

- Read tester script.
- Read launch notes.
- Confirm app promise matches current features.
- Confirm no future features are advertised as ready.

Update `docs/PHASE_LOG.md`.

---

# DO NOT BUILD IN MVP 1

These are banned from MVP 1:

```txt
Quantum productivity
Blockchain achievement system
AR/VR environments
Global marketplace
Enterprise team analytics
Full social features
Public profiles
Community feed
Full mental health advisor
Medical decision system
Legal decision system
Investment recommendation system
Full finance tracker
Full habit OS
Full NeuroFlow life dashboard
Random AI chat room
Generic assistant screen
```

---

# REQUIRED BUILD ORDER

Windsurf must follow this order:

```txt
Phase 0 — Project control and anti-slop system
Phase 1 — Archive inspection and preservation
Phase 2 — Clean app foundation
Phase 3 — Design system and app shell
Phase 4 — Domain model and validation
Phase 5 — Supabase database and repository
Phase 6 — Auth and onboarding
Phase 7 — Home screen
Phase 8 — Create decision flow
Phase 9 — Gemini backend analysis
Phase 10 — Structured analysis UI
Phase 11 — History and detail
Phase 12 — Choice and review loop
Phase 13 — Monetization
Phase 14 — Security and privacy
Phase 15 — Testing
Phase 16 — Polish
Phase 17 — Differentiation features
Phase 18 — Roadmap
Phase 19 — MVP readiness
Phase 20 — Private tester prep
```

Do not skip Phase 0.

Do not skip verification gates.

Do not compress phases together.

---

# FINAL STANDARD

DecisionOS is successful when it does one thing extremely well:

```txt
It helps users make better decisions, save those decisions, and learn from what happened later.
```

The app should feel meaningfully different from ChatGPT/Gemini because it has:

```txt
structured intake
decision scores
persistent memory
outcome reviews
personal patterns
privacy-first design
monetization-ready architecture
```

The goal is not to build the biggest app.

The goal is to build the clearest, sharpest, most useful decision app first — then expand into NeuroFlow later.


---

# APPENDIX A — PER-PHASE COMPLETION TEMPLATE

At the end of every phase, add this to `docs/PHASE_LOG.md`:

```md
## Phase X — [Name]

### Status
Complete / Partial / Blocked

### Summary
What was actually completed.

### Files created
- path/to/file

### Files changed
- path/to/file

### Verification performed
- command or manual check

### Anti-slop checks
- no placeholders:
- file length checked:
- tests added:
- integration verified:
- UI states verified:

### Known issues
- issue

### Next phase readiness
Ready / Not ready
```

---

# APPENDIX B — FILE LENGTH SCAN SCRIPT IDEA

If the project uses Node, create a script later:

```txt
scripts/check-file-lengths.ts
```

Purpose:

```txt
Scan src/, app/, supabase/functions/ for files over 200 lines.
Fail or warn on oversized files.
```

Rules:

- Markdown docs may exceed 200 lines.
- Source code should not.
- Generated files may be excluded only if documented.

---

# APPENDIX C — BANNED IMPLEMENTATION PATTERNS

Do not do these:

## C.1 Giant screen file

Bad:

```txt
app/decisions/new.tsx contains form, validation, Supabase, styles, option editing, AI calls.
```

Good:

```txt
app/decisions/new.tsx
src/features/decisions/useCreateDecisionFlow.ts
src/components/decisions/DecisionBasicsForm.tsx
src/components/decisions/DecisionOptionEditor.tsx
src/features/decisions/decisionRepository.ts
```

## C.2 Client-side AI key

Bad:

```txt
fetch("https://generativelanguage.googleapis.com/...", {
  headers: { key: GEMINI_API_KEY }
})
```

Good:

```txt
client calls Supabase Edge Function
Edge Function calls Gemini
```

## C.3 Fake analysis

Bad:

```txt
const analysis = {
  summary: "Option A seems best...",
};
```

Good:

```txt
call analyze-decision edge function
validate response
display result
```

## C.4 Generic chatbot UX

Bad:

```txt
Text box: "Ask anything..."
```

Good:

```txt
structured decision form
option comparison
scores
review loop
```

## C.5 Overbuilding archive fantasies

Bad:

```txt
Adding QuantumProductivityAlgorithms to MVP
```

Good:

```txt
Document it in future roadmap only.
```

---

# APPENDIX D — DECISIONOS UI SCREEN QUALITY REQUIREMENTS

Every screen must answer:

```txt
What is the user trying to do here?
What is the primary action?
What can go wrong?
What happens while loading?
What happens when empty?
What happens after success?
What happens after failure?
```

## Required screen states

For each major screen:

```txt
loading
empty
error
success
offline-ish/network failure if relevant
unauthorized if relevant
```

## Required form behavior

Forms must have:

```txt
field labels
validation messages
disabled submit when invalid or submitting
loading state on submit
clear success path
clear error message
keyboard-aware layout
```

---

# APPENDIX E — DECISION ANALYSIS REPORT STANDARD

A DecisionOS analysis report must include:

```txt
Recommendation
Confidence Score
Regret Risk
Values Alignment
Reversibility
Risk Score
Option comparison
Tradeoffs
Hidden assumptions
Missing information
Next steps
Caution notes
Uncertainty note
```

It must not include:

```txt
medical advice
legal advice
investment directive
therapy-style diagnosis
guaranteed prediction
shaming language
generic motivational filler
```

---

# APPENDIX F — GEMINI OUTPUT CONTRACT

Gemini output must look like this conceptually:

```ts
type GeminiDecisionAnalysis = {
  summary: string;
  recommendationLabel: string;
  recommendedOptionId: string | null;
  confidenceScore: number;
  regretRiskScore: number;
  valuesAlignmentScore: number;
  reversibilityScore: number;
  riskScore: number;
  optionBreakdowns: Array<{
    optionId: string;
    strengths: string[];
    weaknesses: string[];
    shortTermOutcome: string;
    longTermOutcome: string;
    regretRisk: number;
    valuesAlignment: number;
    reversibility: number;
  }>;
  tradeoffs: string[];
  hiddenAssumptions: string[];
  informationGaps: string[];
  nextSteps: string[];
  cautionNotes: string[];
  uncertaintyNote: string;
};
```

Rules:

- Arrays cannot be empty unless schema allows.
- Scores must be 0–100.
- `recommendedOptionId` must match one of the user’s real option IDs or be null.
- If output fails validation, do not show it as final analysis.

---

# APPENDIX G — MONETIZATION ACCEPTANCE STANDARD

Monetization is not just a paywall screen.

It must include:

```txt
RevenueCat service foundation
entitlement state
free usage limit
server-side usage enforcement
remaining analyses UI
paywall route
Plus plan copy
error handling
restore purchases path eventually
```

Free limit:

```txt
3 analyzed decisions/month
```

Plus:

```txt
$9.99/month
unlimited analyses
advanced report
decision memory
review reminders
regret simulator
```

Do not block users from viewing old decisions after they hit the limit.

---

# APPENDIX H — SECURITY ACCEPTANCE STANDARD

Before MVP private testing:

```txt
GEMINI_API_KEY not in client
Supabase service role not in client
RLS on all user tables
Users only access own decisions
Analytics does not include sensitive text
Memory requires consent
No fake encryption claims
No raw sensitive console logs
```

---

# APPENDIX I — MANUAL QA MASTER SCRIPT

Run before declaring MVP ready:

```txt
1. Fresh install
2. Sign up
3. Complete onboarding
4. Choose values
5. Decline memory
6. Create decision
7. Add one option and confirm blocked
8. Add second option and continue
9. Answer guided questions
10. Run analysis
11. View report
12. Choose option
13. Schedule review
14. Complete review
15. Enable memory
16. Create second decision
17. Run analysis
18. Hit free limit after allowed uses
19. View paywall
20. Sign out
21. Sign back in
22. Confirm history persists
```

---

# APPENDIX J — PRIVATE TESTER SUCCESS CRITERIA

The MVP is promising if testers say:

```txt
I understand what the app does.
This feels more structured than ChatGPT.
The analysis helped me think clearly.
The scores made sense.
I would use this for a real decision.
I like that it checks back later.
I understand why I might pay.
```

The MVP needs work if testers say:

```txt
This just feels like ChatGPT.
I do not know what to do first.
The scores feel random.
The report is too long.
The app feels fake.
I do not trust the privacy.
The paywall appears too early.
```

---

# APPENDIX K — WINDSURF SELF-CHECK BEFORE EVERY RESPONSE

Before completing any coding step, Windsurf should ask internally:

```txt
Did I build the actual requested thing?
Did I avoid placeholders?
Did I keep files under 200 lines?
Did I add validation?
Did I handle loading/error/empty states?
Did I avoid exposing secrets?
Did I update docs?
Did I verify the integration path?
Did I avoid building future scope?
```

If any answer is no, fix before moving on.
