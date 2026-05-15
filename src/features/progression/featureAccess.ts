// Feature Access — Progressive Unlocking System
// Features are unlocked based on user milestones (decisions created, reviewed, etc.)
// This keeps the app simple for new users and progressively reveals more features.

export type FeatureId =
  // Tier 1 — Always available (core loop)
  | 'quick_decision'
  | 'full_decision'
  | 'decision_history'
  | 'ai_analysis'
  | 'basic_reflection'
  // Tier 2 — After 1st decision created
  | 'pattern_insights'
  | 'draft_continuation'
  // Tier 3 — After 1st analysis
  | 'regret_forecast'
  | 'decision_review'
  // Tier 4 — After 1st review completed
  | 'decision_inbox'
  | 'quick_review'
  // Tier 5 — After 3 decisions
  | 'daily_streak'
  | 'decision_velocity'
  // Tier 6 — After 5 reviews
  | 'dq_score'
  | 'blind_spots'
  // Tier 7 — After 10 reviews
  | 'archetype'
  | 'cbmi'
  // Tier 8 — Advanced/retention (higher milestones)
  | 'future_self'
  | 'daily_clarity_practice'
  | 'life_chapters'
  | 'graveyard'
  | 'hindsight_comparison'
  | 'playbooks'
  // Tier 9 — Social (delayed until core is proven)
  | 'second_opinions'
  | 'benchmarks'
  | 'accountability_pacts'
  | 'decision_partners';

export interface FeatureMilestone {
  id: FeatureId;
  label: string;
  description: string;
  requiredDecisionsCreated?: number;
  requiredDecisionsReviewed?: number;
  requiredAnalysesRun?: number;
  requiredDaysActive?: number;
  parentFeature?: FeatureId; // If set, only available when parent is available
}

export const FEATURE_CATALOG: Record<FeatureId, FeatureMilestone> = {
  // Tier 1 — Always available
  quick_decision: {
    id: 'quick_decision',
    label: 'Quick Decision',
    description: '2-minute lightweight decision creation',
  },
  full_decision: {
    id: 'full_decision',
    label: 'Full Analysis',
    description: 'Structured multi-step decision analysis',
  },
  decision_history: {
    id: 'decision_history',
    label: 'Decision History',
    description: 'Browse past decisions',
  },
  ai_analysis: {
    id: 'ai_analysis',
    label: 'AI Analysis',
    description: 'Deep analysis with Gemini AI',
  },
  basic_reflection: {
    id: 'basic_reflection',
    label: 'Basic Reflection',
    description: 'Quick reflection prompts after analysis',
  },

  // Tier 2 — After 1st decision created
  pattern_insights: {
    id: 'pattern_insights',
    label: 'Pattern Insights',
    description: 'Learn from patterns in your decisions',
    requiredDecisionsCreated: 1,
  },
  draft_continuation: {
    id: 'draft_continuation',
    label: 'Draft Continuation',
    description: 'Resume unfinished drafts',
    requiredDecisionsCreated: 1,
  },

  // Tier 3 — After 1st analysis
  regret_forecast: {
    id: 'regret_forecast',
    label: 'Regret Forecast',
    description: 'See potential regret risk for each option',
    requiredAnalysesRun: 1,
  },
  decision_review: {
    id: 'decision_review',
    label: 'Decision Review',
    description: 'Review outcomes after choosing',
    requiredAnalysesRun: 1,
  },

  // Tier 4 — After 1st review
  decision_inbox: {
    id: 'decision_inbox',
    label: 'Decision Inbox',
    description: 'Quick-capture thoughts for later decisions',
    requiredDecisionsReviewed: 1,
  },
  quick_review: {
    id: 'quick_review',
    label: 'Quick Check-In',
    description: '48-hour check-in after choosing',
    requiredDecisionsReviewed: 1,
  },

  // Tier 5 — After 3 decisions
  daily_streak: {
    id: 'daily_streak',
    label: 'Daily Streak',
    description: 'Track daily engagement streak',
    requiredDecisionsCreated: 3,
  },
  decision_velocity: {
    id: 'decision_velocity',
    label: 'Decision Velocity',
    description: 'Track how quickly you make decisions',
    requiredDecisionsCreated: 3,
  },

  // Tier 6 — After 5 reviews
  dq_score: {
    id: 'dq_score',
    label: 'Decision Quotient',
    description: 'Your personal decision quality score',
    requiredDecisionsReviewed: 5,
  },
  blind_spots: {
    id: 'blind_spots',
    label: 'Blind Spots',
    description: 'Identify your recurring thinking traps',
    requiredDecisionsReviewed: 5,
  },

  // Tier 7 — After 10 reviews
  archetype: {
    id: 'archetype',
    label: 'Decision Archetype',
    description: 'Your personal decision-making style',
    requiredDecisionsReviewed: 10,
  },
  cbmi: {
    id: 'cbmi',
    label: 'Decision Profile',
    description: 'Comprehensive decision-making profile',
    requiredDecisionsReviewed: 10,
  },

  // Tier 8 — Advanced
  future_self: {
    id: 'future_self',
    label: 'Future Self',
    description: 'Letters from your future self',
    requiredDecisionsCreated: 5,
    requiredDecisionsReviewed: 3,
  },
  daily_clarity_practice: {
    id: 'daily_clarity_practice',
    label: 'Daily Clarity Practice',
    description: 'Daily reflection exercises',
    requiredDaysActive: 3,
  },
  life_chapters: {
    id: 'life_chapters',
    label: 'Life Chapters',
    description: 'Organize decisions by life chapters',
    requiredDecisionsCreated: 5,
  },
  graveyard: {
    id: 'graveyard',
    label: 'Decision Graveyard',
    description: 'Archived and abandoned decisions',
    requiredDecisionsCreated: 5,
  },
  hindsight_comparison: {
    id: 'hindsight_comparison',
    label: 'Hindsight Comparison',
    description: 'Compare predictions to outcomes',
    requiredDecisionsReviewed: 2,
  },
  playbooks: {
    id: 'playbooks',
    label: 'Playbooks',
    description: 'Reusable decision templates',
    requiredDecisionsCreated: 3,
  },

  // Tier 9 — Social (delayed)
  second_opinions: {
    id: 'second_opinions',
    label: 'Second Opinions',
    description: 'Get trusted feedback on decisions',
    requiredDecisionsCreated: 10,
    requiredDecisionsReviewed: 5,
  },
  benchmarks: {
    id: 'benchmarks',
    label: 'Benchmarks',
    description: 'Compare decision patterns anonymously',
    requiredDecisionsCreated: 10,
    requiredDecisionsReviewed: 5,
  },
  accountability_pacts: {
    id: 'accountability_pacts',
    label: 'Accountability Pacts',
    description: 'Commit to decisions with a partner',
    requiredDecisionsCreated: 10,
    requiredDecisionsReviewed: 5,
  },
  decision_partners: {
    id: 'decision_partners',
    label: 'Decision Partners',
    description: 'Collaborate on decisions with others',
    requiredDecisionsCreated: 15,
    requiredDecisionsReviewed: 8,
  },
};

