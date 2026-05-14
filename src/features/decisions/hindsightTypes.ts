// Hindsight Types — Types for the hindsight feedback loop system
export interface HindsightComparison {
  /** What the user expected to happen vs what actually happened */
  prediction_accuracy: string;
  /** Specific biases that were present in the original decision */
  biases_exhibited: Array<{
    bias_name: string;
    how_it_manifested: string;
    would_have_changed_outcome: 'likely' | 'possibly' | 'unlikely';
  }>;
  /** Key lessons identified */
  lessons: string[];
  /** The "path not taken" — what was the alternative and what might have happened */
  path_not_taken: {
    alternative_option: string;
    predicted_alternative_outcome: string;
    why_it_was_rejected_originally: string;
  } | null;
  /** Growth insight — how the user has improved */
  growth_insight: string;
  /** Updated CBMI relevant bias info */
  bias_acknowledged: boolean;
}

export interface HindsightReport {
  id: string;
  decision_id: string;
  user_id: string;
  comparison: HindsightComparison;
  created_at: string;
}

export interface HindsightReviewInput {
  decisionTitle: string;
  originalContext: string;
  chosenOptionTitle: string;
  rejectedOptions: string[];
  originalAnalysisSummary: string;
  outcomeNotes: string;
  satisfactionScore: number | null;
  wouldChooseSame: boolean | null;
}
