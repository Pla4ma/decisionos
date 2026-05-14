// useMemoryInsights — Hook for fetching real personalized insights from past decisions
import { useQuery } from '@tanstack/react-query';
import { DecisionCategory } from './decisionTypes';
import { fetchRealInsights, getAnalysisContext, RealInsight } from './realInsights';

interface UseMemoryInsightsOptions {
  userId: string | null;
  category?: DecisionCategory;
  enabled?: boolean;
}

export function useMemoryInsights({
  userId,
  category,
  enabled = true,
}: UseMemoryInsightsOptions) {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['memory-insights', userId, category],
    queryFn: async (): Promise<RealInsight[]> => {
      if (!userId || !enabled) return [];
      return fetchRealInsights(userId);
    },
    enabled: !!userId && enabled,
    staleTime: 1000 * 60 * 60,
  });

  const { data: analysisContext } = useQuery({
    queryKey: ['analysis-context', userId, category],
    queryFn: async (): Promise<string> => {
      if (!userId || !enabled || !category) return '';
      return getAnalysisContext(userId, category);
    },
    enabled: !!userId && enabled && !!category,
    staleTime: 1000 * 60 * 10,
  });

  return {
    insights: insights || [],
    analysisContext: analysisContext || '',
    isLoading,
    hasInsights: (insights?.length || 0) > 0,
  };
}
