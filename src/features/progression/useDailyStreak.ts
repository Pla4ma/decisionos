import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { DailyStreak, StreakRecovery } from './dailyStreakTypes';
import { DAILY_STREAK_CONFIG } from './dailyStreakTypes';

interface UseDailyStreakOptions {
  enabled?: boolean;
}

interface UseDailyStreakReturn {
  dailyStreak: DailyStreak | null;
  currentStreak: number;
  longestStreak: number;
  isAtRisk: boolean;
  isOnFire: boolean;
  checkedInToday: boolean;
  isLoading: boolean;
  recovery: StreakRecovery | null;
  checkIn: () => Promise<void>;
  forgiveStreak: () => Promise<void>;
}

function computeRecovery(streak: DailyStreak, checkedInToday: boolean): StreakRecovery | null {
  if (checkedInToday) return null;
  if (streak.current_streak === 0) return null;

  const today = new Date().toISOString().split('T')[0];
  const lastDate = new Date(streak.last_check_in_date);
  const now = new Date();
  const diffMs = now.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return null;

  const graceLeft = Math.max(0, DAILY_STREAK_CONFIG.GRACE_DAYS_ALLOWED - streak.grace_days_used);

  if (diffDays <= DAILY_STREAK_CONFIG.RESET_AFTER_MISSED_DAYS && graceLeft > 0) {
    return {
      missedDays: diffDays - 1,
      graceDaysRemaining: graceLeft,
      isOnRecovery: true,
      recoveryMessage: `You missed ${diffDays - 1} day${diffDays - 1 > 1 ? 's' : ''}. Your streak is safe — use a grace day to keep it going.`,
      recoveryAction: 'forgive_and_continue',
    };
  }

  if (diffDays <= DAILY_STREAK_CONFIG.RECOVERY_WINDOW_HOURS / 24 + 1) {
    const isSameWeek = lastDate.getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1000;
    if (isSameWeek) {
      return {
        missedDays: diffDays - 1,
        graceDaysRemaining: 0,
        isOnRecovery: true,
        recoveryMessage: `You're back. Your streak paused — pick up where you left off.`,
        recoveryAction: 'check_in',
      };
    }
  }

  return null;
}

export function useDailyStreak(userId: string | null, options?: UseDailyStreakOptions): UseDailyStreakReturn {
  const queryClient = useQueryClient();

  const { data: streak, isLoading } = useQuery({
    queryKey: ['dailyStreak', userId],
    queryFn: async (): Promise<DailyStreak | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('daily_streaks')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },
    enabled: !!userId && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5,
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('No user');
      const { data, error } = await supabase.rpc('daily_check_in', { p_user_id: userId });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyStreak', userId] });
    },
  });

  const forgiveMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('No user');
      await supabase.rpc('forgive_streak_grace_day', { p_user_id: userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyStreak', userId] });
    },
  });

  const today = new Date().toISOString().split('T')[0];
  const lastCheckIn = streak?.last_check_in_date;
  const checkedInToday = lastCheckIn === today;

  const recovery = streak && !checkedInToday ? computeRecovery(streak, checkedInToday) : null;

  return {
    dailyStreak: streak || null,
    currentStreak: streak?.current_streak ?? 0,
    longestStreak: streak?.longest_streak ?? 0,
    isAtRisk: streak ? streak.current_streak >= 3 && !checkedInToday : false,
    isOnFire: streak ? streak.current_streak >= 7 : false,
    checkedInToday,
    isLoading,
    recovery,
    checkIn: () => checkInMutation.mutateAsync(),
    forgiveStreak: () => forgiveMutation.mutateAsync(),
  };
}