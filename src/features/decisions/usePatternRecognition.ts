import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { PatternInsight, generatePatternInsights } from './patternRecognitionTypes';
import { useAuth } from '@/features/auth';

interface UsePatternRecognitionReturn {
  activeInsights: PatternInsight[];
  isLoading: boolean;
  dismissInsight: (id: string) => Promise<void>;
  refreshInsights: () => Promise<void>;
}

export function usePatternRecognition(): UsePatternRecognitionReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: storedInsights = [], isLoading } = useQuery({
    queryKey: ['patternInsights', user?.id],
    queryFn: async (): Promise<PatternInsight[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('pattern_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []) as PatternInsight[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 30,
  });

  const dismissMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('pattern_insights').update({ is_dismissed: true }).eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patternInsights', user?.id] });
    },
  });

  const generateAndSaveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const { data: decisions } = await supabase
        .from('decisions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (!decisions || decisions.length < 2) return;

      const { data: biasEvents } = await supabase
        .from('bias_detection_events')
        .select('bias_name')
        .eq('user_id', user.id);
      const biasCounts: Record<string, number> = {};
      (biasEvents || []).forEach((b: any) => {
        biasCounts[b.bias_name] = (biasCounts[b.bias_name] || 0) + 1;
      });

      const decisionData = decisions.map(d => ({
        category: d.category,
        importance: d.importance,
        satisfaction: null,
        time_to_decide_hours: 0,
        options_count: 0,
        status: d.status,
      }));

      const newInsights = generatePatternInsights(user.id, decisionData, Object.entries(biasCounts).map(([k, v]) => ({ bias_name: k, count: v })));
      for (const insight of newInsights) {
        await supabase.from('pattern_insights').insert(insight).select().maybeSingle();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patternInsights', user?.id] });
    },
  });

  return {
    activeInsights: storedInsights,
    isLoading,
    dismissInsight: async (id) => dismissMutation.mutateAsync(id),
    refreshInsights: async () => generateAndSaveMutation.mutateAsync(),
  };
}
