// CBMI Types — Cognitive Bias Mitigation Index domain types
export interface BiasDetectionEvent {
  id: string;
  user_id: string;
  decision_id: string | null;
  bias_name: string;
  description: string | null;
  context_excerpt: string | null;
  mitigation_strategy: string | null;
  was_acknowledged: boolean;
  was_mitigated: boolean;
  mitigated_at: string | null;
  created_at: string;
}

export interface CbmiScoreSnapshot {
  id: string;
  user_id: string;
  week_start: string;
  cbmi_score: number;
  total_bias_events: number;
  mitigated_events: number;
  decisions_analyzed: number;
  top_bias_this_week: string | null;
  created_at: string;
}

export interface UserBiasProfile {
  id: string;
  user_id: string;
  dominant_biases: Array<{ bias_name: string; count: number; trend: 'increasing' | 'stable' | 'decreasing' }>;
  top_strengths: Array<{ bias_name: string; count: number }>;
  current_cbmi: number;
  cbmi_trend: 'improving' | 'stable' | 'declining';
  persona_title: string;
  persona_level: number;
  total_bias_mitigations: number;
  total_decisions_with_bias_checks: number;
  updated_at: string;
  created_at: string;
}

export const PERSONA_TIERS = [
  { minScore: 0, title: 'Novice Decider', level: 1, description: 'Beginning your journey to clearer thinking' },
  { minScore: 30, title: 'Bias Detective', level: 2, description: 'Learning to spot cognitive traps' },
  { minScore: 50, title: 'Aware Decider', level: 3, description: 'Consistently recognizing biases in real-time' },
  { minScore: 70, title: 'Clear Thinker', level: 4, description: 'Most decisions are bias-aware' },
  { minScore: 90, title: 'Rationality Master', level: 5, description: 'Cognitive biases rarely go unnoticed' },
] as const;

export function getPersonaForScore(score: number): typeof PERSONA_TIERS[number] {
  const tier = [...PERSONA_TIERS].reverse().find(t => score >= t.minScore);
  return tier || PERSONA_TIERS[0];
}
