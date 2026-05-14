# DecisionOS — Archive Notes

## Purpose

Documentation of the `THIRD APP/` archive folder, its contents, and patterns that may inspire DecisionOS.

---

## Archive Root

**Location**: `archive/` (moved from project root)  
**Current Contents**:
- `HomeScreenV2.tsx`
- `productivity/` (31 items)
- `services/` (46 items)
- `tests/` (41 items)

**Total Files**: 119 files

**Move Date**: 2026-05-03 (Phase 1)

---

## Archive Inventory

### File Count Estimate

| Folder | Items |
|--------|-------|
| Root | 2 files |
| productivity/ | 31 items |
| services/ | 46 items |
| tests/ | 41 items |
| **Total** | ~120 files |

---

## High-Value Inspiration Files

These files may inspire DecisionOS patterns:

| File | Possible Use |
|------|--------------|
| `archive/HomeScreenV2.tsx` | Hero card pattern, quick action rail, state management |
| `archive/productivity/ai/PersonalizedAICoach.ts` | AI interaction patterns, prompt structure |
| `archive/productivity/ai/PredictiveAnalyticsEngine.ts` | Analysis result formatting |
| `archive/productivity/analytics/ProductivityAnalytics.ts` | Safe analytics logging patterns |
| `archive/productivity/core/ProductivityEngine.ts` | Core service architecture |
| `archive/productivity/goals/GoalTrackingService.ts` | Progress tracking patterns |
| `archive/productivity/habits/HabitFormationService.ts` | Outcome review patterns |
| `archive/productivity/monetization/RealMonetizationService.ts` | RevenueCat integration patterns |
| `archive/productivity/progression/RealProgressionService.ts` | Usage limit patterns |
| `archive/productivity/repositories/GoalRepository.ts` | Repository pattern structure |
| `archive/productivity/repositories/ProductivityRepository.ts` | Database query patterns |
| `archive/productivity/simulation/PredictiveLifeSimulation.ts` | Decision simulation ideas |
| `archive/productivity/stores/ProductivityStore.ts` | State management patterns |
| `archive/productivity/ui/components/GoalCreationForm.tsx` | Form patterns, validation |
| `archive/productivity/ui/hooks/useProductivity.ts` | Custom hook patterns |
| `archive/productivity/validation/ProductivityValidators.ts` | Validation schema patterns |
| `archive/services/auth.ts` | Auth service patterns |
| `archive/services/supabaseAuth.ts` | Supabase integration patterns |
| `archive/services/realtime.ts` | Realtime subscription patterns |
| `archive/services/DataAnalyticsService.ts` | Analytics service structure |
| `archive/services/ArtificialIntelligenceService.ts` | AI service patterns |
| `archive/services/CyberSecurityService.ts` | Security patterns |
| `archive/services/CloudComputingService.ts` | External service integration |

**Note**: Use for inspiration only. Do not copy blindly.

---

## Future NeuroFlow Inspiration Files

These are relevant to the broader ecosystem but NOT for MVP:

| File | Future Use |
|------|------------|
| `archive/productivity/biometric/BiometricOptimizationSystem.ts` | Health data integration |
| `archive/productivity/collaboration/CollaborationService.ts` | Team features |
| `archive/productivity/collaboration/RealTimeCollaborationSystem.ts` | Real-time collaboration |
| `archive/productivity/enterprise/TeamAnalyticsSystem.ts` | Enterprise features |
| `archive/productivity/gamification/RealWorldRewardsSystem.ts` | Gamification |
| `archive/productivity/impact/ImpactMeasurementSystem.ts` | Impact tracking |
| `archive/productivity/integration/VEXProductivitySystem.ts` | System integration |
| `archive/productivity/neuro/NeuroProductivitySystem.ts` | NeuroFlow core |
| `archive/productivity/security/AdvancedSecuritySystem.ts` | Advanced security |
| `archive/productivity/verification/ElevenTenComprehensiveAudit.ts` | Audit features |
| `archive/productivity/verification/ElevenTenVerification.ts` | Verification system |

---

## MVP-Banned Distraction Files

These are explicitly out of scope and must not influence MVP:

