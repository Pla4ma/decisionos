// Challenge Types — Daily/weekly micro-engagement
export type ChallengeType = 'quick_poll' | 'blind_spot_quiz' | 'what_would_you_do' | 'tradeoff_puzzle' | 'values_check';

export interface ChallengeOption {
  id: string;
  title: string;
  explanation: string;
}

export interface DecisionChallenge {
  id: string;
  challenge_type: ChallengeType;
  title: string;
  description: string;
  scenario: string;
  options: ChallengeOption[];
  correct_insight: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  active_from: string;
  active_until: string;
  category: string | null;
}

export interface UserChallengeResponse {
  id: string;
  user_id: string;
  challenge_id: string;
  selected_option_id: string;
  created_at: string;
}
