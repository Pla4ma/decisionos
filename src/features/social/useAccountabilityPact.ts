import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { isTableAccessible } from '@/features/progression/featureAccess';
import type { PactVisibility, PactStatus } from './accountabilityPactTypes';

interface UseAccountabilityPactReturn {
  createPact: (decisionId: string, partnerEmail: string, pactType: string, visibility?: PactVisibility) => Promise<string>;
  respondToPact: (inviteToken: string, accept: boolean) => Promise<void>;
  completePact: (pactId: string) => Promise<void>;
  isCreating: boolean;
  isResponding: boolean;
}

export function useAccountabilityPact(userId: string | null): UseAccountabilityPactReturn {
  const queryClient = useQueryClient();

  const disabled = !isTableAccessible('accountability_pacts') || !isTableAccessible('pact_invites');

  const createMutation = useMutation({
    mutationFn: async ({ decisionId, partnerEmail, pactType, visibility }: { decisionId: string; partnerEmail: string; pactType: string; visibility?: PactVisibility }) => {
      if (disabled) throw new Error('Accountability pacts are not available yet');
      if (!userId) throw new Error('No user');
      const inviteToken = `pact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { data, error } = await supabase
        .from('accountability_pacts')
        .insert({
          decision_id: decisionId,
          owner_id: userId,
          partner_email: partnerEmail,
          pact_type: pactType,
          visibility: visibility || 'partners_only',
          status: 'pending',
          review_expected_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select('id')
        .single();
      if (error) throw error;

      const { error: inviteError } = await supabase.from('pact_invites').insert({
        pact_id: data.id,
        inviter_name: 'A friend',
        decision_title: 'a decision',
        invite_token: inviteToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      if (inviteError) throw inviteError;

      return inviteToken;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacts'] });
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ inviteToken, accept }: { inviteToken: string; accept: boolean }) => {
      if (disabled) throw new Error('Accountability pacts are not available yet');
      const { data: invite } = await supabase
        .from('pact_invites')
        .select('*, accountability_pacts!inner(*)')
        .eq('invite_token', inviteToken)
        .single();
      if (!invite) throw new Error('Invite not found');

      await supabase
        .from('accountability_pacts')
        .update({ status: accept ? 'active' : 'broken' })
        .eq('id', invite.pact_id);

      await supabase
        .from('pact_invites')
        .update({ status: accept ? 'accepted' : 'declined' })
        .eq('invite_token', inviteToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacts'] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (pactId: string) => {
      if (disabled) throw new Error('Accountability pacts are not available yet');
      await supabase
        .from('accountability_pacts')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', pactId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacts'] });
    },
  });

  return {
    createPact: async (decisionId, partnerEmail, pactType, visibility) =>
      createMutation.mutateAsync({ decisionId, partnerEmail, pactType, visibility }),
    respondToPact: async (inviteToken, accept) => respondMutation.mutateAsync({ inviteToken, accept }),
    completePact: async (pactId) => completeMutation.mutateAsync(pactId),
    isCreating: createMutation.isPending,
    isResponding: respondMutation.isPending,
  };
}
