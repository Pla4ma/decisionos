// Earned Analyses Types — Free tier can earn analyses through reviews
export interface EarnedAnalyses {
  id: string;
  user_id: string;
  decision_id: string;
  source: 'review_completed';
  earned_at: string;
  used_at: string | null;
  is_used: boolean;
  expires_at: string;
}

export interface EarnedAnalysesStatus {
  total_earned: number;
  unused_count: number;
  can_earn_today: boolean;
}
