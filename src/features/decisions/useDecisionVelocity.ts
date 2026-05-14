// Decision Velocity Hook — Track decision speed vs outcome quality

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { DecisionVelocity } from './deepDecisionTypes';

export function useDecisionVelocity(userId: string | null) {
  const queryClient = useQueryClient();

  const { data: velocityRecords } = useQuery({
    queryKey: ['decisionVelocity', userId],
    queryFn: async (): Promise<DecisionVelocity[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('decision_velocity')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const recordVelocityMutation = useMutation({
    mutationFn: async ({
      decisionId,
      createdToDecidedHours,
      satisfactionScore,
      wouldChooseSame,
    }: {
      decisionId: string;
      createdToDecidedHours: number | null;
      satisfactionScore?: number;
      wouldChooseSame?: boolean;
    }) => {
      if (!userId) throw new Error('No user');

      const { data, error } = await supabase
        .from('decision_velocity')
        .upsert({
          decision_id: decisionId,
          user_id: userId,
          created_to_decided_hours: createdToDecidedHours,
          satisfaction_score: satisfactionScore,
          would_choose_same: wouldChooseSame,
        }, { onConflict: 'decision_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisionVelocity', userId] });
    },
  });

  const getVelocityInsight = (): string | null => {
    if (!velocityRecords || velocityRecords.length < 3) return null;

    const withSatisfaction = velocityRecords.filter(r => r.satisfaction_score != null);
    if (withSatisfaction.length < 3) return null;

    const fastSatisfied = withSatisfaction.filter(
      r => r.velocity_tier === 'quick' && (r.satisfaction_score || 0) >= 4,
    ).length;

    const slowUnsatisfied = withSatisfaction.filter(
      r => r.velocity_tier === 'slow' && (r.satisfaction_score || 0) < 3,
    ).length;

    const avgHours = withSatisfaction.reduce((sum, r) => sum + (r.created_to_decided_hours || 0), 0) / withSatisfaction.length;

    if (fastSatisfied >= 3) {
      return 'You tend to make good decisions quickly. Trust your instincts.';
    }
    if (slowUnsatisfied >= 2) {
      return `You average ${Math.round(avgHours)} hours per decision but satisfaction is low. More time may not be helping.`;
    }

    return `Your optimal decision pace is around ${Math.round(avgHours)} hours.`;
  };

  return {
    velocityRecords,
    recordVelocity: recordVelocityMutation.mutateAsync,
    getVelocityInsight,
    isRecording: recordVelocityMutation.isPending,
  };
}

export async function recordVelocityDirect(
  userId: string,
  decisionId: string,
  createdToDecidedHours: number | null,
  decidedToReviewedHours: number | null,
): Promise<void> {
  const tier = createdToDecidedHours != null
    ? (
      createdToDecidedHours < 1 ? 'rushed' :
      createdToDecidedHours < 24 ? 'quick' :
      createdToDecidedHours < 72 ? 'moderate' :
      createdToDecidedHours < 168 ? 'deliberate' : 'slow'
    )
    : null;

  await supabase.from('decision_velocity').upsert({
    decision_id: decisionId,
    user_id: userId,
    created_to_decided_hours: createdToDecidedHours,
    decided_to_reviewed_hours: decidedToReviewedHours,
    velocity_tier: tier,
  }, { onConflict: 'decision_id' });
}
