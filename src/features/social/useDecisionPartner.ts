// useDecisionPartner — Lightweight social sharing
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useDecisionPartner(userId: string | null) {
  const queryClient = useQueryClient();

  const createShareMutation = useMutation({
    mutationFn: async ({
      decisionId,
      partnerLabel,
    }: {
      decisionId: string;
      partnerLabel: string;
    }) => {
      if (!userId) throw new Error('No user');
      const token = `dp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const { data, error } = await supabase
        .from('decision_partners')
        .insert({
          decision_id: decisionId,
          owner_id: userId,
          share_token: token,
          partner_label: partnerLabel,
          status: 'pending',
        })
        .select('share_token')
        .single();
      if (error) throw error;
      return data.share_token as string;
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({
      shareToken,
      input,
      votedOptionId,
    }: {
      shareToken: string;
      input?: string;
      votedOptionId?: string;
    }) => {
      const { error } = await supabase
        .from('decision_partners')
        .update({
          partner_input: input || null,
          partner_voted_option_id: votedOptionId || null,
          status: 'responded',
          responded_at: new Date().toISOString(),
        })
        .eq('share_token', shareToken);
      if (error) throw error;
    },
  });

  const getShareByToken = async (token: string) => {
    const { data, error } = await supabase
      .from('decision_partners')
      .select('*, decisions:decision_id(title, category)')
      .eq('share_token', token)
      .single();
    if (error) return null;
    return data;
  };

  return {
    createShare: createShareMutation.mutateAsync,
    respondToShare: respondMutation.mutateAsync,
    getShareByToken,
    isCreating: createShareMutation.isPending,
    isResponding: respondMutation.isPending,
  };
}
