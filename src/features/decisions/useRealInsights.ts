// useRealInsights — Real user stats and insights (no gamification)

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { UserStats } from './deepDecisionTypes';

export function useRealInsights(userId: string | null) {
  const { data: userStats } = useQuery({
    queryKey: ['userStats', userId],
    queryFn: async (): Promise<UserStats | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('total_decisions_made, total_reviews_completed, regret_rate, avg_decision_hours, decision_consistency_days')
        .eq('id', userId)
        .single();

      if (error) return null;

      // Calculate avg satisfaction from reviews
      const { data: satData } = await supabase
        .from('decision_reviews')
        .select('satisfaction_score')
        .eq('user_id', userId)
        .not('satisfaction_score', 'is', null);

      const avgSatisfaction = satData && satData.length > 0
        ? satData.reduce((sum, r) => sum + (r.satisfaction_score || 0), 0) / satData.length
        : null;

      return {
        total_decisions_made: data?.total_decisions_made || 0,
        total_reviews_completed: data?.total_reviews_completed || 0,
        regret_rate: data?.regret_rate ?? null,
        avg_decision_hours: data?.avg_decision_hours ?? null,
        decision_consistency_days: data?.decision_consistency_days || 0,
        avg_satisfaction: avgSatisfaction,
      };
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  return { userStats };
}
