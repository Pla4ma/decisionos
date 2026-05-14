import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { DailyStreak } from './dailyStreakTypes';

interface UseDailyStreakReturn {
  dailyStreak: DailyStreak | null;
  currentStreak: number;
  longestStreak: number;
  isAtRisk: boolean;
  isOnFire: boolean;
  checkedInToday: boolean;
  isLoading: boolean;
  checkIn: () => Promise<void>;
}

export function useDailyStreak(userId: string | null): UseDailyStreakReturn {
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
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('No user');
      const { data, error } = await supabase.rpc('daily_check_in', {
        p_user_id: userId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyStreak', userId] });
    },
  });

  const today = new Date().toISOString().split('T')[0];
  const lastCheckIn = streak?.last_check_in_date;
  const checkedInToday = lastCheckIn === today;

  return {
    dailyStreak: streak || null,
    currentStreak: streak?.current_streak ?? 0,
    longestStreak: streak?.longest_streak ?? 0,
    isAtRisk: streak ? streak.current_streak >= 3 && !checkedInToday : false,
    isOnFire: streak ? streak.current_streak >= 7 : false,
    checkedInToday,
    isLoading,
    checkIn: () => checkInMutation.mutateAsync(),
  };
}
