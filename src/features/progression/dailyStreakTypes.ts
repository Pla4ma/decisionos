export interface DailyStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_check_in_date: string;
  grace_days_used: number;
  updated_at: string;
}

export const DAILY_STREAK_CONFIG = {
  GRACE_DAYS_ALLOWED: 1,
  STREAK_WARNING_THRESHOLD: 3,
  RESET_AFTER_MISSED_DAYS: 2,
};
