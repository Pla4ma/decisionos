// useEarnedAnalyses — Free tier can earn analyses through reviews
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { EarnedAnalysesStatus } from '@/features/monetization/earnedAnalysesTypes';

export function useEarnedAnalyses(userId: string | null) {
  const queryClient = useQueryClient();

  const { data: earnedStatus, isLoading } = useQuery({
    queryKey: ['earned-analyses', userId],
    queryFn: async (): Promise<EarnedAnalysesStatus> => {
      if (!userId) return { total_earned: 0, unused_count: 0, can_earn_today: false };
      const { data, error } = await supabase.rpc('get_earned_analyses', {
        p_user_id: userId,
      });
      if (error) throw error;
      return (data?.[0] || { total_earned: 0, unused_count: 0, can_earn_today: false }) as EarnedAnalysesStatus;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const awardAnalysisMutation = useMutation({
    mutationFn: async (decisionId: string) => {
      if (!userId) throw new Error('No user');
      const { error } = await supabase
        .from('earned_analyses')
        .insert({
          user_id: userId,
          decision_id: decisionId,
          source: 'review_completed',
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earned-analyses', userId] });
    },
  });

  const consumeAnalysisMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('No user');
      const { error } = await supabase
        .from('earned_analyses')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .order('earned_at', { ascending: true })
        .limit(1);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earned-analyses', userId] });
    },
  });

  return {
    earnedStatus,
    isLoading,
    unusedEarned: earnedStatus?.unused_count ?? 0,
    canEarnToday: earnedStatus?.can_earn_today ?? false,
    awardAnalysis: awardAnalysisMutation.mutateAsync,
    consumeAnalysis: consumeAnalysisMutation.mutateAsync,
  };
}
