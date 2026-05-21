export type FeatureClassification = 'core' | 'progressive' | 'experimental' | 'disabled' | 'deprecated';

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
  classification: FeatureClassification;
  requiredDecisionsCreated?: number;
  requiredDecisionsReviewed?: number;
  requiredAnalysesRun?: number;
  requiredDaysActive?: number;
  requiredValuesAvailable?: boolean;
  requiredPrivacyConsent?: boolean;
  parentFeature?: FeatureId;
}

export const FEATURE_CATALOG: Record<FeatureId, FeatureMilestone> = {
  quick_decision: { id: 'quick_decision', label: 'Quick Decision', description: '2-minute lightweight decision creation', classification: 'core' },
  full_decision: { id: 'full_decision', label: 'Full Analysis', description: 'Structured multi-step decision analysis', classification: 'core' },
  decision_history: { id: 'decision_history', label: 'Decision History', description: 'Browse past decisions', classification: 'core' },
  ai_analysis: { id: 'ai_analysis', label: 'AI Analysis', description: 'Deep analysis with Gemini AI', classification: 'core' },
  basic_reflection: { id: 'basic_reflection', label: 'Basic Reflection', description: 'Quick reflection prompts after analysis', classification: 'core' },
  draft_continuation: { id: 'draft_continuation', label: 'Draft Continuation', description: 'Resume unfinished drafts', classification: 'core', requiredDecisionsCreated: 1 },
  pattern_insights: { id: 'pattern_insights', label: 'Pattern Insights', description: 'Learn from patterns in your decisions', classification: 'progressive', requiredDecisionsCreated: 3, requiredDecisionsReviewed: 1 },
  regret_forecast: { id: 'regret_forecast', label: 'Regret Forecast', description: 'See potential regret risk for each option', classification: 'progressive', requiredAnalysesRun: 1 },
  decision_review: { id: 'decision_review', label: 'Decision Review', description: 'Review outcomes after choosing', classification: 'core', requiredAnalysesRun: 1 },
  decision_inbox: { id: 'decision_inbox', label: 'Decision Inbox', description: 'Quick-capture thoughts for later decisions', classification: 'progressive', requiredDecisionsReviewed: 1 },
  quick_review: { id: 'quick_review', label: 'Quick Check-In', description: '48-hour check-in after choosing', classification: 'progressive', requiredDecisionsReviewed: 1 },
  daily_streak: { id: 'daily_streak', label: 'Daily Streak', description: 'Track daily engagement streak', classification: 'progressive', requiredDecisionsCreated: 3 },
  decision_velocity: { id: 'decision_velocity', label: 'Decision Velocity', description: 'Track how quickly you make decisions', classification: 'progressive', requiredDecisionsCreated: 3 },
  dq_score: { id: 'dq_score', label: 'Decision Pattern Score', description: 'Your personal decision quality score', classification: 'progressive', requiredDecisionsReviewed: 5 },
  blind_spots: { id: 'blind_spots', label: 'Thinking Traps', description: 'Identify your recurring thinking traps', classification: 'progressive', requiredDecisionsReviewed: 3 },
  archetype: { id: 'archetype', label: 'Decision Archetype', description: 'Your personal decision-making style', classification: 'progressive', requiredDecisionsReviewed: 8 },
  cbmi: { id: 'cbmi', label: 'Decision Profile', description: 'Comprehensive decision-making profile', classification: 'progressive', requiredDecisionsReviewed: 10 },
  future_self: { id: 'future_self', label: 'Future Self', description: 'Letters from your future self', classification: 'progressive', requiredDecisionsReviewed: 3, requiredValuesAvailable: true },
  daily_clarity_practice: { id: 'daily_clarity_practice', label: 'Daily Clarity Practice', description: 'Daily reflection exercises', classification: 'progressive', requiredDecisionsCreated: 1 },
  life_chapters: { id: 'life_chapters', label: 'Life Chapters', description: 'Organize decisions by life chapters', classification: 'progressive', requiredDecisionsCreated: 10 },
  graveyard: { id: 'graveyard', label: 'Decision Graveyard', description: 'Archived and abandoned decisions', classification: 'progressive', requiredDecisionsCreated: 10 },
  hindsight_comparison: { id: 'hindsight_comparison', label: 'Hindsight Comparison', description: 'Compare predictions to outcomes', classification: 'progressive', requiredDecisionsReviewed: 5 },
  playbooks: { id: 'playbooks', label: 'Playbooks', description: 'Reusable decision templates', classification: 'progressive', requiredDecisionsCreated: 8 },
  second_opinions: { id: 'second_opinions', label: 'Second Opinions', description: 'Get trusted feedback on decisions', classification: 'disabled', requiredDecisionsCreated: 10, requiredDecisionsReviewed: 10, requiredPrivacyConsent: true },
  benchmarks: { id: 'benchmarks', label: 'Benchmarks', description: 'Compare decision patterns anonymously', classification: 'progressive', requiredDecisionsCreated: 10, requiredDecisionsReviewed: 10, requiredPrivacyConsent: true },
  accountability_pacts: { id: 'accountability_pacts', label: 'Accountability Pacts', description: 'Commit to decisions with a partner', classification: 'disabled', requiredDecisionsCreated: 10, requiredDecisionsReviewed: 10, requiredPrivacyConsent: true },
  decision_partners: { id: 'decision_partners', label: 'Decision Partners', description: 'Collaborate on decisions with others', classification: 'disabled', requiredDecisionsCreated: 15, requiredDecisionsReviewed: 10, requiredPrivacyConsent: true },
};

