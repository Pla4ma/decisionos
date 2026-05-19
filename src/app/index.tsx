import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useAuth } from '@/features/auth/useAuth';
import { useDailyClarityPractice } from '@/features/engagement/useDailyClarityPractice';
import { useFutureSelf } from '@/features/ai/useFutureSelf';
import { usePatternRecognition } from '@/features/decisions/usePatternRecognition';
import { useHomeDecisionRecommendation as useHomeRecommendation } from '@/features/decisions/useHomeDecisionRecommendation';
import { useDailyStreak } from '@/features/progression/useDailyStreak';
import { useFeatureAccess } from '@/features/progression/useFeatureAccess';
import { useDq } from '@/features/dq/useDq';
import { useChapters } from '@/features/engagement/useChapters';
import { useGraveyard } from '@/features/engagement/useGraveyard';
import { useQuickReview } from '@/features/engagement/useQuickReview';
import { useDecisionDraftStore } from '@/stores/decisionDraftStore';
import { getProgressionMilestone } from '@/features/progression/progressionVisibilityTypes';
import type { QuickReviewFeeling } from '@/features/engagement/quickReviewTypes';
import { LoadingState } from '@/components/ui/LoadingState';
import { ROUTES } from '@/config/routes';
import { homeStyles } from './homeScreenStyles';
import { getGreeting, getExampleDecisions, getRecoveryGreeting, getSubtitleForStage } from './homeScreenHelpers';
import { EmptyHomeContent } from '@/components/home/EmptyHomeContent';
import { ActiveDecisionContent } from '@/components/home/ActiveDecisionContent';
import { ReviewDueContent } from '@/components/home/ReviewDueContent';
import { ReviewingContent } from '@/components/home/ReviewingContent';
import { PowerUserContent } from '@/components/home/PowerUserContent';
import { DqDashboardCard } from '@/components/home/DqDashboardCard';
import { DailyStreakBanner } from '@/components/home/DailyStreakBanner';
import { WelcomeBackBanner } from '@/components/home/WelcomeBackBanner';

