import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { DecisionInboxItem, CreateInboxInput, extractCategoryFromThought } from './decisionInboxTypes';
import { useAuth } from '@/features/auth';

interface UseDecisionInboxOptions {
  enabled?: boolean;
}

interface UseDecisionInboxReturn {
  items: DecisionInboxItem[];
  unprocessedCount: number;
  isLoading: boolean;
  addToInbox: (input: CreateInboxInput) => Promise<void>;
  archiveItem: (id: string) => Promise<void>;
  markProcessed: (id: string, decisionId: string) => Promise<void>;
  clearInbox: () => Promise<void>;
}

export function useDecisionInbox(options?: UseDecisionInboxOptions): UseDecisionInboxReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['decisionInbox', user?.id],
    queryFn: async (): Promise<DecisionInboxItem[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('decision_inbox')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as DecisionInboxItem[];
    },
    enabled: !!user?.id && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 2,
  });

  const addMutation = useMutation({
    mutationFn: async (input: CreateInboxInput) => {
      if (!user?.id) throw new Error('No user');
      const category = input.context
        ? extractCategoryFromThought(input.context)
        : extractCategoryFromThought(input.thought);
      const { error } = await supabase.from('decision_inbox').insert({
        user_id: user.id,
        thought: input.thought,
        context: input.context || null,
        category,
        source: input.source || 'manual',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisionInbox', user?.id] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('decision_inbox').update({ is_archived: true }).eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisionInbox', user?.id] });
    },
  });

  const processMutation = useMutation({
    mutationFn: async ({ id, decisionId }: { id: string; decisionId: string }) => {
      await supabase.from('decision_inbox').update({
        is_processed: true,
        processed_to_decision_id: decisionId,
      }).eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisionInbox', user?.id] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      await supabase.from('decision_inbox').update({ is_archived: true }).eq('user_id', user.id).eq('is_archived', false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisionInbox', user?.id] });
    },
  });

  const unprocessedCount = items.filter(i => !i.is_processed).length;

  return {
    items,
    unprocessedCount,
    isLoading,
    addToInbox: async (input) => addMutation.mutateAsync(input),
    archiveItem: async (id) => archiveMutation.mutateAsync(id),
    markProcessed: async (id, decisionId) => processMutation.mutateAsync({ id, decisionId }),
    clearInbox: async () => clearAllMutation.mutateAsync(),
  };
}
