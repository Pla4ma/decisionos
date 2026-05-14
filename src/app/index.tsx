// Home Screen — DQ-Centered Command Center
// Unified around ONE metric: Decision Quotient
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useAuth } from '@/features/auth/useAuth';
import { useHomeDecisionRecommendation } from '@/features/decisions/useHomeDecisionRecommendation';
import { useBlindSpots } from '@/features/decisions/useBlindSpots';
import { useDecisionPlaybook } from '@/features/decisions/useDecisionPlaybook';
import { useRealInsights } from '@/features/decisions/useRealInsights';
import { useChallenges } from '@/features/engagement/useChallenges';
import { useStreak } from '@/features/progression/useStreak';
import { useBenchmarks } from '@/features/social/useBenchmarks';
import { useReflections } from '@/features/decisions/useReflections';
import { useTemplates } from '@/features/decisions/useTemplates';
import { useDq } from '@/features/dq/useDq';
import {
  DecisionHomeHeader, DailyClarityCard, RecommendedActionCard,
  PendingDecisionCard, DecisionQuickActions, BlindSpotAlertCard,
  PlaybookPreviewCard, ImprovementScoreCard,
  ChallengeCard, BenchmarkCard, WeeklyReflectionCard, TemplatePickerCard,
  DqDashboardCard,
} from '@/components/home';
import { ReviewLoopHighlight } from '@/components/decisions';
import { Screen } from '@/components/ui/Screen';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import type { HomeRecommendation } from '@/features/decisions/useHomeDecisionRecommendation';
import type { DecisionTemplate } from '@/features/decisions/templateTypes';

