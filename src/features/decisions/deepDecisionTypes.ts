// Deep Decision Intelligence Types
// Forecasts, Blind Spots, Velocity, Playbooks — the systems that make this industry-shaking

export interface RegretForecastItem {
  option_id: string;
  option_title: string;
  regret_likelihood: number; // 0-100
  why: string;
  what_would_cause_regret: string;
  time_horizon: 'short_term' | 'medium_term' | 'long_term';
}

export interface FutureSelfLetter {
  option_id: string;
  option_title: string;
  letter_text: string; // "Dear past me..." style letter
  perspective: string; // What future-you sees that you can't see now
  biggest_lesson: string;
}

export interface BlindSpotAlert {
  blind_spot_type: string;
  title: string;
  description: string;
  relevant_to_option: string | null;
  severity: 'mild' | 'moderate' | 'significant';
}

export interface DecisionForecast {
  id: string;
  decision_id: string;
  user_id: string;
  regret_forecast: RegretForecastItem[];
  future_self_letters: FutureSelfLetter[];
  blind_spot_alerts: BlindSpotAlert[];
  confidence_timeline: {
    immediate: number;
    short_term: number;
    long_term: number;
  };
  created_at: string;
}

export interface DecisionVelocity {
  id: string;
  decision_id: string;
  user_id: string;
  created_to_decided_hours: number | null;
  decided_to_reviewed_hours: number | null;
  satisfaction_score: number | null;
  would_choose_same: boolean | null;
  velocity_tier: 'rushed' | 'quick' | 'moderate' | 'deliberate' | 'slow' | null;
}

export interface UserBlindSpot {
  id: string;
  user_id: string;
  blind_spot_type: string;
  title: string;
  description: string;
  evidence_count: number;
  severity: 'mild' | 'moderate' | 'significant';
  is_active: boolean;
}

export interface DecisionPlaybook {
  id: string;
  user_id: string;
  version: number;
  title: string;
  strengths: PlaybookItem[];
  weaknesses: PlaybookItem[];
  biases: PlaybookBias[];
  optimal_speed: string | null;
  strongest_categories: PlaybookCategory[];
  growth_areas: PlaybookCategory[];
  regret_pattern: string | null;
  decision_philosophy: string | null;
  generated_at: string;
  review_count: number;
  is_published: boolean;
}

export interface PlaybookItem {
  title: string;
  description: string;
  confidence?: number;
  impact?: string;
}

export interface PlaybookBias {
  type: string;
  title: string;
  description: string;
  severity?: string;
}

export interface PlaybookCategory {
  category: string;
  avg_satisfaction?: number;
  suggestion?: string;
}

export interface PredictionAccuracy {
  id: string;
  user_id: string;
  forecast_id: string;
  decision_id: string;
  regret_accuracy: number | null;
  satisfaction_predicted: number | null;
  satisfaction_actual: number | null;
  did_regret: boolean | null;
  was_regret_predicted: boolean | null;
  analysis_accuracy: number | null;
}

// Simplified user profile stats (replaces gamified progression)
export interface UserStats {
  total_decisions_made: number;
  total_reviews_completed: number;
  regret_rate: number | null; // % of decisions they'd change
  avg_decision_hours: number | null;
  decision_consistency_days: number;
  avg_satisfaction: number | null;
}
