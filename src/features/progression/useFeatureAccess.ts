// useFeatureAccess — Progressive feature unlocking hook
// Provides feature-gating logic based on user milestones
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { FeatureId, isFeatureUnlocked, getUnlockedFeatures } from './featureAccess';

export interface UserMilestoneStats {
  decisionsCreated: number;
  decisionsReviewed: number;
  analysesRun: number;
  daysActive: number;
}

export function useFeatureAccess(userId: string | null): {
  milestones: UserMilestoneStats;
  isFeatureUnlocked: (featureId: FeatureId) => boolean;
  unlockedFeatures: FeatureId[];
  isLoading: boolean;
} {
  const { data: milestones, isLoading } = useQuery<UserMilestoneStats>({
    queryKey: ['user-milestones', userId],
    queryFn: async () => {
      if (!userId) return { decisionsCreated: 0, decisionsReviewed: 0, analysesRun: 0, daysActive: 0 };

      // Get decision counts
      const { count: decisionsCreated } = await supabase
        .from('decisions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get reviewed decisions count (filter by user)
      const { count: decisionsReviewed } = await supabase
        .from('decision_reviews')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get analysis usage count
      const { count: analysesRun } = await supabase
        .from('ai_usage_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('event_type', 'deep_analysis');

      return {
        decisionsCreated: decisionsCreated ?? 0,
        decisionsReviewed: decisionsReviewed ?? 0,
        analysesRun: analysesRun ?? 0,
        daysActive: 0, // Will be computed from profile created_at if needed
      };
    },
    enabled: !!userId,
    staleTime: 60_000, // 1 minute cache
  });

  const stats = milestones ?? { decisionsCreated: 0, decisionsReviewed: 0, analysesRun: 0, daysActive: 0 };

  const unlockedFeatures = useMemo(() => getUnlockedFeatures(stats), [stats]);

  return {
    milestones: stats,
    isFeatureUnlocked: (featureId: FeatureId) => isFeatureUnlocked(featureId, stats),
    unlockedFeatures,
    isLoading,
  };
}
