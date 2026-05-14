import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { MicroReviewFeeling, MICRO_REVIEW_CONFIG } from './microReviewTypes';

interface UseMicroReviewReturn {
  submitMicroReview: (decisionId: string, feeling: MicroReviewFeeling, note?: string) => Promise<void>;
  isSubmitting: boolean;
  getDecisionIdsDueForReview: (decisionIds: string[], commitDates: string[]) => string[];
}

export function useMicroReview(userId: string | null): UseMicroReviewReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ decisionId, feeling, note }: { decisionId: string; feeling: MicroReviewFeeling; note?: string }) => {
      if (!userId) throw new Error('No user');
      const commitDate = new Date();
      commitDate.setHours(commitDate.getHours() - 48);

      const { error } = await supabase
        .from('micro_reviews')
        .insert({
          decision_id: decisionId,
          user_id: userId,
          feeling,
          note: note || null,
          days_since_commit: 2,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['microReviews'] });
    },
  });

  function getDecisionIdsDueForReview(decisionIds: string[], commitDates: string[]): string[] {
    const now = Date.now();
    const triggerMs = MICRO_REVIEW_CONFIG.TRIGGER_HOURS_AFTER_COMMIT * 60 * 60 * 1000;
    return decisionIds.filter((_, i) => {
      const commitMs = new Date(commitDates[i]).getTime();
      return (now - commitMs) >= triggerMs;
    });
  }

  return {
    submitMicroReview: async (decisionId, feeling, note) => {
      await mutation.mutateAsync({ decisionId, feeling, note });
    },
    isSubmitting: mutation.isPending,
    getDecisionIdsDueForReview,
  };
}
