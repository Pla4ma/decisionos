import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { useHomeDecisionRecommendation } from '@/features/decisions/useHomeDecisionRecommendation';
import { usePatternRecognition } from '@/features/decisions/usePatternRecognition';
import { useDailyClarityPractice } from '@/features/engagement/useDailyClarityPractice';
import { useFutureSelf } from '@/features/ai/useFutureSelf';
import { useDq } from '@/features/dq/useDq';
import { useChapters } from '@/features/engagement/useChapters';
import { useGraveyard } from '@/features/engagement/useGraveyard';
import { useFeatureAccess } from '@/features/progression/useFeatureAccess';
import { useAuth } from '@/features/auth/useAuth';
import { getProgressionMilestone } from '@/features/progression/progressionVisibilityTypes';
import { ROUTES } from '@/config/routes';
import { NextArchetypeCard } from './NextArchetypeCard';
import { FutureSelfMessageCard } from './FutureSelfMessage';
import { PatternInsightCard } from './PatternInsightCard';
import { DailyClarityPractice } from './DailyClarityPractice';
import { LifeChapterCard } from './LifeChapterCard';
import { GraveyardCard } from './GraveyardCard';
import { DqDashboardCard } from './DqDashboardCard';

export function PowerUserHome(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const { pendingDecisions } = useHomeDecisionRecommendation(user?.id ?? null);
  const { isFeatureUnlocked, milestones } = useFeatureAccess(user?.id ?? null);
  const { activeInsights, dismissInsight } = usePatternRecognition({ enabled: isFeatureUnlocked('pattern_insights') });
  const { todayPrompt, isCompleted: practiceCompleted, completePractice, skipPractice, streakCount: practiceStreak } = useDailyClarityPractice({ enabled: isFeatureUnlocked('daily_clarity_practice') });
  const { unreadMessages: futureSelfMessages, markAsRead, archiveMessage } = useFutureSelf({ enabled: isFeatureUnlocked('future_self') });
  const { dq } = useDq({ enabled: isFeatureUnlocked('dq_score') });
  const { activeChapter, chapters } = useChapters(user?.id ?? null, { enabled: isFeatureUnlocked('life_chapters') });
  const { entries: graveyardEntries } = useGraveyard(user?.id ?? null, { enabled: isFeatureUnlocked('graveyard') });

  const isPowerUser = milestones.decisionsCreated >= 5 && milestones.decisionsReviewed >= 3;
  if (!isPowerUser) return <></>;

  const needsReviewCount = pendingDecisions.filter(d => d.status === 'review_scheduled').length;
  const dqScore = dq?.overall ?? 0;
  const reviewCount = dq?.reviewConsistency ?? 0;
  const biasCount = dq?.biasMitigationRate ?? 0;
  const progression = dqScore > 0
    ? getProgressionMilestone(dqScore, Math.round(reviewCount / 20), Math.round(biasCount / 20))
    : null;

  return (
    <>
      {needsReviewCount > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Review Due</Text>
            <View style={styles.countBadge}><Text style={styles.countText}>{needsReviewCount}</Text></View>
          </View>
          {pendingDecisions.filter(d => d.status === 'review_scheduled').slice(0, 2).map((decision) => (
            <TouchableOpacity
              key={decision.id}
              style={[styles.decisionCard, styles.reviewCard]}
              onPress={() => router.push(ROUTES.DECISION_REVIEW(decision.id))}
              activeOpacity={0.7}
            >
              <View style={styles.cardIconBox}><Text style={styles.cardIcon}>📋</Text></View>
              <View style={styles.cardCenter}>
                <Text style={styles.decisionTitle} numberOfLines={1}>{decision.title}</Text>
                <Text style={styles.decisionSub}>Review your outcome</Text>
              </View>
              <Text style={styles.reviewArrow}>Review →</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {dq && isFeatureUnlocked('dq_score') && (
        <DqDashboardCard
          dq={dq}
          onPress={() => router.push(ROUTES.SETTINGS)}
        />
      )}

      {dq && progression && isFeatureUnlocked('archetype') && (
        <NextArchetypeCard
          currentArchetype={progression.currentArchetype}
          currentDq={dqScore}
          nextArchetype={progression.nextArchetype}
          progressToNext={progression.progressToNext}
          requirements={progression.requirements}
        />
      )}

      {isFeatureUnlocked('future_self') && futureSelfMessages.length > 0 && (
        <FutureSelfMessageCard
          messages={futureSelfMessages}
          unreadCount={futureSelfMessages.length}
          onRead={(msg) => markAsRead(msg.id)}
          onDismiss={(id) => archiveMessage(id)}
        />
      )}

      {activeInsights.length > 0 && (
        <PatternInsightCard
          insights={activeInsights}
          onDismiss={(id) => dismissInsight(id)}
          onAction={() => router.push(ROUTES.DECISIONS_NEW)}
        />
      )}

      {todayPrompt && !practiceCompleted && (
        <DailyClarityPractice
          prompt={todayPrompt}
          streakCount={practiceStreak}
          isCompleted={practiceCompleted}
          onComplete={completePractice}
          onSkip={skipPractice}
          isSubmitting={false}
        />
      )}

      {activeChapter && (
        <LifeChapterCard
          chapter={activeChapter}
          onCreateChapter={() => router.push(ROUTES.DECISIONS_NEW)}
        />
      )}

      {graveyardEntries.length > 0 && (
        <GraveyardCard
          entries={graveyardEntries}
          onViewGraveyard={() => router.push(ROUTES.DECISIONS_LIST)}
        />
      )}

      {isFeatureUnlocked('future_self') && futureSelfMessages.length === 0 && (
        <Card variant="elevated" style={styles.optInCard}>
          <View style={styles.optInHeader}>
            <Text style={styles.optInIcon}>📜</Text>
            <View style={styles.optInInfo}>
              <Text style={styles.optInTitle}>Future Self Letters</Text>
              <Text style={styles.optInDesc}>
                Receive letters from your future self — reflections based on your decisions, values, and growth trajectory.
              </Text>
            </View>
          </View>
          <View style={styles.optInBullets}>
            <Text style={styles.bullet}>• Personalized to your decision patterns</Text>
            <Text style={styles.bullet}>• Based on your reviewed decisions and values</Text>
            <Text style={styles.bullet}>• Generated weekly as you build your decision history</Text>
          </View>
        </Card>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 1 },
  countBadge: { backgroundColor: colors.status.warning, borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 1 },
  countText: { fontSize: typography.size.xs, fontWeight: '700', color: colors.text.inverse },
  decisionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.secondary, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border.primary },
  reviewCard: { borderLeftWidth: 3, borderLeftColor: colors.accent.primary },
  cardIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  cardIcon: { fontSize: 16 },
  cardCenter: { flex: 1, marginRight: spacing.md },
  decisionTitle: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary },
  decisionSub: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 2 },
  reviewArrow: { fontSize: typography.size.sm, fontWeight: '600', color: colors.accent.primary },
  optInCard: { padding: spacing.lg, marginBottom: spacing.md },
  optInHeader: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  optInIcon: { fontSize: 28 },
  optInInfo: { flex: 1 },
  optInTitle: { fontSize: typography.size.md, fontWeight: '700', color: colors.text.primary },
  optInDesc: { fontSize: typography.size.sm, color: colors.text.secondary, lineHeight: 20, marginTop: spacing.xs },
  optInBullets: { gap: spacing.xs, paddingLeft: spacing.md },
  bullet: { fontSize: typography.size.sm, color: colors.text.tertiary, lineHeight: 20 },
});
