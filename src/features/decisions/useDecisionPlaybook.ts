// Decision Playbook Hook — Auto-generated personal decision guide

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { DecisionPlaybook } from './deepDecisionTypes';

export function useDecisionPlaybook(userId: string | null) {
  const queryClient = useQueryClient();

  const { data: playbook, isLoading } = useQuery({
    queryKey: ['playbook', userId],
    queryFn: async (): Promise<DecisionPlaybook | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('decision_playbooks')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as DecisionPlaybook;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30,
  });

  const generatePlaybookMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('No user');
      const { data, error } = await supabase.rpc('generate_decision_playbook', {
        p_user_id: userId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbook', userId] });
    },
  });

  const isReady = playbook?.is_published === true;
  const reviewsNeeded = playbook && !isReady
    ? 5 - (playbook.review_count || 0)
    : 0;

  return {
    playbook,
    isLoading,
    isReady,
    reviewsNeeded,
    generatePlaybook: generatePlaybookMutation.mutateAsync,
    isGenerating: generatePlaybookMutation.isPending,
  };
}
