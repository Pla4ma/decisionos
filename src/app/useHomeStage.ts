import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/useAuth';
import { useFeatureAccess } from '@/features/progression/useFeatureAccess';
import { useHomeDecisionRecommendation } from '@/features/decisions/useHomeDecisionRecommendation';
import { useGamification } from '@/features/gamification/useGamification';
import { getGreeting } from './homeScreenHelpers';

export type HomeStage = 'new_user' | 'active_decision' | 'review_due' | 'reviewing' | 'power_user';

export interface HomeStageData {
  stage: HomeStage;
  displayName: string;
  greeting: string;
  needsReviewCount: number;
  milestones: { decisionsCreated: number; decisionsReviewed: number };
  isLoading: boolean;
  refreshing: boolean;
  setRefreshing: (v: boolean) => void;
  onRefresh: () => Promise<void>;
  iqScore: any;
  xp: number;
  level: { level: number; xpForNext: number; progress: number };
  achievements: any[];
}

export function useHomeStage(): HomeStageData {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { milestones, isLoading: featureLoading } = useFeatureAccess(user?.id ?? null);
  const { pendingDecisions } = useHomeDecisionRecommendation(user?.id ?? null);
  const { iqScore, xp, level, achievements } = useGamification(user?.id ?? null);
  const [refreshing, setRefreshing] = useState(false);

  const hasCreatedDecisions = milestones.decisionsCreated > 0;
  const hasChosenDecisions = hasCreatedDecisions && pendingDecisions.some(d => d.status === 'chosen' || d.status === 'review_scheduled');
  const hasReviews = milestones.decisionsReviewed > 0;
  const isPowerUser = milestones.decisionsCreated >= 5 && milestones.decisionsReviewed >= 3;

  const stage: HomeStage = !hasCreatedDecisions ? 'new_user'
    : !hasChosenDecisions ? 'active_decision'
    : !hasReviews ? 'review_due'
    : !isPowerUser ? 'reviewing'
    : 'power_user';

  const needsReviewCount = pendingDecisions.filter(d => d.status === 'review_scheduled').length;
  const displayName = user?.email?.split('@')[0] || '';
  const greeting = getGreeting();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['decisions'] });
    setRefreshing(false);
  }, [queryClient]);

  return {
    stage, displayName, greeting, needsReviewCount,
    milestones: { decisionsCreated: milestones.decisionsCreated, decisionsReviewed: milestones.decisionsReviewed },
    isLoading: featureLoading || refreshing,
    refreshing, setRefreshing, onRefresh,
    iqScore, xp, level, achievements,
  };
}
