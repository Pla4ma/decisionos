import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { DecisionGraveyardEntry } from './graveyardTypes';

interface UseGraveyardReturn {
  entries: DecisionGraveyardEntry[];
  totalBuried: number;
  isLoading: boolean;
  buryDecision: (decisionId: string, title: string, category: string, reason: string, note?: string) => Promise<void>;
  resurrectDecision: (entryId: string) => Promise<void>;
}

export function useGraveyard(userId: string | null): UseGraveyardReturn {
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['graveyard', userId],
    queryFn: async (): Promise<DecisionGraveyardEntry[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('decision_graveyard')
        .select('*')
        .eq('user_id', userId)
        .order('abandoned_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as DecisionGraveyardEntry[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  });

  const buryMutation = useMutation({
    mutationFn: async ({ decisionId, title, category, reason, note }: { decisionId: string; title: string; category: string; reason: string; note?: string }) => {
      if (!userId) throw new Error('No user');
      await supabase.from('decisions').delete().eq('id', decisionId);
      const { error } = await supabase.from('decision_graveyard').insert({
        decision_id: decisionId, user_id: userId,
        original_title: title, original_category: category,
        reason, note: note || null, abandoned_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graveyard', userId] });
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
    },
  });

  const resurrectMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const { data: entry } = await supabase
        .from('decision_graveyard').select('*').eq('id', entryId).single();
      if (!entry) throw new Error('Graveyard entry not found');
      const { error: insertError } = await supabase.from('decisions').insert({
        id: entry.decision_id, user_id: userId, title: entry.original_title,
        category: entry.original_category, status: 'draft',
        importance: 5, urgency: 5,
      });
      if (insertError) throw insertError;
      await supabase.from('decision_graveyard').delete().eq('id', entryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graveyard', userId] });
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
    },
  });

  return {
    entries,
    totalBuried: entries.length,
    isLoading,
    buryDecision: async (decisionId, title, category, reason, note) =>
      buryMutation.mutateAsync({ decisionId, title, category, reason, note }),
    resurrectDecision: async (entryId) => resurrectMutation.mutateAsync(entryId),
  };
}
