// useBenchmarks — Anonymous social comparison
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { AnonymousBenchmark, ImprovementScore } from '@/features/social/benchmarkTypes';

export function useBenchmarks(userId: string | null) {
  const { data: benchmarks, isLoading: benchmarksLoading } = useQuery({
    queryKey: ['benchmarks', userId],
    queryFn: async (): Promise<AnonymousBenchmark> => {
      if (!userId) return { eligible: false };
      const { data, error } = await supabase.rpc('get_anonymous_benchmarks', {
        p_user_id: userId,
      });
      if (error) throw error;
      return data as AnonymousBenchmark;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 60,
  });

  const { data: improvementScore, isLoading: improvementLoading } = useQuery({
    queryKey: ['improvement-score', userId],
    queryFn: async (): Promise<ImprovementScore> => {
      if (!userId) return { ready: false };
      const { data, error } = await supabase.rpc('get_improvement_score', {
        p_user_id: userId,
      });
      if (error) throw error;
      return data as ImprovementScore;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 60,
  });

  return {
    benchmarks,
    improvementScore,
    isLoading: benchmarksLoading || improvementLoading,
    isEligible: benchmarks?.eligible ?? false,
    percentileText: benchmarks?.regret_rate?.percentile != null
      ? `Better than ${benchmarks.regret_rate.percentile}% of users`
      : null,
  };
}
