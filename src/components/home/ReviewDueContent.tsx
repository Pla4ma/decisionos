import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { QuickReviewPrompt } from './QuickReviewPrompt';
import { DailyStreakBanner } from './DailyStreakBanner';
import type { QuickReviewFeeling } from '@/features/engagement/quickReviewTypes';

interface DecisionItem {
  id: string;
  title: string;
  status: string;
}

interface ReviewDueContentProps {
  pendingDecisions: DecisionItem[];
  showQuickReview: { id: string; title: string } | null;
  quickReviewSubmitting: boolean;
  onReview: (id: string) => void;
  onQuickReview: (feeling: QuickReviewFeeling) => void;
  onDismissQuickReview: () => void;
  currentStreak: number;
  longestStreak: number;
  checkedInToday: boolean;
  isAtRisk: boolean;
  isOnFire: boolean;
  onCheckIn: () => void;
}

export function ReviewDueContent({
  pendingDecisions, showQuickReview, quickReviewSubmitting,
  onReview, onQuickReview, onDismissQuickReview,
  currentStreak, longestStreak, checkedInToday, isAtRisk, isOnFire, onCheckIn,
}: ReviewDueContentProps): JSX.Element {
  const needsReviewCount = pendingDecisions.filter(d => d.status === 'review_scheduled').length;
  const quickReviewCount = pendingDecisions.filter(d => d.status === 'chosen').length;

  return (
    <>
      {needsReviewCount > 0 && (
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Review Due</Text>
            <View style={s.countBadge}>
              <Text style={s.countText}>{needsReviewCount}</Text>
            </View>
          </View>
          {pendingDecisions.filter(d => d.status === 'review_scheduled').slice(0, 3).map((decision) => (
            <TouchableOpacity
              key={decision.id}
              style={[s.decisionCard, s.reviewCard]}
              onPress={() => onReview(decision.id)}
              activeOpacity={0.7}
            >
              <View style={s.cardIconContainer}>
                <Text style={s.cardIcon}>📋</Text>
              </View>
              <View style={s.cardCenter}>
                <Text style={s.decisionTitle} numberOfLines={1}>{decision.title}</Text>
                <Text style={s.decisionSub}>Time to review — how did it go?</Text>
              </View>
              <Text style={s.reviewArrow}>Review →</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {quickReviewCount > 0 && !showQuickReview && needsReviewCount === 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Quick Check-Ins</Text>
          {pendingDecisions.filter(d => d.status === 'chosen').slice(0, 2).map((decision) => (
            <TouchableOpacity
              key={decision.id}
              style={s.decisionCard}
              onPress={() => onReview(decision.id)}
              activeOpacity={0.7}
            >
              <View style={s.cardIconContainer}>
                <Text style={s.cardIcon}>📝</Text>
              </View>
              <View style={s.cardCenter}>
                <Text style={s.decisionTitle} numberOfLines={1}>{decision.title}</Text>
                <Text style={s.decisionSub}>Quick check-in available</Text>
              </View>
              <Text style={s.reviewArrow}>Check →</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showQuickReview && (
        <Card variant="elevated" style={s.quickReviewCard}>
          <QuickReviewPrompt
            decisionTitle={showQuickReview.title}
            decisionId={showQuickReview.id}
            onSelect={onQuickReview}
            onDismiss={onDismissQuickReview}
            isSubmitting={quickReviewSubmitting}
          />
        </Card>
      )}

      <DailyStreakBanner
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        checkedInToday={checkedInToday}
        isAtRisk={isAtRisk}
        isOnFire={isOnFire}
        onCheckIn={onCheckIn}
      />
    </>
  );
}

const s = StyleSheet.create({
  section: { marginBottom: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionTitle: {
    fontSize: 14, fontWeight: '600', color: colors.text.secondary,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  countBadge: { backgroundColor: colors.status.warning, borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 1 },
  countText: { fontSize: typography.size.xs, fontWeight: '700', color: colors.text.inverse },
  decisionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.background.secondary, borderRadius: 12,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border.primary,
  },
  reviewCard: { borderLeftWidth: 3, borderLeftColor: colors.accent.primary },
  cardIconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  cardIcon: { fontSize: 16 },
  cardCenter: { flex: 1, marginRight: spacing.md },
  decisionTitle: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary },
  decisionSub: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 2 },
  reviewArrow: { fontSize: typography.size.sm, fontWeight: '600', color: colors.accent.primary },
  quickReviewCard: { padding: spacing.md, marginBottom: spacing.md },
});