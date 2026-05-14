// useChallenges — Daily micro-engagement puzzles
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { DecisionChallenge, UserChallengeResponse } from '@/features/engagement/challengeTypes';

export function useChallenges(userId: string | null) {
  const queryClient = useQueryClient();

  const { data: challenges, isLoading: challengesLoading } = useQuery({
    queryKey: ['challenges', 'active'],
    queryFn: async (): Promise<DecisionChallenge[]> => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('decision_challenges')
        .select('*')
        .lte('active_from', today)
        .gte('active_until', today)
        .order('difficulty', { ascending: true })
        .limit(3);
      if (error) throw error;
      return (data || []) as DecisionChallenge[];
    },
    staleTime: 1000 * 60 * 30,
  });

  const { data: userResponses } = useQuery({
    queryKey: ['challenge-responses', userId],
    queryFn: async (): Promise<UserChallengeResponse[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_challenge_responses')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return (data || []) as UserChallengeResponse[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ challengeId, selectedOptionId }: { challengeId: string; selectedOptionId: string }) => {
      if (!userId) throw new Error('No user');
      const { error } = await supabase
        .from('user_challenge_responses')
        .upsert({ user_id: userId, challenge_id: challengeId, selected_option_id: selectedOptionId }, { onConflict: 'user_id,challenge_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-responses', userId] });
    },
  });

  const unansweredChallenges = userId ? (challenges || []).filter(c =>
    !(userResponses || []).some(r => r.challenge_id === c.id)
  ) : [];

  return {
    challenges: challenges || [],
    unansweredChallenges,
    userResponses: userResponses || [],
    isLoading: challengesLoading,
    respondToChallenge: respondMutation.mutateAsync,
    hasUnanswered: unansweredChallenges.length > 0,
  };
}
