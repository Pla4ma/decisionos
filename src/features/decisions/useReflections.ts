// useReflections — Weekly decision check-ins between creation and review
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { DecisionReflection, WeeklyReflectionSummary, ReflectionFeeling } from '@/features/decisions/reflectionTypes';

export function useReflections(userId: string | null) {
  const queryClient = useQueryClient();

  const { data: weeklySummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['weekly-reflections', userId],
    queryFn: async (): Promise<WeeklyReflectionSummary[]> => {
      if (!userId) return [];
      const { data, error } = await supabase.rpc('get_weekly_reflection_summary', {
        p_user_id: userId,
      });
      if (error) throw error;
      return (data || []) as WeeklyReflectionSummary[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 60,
  });

  const getReflectionsForDecision = (decisionId: string) =>
    useQuery({
      queryKey: ['reflections', decisionId],
      queryFn: async (): Promise<DecisionReflection[]> => {
        const { data, error } = await supabase
          .from('decision_reflections')
          .select('*')
          .eq('decision_id', decisionId)
          .order('week_number', { ascending: false });
        if (error) throw error;
        return (data || []) as DecisionReflection[];
      },
      enabled: !!decisionId,
      staleTime: 1000 * 60 * 10,
    });

  const addReflectionMutation = useMutation({
    mutationFn: async ({
      decisionId,
      weekNumber,
      feeling,
      thought,
      wouldChooseSame,
    }: {
      decisionId: string;
      weekNumber: number;
      feeling: ReflectionFeeling;
      thought?: string;
      wouldChooseSame?: boolean;
    }) => {
      if (!userId) throw new Error('No user');
      const { error } = await supabase
        .from('decision_reflections')
        .upsert({
          decision_id: decisionId,
          user_id: userId,
          week_number: weekNumber,
          feeling,
          thought: thought || null,
          would_choose_same_so_far: wouldChooseSame ?? null,
        }, { onConflict: 'decision_id,week_number' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-reflections', userId] });
    },
  });

  return {
    weeklySummary: weeklySummary || [],
    isSummaryLoading: summaryLoading,
    getReflectionsForDecision,
    addReflection: addReflectionMutation.mutateAsync,
    hasReflectionsDue: (weeklySummary || []).some((s: WeeklyReflectionSummary) => s.weeks_since_choice >= 1),
  };
}
