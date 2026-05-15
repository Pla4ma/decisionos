// Home Screen — Daily Briefing
// FLOW: This is the PRIMARY screen. Every user journey starts here.
// FEATURES: Progressively unlocked based on user milestones.
// New users see a simple focused view; advanced features reveal over time.
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
import { useFeatureAccess } from '@/features/progression/useFeatureAccess';
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

function getExampleDecisions(): string[] {
  return [
    'Should I quit my job?',
    'Should I move?',
    'Should I start this business?',
    'Should I choose this school?',
    'Should I make this big purchase?',
    'Should I break up?',
    'Should I take this offer?',
    'Should I wait or act now?',
  ];
}

export default function HomeScreen(): JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showQuickReview, setShowQuickReview] = useState<{ id: string; title: string } | null>(null);

  // Feature access — progressive unlocking based on user milestones
  const { isFeatureUnlocked, milestones, isLoading: featureLoading } = useFeatureAccess(user?.id ?? null);
  const hasCreatedDecisions = milestones.decisionsCreated > 0;

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

  // Generate weekly Future Self letter (only when feature is unlocked)
  useEffect(() => {
    if (user?.id && dq && practiceStreak > 0 && isFeatureUnlocked('future_self')) {
      generateWeeklyLetter(dq.overall, dq.archetype, practiceStreak).catch(() => {});
    }
  }, [user?.id, dq, practiceStreak, isFeatureUnlocked('future_self')]);

  // Show quick review when decisions need 48h check-in
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
  const exampleDecisions = getExampleDecisions();

  if (practiceLoading && !refreshing && hasCreatedDecisions) {
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
            <Text style={styles.subtitle}>
              {hasCreatedDecisions ? 'Your Daily Briefing' : 'Think Clearly Before Choices You Might Regret'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {isFeatureUnlocked('daily_streak') && currentStreak > 0 && (
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

        {/* NEW USER EMPTY STATE — Simple focused entry point */}
        {!hasCreatedDecisions && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>What decision are you facing?</Text>
            <Text style={styles.emptySubtitle}>
              Use DecisionOS before you quit, move, spend, choose, or commit.
            </Text>
            <View style={styles.emptyExamples}>
              {exampleDecisions.slice(0, 4).map((example, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.exampleChip}
                  onPress={() => router.push(`${ROUTES.DECISIONS_NEW}?quick=true`)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.exampleChipText}>{example}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.emptyActions}>
              <TouchableOpacity style={styles.primaryActionBtn} onPress={() => router.push(ROUTES.DECISIONS_NEW)} activeOpacity={0.7}>
                <Text style={styles.primaryActionLabel}>Start Full Analysis</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryActionBtn} onPress={() => router.push(ROUTES.DECISIONS_NEW_QUICK)} activeOpacity={0.7}>
                <Text style={styles.secondaryActionLabel}>Quick Decision</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* RETURNING USER — Progressively revealed modules */}

        {/* 1. DAILY CLARITY PRACTICE — Unlocked after 3 days active */}
        {hasCreatedDecisions && isFeatureUnlocked('daily_clarity_practice') && todayPrompt && (
          <DailyClarityPractice
            prompt={todayPrompt}
            streakCount={practiceStreak}
            isCompleted={practiceCompleted}
            onComplete={completePractice}
            onSkip={skipPractice}
            isSubmitting={false}
          />
        )}

        {/* 2. FUTURE SELF MESSAGES — Unlocked after 5 decisions + 3 reviews */}
        {hasCreatedDecisions && isFeatureUnlocked('future_self') && (
          <FutureSelfMessageCard
            messages={futureSelfMessages}
            unreadCount={futureSelfMessages.length}
            onRead={(msg) => {
              markAsRead(msg.id);
            }}
            onDismiss={(id) => archiveMessage(id)}
          />
        )}

        {/* 3. PATTERN INSIGHTS — Unlocked after 1st decision */}
        {hasCreatedDecisions && isFeatureUnlocked('pattern_insights') && (
          <PatternInsightCard
            insights={activeInsights}
            onDismiss={(id) => dismissInsight(id)}
            onAction={(insight) => {
              if (insight.suggested_action) {
                router.push(ROUTES.DECISIONS_NEW);
              }
            }}
          />
        )}

        {/* 4. DECISION INBOX — Unlocked after 1st review */}
        {hasCreatedDecisions && isFeatureUnlocked('decision_inbox') && (
          <DecisionInboxCard
            items={inboxItems}
            unprocessedCount={unprocessedCount}
            onAdd={(thought) => addToInbox({ thought })}
            onItemPress={handleInboxItem}
          />
        )}

        {/* Quick Review Prompt — Unlocked after 1st review */}
        {hasCreatedDecisions && isFeatureUnlocked('quick_review') && showQuickReview && (
          <QuickReviewPrompt
            decisionTitle={showQuickReview.title}
            decisionId={showQuickReview.id}
            onSelect={handleQuickReview}
            onDismiss={() => setShowQuickReview(null)}
            isSubmitting={quickReviewSubmitting}
          />
        )}

        {/* Draft Continuation — Unlocked after 1st decision */}
        {hasCreatedDecisions && isFeatureUnlocked('draft_continuation') && unfinishedDraft && (
          <DraftContinuationCard
            draft={unfinishedDraft}
            onResume={() => router.push(ROUTES.DECISIONS_NEW)}
            onDismiss={() => {}}
          />
        )}

        {/* Daily Streak — Unlocked after 3 decisions */}
        {hasCreatedDecisions && isFeatureUnlocked('daily_streak') && (
          <DailyStreakBanner
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            checkedInToday={checkedInToday}
            isAtRisk={isAtRisk}
            isOnFire={isOnFire}
            onCheckIn={checkIn}
          />
        )}

        {/* Progression / DQ / Archetype — Unlocked after 5+ reviews */}
        {hasCreatedDecisions && isFeatureUnlocked('dq_score') && dq && (
          <NextArchetypeCard
            currentArchetype={progression.currentArchetype}
            currentDq={dqScore}
            nextArchetype={progression.nextArchetype}
            progressToNext={progression.progressToNext}
            requirements={progression.requirements}
          />
        )}

        {/* Life Chapter — Unlocked after 5 decisions */}
        {hasCreatedDecisions && isFeatureUnlocked('life_chapters') && (
          <LifeChapterCard
            chapter={activeChapter}
            onCreateChapter={() => router.push(ROUTES.DECISIONS_NEW)}
          />
        )}

        {/* Open Decisions (compact list) */}
        {hasCreatedDecisions && pendingDecisions.length > 0 && (
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

        {/* Graveyard — Unlocked after 5 decisions */}
        {hasCreatedDecisions && isFeatureUnlocked('graveyard') && (
          <GraveyardCard
            entries={graveyardEntries}
            onViewGraveyard={() => router.push(ROUTES.DECISIONS_LIST)}
          />
        )}

        {/* Quick Actions — Always visible once user has created a decision */}
        {hasCreatedDecisions && (
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
        )}

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
  emptyState: {
    alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.md,
  },
  emptyTitle: {
    fontSize: 26, fontWeight: '700', color: colors.text.primary,
    textAlign: 'center', marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.size.md, color: colors.text.secondary,
    textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg,
  },
  emptyExamples: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    gap: spacing.sm, marginBottom: spacing.xl,
  },
  exampleChip: {
    backgroundColor: colors.background.secondary,
    borderRadius: 9999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.border.primary,
  },
  exampleChipText: {
    fontSize: typography.size.sm, color: colors.accent.primary,
  },
  emptyActions: {
    width: '100%', gap: spacing.md,
  },
  primaryActionBtn: {
    backgroundColor: colors.accent.primary, borderRadius: 12,
    padding: spacing.md, alignItems: 'center',
  },
  primaryActionLabel: {
    fontSize: typography.size.md, fontWeight: '600', color: '#FFFFFF',
  },
  secondaryActionBtn: {
    borderRadius: 12, padding: spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border.primary,
  },
  secondaryActionLabel: {
    fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary,
  },
});