| File | Why Excluded |
|------|--------------|
| `archive/productivity/blockchain/BlockchainAchievementSystem.ts` | Blockchain not in MVP |
| `archive/productivity/immersive/ARVREnvironments.ts` | AR/VR not in MVP |
| `archive/productivity/marketplace/GlobalProductivityMarketplace.ts` | Marketplace not in MVP |
| `archive/productivity/quantum/QuantumProductivityAlgorithms.ts` | Quantum not in MVP |
| `archive/services/AdvancedMaterialsService.ts` | Future tech |
| `archive/services/BiotechnologyService.ts` | Future tech |
| `archive/services/BlockchainService.ts` | Blockchain not in MVP |
| `archive/services/DigitalTwinService.ts` | Future tech |
| `archive/services/EdgeComputingService.ts` | Infrastructure focus |
| `archive/services/EnvironmentalScienceService.ts` | Domain-specific |
| `archive/services/HolographicDisplayService.ts` | Future tech |
| `archive/services/InternetOfThingsService.ts` | Hardware integration |
| `archive/services/MedicalResearchService.ts` | Regulated domain |
| `archive/services/NanotechnologyService.ts` | Future tech |
| `archive/services/NeuralInterfaceService.ts` | Future tech |
| `archive/services/QuantumComputingService.ts` | Quantum not in MVP |
| `archive/services/RoboticsAutomationService.ts` | Robotics not in MVP |
| `archive/services/RoboticsService.ts` | Robotics not in MVP |
| `archive/services/SpaceExplorationService.ts` | Domain-specific |
| `archive/services/VirtualRealityService.ts` | VR not in MVP |

---

## Old Tests Policy

The `archive/tests/` folder contains 41 test files from the previous iteration.

- **Do not treat as current tests** — They test old code
- **Do not fix for missing repositories** — Old dependencies may be broken
- **Use as inspiration** — Testing patterns and coverage ideas
- **Reference during Phase 2+** — When creating new test structure

---

## HomeScreenV2 Useful Patterns

**File**: `archive/HomeScreenV2.tsx` (213 lines)

### Keep
- **Component composition structure** — Clean separation: ContextBar, HeroCard, QuickActionsRail, MiniBossPreview
- **Safe area handling** — Uses `useSafeAreaInsets()` correctly with padding adjustments
- **ScrollView with RefreshControl** — Pull-to-refresh pattern with haptic feedback
- **Style memoization** — `useMemo` for styles to avoid recalculation
- **Callback memoization** — `useCallback` for event handlers

### Adapt
- **State management** — Uses custom hooks (`useHomeRecommendation`, `useDailyLoginReward`) → Adapt to TanStack Query + Zustand
- **Navigation** — Uses `@react-navigation/native` → Adapt to Expo Router
- **Theming** — Uses custom `useTheme` hook → Adapt to decisionOS theme system
- **Hero card pattern** — Recommendation CTA → Decision summary card with "Continue Analysis" action
- **Quick actions rail** — Focus/Study/Boss/Progress → New Decision/History/Settings

### Avoid
- **Gamification elements** — Daily login rewards, streaks, boss battles
- **Productivity-specific language** — "focus session", "study plan", "squad"
- **Complex recommendation engine** — Overly elaborate for decision context
- **Biometric/achievement hooks** — Not relevant to decision product

### DecisionOS Home Screen Direction
- **Recent decisions list** — Clean card-based list of active decisions
- **Prominent "New Decision" CTA** — Primary action clearly visible
- **Usage indicator** — "X analyses remaining this month" (not gamified)
- **Calm aesthetic** — No streaks, points, or competitive elements
- **Simple navigation** — Create | History | Settings (no deep nesting)

---

## Phase 7 — HomeScreenV2 Adaptation

**Completed**: 2026-05-03

### Patterns Used in DecisionOS Home

**Directly adapted:**
- Component composition structure (header, hero, quick actions)
- Safe area handling with `useSafeAreaInsets()`
- ScrollView with RefreshControl pattern
- StyleSheet memoization for performance
- Callback memoization with `useCallback()`

**Modified for DecisionOS:**
- Recommendation engine simplified for decision context
- Quick actions: Focus/Study/Boss → New/History/Settings
- Removed gamification elements
- Changed productivity language to decision language

**Files influenced:**
- `src/components/home/DecisionHomeHeader.tsx` — Adapted from ContextBar + greeting pattern
- `src/components/home/DailyClarityCard.tsx` — Hero card pattern adapted
- `src/components/home/DecisionQuickActions.tsx` — QuickActionsRail adapted
- `src/app/index.tsx` — Overall screen structure inspired by HomeScreenV2 layout

---

## Archive-to-Roadmap Mapping

This section maps archive files to potential roadmap stages, ensuring archive value is preserved while maintaining MVP focus.

### Stage 1 — DecisionOS MVP (Already Completed)

| Archive File | MVP Implementation | Status |
|--------------|-------------------|--------|
| `HomeScreenV2.tsx` | Home screen layout and components | ✅ Adapted |
| `ProductivityEngine.ts` | Decision analysis service patterns | ✅ Inspired |
| `PersonalizedAICoach.ts` | AI interaction patterns | ✅ Inspired |
| `ProductivityAnalytics.ts` | Safe analytics logging | ✅ Inspired |

