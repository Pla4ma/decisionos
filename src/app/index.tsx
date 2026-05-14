// Home Screen — Daily Briefing
// FLOW: This is the PRIMARY screen. Every user journey starts here.
// PRIORITY: Daily Practice > Future Self > Pattern Insights > Inbox > Decisions > Actions
// See FLOW_ARCHITECTURE.md for complete flow map.

import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useAuth } from '@/features/auth/useAuth';
import { useDailyClarityPractice } from '@/features/engagement/useDailyClarityPractice';
import { useFutureSelf } from '@/features/ai/useFutureSelf';
import { usePatternRecognition } from '@/features/decisions/usePatternRecognition';
import { useDecisionInbox } from '@/features/decisions/useDecisionInbox';
import { useHomeDecisionRecommendation as useHomeRecommendation } from '@/features/decisions/useHomeDecisionRecommendation';
import { useDailyStreak } from '@/features/progression/useDailyStreak';
import { useDq } from '@/features/dq/useDq';
import { useChapters } from '@/features/engagement/useChapters';
import { useGraveyard } from '@/features/engagement/useGraveyard';
import { DecisionInboxItem } from '@/features/decisions/decisionInboxTypes';
import { DailyClarityPractice } from '@/components/home/DailyClarityPractice';
import { FutureSelfMessageCard } from '@/components/home/FutureSelfMessage';
import { PatternInsightCard } from '@/components/home/PatternInsightCard';
import { DecisionInboxCard } from '@/components/home/DecisionInboxCard';
import { DailyStreakBanner } from '@/components/home/DailyStreakBanner';
import { DraftContinuationCard } from '@/components/home/DraftContinuationCard';
import { NextArchetypeCard } from '@/components/home/NextArchetypeCard';
import { LifeChapterCard } from '@/components/home/LifeChapterCard';
import { GraveyardCard } from '@/components/home/GraveyardCard';
import { QuickReviewPrompt } from '@/components/home/QuickReviewPrompt';
import { useQuickReview } from '@/features/engagement/useQuickReview';
import { useDecisionDraftStore } from '@/stores/decisionDraftStore';
import { getProgressionMilestone } from '@/features/progression/progressionVisibilityTypes';
import { getStatusLabel } from '@/components/home/getStatusLabel';
import type { QuickReviewFeeling } from '@/features/engagement/quickReviewTypes';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ROUTES } from '@/config/routes';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen(): JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showQuickReview, setShowQuickReview] = useState<{ id: string; title: string } | null>(null);

  // Core daily systems
  const { todayPrompt, isCompleted: practiceCompleted, isLoading: practiceLoading, completePractice, skipPractice, streakCount: practiceStreak } = useDailyClarityPractice();
  const { unreadMessages: futureSelfMessages, latestMessage, markAsRead, archiveMessage, generateWeeklyLetter } = useFutureSelf();
  const { activeInsights, dismissInsight } = usePatternRecognition();

  // Capture + decisions
  const { items: inboxItems, unprocessedCount, addToInbox } = useDecisionInbox();
  const { recommendation, pendingDecisions, isLoading: decisionsLoading } = useHomeRecommendation(user?.id ?? null);
  const { submitQuickReview, isSubmitting: quickReviewSubmitting } = useQuickReview();

  // Progression
  const { currentStreak, longestStreak, checkedInToday, isAtRisk, isOnFire, checkIn } = useDailyStreak(user?.id ?? null);
  const { dq } = useDq();
  const { activeChapter, chapters } = useChapters(user?.id ?? null);
  const { entries: graveyardEntries } = useGraveyard(user?.id ?? null);
  const { draft } = useDecisionDraftStore();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 500));
    setRefreshing(false);
  }, []);

  // Generate weekly Future Self letter
  useEffect(() => {
    if (user?.id && dq && practiceStreak > 0) {
      generateWeeklyLetter(dq.overall, dq.archetype, practiceStreak).catch(() => {});
    }
  }, [user?.id, dq, practiceStreak]);

  // Show quick review when decisions need 48h check-in
  const decisionsNeedingQuickReview = pendingDecisions.filter((d: any) => d.is_quick_review_due);
  useEffect(() => {
    if (!showQuickReview && decisionsNeedingQuickReview.length > 0) {
      setShowQuickReview({ id: decisionsNeedingQuickReview[0].id, title: decisionsNeedingQuickReview[0].title });
    }
  }, [decisionsNeedingQuickReview, showQuickReview]);

  const handleQuickReview = useCallback(async (feeling: QuickReviewFeeling) => {
    if (showQuickReview) {
      await submitQuickReview(showQuickReview.id, feeling);
      setShowQuickReview(null);
    }
  }, [showQuickReview, submitQuickReview]);

  const handleInboxItem = useCallback((item: DecisionInboxItem) => {
    router.push(`${ROUTES.DECISIONS_NEW}?thought=${encodeURIComponent(item.thought)}`);
  }, [router]);

  const greeting = getGreeting();
  const displayName = user?.email?.split('@')[0];
  const dqScore = dq?.overall ?? 0;
  const reviewCount = dq?.reviewConsistency ?? 0;
  const biasCount = dq?.biasMitigationRate ?? 0;
  const progression = getProgressionMilestone(dqScore, Math.round(reviewCount / 20), Math.round(biasCount / 20));
  const unfinishedDraft = draft?.title ? { title: draft.title, step: 0, totalSteps: 4 } : null;

  if (practiceLoading && !refreshing) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LoadingState message="Preparing your briefing..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.lg }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Minimal Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}{displayName ? `, ${displayName}` : ''}</Text>
            <Text style={styles.subtitle}>Your Daily Briefing</Text>
          </View>
          <View style={styles.headerRight}>
            {currentStreak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakIcon}>🔥</Text>
                <Text style={styles.streakValue}>{currentStreak}</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => router.push(ROUTES.SETTINGS)} style={styles.settingsBtn}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 1. DAILY CLARITY PRACTICE — The main event */}
        {todayPrompt && (
          <DailyClarityPractice
            prompt={todayPrompt}
            streakCount={practiceStreak}
            isCompleted={practiceCompleted}
            onComplete={completePractice}
            onSkip={skipPractice}
            isSubmitting={false}
          />
        )}

        {/* 2. FUTURE SELF MESSAGES — Emotional anchor */}
        <FutureSelfMessageCard
          messages={futureSelfMessages}
          unreadCount={futureSelfMessages.length}
          onRead={(msg) => {
            markAsRead(msg.id);
          }}
          onDismiss={(id) => archiveMessage(id)}
        />

        {/* 3. PATTERN INSIGHTS — Intellectual hook */}
        <PatternInsightCard
          insights={activeInsights}
          onDismiss={(id) => dismissInsight(id)}
          onAction={(insight) => {
            if (insight.suggested_action) {
              router.push(ROUTES.DECISIONS_NEW);
            }
          }}
        />

        {/* 4. DECISION INBOX — Quick capture */}
        <DecisionInboxCard
          items={inboxItems}
          unprocessedCount={unprocessedCount}
          onAdd={(thought) => addToInbox({ thought })}
          onItemPress={handleInboxItem}
        />

        {/* Quick Review Prompt */}
        {showQuickReview && (
          <QuickReviewPrompt
            decisionTitle={showQuickReview.title}
            decisionId={showQuickReview.id}
            onSelect={handleQuickReview}
            onDismiss={() => setShowQuickReview(null)}
            isSubmitting={quickReviewSubmitting}
          />
        )}

        {/* Draft Continuation */}
        {unfinishedDraft && (
          <DraftContinuationCard
            draft={unfinishedDraft}
            onResume={() => router.push(ROUTES.DECISIONS_NEW)}
            onDismiss={() => {}}
          />
        )}

        {/* Daily Streak (compact) */}
        <DailyStreakBanner
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          checkedInToday={checkedInToday}
          isAtRisk={isAtRisk}
          isOnFire={isOnFire}
          onCheckIn={checkIn}
        />

        {/* Progression */}
        {dq && (
          <NextArchetypeCard
            currentArchetype={progression.currentArchetype}
            currentDq={dqScore}
            nextArchetype={progression.nextArchetype}
            progressToNext={progression.progressToNext}
            requirements={progression.requirements}
          />
        )}

        {/* Life Chapter */}
        <LifeChapterCard
          chapter={activeChapter}
          onCreateChapter={() => router.push(ROUTES.DECISIONS_NEW)}
        />

        {/* Open Decisions (compact list) */}
        {pendingDecisions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Open Decisions</Text>
            {pendingDecisions.slice(0, 5).map((decision: any) => {
              const status = decision.is_quick_review_due
                ? { label: 'Check-in', variant: 'accent' as const }
                : getStatusLabel(decision);
              return (
                <TouchableOpacity
                  key={decision.id}
                  style={styles.decisionRow}
                  onPress={() => router.push(ROUTES.DECISION_DETAIL(decision.id))}
                  activeOpacity={0.7}
                >
                  <View style={styles.decisionInfo}>
                    <Text style={styles.decisionTitle} numberOfLines={1}>{decision.title}</Text>
                    <Text style={styles.decisionDate}>
                      {new Date(decision.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: status.variant === 'accent' ? colors.accent.primary : colors.text.tertiary }]} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Graveyard */}
        <GraveyardCard
          entries={graveyardEntries}
          onViewGraveyard={() => router.push(ROUTES.DECISIONS_LIST)}
        />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push(ROUTES.DECISIONS_NEW_QUICK)} activeOpacity={0.7}>
            <Text style={styles.quickActionIcon}>⚡</Text>
            <Text style={styles.quickActionLabel}>Quick Decision</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push(ROUTES.DECISIONS_NEW)} activeOpacity={0.7}>
            <Text style={styles.quickActionIcon}>+</Text>
            <Text style={styles.quickActionLabel}>Full Analysis</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push(ROUTES.DECISIONS_LIST)} activeOpacity={0.7}>
            <Text style={styles.quickActionIcon}>📋</Text>
            <Text style={styles.quickActionLabel}>History</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Clarity is a daily practice, not a destination.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  greeting: {
    fontSize: typography.size.xxl, fontWeight: typography.weight.bold, color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.size.sm, color: colors.text.tertiary, marginTop: spacing.xs,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.background.secondary,
    borderRadius: 9999, paddingHorizontal: spacing.sm, paddingVertical: 4,
  },
  streakIcon: { fontSize: 14 },
  streakValue: { fontSize: typography.size.sm, fontWeight: '700', color: colors.accent.primary },
  settingsBtn: { padding: spacing.sm },
  settingsIcon: { fontSize: 20 },
  section: { marginBottom: spacing.md },
  sectionTitle: {
    fontSize: 14, fontWeight: '600', color: colors.text.secondary,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md,
  },
  decisionRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.background.secondary, borderRadius: 8,
    padding: spacing.md, marginBottom: spacing.xs,
  },
  decisionInfo: { flex: 1, marginRight: spacing.md },
  decisionTitle: { fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.text.primary },
  decisionDate: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  quickActions: {
    flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg,
  },
  quickActionBtn: {
    flex: 1, backgroundColor: colors.background.secondary, borderRadius: 10,
    padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border.primary,
  },
  quickActionIcon: { fontSize: 18, marginBottom: spacing.xs },
  quickActionLabel: { fontSize: typography.size.xs, fontWeight: typography.weight.medium, color: colors.text.primary },
  footer: {
    fontSize: typography.size.sm, color: colors.text.tertiary,
    textAlign: 'center', fontStyle: 'italic', marginTop: spacing.md,
  },
});
