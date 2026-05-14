import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SecondOpinionRequest, PublicSecondOpinionRequest } from './secondOpinionTypes';
import { useAuth } from '@/features/auth';

interface UseSecondOpinionReturn {
  myRequests: SecondOpinionRequest[];
  openRequests: PublicSecondOpinionRequest[];
  votedRequestIds: string[];
  isLoading: boolean;
  createRequest: (decisionId: string, question: string, options: string[]) => Promise<void>;
  castVote: (requestId: string, optionId: string) => Promise<void>;
  closeRequest: (requestId: string) => Promise<void>;
}

export function useSecondOpinion(): UseSecondOpinionReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: myRequests = [], isLoading: myLoading } = useQuery({
    queryKey: ['secondOpinionMy', user?.id],
    queryFn: async (): Promise<SecondOpinionRequest[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('second_opinion_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []) as SecondOpinionRequest[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });

  const { data: openRequests = [], isLoading: openLoading } = useQuery({
    queryKey: ['secondOpinionOpen'],
    queryFn: async (): Promise<PublicSecondOpinionRequest[]> => {
      const { data, error } = await supabase
        .from('public_opinion_requests')
        .select('*')
        .eq('status', 'open')
        .order('total_votes', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []) as PublicSecondOpinionRequest[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: votedIds = [] } = useQuery({
    queryKey: ['secondOpinionVoted', user?.id],
    queryFn: async (): Promise<string[]> => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('second_opinion_votes')
        .select('request_id')
        .eq('voter_id', user.id);
      return (data || []).map((d: any) => d.request_id);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: async ({ decisionId, question, optionTitles }: { decisionId: string; question: string; optionTitles: string[] }) => {
      if (!user?.id) throw new Error('No user');
      const { data, error } = await supabase
        .from('second_opinion_requests')
        .insert({
          user_id: user.id,
          decision_id: decisionId,
          question,
          options: optionTitles.map(title => ({ title, vote_count: 0 })),
          status: 'open',
        })
        .select()
        .single();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secondOpinionMy', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['secondOpinionOpen'] });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ requestId, optionId }: { requestId: string; optionId: string }) => {
      if (!user?.id) throw new Error('No user');
      await supabase.from('second_opinion_votes').insert({
        request_id: requestId,
        voter_id: user.id,
        selected_option_id: optionId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secondOpinionOpen'] });
      queryClient.invalidateQueries({ queryKey: ['secondOpinionVoted', user?.id] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: async (requestId: string) => {
      await supabase.from('second_opinion_requests').update({
        status: 'closed',
        closed_at: new Date().toISOString(),
      }).eq('id', requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secondOpinionMy', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['secondOpinionOpen'] });
    },
  });

  return {
    myRequests,
    openRequests,
    votedRequestIds: votedIds,
    isLoading: myLoading || openLoading,
    createRequest: async (decisionId, question, options) => createMutation.mutateAsync({ decisionId, question, optionTitles: options }),
    castVote: async (requestId, optionId) => voteMutation.mutateAsync({ requestId, optionId }),
    closeRequest: async (requestId) => closeMutation.mutateAsync(requestId),
  };
}
