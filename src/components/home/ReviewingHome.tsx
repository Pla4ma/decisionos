import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useHomeDecisionRecommendation } from '@/features/decisions/useHomeDecisionRecommendation';
import { usePatternRecognition } from '@/features/decisions/usePatternRecognition';
import { useDailyClarityPractice } from '@/features/engagement/useDailyClarityPractice';
import { useFeatureAccess } from '@/features/progression/useFeatureAccess';
import { useAuth } from '@/features/auth/useAuth';
import { ROUTES } from '@/config/routes';
import { PatternInsightCard } from './PatternInsightCard';
import { DailyClarityPractice } from './DailyClarityPractice';

export function ReviewingHome(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const { pendingDecisions } = useHomeDecisionRecommendation(user?.id ?? null);
  const { isFeatureUnlocked, milestones } = useFeatureAccess(user?.id ?? null);
  const { activeInsights, dismissInsight } = usePatternRecognition({ enabled: isFeatureUnlocked('pattern_insights') });
  const { todayPrompt, isCompleted: practiceCompleted, isLoading: practiceLoading, completePractice, skipPractice, streakCount: practiceStreak } = useDailyClarityPractice({ enabled: isFeatureUnlocked('daily_clarity_practice') });

  const hasReviews = milestones.decisionsReviewed > 0;
  const isPowerUser = milestones.decisionsCreated >= 5 && milestones.decisionsReviewed >= 3;
  if (!hasReviews || isPowerUser) return <></>;

  const needsReviewCount = pendingDecisions.filter(d => d.status === 'review_scheduled').length;
  const openDecisions = pendingDecisions.filter(d => d.status !== 'review_scheduled' && d.status !== 'archived');

  return (
    <>
      {needsReviewCount > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Review Due</Text>
            <View style={styles.countBadge}><Text style={styles.countText}>{needsReviewCount}</Text></View>
          </View>
          {pendingDecisions.filter(d => d.status === 'review_scheduled').slice(0, 3).map((decision) => (
            <TouchableOpacity
              key={decision.id}
              style={[styles.decisionCard, styles.reviewCard]}
              onPress={() => router.push(ROUTES.DECISION_REVIEW(decision.id))}
              activeOpacity={0.7}
            >
              <View style={styles.cardIconBox}><Text style={styles.cardIcon}>📋</Text></View>
              <View style={styles.cardCenter}>
                <Text style={styles.decisionTitle} numberOfLines={1}>{decision.title}</Text>
                <Text style={styles.decisionSub}>How did it turn out?</Text>
              </View>
              <Text style={styles.reviewArrow}>Review →</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {activeInsights.length > 0 && (
        <PatternInsightCard
          insights={activeInsights.slice(0, 1)}
          onDismiss={(id) => dismissInsight(id)}
          onAction={() => router.push(ROUTES.DECISIONS_NEW)}
        />
      )}

      {openDecisions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Open Decisions</Text>
          {openDecisions.slice(0, 3).map((decision, i) => (
            <TouchableOpacity
              key={decision.id}
              style={styles.decisionCard}
              onPress={() => router.push(ROUTES.DECISION_DETAIL(decision.id))}
              activeOpacity={0.7}
            >
              <View style={[styles.rankCircle, { backgroundColor: i === 0 ? colors.accent.muted : colors.background.tertiary }]}>
                <Text style={[styles.rankText, { color: i === 0 ? colors.accent.primary : colors.text.tertiary }]}>{i + 1}</Text>
              </View>
              <View style={styles.cardCenter}>
                <Text style={styles.decisionTitle} numberOfLines={1}>{decision.title}</Text>
                <Text style={styles.decisionDate}>
                  {new Date(decision.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <View style={[styles.statusDot, { backgroundColor: decision.status === 'analyzed' ? colors.status.success : colors.accent.primary }]} />
            </TouchableOpacity>
          ))}
        </View>
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
  decisionDate: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 2 },
  reviewArrow: { fontSize: typography.size.sm, fontWeight: '600', color: colors.accent.primary },
  rankCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  rankText: { fontSize: typography.size.xs, fontWeight: '700' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});