export default function HomeScreen(): JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChallengeOptions, setSelectedChallengeOptions] = useState<Record<string, string>>({});

  const uid = user?.id ?? null;

  const { recommendation, pendingDecisions, activeDecisionCount, isLoading, error } =
    useHomeDecisionRecommendation(uid);
  const { blindSpots, hasBlindSpots, detectBlindSpots } = useBlindSpots(uid);
  const { playbook, isReady: playbookReady, reviewsNeeded, reviewCount, generatePlaybook } =
    useDecisionPlaybook(uid);
  const { userStats } = useRealInsights(uid);
  const { challenges, unansweredChallenges, respondToChallenge, hasUnanswered } = useChallenges(uid);
  const { currentStreak, longestStreak, isAtRisk, updateStreak } = useStreak(uid);
  const { benchmarks, improvementScore } = useBenchmarks(uid);
  const { weeklySummary, hasReflectionsDue } = useReflections(uid);
  const { templates } = useTemplates();
  const { dq, isLoaded: dqLoaded, refresh: refreshDq } = useDq();

  const freeTemplates = (templates || []).filter(t => t.tier === 'free');

  useEffect(() => {
    if (uid) {
      detectBlindSpots().catch(() => {});
    }
  }, [uid]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (uid) {
      await Promise.allSettled([detectBlindSpots(), generatePlaybook(), updateStreak(), refreshDq()]);
    }
    setRefreshing(false);
  }, [uid, detectBlindSpots, generatePlaybook, updateStreak, refreshDq]);

  const handleNewDecision = useCallback(() => router.push('/decisions/new'), [router]);
  const handleViewHistory = useCallback(() => router.push('/decisions'), [router]);
  const handleSettings = useCallback(() => router.push('/settings'), [router]);
  const handleViewPlaybook = useCallback(() => router.push('/playbook'), [router]);
  const handleViewTimeline = useCallback(() => router.push('/timeline'), [router]);

  const handleRecommendationAction = useCallback((rec: HomeRecommendation) => {
    if (rec.decisionId) {
      switch (rec.type) {
        case 'review_due': router.push(`/decisions/${rec.decisionId}/review`); break;
        case 'run_analysis': router.push(`/decisions/${rec.decisionId}/analysis`); break;
        default: router.push(`/decisions/${rec.decisionId}`);
      }
    } else if (rec.type === 'create_first') {
      router.push('/decisions/new');
    }
  }, [router]);

  const handlePendingDecisionPress = useCallback((decisionId: string) => {
    router.push(`/decisions/${decisionId}`);
  }, [router]);

  const handleQuickDecision = useCallback(() => {
    router.push({ pathname: '/decisions/new', params: { quick: 'true' } });
  }, [router]);

  const handleReflectionTap = useCallback((decisionId: string) => {
    router.push(`/decisions/${decisionId}`);
  }, [router]);

  const handleChallengeSelect = useCallback(async (challengeId: string, optionId: string) => {
    setSelectedChallengeOptions(prev => ({ ...prev, [challengeId]: optionId }));
    try {
      await respondToChallenge({ challengeId, selectedOptionId: optionId });
      if (uid) updateStreak().catch(() => {});
    } catch {}
  }, [respondToChallenge, uid, updateStreak]);

  const handleTemplateSelect = useCallback((template: DecisionTemplate) => {
    router.push({
      pathname: '/decisions/new',
      params: { template: template.id },
    });
  }, [router]);

  if (isLoading && !refreshing) {
    return <Screen padding={false}><LoadingState message="Loading..." /></Screen>;
  }

  if (error) {
    return (
      <Screen padding={false}>
        <ErrorState title="Couldn't load" message={error.message} onRetry={handleRefresh} />
      </Screen>
    );
  }

  const showImprovement = improvementScore?.ready;
  const showBenchmarks = benchmarks?.eligible;
  const showWeeklyReflections = hasReflectionsDue && (weeklySummary || []).length > 0;
  const showChallenges = hasUnanswered;
  const showTemplates = freeTemplates.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.lg }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <DecisionHomeHeader
          userName={user?.email?.split('@')[0]}
          regretRate={userStats?.regret_rate ?? null}
          reviewCount={userStats?.total_reviews_completed ?? 0}
          avgSatisfaction={userStats?.avg_satisfaction ?? null}
        />

        {/* DQ Identity Layer — ONE number replaces Streak + CBMI + Improvement */}
        {dq && dqLoaded && (
          <DqDashboardCard dq={dq} currentStreak={currentStreak} onPress={handleViewPlaybook} />
        )}

        {showImprovement && (
          <ImprovementScoreCard score={improvementScore!} onPress={handleViewPlaybook} />
        )}

        {/* Priority action */}
        <RecommendedActionCard recommendation={recommendation} onAction={handleRecommendationAction} />

        {/* Weekly reflections — meso loop bridge */}
        {showWeeklyReflections && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Check-Ins</Text>
            {(weeklySummary || []).slice(0, 3).map((reflection: any) => (
              <WeeklyReflectionCard
                key={reflection.decision_id}
                reflection={reflection}
                onReflect={handleReflectionTap}
              />
            ))}
          </View>
        )}

        {/* Daily challenge */}
        {showChallenges && (unansweredChallenges || []).slice(0, 1).map((challenge: any) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            hasResponded={!!selectedChallengeOptions[challenge.id]}
            selectedOptionId={selectedChallengeOptions[challenge.id]}
            onSelectOption={handleChallengeSelect}
          />
        ))}

        {/* Templates */}
        {showTemplates && (
          <TemplatePickerCard
            templates={freeTemplates}
            onSelectTemplate={handleTemplateSelect}
          />
        )}

        {/* Active decisions */}
        {pendingDecisions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Decisions</Text>
            {pendingDecisions.map(decision => (
              <PendingDecisionCard key={decision.id} decision={decision} onPress={handlePendingDecisionPress} />
            ))}
          </View>
        )}

        {/* Decision Intelligence */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Decision Intelligence</Text>

          {hasBlindSpots && blindSpots.filter(b => b.severity !== 'mild').map(spot => (
            <BlindSpotAlertCard key={spot.id} blindSpot={spot} />
          ))}

          <PlaybookPreviewCard
            isReady={playbookReady}
            reviewsNeeded={reviewsNeeded}
            reviewCount={reviewCount || 0}
            onView={handleViewPlaybook}
          />
        </View>

        {/* Benchmark comparison */}
        {showBenchmarks && <BenchmarkCard benchmark={benchmarks!} />}

        {/* Education + Clarity */}
        <ReviewLoopHighlight variant="card" />
        <DailyClarityCard onNewDecision={handleNewDecision} />

        <DecisionQuickActions
          onNewDecision={handleNewDecision}
          onViewHistory={handleViewHistory}
          onSettings={handleSettings}
          onViewTimeline={handleViewTimeline}
          onViewPlaybook={handleViewPlaybook}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  section: { marginTop: spacing.xl, marginBottom: spacing.md },
  sectionTitle: {
    fontSize: 14, fontWeight: '600', color: colors.text.secondary,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md,
  },
});