export const FEATURE_HIERARCHY: Partial<Record<FeatureId, FeatureId[]>> = {
  dq_score: ['archetype', 'cbmi'],
};

export const FEATURE_TIER_LABELS: Record<string, string> = {
  1: 'Core', 2: 'Getting Started', 3: 'Deeper Analysis', 4: 'Reflection',
  5: 'Building Habits', 6: 'Advanced Insights', 7: 'Mastery', 8: 'Advanced', 9: 'Social',
};

export const TABLE_CLASSIFICATION: Record<string, FeatureClassification> = {
  profiles: 'core',
  decisions: 'core',
  decision_options: 'core',
  decision_answers: 'core',
  decision_analysis: 'core',
  decision_reviews: 'core',
  ai_usage_events: 'core',
  subscriptions: 'core',

  decision_forecasts: 'progressive',
  pattern_insights: 'progressive',
  dq_scores: 'progressive',
  user_blind_spots: 'progressive',
  user_cbmi_scores: 'progressive',
  user_bias_profiles: 'progressive',
  prediction_calibrations: 'progressive',
  decision_velocity_log: 'progressive',
  future_self_messages: 'progressive',
  daily_practices: 'progressive',
  decision_journal: 'progressive',
  decision_inbox: 'progressive',
  life_chapters: 'progressive',
  decision_graveyard: 'progressive',
  decision_velocity: 'progressive',
  prediction_accuracy: 'progressive',
  hindsight_reports: 'progressive',
  bias_detection_events: 'progressive',
  notification_tokens: 'progressive',
  earned_analyses: 'progressive',
  decision_reflections: 'progressive',
  micro_reviews: 'progressive',
  quick_reviews: 'progressive',
  user_streaks: 'progressive',
  daily_streaks: 'progressive',
  decision_playbooks: 'progressive',

  decision_challenges: 'experimental',
  user_challenge_responses: 'experimental',
  decision_templates: 'experimental',

  decision_partners: 'disabled',
  practice_sessions: 'disabled',
  accountability_pacts: 'disabled',
  pact_invites: 'disabled',
  second_opinion_requests: 'disabled',
  second_opinion_votes: 'disabled',

  decision_pattern_insights: 'deprecated',
};