### Stage 2 — Decision Memory

| Archive File | Potential Use | Implementation Notes |
|--------------|--------------|----------------------|
| `GoalTrackingService.ts` | Memory pattern recognition | Adapt for decision patterns |
| `HabitFormationService.ts` | Review habit formation | Modify for decision reviews |
| `PredictiveAnalyticsEngine.ts` | Insight generation | Simplify for decision insights |
| `PersonalizedAICoach.ts` | Memory-based coaching | Focus on past decisions |

### Stage 3 — Regret Simulator

| Archive File | Potential Use | Implementation Notes |
|--------------|--------------|----------------------|
| `PredictiveAnalyticsEngine.ts` | Monte Carlo simulations | Extend for regret modeling |
| `ProductivityEngine.ts` | Scenario modeling | Adapt for decision scenarios |
| `AdvancedAnalyticsService.ts` | Probability calculations | Build regret probability curves |

### Stage 4 — Goal Conversion

| Archive File | Potential Use | Implementation Notes |
|--------------|--------------|----------------------|
| `GoalTrackingService.ts` | Core goal system | Direct adaptation possible |
| `ProgressVisualization.ts` | Goal progress UI | Adapt for decision-goal mapping |
| `AchievementSystem.ts` | Celebration mechanics | Modify for decision achievements |
| `MilestoneTracker.ts` | Goal milestones | Adapt for decision milestones |

### Stage 5 — Future Self Simulator

| Archive File | Potential Use | Implementation Notes |
|--------------|--------------|----------------------|
| `PredictiveLifeSimulation.ts` | Future self modeling | Core inspiration |
| `PersonalizedAICoach.ts` | Conversational interface | Adapt for future self |
| `TimeSeriesAnalysis.ts` | Long-term impact modeling | Extend for life trajectory |
| `AdvancedSimulationEngine.ts` | Complex simulations | Build future self engine |

### Stage 6 — NeuroFlow Expansion

| Archive File | Potential Use | Implementation Notes |
|--------------|--------------|----------------------|
| `HabitFormationService.ts` | Habit tracking integration | Direct adaptation |
| `TeamAnalyticsSystem.ts` | Team collaboration | Extend for team decisions |
| `BiometricIntegration.ts` | Biometric insights | Build health-decision links |
| `EnterpriseAnalytics.ts` | Advanced analytics | Adapt for enterprise features |
| `ProductivityEngine.ts` | Holistic life optimization | Extend for life dashboard |

### Future-Only / MVP-Banned Files

| Archive File | Roadmap Stage | Why Banned from MVP |
|--------------|--------------|-------------------|
| `MedicalDecisionSupport.ts` | Never | Medical category - requires professional guidance |
| `LegalAdviceEngine.ts` | Never | Legal category - requires professional guidance |
| `InvestmentPortfolioOptimizer.ts` | Never | Investment category - requires professional guidance |
| `CrisisInterventionSystem.ts` | Never | Crisis category - requires professional help |
| `TherapyModeService.ts` | Never | Mental health - requires professional guidance |
| `AdvancedGamification.ts` | Never | Gamification - MVP focused on utility |
| `SocialMediaIntegration.ts` | Stage 6+ | Social features - MVP solo focus |
| `AdvancedSecuritySystem.ts` | Stage 5+ | Enhanced security - MVP security sufficient |

### Implementation Guidelines

**Direct Adaptation (High Confidence):**
- `GoalTrackingService.ts` → Goal Conversion stage
- `HabitFormationService.ts` → Decision Memory stage
- `HomeScreenV2.tsx` patterns → Already adapted

**Significant Modification Required:**
- `PredictiveLifeSimulation.ts` → Future Self Simulator (major simplification)
- `TeamAnalyticsSystem.ts` → NeuroFlow Expansion (solo→team transition)
- `BiometricIntegration.ts` → NeuroFlow Expansion (privacy considerations)

**Inspiration Only:**
- `PredictiveAnalyticsEngine.ts` → Multiple stages (pattern inspiration)
- `ProductivityEngine.ts` → Multiple stages (architectural patterns)
- `PersonalizedAICoach.ts` → Multiple stages (interaction patterns)

---

## Document History

| Date | Change |
|------|--------|
| 2026-05-03 | Initial inventory created in Phase 0 |
| 2026-05-03 | Phase 7 HomeScreenV2 adaptation documented |
| 2026-05-03 | Added archive-to-roadmap mapping for Phase 18 |
