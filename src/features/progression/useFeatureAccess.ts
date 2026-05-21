import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { FeatureId, isFeatureUnlocked, getUnlockedFeatures } from './featureAccess';

export interface UserMilestoneStats {
  decisionsCreated: number;
  decisionsReviewed: number;
  analysesRun: number;
  daysActive: number;
  hasValues: boolean;
  hasPrivacyConsent: boolean;
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
      if (!userId) return { decisionsCreated: 0, decisionsReviewed: 0, analysesRun: 0, daysActive: 0, hasValues: false, hasPrivacyConsent: false };

      const [decisionsCount, reviewsCount, analysesCount, profileResult] = await Promise.all([
        supabase.from('decisions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('decision_reviews').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('ai_usage_events').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('event_type', 'deep_analysis'),
        supabase.from('profiles').select('values_profile, privacy_consent, created_at').eq('id', userId).maybeSingle(),
      ]);

      const valuesProfile = profileResult?.data?.values_profile as { selected_values?: string[]; memory_enabled?: boolean } | null;
      const hasValues = !!valuesProfile && Array.isArray(valuesProfile.selected_values) && valuesProfile.selected_values.length > 0;
      const hasPrivacyConsent = !!profileResult?.data?.privacy_consent;

      const createdDate = profileResult?.data?.created_at ? new Date(profileResult.data.created_at) : new Date();
      const daysActive = Math.max(0, Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        decisionsCreated: decisionsCount.count ?? 0,
        decisionsReviewed: reviewsCount.count ?? 0,
        analysesRun: analysesCount.count ?? 0,
        daysActive,
        hasValues,
        hasPrivacyConsent,
      };
    },
    enabled: !!userId,
    staleTime: 60_000,
  });

  const stats = milestones ?? { decisionsCreated: 0, decisionsReviewed: 0, analysesRun: 0, daysActive: 0, hasValues: false, hasPrivacyConsent: false };

  const unlockedFeatures = useMemo(() => getUnlockedFeatures(stats), [stats]);

  return {
    milestones: stats,
    isFeatureUnlocked: (featureId: FeatureId) => isFeatureUnlocked(featureId, stats),
    unlockedFeatures,
    isLoading,
  };
}
