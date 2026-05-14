import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { LifeChapter } from './chaptersTypes';

interface UseChaptersReturn {
  chapters: LifeChapter[];
  activeChapter: LifeChapter | null;
  isLoading: boolean;
  createChapter: (title: string, emoji: string, description?: string) => Promise<void>;
  closeChapter: (chapterId: string) => Promise<void>;
  assignDecisionToChapter: (decisionId: string, chapterId: string) => Promise<void>;
  removeDecisionFromChapter: (decisionId: string) => Promise<void>;
}

export function useChapters(userId: string | null): UseChaptersReturn {
  const queryClient = useQueryClient();

  const { data: chapters = [], isLoading } = useQuery({
    queryKey: ['chapters', userId],
    queryFn: async (): Promise<LifeChapter[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('life_chapters')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as LifeChapter[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: async ({ title, emoji, description }: { title: string; emoji: string; description?: string }) => {
      if (!userId) throw new Error('No user');
      const { error } = await supabase.from('life_chapters').insert({
        user_id: userId, title, emoji, description: description || null,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chapters', userId] }),
  });

  const closeMutation = useMutation({
    mutationFn: async (chapterId: string) => {
      const { error } = await supabase
        .from('life_chapters')
        .update({ is_active: false, end_date: new Date().toISOString() })
        .eq('id', chapterId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chapters', userId] }),
  });

  const assignMutation = useMutation({
    mutationFn: async ({ decisionId, chapterId }: { decisionId: string; chapterId: string }) => {
      const { error } = await supabase
        .from('decisions')
        .update({ chapter_id: chapterId })
        .eq('id', decisionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (decisionId: string) => {
      const { error } = await supabase
        .from('decisions')
        .update({ chapter_id: null })
        .eq('id', decisionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
  });

  const activeChapter = chapters.find(c => c.is_active) || null;

  return {
    chapters,
    activeChapter,
    isLoading,
    createChapter: async (title, emoji, description) => createMutation.mutateAsync({ title, emoji, description }),
    closeChapter: async (chapterId) => closeMutation.mutateAsync(chapterId),
    assignDecisionToChapter: async (decisionId, chapterId) => assignMutation.mutateAsync({ decisionId, chapterId }),
    removeDecisionFromChapter: async (decisionId) => removeMutation.mutateAsync(decisionId),
  };
}
