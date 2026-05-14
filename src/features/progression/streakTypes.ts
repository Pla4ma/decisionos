// Streak Types — Weekly decision consistency tracking
export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  total_weeks_active: number;
  last_activity_week: string | null;
  grace_days_used: number;
  max_grace_days: number;
  streak_started_at: string | null;
  last_updated_at: string;
}

export interface StreakUpdateResult {
  current_streak: number;
  longest_streak: number;
  is_new?: boolean;
  streak_updated?: boolean;
  already_updated?: boolean;
}
