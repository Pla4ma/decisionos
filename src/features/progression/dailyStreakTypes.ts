export interface DailyStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_check_in_date: string;
  grace_days_used: number;
  updated_at: string;
  missed_days: number;
  last_welcome_back_shown: string | null;
  recovery_date: string | null;
}

export interface StreakRecovery {
  missedDays: number;
  graceDaysRemaining: number;
  isOnRecovery: boolean;
  recoveryMessage: string;
  recoveryAction: 'check_in' | 'forgive_and_continue' | 'restart';
}

export const DAILY_STREAK_CONFIG = {
  GRACE_DAYS_ALLOWED: 3,
  STREAK_WARNING_THRESHOLD: 3,
  RESET_AFTER_MISSED_DAYS: 5,
  RECOVERY_WINDOW_HOURS: 48,
};
