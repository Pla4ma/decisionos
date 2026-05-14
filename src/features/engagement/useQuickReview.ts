import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QuickReviewFeeling, emojiToSatisfaction } from './quickReviewTypes';
import { useAuth } from '@/features/auth';
import { resolvePredictionCalibration } from '@/features/dq/dqService';

interface UseQuickReviewReturn {
  submitQuickReview: (decisionId: string, feeling: QuickReviewFeeling) => Promise<void>;
  needsQuickReview: (committedAt: string) => boolean;
  isSubmitting: boolean;
}

export function useQuickReview(): UseQuickReviewReturn {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async ({ decisionId, feeling }: { decisionId: string; feeling: QuickReviewFeeling }) => {
      if (!user?.id) throw new Error('No user');

      await supabase.from('quick_reviews').insert({
        decision_id: decisionId,
        user_id: user.id,
        feeling,
        is_complete: true,
      });

      const satisfaction = emojiToSatisfaction(feeling);
      resolvePredictionCalibration(decisionId, satisfaction).catch(() => {});

      await supabase.rpc('increment_profile_counter', {
        p_user_id: user.id,
        p_column: 'total_quick_reviews',
      }).catch(() => {});

      await supabase.rpc('daily_check_in', { p_user_id: user.id }).catch(() => {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quickReviews'] });
      queryClient.invalidateQueries({ queryKey: ['dq'] });
      queryClient.invalidateQueries({ queryKey: ['dailyStreak'] });
    },
  });

  function needsQuickReview(committedAt: string): boolean {
    const commitTime = new Date(committedAt).getTime();
    const now = Date.now();
    const hoursSince = (now - commitTime) / (1000 * 60 * 60);
    return hoursSince >= 48 && hoursSince <= 168;
  }

  return {
    submitQuickReview: async (decisionId, feeling) => {
      await mutation.mutateAsync({ decisionId, feeling });
    },
    needsQuickReview,
    isSubmitting: mutation.isPending,
  };
}
