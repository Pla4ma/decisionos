import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { useHomeDecisionRecommendation } from '@/features/decisions/useHomeDecisionRecommendation';
import { useQuickReview } from '@/features/engagement/useQuickReview';
import { useFeatureAccess } from '@/features/progression/useFeatureAccess';
import { useAuth } from '@/features/auth/useAuth';
import { ROUTES } from '@/config/routes';
import { QuickReviewPrompt } from './QuickReviewPrompt';
import type { QuickReviewFeeling } from '@/features/engagement/quickReviewTypes';

export function ReviewDueHome(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const { pendingDecisions } = useHomeDecisionRecommendation(user?.id ?? null);
  const { isFeatureUnlocked } = useFeatureAccess(user?.id ?? null);
  const { submitQuickReview, isSubmitting: quickReviewSubmitting } = useQuickReview();

  const hasChosen = pendingDecisions.some(d => d.status === 'chosen' || d.status === 'review_scheduled');
  if (!hasChosen) return <></>;
  const hasReviews = pendingDecisions.some(d => d.status === 'reviewed');
  if (hasReviews) return <></>;

  const needsReviewCount = pendingDecisions.filter(d => d.status === 'review_scheduled').length;
  const quickReviewCount = pendingDecisions.filter(d => d.status === 'chosen').length;
  const decisionsNeedingQuickReview = pendingDecisions.filter((d: any) => d.is_quick_review_due);
  const showQuickReview = decisionsNeedingQuickReview.length > 0 && isFeatureUnlocked('quick_review')
    ? { id: decisionsNeedingQuickReview[0].id, title: decisionsNeedingQuickReview[0].title }
    : null;

  const handleQuickReview = async (feeling: QuickReviewFeeling) => {
    if (showQuickReview) {
      await submitQuickReview(showQuickReview.id, feeling);
    }
  };

  const reviewConsistency = pendingDecisions.filter(d => d.status === 'reviewed' || d.status === 'review_scheduled').length;
  const totalDecisions = pendingDecisions.length;
  const reviewRate = totalDecisions > 0 ? Math.round((reviewConsistency / totalDecisions) * 100) : 0;

  return (
    <>
      {reviewConsistency > 0 && (
        <Card variant="elevated" style={styles.consistencyCard}>
          <Text style={styles.consistencyLabel}>Review Consistency</Text>
          <Text style={styles.consistencyValue}>{reviewRate}%</Text>
          <Text style={styles.consistencyDesc}>
            {reviewRate >= 50 ? 'Great job keeping up with reviews.' : 'Reviews help you learn from every decision.'}
          </Text>
        </Card>
      )}

      {needsReviewCount > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Review Due</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{needsReviewCount}</Text>
            </View>
          </View>
          {pendingDecisions.filter(d => d.status === 'review_scheduled').slice(0, 3).map((decision) => (
            <TouchableOpacity
              key={decision.id}
              style={[styles.decisionCard, styles.reviewCard]}
              onPress={() => router.push(ROUTES.DECISION_REVIEW(decision.id))}
              activeOpacity={0.7}
            >
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>📋</Text>
              </View>
              <View style={styles.cardCenter}>
                <Text style={styles.decisionTitle} numberOfLines={1}>{decision.title}</Text>
                <Text style={styles.decisionSub}>Time to review — how did it go?</Text>
              </View>
              <Text style={styles.reviewArrow}>Review →</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {quickReviewCount > 0 && !showQuickReview && needsReviewCount === 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Check-Ins</Text>
          {pendingDecisions.filter(d => d.status === 'chosen').slice(0, 2).map((decision) => (
            <TouchableOpacity
              key={decision.id}
              style={styles.decisionCard}
              onPress={() => router.push(ROUTES.DECISION_REVIEW(decision.id))}
              activeOpacity={0.7}
            >
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>📝</Text>
              </View>
              <View style={styles.cardCenter}>
                <Text style={styles.decisionTitle} numberOfLines={1}>{decision.title}</Text>
                <Text style={styles.decisionSub}>Quick check-in available</Text>
              </View>
              <Text style={styles.reviewArrow}>Check →</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showQuickReview && (
        <Card variant="elevated" style={styles.quickReviewCard}>
          <QuickReviewPrompt
            decisionTitle={showQuickReview.title}
            decisionId={showQuickReview.id}
            onSelect={handleQuickReview}
            onDismiss={() => {}}
            isSubmitting={quickReviewSubmitting}
          />
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
  cardIconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  cardIcon: { fontSize: 16 },
  cardCenter: { flex: 1, marginRight: spacing.md },
  decisionTitle: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary },
  decisionSub: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 2 },
  reviewArrow: { fontSize: typography.size.sm, fontWeight: '600', color: colors.accent.primary },
  quickReviewCard: { padding: spacing.md, marginBottom: spacing.md },
  consistencyCard: { padding: spacing.lg, marginBottom: spacing.md, alignItems: 'center' },
  consistencyLabel: { fontSize: typography.size.xs, fontWeight: '700', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs },
  consistencyValue: { fontSize: 32, fontWeight: '800', color: colors.accent.primary, marginBottom: spacing.xs },
  consistencyDesc: { fontSize: typography.size.sm, color: colors.text.secondary, textAlign: 'center' },
});