// Features that are hidden behind a parent feature
export const FEATURE_HIERARCHY: Partial<Record<FeatureId, FeatureId[]>> = {
  dq_score: ['archetype', 'cbmi'], // DQ unlocks archetype and CBMI
};

export function isFeatureUnlocked(
  featureId: FeatureId,
  stats: { decisionsCreated: number; decisionsReviewed: number; analysesRun: number; daysActive: number },
): boolean {
  const feature = FEATURE_CATALOG[featureId];
  if (!feature) return false;

  if (feature.requiredDecisionsCreated !== undefined && stats.decisionsCreated < feature.requiredDecisionsCreated) return false;
  if (feature.requiredDecisionsReviewed !== undefined && stats.decisionsReviewed < feature.requiredDecisionsReviewed) return false;
  if (feature.requiredAnalysesRun !== undefined && stats.analysesRun < feature.requiredAnalysesRun) return false;
  if (feature.requiredDaysActive !== undefined && stats.daysActive < feature.requiredDaysActive) return false;

  // Check parent feature dependency
  if (feature.parentFeature) {
    return isFeatureUnlocked(feature.parentFeature, stats);
  }

  return true;
}

// Get all unlocked features for a given stats set
export function getUnlockedFeatures(
  stats: { decisionsCreated: number; decisionsReviewed: number; analysesRun: number; daysActive: number },
): FeatureId[] {
  return (Object.keys(FEATURE_CATALOG) as FeatureId[]).filter((id) => isFeatureUnlocked(id, stats));
}

// Tier labels for UI display
export const FEATURE_TIER_LABELS: Record<string, string> = {
  1: 'Core',
  2: 'Getting Started',
  3: 'Deeper Analysis',
  4: 'Reflection',
  5: 'Building Habits',
  6: 'Advanced Insights',
  7: 'Mastery',
  8: 'Advanced',
  9: 'Social',
};
