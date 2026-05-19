export type FeatureId =
  | 'quick_decision' | 'full_decision' | 'decision_history' | 'ai_analysis' | 'basic_reflection'
  | 'pattern_insights' | 'draft_continuation'
  | 'regret_forecast' | 'decision_review'
  | 'decision_inbox' | 'quick_review'
  | 'daily_streak' | 'decision_velocity'
  | 'dq_score' | 'blind_spots'
  | 'archetype' | 'cbmi'
  | 'future_self' | 'daily_clarity_practice' | 'life_chapters' | 'graveyard' | 'hindsight_comparison' | 'playbooks'
  | 'second_opinions' | 'benchmarks' | 'accountability_pacts' | 'decision_partners';

export interface FeatureMilestone {
  id: FeatureId;
  label: string;
  description: string;
  requiredDecisionsCreated?: number;
  requiredDecisionsReviewed?: number;
  requiredAnalysesRun?: number;
  requiredDaysActive?: number;
  parentFeature?: FeatureId;
}

export const FEATURE_CATALOG: Record<FeatureId, FeatureMilestone> = {
  quick_decision: { id: 'quick_decision', label: 'Quick Decision', description: '2-minute lightweight decision creation' },
  full_decision: { id: 'full_decision', label: 'Full Analysis', description: 'Structured multi-step decision analysis' },
  decision_history: { id: 'decision_history', label: 'Decision History', description: 'Browse past decisions' },
  ai_analysis: { id: 'ai_analysis', label: 'AI Analysis', description: 'Deep analysis with Gemini AI' },
  basic_reflection: { id: 'basic_reflection', label: 'Basic Reflection', description: 'Quick reflection prompts after analysis' },
  draft_continuation: { id: 'draft_continuation', label: 'Draft Continuation', description: 'Resume unfinished drafts', requiredDecisionsCreated: 1 },
  pattern_insights: { id: 'pattern_insights', label: 'Pattern Insights', description: 'Learn from patterns in your decisions', requiredDecisionsCreated: 3 },
  regret_forecast: { id: 'regret_forecast', label: 'Regret Forecast', description: 'See potential regret risk for each option', requiredAnalysesRun: 1 },
  decision_review: { id: 'decision_review', label: 'Decision Review', description: 'Review outcomes after choosing', requiredAnalysesRun: 1 },
  decision_inbox: { id: 'decision_inbox', label: 'Decision Inbox', description: 'Quick-capture thoughts for later decisions', requiredDecisionsReviewed: 1 },
  quick_review: { id: 'quick_review', label: 'Quick Check-In', description: '48-hour check-in after choosing', requiredDecisionsReviewed: 1 },
  daily_streak: { id: 'daily_streak', label: 'Daily Streak', description: 'Track daily engagement streak', requiredDecisionsCreated: 3 },
  decision_velocity: { id: 'decision_velocity', label: 'Decision Velocity', description: 'Track how quickly you make decisions', requiredDecisionsCreated: 3 },
  dq_score: { id: 'dq_score', label: 'Decision Pattern Score', description: 'Your personal decision quality score', requiredDecisionsCreated: 1, requiredDecisionsReviewed: 1 },
  blind_spots: { id: 'blind_spots', label: 'Thinking Traps', description: 'Identify your recurring thinking traps', requiredDecisionsCreated: 1, requiredDecisionsReviewed: 1 },
  archetype: { id: 'archetype', label: 'Decision Archetype', description: 'Your personal decision-making style', requiredDecisionsReviewed: 2 },
  cbmi: { id: 'cbmi', label: 'Decision Profile', description: 'Comprehensive decision-making profile', requiredDecisionsReviewed: 2 },
  future_self: { id: 'future_self', label: 'Future Self', description: 'Letters from your future self', requiredDecisionsCreated: 3, requiredDecisionsReviewed: 1 },
  daily_clarity_practice: { id: 'daily_clarity_practice', label: 'Daily Clarity Practice', description: 'Daily reflection exercises', requiredDaysActive: 3 },
  life_chapters: { id: 'life_chapters', label: 'Life Chapters', description: 'Organize decisions by life chapters', requiredDecisionsCreated: 5 },
  graveyard: { id: 'graveyard', label: 'Decision Graveyard', description: 'Archived and abandoned decisions', requiredDecisionsCreated: 5 },
  hindsight_comparison: { id: 'hindsight_comparison', label: 'Hindsight Comparison', description: 'Compare predictions to outcomes', requiredDecisionsReviewed: 2 },
  playbooks: { id: 'playbooks', label: 'Playbooks', description: 'Reusable decision templates', requiredDecisionsCreated: 3 },
  second_opinions: { id: 'second_opinions', label: 'Second Opinions', description: 'Get trusted feedback on decisions', requiredDecisionsCreated: 3, requiredDecisionsReviewed: 2 },
  benchmarks: { id: 'benchmarks', label: 'Benchmarks', description: 'Compare decision patterns anonymously', requiredDecisionsCreated: 3, requiredDecisionsReviewed: 2 },
  accountability_pacts: { id: 'accountability_pacts', label: 'Accountability Pacts', description: 'Commit to decisions with a partner', requiredDecisionsCreated: 3, requiredDecisionsReviewed: 2 },
  decision_partners: { id: 'decision_partners', label: 'Decision Partners', description: 'Collaborate on decisions with others', requiredDecisionsCreated: 5, requiredDecisionsReviewed: 3 },
};

export const FEATURE_HIERARCHY: Partial<Record<FeatureId, FeatureId[]>> = {
  dq_score: ['archetype', 'cbmi'],
};

export const FEATURE_TIER_LABELS: Record<string, string> = {
  1: 'Core', 2: 'Getting Started', 3: 'Deeper Analysis', 4: 'Reflection',
  5: 'Building Habits', 6: 'Advanced Insights', 7: 'Mastery', 8: 'Advanced', 9: 'Social',
};
