// Decision Domain Types
// Core type definitions for the DecisionOS decision domain

// Bias warning during drafting
export interface BiasWarning {
  bias_name: string;
  description: string;
  context_in_decision: string;
  mitigation_strategy: string;
}

// Decision categories - safe for MVP (no medical/legal/investment)
export type DecisionCategory =
  | 'school'
  | 'career'
  | 'money'
  | 'moving'
  | 'business'
  | 'personal_goals'
  | 'other';

// Decision status workflow
export type DecisionStatus =
  | 'draft'           // Initial creation
  | 'questions'       // Answering guided questions
  | 'ready_for_analysis'  // All required data collected
  | 'analyzed'        // AI analysis complete
  | 'chosen'          // User selected an option
  | 'review_scheduled' // Review date set
  | 'reviewed';       // Outcome recorded

// Core Decision entity
export interface Decision {
  id: string;
  user_id: string;
  title: string;
  context: string | null;
  category: DecisionCategory;
  status: DecisionStatus;
  importance: number; // 1-10
  urgency: number;   // 1-10
  created_at: string;
  updated_at: string;
  scheduled_review_at: string | null;
  completed_at: string | null;
}

// Decision option/alternative
export interface DecisionOption {
  id: string;
  decision_id: string;
  user_id: string;
  title: string;
  description: string | null;
  pros: string[];
  cons: string[];
  is_chosen: boolean;
  created_at: string;
  updated_at: string;
}

// User's answer to a guided question
export interface DecisionAnswer {
  id: string;
  decision_id: string;
  user_id: string;
  question_key: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

// AI-generated analysis for a decision
export interface DecisionAnalysis {
  id: string;
  decision_id: string;
  user_id: string;
  option_scores: OptionScore[];
  summary: string;
  factors_considered: string[];
  confidence_level: number; // 0-100
  created_at: string;
}

// Score for a specific option
export interface OptionScore {
  option_id: string;
  option_title: string;
  overall_score: number; // 0-100
  scores: Record<DecisionScoreName, number>;
  reasoning: string;
}

// Decision score dimensions
export type DecisionScoreName =
  | 'regret_risk'
  | 'confidence'
  | 'values_alignment'
  | 'reversibility'
  | 'risk';

// Review/outcome tracking
export interface DecisionReview {
  id: string;
  decision_id: string;
  user_id: string;
  chosen_option_id: string;
  outcome_notes: string;
  satisfaction_score: number | null; // 1-10
  would_choose_same: boolean | null;
  lessons_learned: string | null;
  created_at: string;
  updated_at: string;
}

// Pattern insight for user learning
export interface DecisionPatternInsight {
  id: string;
  user_id: string;
  insight_type: 'strength' | 'bias' | 'pattern' | 'suggestion';
  title: string;
  description: string;
  evidence_count: number;
  created_at: string;
}

// New option input
export interface CreateOptionInput {
  title: string;
  description?: string;
  pros?: string[];
  cons?: string[];
}

// Review input
export interface CreateReviewInput {
  chosen_option_id: string;
  outcome_notes: string;
  satisfaction_score?: number;
  would_choose_same?: boolean;
  lessons_learned?: string;
}

// Filter for listing decisions
export interface DecisionFilter {
  status?: DecisionStatus;
  category?: DecisionCategory;
  archived?: boolean;
}
