import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { JournalEntry, extractDecisionFromJournal } from './decisionJournalTypes';
import { useAuth } from '@/features/auth';

interface UseDecisionJournalReturn {
  entries: JournalEntry[];
  recentEntries: JournalEntry[];
  isLoading: boolean;
  addEntry: (content: string) => Promise<JournalEntry>;
  convertToDecision: (entryId: string) => Promise<{ title: string; options: string[] }>;
  deleteEntry: (id: string) => Promise<void>;
}

export function useDecisionJournal(): UseDecisionJournalReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journalEntries', user?.id],
    queryFn: async (): Promise<JournalEntry[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('decision_journal')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as JournalEntry[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });

  const addMutation = useMutation({
    mutationFn: async (content: string): Promise<JournalEntry> => {
      if (!user?.id) throw new Error('No user');
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const { data, error } = await supabase
        .from('decision_journal')
        .insert({
          user_id: user.id,
          content,
          word_count: wordCount,
        })
        .select()
        .single();
      if (error) throw error;
      return data as JournalEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries', user?.id] });
    },
  });

  const convertMutation = useMutation({
    mutationFn: async (entryId: string): Promise<{ title: string; options: string[] }> => {
      const entry = entries.find(e => e.id === entryId);
      if (!entry) throw new Error('Entry not found');
      const extracted = extractDecisionFromJournal(entry.content);
      await supabase.from('journal_entries').update({ is_analyzed: true, category_hint: 'extracted' }).eq('id', entryId);
      return { title: extracted.title || 'Untitled Decision', options: extracted.options };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries', user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('decision_journal').delete().eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries', user?.id] });
    },
  });

  const recentEntries = entries.slice(0, 5);

  return {
    entries,
    recentEntries,
    isLoading,
    addEntry: async (content) => addMutation.mutateAsync(content),
    convertToDecision: async (entryId) => convertMutation.mutateAsync(entryId),
    deleteEntry: async (id) => deleteMutation.mutateAsync(id),
  };
}
