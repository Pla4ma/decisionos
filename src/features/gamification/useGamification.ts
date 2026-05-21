import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { calculateDecisionIQ, UserStats } from '@/features/dq/decisionIQ';
import { getLevel, getUnlockedAchievements, AchievementStats } from './achievements';

export function useGamification(userId: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: ['gamification', userId],
    queryFn: async () => {
      if (!userId) return null;

      const [decisions, reviews, quickReviews, biases, streak, profile] = await Promise.all([
        supabase.from('decisions').select('id, status').eq('user_id', userId),
        supabase.from('decision_reviews').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('quick_reviews').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('bias_detection_events').select('id, was_mitigated').eq('user_id', userId),
        supabase.from('daily_streaks').select('current_streak, longest_streak').eq('user_id', userId).maybeSingle(),
        supabase.from('profiles').select('xp, created_at').eq('id', userId).maybeSingle(),
      ]);

      const allDecisions = decisions.data || [];
      const analyzedDecisions = allDecisions.filter((d: any) =>
        ['analyzed', 'chosen', 'review_scheduled', 'reviewed', 'quick_reviewed'].includes(d.status)
      );
      const reviewedDecisions = allDecisions.filter((d: any) =>
        ['reviewed', 'quick_reviewed'].includes(d.status)
      );

      const biasEvents = biases.data || [];
      const mitigatedBiases = biasEvents.filter((b: any) => b.was_mitigated);

      const userStats: UserStats = {
        totalDecisions: allDecisions.length,
        analyzedDecisions: analyzedDecisions.length,
        reviewedDecisions: reviewedDecisions.length,
        quickReviews: quickReviews.count ?? 0,
        biasEventsDetected: biasEvents.length,
        biasEventsMitigated: mitigatedBiases.length,
        totalDecisionsMade: allDecisions.length,
        currentStreak: streak?.data?.current_streak ?? 0,
        longestStreak: streak?.data?.longest_streak ?? 0,
        daysActive: profile?.data?.created_at
          ? Math.floor((Date.now() - new Date(profile.data.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0,
        reflectionEntries: 0,
      };

      const iqScore = calculateDecisionIQ(userStats);
      const xp = (profile?.data as any)?.xp ?? 0;
      const level = getLevel(xp);
      const achievementStats: AchievementStats = {
        decisionsCreated: allDecisions.length,
        decisionsAnalyzed: analyzedDecisions.length,
        decisionsReviewed: reviews.count ?? 0,
        quickReviewsDone: quickReviews.count ?? 0,
        currentStreak: userStats.currentStreak,
        longestStreak: userStats.longestStreak,
        biasesDetected: biasEvents.length,
        biasesMitigated: mitigatedBiases.length,
        reflectionsWritten: 0,
        templatesUsed: 0,
        practicesCompleted: 0,
        secondOpinionsGiven: 0,
      };
      const achievements = getUnlockedAchievements(achievementStats);

      return { iqScore, xp, level, achievements, achievementStats };
    },
    enabled: !!userId,
    staleTime: 60000,
  });

  return {
    iqScore: data?.iqScore ?? null,
    xp: data?.xp ?? 0,
    level: data?.level ?? { level: 1, xpForNext: 100, progress: 0 },
    achievements: data?.achievements ?? [],
    achievementStats: data?.achievementStats ?? null,
    isLoading,
  };
}