export default function HomeScreen(): JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showQuickReview, setShowQuickReview] = useState<{ id: string; title: string } | null>(null);
  const [insightGenerated, setInsightGenerated] = useState(false);

  const { isFeatureUnlocked, milestones, isLoading: featureLoading } = useFeatureAccess(user?.id ?? null);
  const hasCreatedDecisions = milestones.decisionsCreated > 0;

  const { todayPrompt, isCompleted: practiceCompleted, isLoading: practiceLoading, completePractice, skipPractice, streakCount: practiceStreak } = useDailyClarityPractice({ enabled: isFeatureUnlocked('daily_clarity_practice') });
  const { unreadMessages: futureSelfMessages, markAsRead, archiveMessage, generateWeeklyLetter } = useFutureSelf({ enabled: isFeatureUnlocked('future_self') });
  const { activeInsights, dismissInsight } = usePatternRecognition({ enabled: isFeatureUnlocked('pattern_insights') });
  const { recommendation, pendingDecisions, isLoading: decisionsLoading } = useHomeRecommendation(user?.id ?? null);
  const { submitQuickReview, isSubmitting: quickReviewSubmitting } = useQuickReview();
  const { currentStreak, longestStreak, checkedInToday, isAtRisk, isOnFire, checkIn, recovery, forgiveStreak } = useDailyStreak(user?.id ?? null, { enabled: isFeatureUnlocked('daily_streak') });
  const { dq, isLoading: dqLoading } = useDq({ enabled: isFeatureUnlocked('dq_score') });
  const { activeChapter, chapters } = useChapters(user?.id ?? null, { enabled: isFeatureUnlocked('life_chapters') });
  const { entries: graveyardEntries } = useGraveyard(user?.id ?? null, { enabled: isFeatureUnlocked('graveyard') });
  const { draft } = useDecisionDraftStore();

  const hasChosenDecisions = milestones.decisionsCreated > 0 && pendingDecisions.some(d => d.status === 'chosen' || d.status === 'review_scheduled');
  const hasReviews = milestones.decisionsReviewed > 0;
  const isPowerUser = milestones.decisionsCreated >= 5 && milestones.decisionsReviewed >= 3;
  const showDqCard = dq && milestones.decisionsReviewed >= 1;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 500));
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (user?.id && dq && practiceStreak > 0 && isFeatureUnlocked('future_self')) {
      generateWeeklyLetter(dq.overall, dq.archetype, practiceStreak).catch(() => {});
    }
  }, [user?.id, dq, practiceStreak, isFeatureUnlocked('future_self')]);

  const decisionsNeedingQuickReview = pendingDecisions.filter((d: any) => d.is_quick_review_due);
  useEffect(() => {
    if (!showQuickReview && decisionsNeedingQuickReview.length > 0 && isFeatureUnlocked('quick_review')) {
      setShowQuickReview({ id: decisionsNeedingQuickReview[0].id, title: decisionsNeedingQuickReview[0].title });
    }
  }, [decisionsNeedingQuickReview, showQuickReview, isFeatureUnlocked]);

  const handleQuickReview = useCallback(async (feeling: QuickReviewFeeling) => {
    if (showQuickReview) {
      await submitQuickReview(showQuickReview.id, feeling);
      setShowQuickReview(null);
    }
  }, [showQuickReview, submitQuickReview]);

  const handleInsightGenerated = useCallback((_insight: any) => {
    setInsightGenerated(true);
  }, []);

  const greeting = getGreeting();
  const displayName = user?.email?.split('@')[0];
  const dqScore = dq?.overall ?? 0;
  const reviewCount = dq?.reviewConsistency ?? 0;
  const biasCount = dq?.biasMitigationRate ?? 0;
  const progression = getProgressionMilestone(dqScore, Math.round(reviewCount / 20), Math.round(biasCount / 20));
  const unfinishedDraft = draft?.title ? { title: draft.title, step: 0, totalSteps: 4 } : null;
  const exampleDecisions = getExampleDecisions();
  const subtitle = getSubtitleForStage(hasCreatedDecisions, hasReviews, isPowerUser);

  const needsReviewCount = pendingDecisions.filter(d => d.status === 'review_scheduled').length;

  if (featureLoading && !refreshing) {
    return (
      <View style={homeStyles.container}>
        <LoadingState message="Preparing your briefing..." />
      </View>
    );
  }

  const renderStage = () => {
    if (!hasCreatedDecisions) {
      return (
        <EmptyHomeContent
          exampleDecisions={exampleDecisions}
          onStartFull={() => router.push(ROUTES.DECISIONS_NEW)}
          onStartQuick={(title) => router.push(`${ROUTES.DECISIONS_NEW_QUICK}&title=${encodeURIComponent(title)}`)}
          onInsightGenerated={handleInsightGenerated}
        />
      );
    }

    return (
      <>
        {recovery && checkedInToday === false && (
          <WelcomeBackBanner
            recovery={recovery}
            currentStreak={currentStreak}
            onCheckIn={checkIn}
            onForgive={forgiveStreak}
            isSubmitting={false}
          />
        )}

        {!recovery && hasCreatedDecisions && (
          <DailyStreakBanner
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            checkedInToday={checkedInToday}
            isAtRisk={isAtRisk}
            isOnFire={isOnFire}
            onCheckIn={checkIn}
          />
        )}

        {showDqCard && (
          <DqDashboardCard
            dq={dq!}
            currentStreak={currentStreak}
            onPress={() => router.push(ROUTES.SETTINGS)}
          />
        )}

        {!hasChosenDecisions && (
          <ActiveDecisionContent
            pendingDecisions={pendingDecisions}
            unfinishedDraft={unfinishedDraft}
            onResumeDraft={() => router.push(ROUTES.DECISIONS_NEW)}
            onDecisionPress={(id) => router.push(ROUTES.DECISION_DETAIL(id))}
          />
        )}

        {hasChosenDecisions && !hasReviews && (
          <ReviewDueContent
            pendingDecisions={pendingDecisions}
            showQuickReview={showQuickReview}
            quickReviewSubmitting={quickReviewSubmitting}
            onReview={(id) => router.push(ROUTES.DECISION_REVIEW(id))}
            onQuickReview={handleQuickReview}
            onDismissQuickReview={() => setShowQuickReview(null)}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            checkedInToday={checkedInToday}
            isAtRisk={isAtRisk}
            isOnFire={isOnFire}
            onCheckIn={checkIn}
          />
        )}

        {hasReviews && !isPowerUser && (
          <ReviewingContent
            pendingDecisions={pendingDecisions}
            activeInsights={activeInsights}
            onDismissInsight={dismissInsight}
            onInsightAction={() => router.push(ROUTES.DECISIONS_NEW)}
            onReview={(id) => router.push(ROUTES.DECISION_REVIEW(id))}
            onDecisionPress={(id) => router.push(ROUTES.DECISION_DETAIL(id))}
            todayPrompt={todayPrompt}
            practiceStreak={practiceStreak}
            practiceCompleted={practiceCompleted}
            onCompletePractice={completePractice}
            onSkipPractice={skipPractice}
          />
        )}

        {isPowerUser && (
          <PowerUserContent
            pendingDecisions={pendingDecisions}
            dq={dq}
            dqScore={dqScore}
            progression={progression}
            futureSelfMessages={futureSelfMessages}
            onReadFutureSelf={(msg) => markAsRead(msg.id)}
            onDismissFutureSelf={(id) => archiveMessage(id)}
            activeInsights={activeInsights}
            onDismissInsight={dismissInsight}
            onInsightAction={() => router.push(ROUTES.DECISIONS_NEW)}
            todayPrompt={todayPrompt}
            practiceStreak={practiceStreak}
            practiceCompleted={practiceCompleted}
            onCompletePractice={completePractice}
            onSkipPractice={skipPractice}
            activeChapter={activeChapter}
            graveyardEntries={graveyardEntries}
            onViewGraveyard={() => router.push(ROUTES.DECISIONS_LIST)}
            onCreateChapter={() => router.push(ROUTES.DECISIONS_NEW)}
            onReview={(id) => router.push(ROUTES.DECISION_REVIEW(id))}
          />
        )}
      </>
    );
  };

  return (
    <View style={[homeStyles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={homeStyles.scroll}
        contentContainerStyle={[homeStyles.scrollContent, { paddingBottom: insets.bottom + spacing.lg }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={homeStyles.header}>
          <View>
            <Text style={homeStyles.greeting}>{greeting}{displayName ? `, ${displayName}` : ''}</Text>
            <Text style={homeStyles.subtitle}>{subtitle}</Text>
          </View>
          <View style={homeStyles.headerRight}>
            {recovery && (
              <View style={[homeStyles.streakBadge, { backgroundColor: colors.accent.muted }]}>
                <Text style={homeStyles.streakValue}>🫂 {currentStreak}</Text>
              </View>
            )}
            {hasReviews && !recovery && (
              <View style={homeStyles.streakBadge}>
                <Text style={homeStyles.streakIcon}>✓</Text>
                <Text style={homeStyles.streakValue}>{milestones.decisionsReviewed} reviewed</Text>
              </View>
            )}
            {needsReviewCount > 0 && (
              <View style={[homeStyles.streakBadge, { backgroundColor: colors.status.warning + '20' }]}>
                <Text style={[homeStyles.streakValue, { color: colors.status.warning }]}>{needsReviewCount} due</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => router.push(ROUTES.SETTINGS)} style={homeStyles.settingsBtn}>
              <Text style={homeStyles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {renderStage()}

        {hasCreatedDecisions && (
          <View style={homeStyles.quickActions}>
            <TouchableOpacity style={homeStyles.quickActionBtn} onPress={() => router.push(ROUTES.DECISIONS_NEW_QUICK)} activeOpacity={0.7}>
              <Text style={homeStyles.quickActionIcon}>⚡</Text>
              <Text style={homeStyles.quickActionLabel}>Quick Decision</Text>
            </TouchableOpacity>
            <TouchableOpacity style={homeStyles.quickActionBtn} onPress={() => router.push(ROUTES.DECISIONS_NEW)} activeOpacity={0.7}>
              <Text style={homeStyles.quickActionIcon}>+</Text>
              <Text style={homeStyles.quickActionLabel}>Full Analysis</Text>
            </TouchableOpacity>
            <TouchableOpacity style={homeStyles.quickActionBtn} onPress={() => router.push(ROUTES.DECISIONS_LIST)} activeOpacity={0.7}>
              <Text style={homeStyles.quickActionIcon}>📋</Text>
              <Text style={homeStyles.quickActionLabel}>History</Text>
            </TouchableOpacity>
          </View>
        )}

        {!hasCreatedDecisions && insightGenerated && (
          <View style={homeStyles.quickActions}>
            <TouchableOpacity style={homeStyles.quickActionBtn} onPress={() => router.push(ROUTES.DECISIONS_NEW)} activeOpacity={0.7}>
              <Text style={homeStyles.quickActionIcon}>+</Text>
              <Text style={homeStyles.quickActionLabel}>Full Analysis</Text>
            </TouchableOpacity>
          </View>
        )}

        {!recovery && <Text style={homeStyles.footer}>Clarity is a daily practice, not a destination.</Text>}
      </ScrollView>
    </View>
  );
}