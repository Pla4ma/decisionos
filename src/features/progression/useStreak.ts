// useStreak — Weekly decision consistency tracking
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { UserStreak } from './streakTypes';

export function useStreak(userId: string | null) {
  const queryClient = useQueryClient();

  const { data: streak, isLoading } = useQuery({
    queryKey: ['streak', userId],
    queryFn: async (): Promise<UserStreak | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const updateStreakMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('No user');
      const { data, error } = await supabase.rpc('update_user_streak', {
        p_user_id: userId,
        p_activity_date: new Date().toISOString().split('T')[0],
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streak', userId] });
    },
  });

  return {
    streak,
    currentStreak: streak?.current_streak ?? 0,
    longestStreak: streak?.longest_streak ?? 0,
    isLoading,
    updateStreak: updateStreakMutation.mutateAsync,
    isAtRisk: streak ? (streak.grace_days_used === 0 && streak.current_streak > 2) : false,
  };
}
