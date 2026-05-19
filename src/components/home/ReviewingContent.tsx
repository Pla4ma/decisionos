import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { PatternInsightCard } from './PatternInsightCard';
import { DailyClarityPractice } from './DailyClarityPractice';

interface DecisionItem {
  id: string;
  title: string;
  created_at: string;
  status: string;
}

interface ReviewingContentProps {
  pendingDecisions: DecisionItem[];
  activeInsights: any[];
  onDismissInsight: (id: string) => void;
  onInsightAction: () => void;
  onReview: (id: string) => void;
  onDecisionPress: (id: string) => void;
  todayPrompt: any;
  practiceStreak: number;
  practiceCompleted: boolean;
  onCompletePractice: () => void;
  onSkipPractice: () => void;
}

export function ReviewingContent({
  pendingDecisions, activeInsights, onDismissInsight, onInsightAction,
  onReview, onDecisionPress,
  todayPrompt, practiceStreak, practiceCompleted, onCompletePractice, onSkipPractice,
}: ReviewingContentProps): JSX.Element {
  const needsReviewCount = pendingDecisions.filter(d => d.status === 'review_scheduled').length;
  const openDecisions = pendingDecisions.filter(d => d.status !== 'review_scheduled' && d.status !== 'archived');

  return (
    <>
      {needsReviewCount > 0 && (
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Review Due</Text>
            <View style={s.countBadge}><Text style={s.countText}>{needsReviewCount}</Text></View>
          </View>
          {pendingDecisions.filter(d => d.status === 'review_scheduled').slice(0, 3).map((decision) => (
            <TouchableOpacity
              key={decision.id}
              style={[s.decisionCard, s.reviewCard]}
              onPress={() => onReview(decision.id)}
              activeOpacity={0.7}
            >
              <View style={s.cardIconBox}><Text style={s.cardIcon}>📋</Text></View>
              <View style={s.cardCenter}>
                <Text style={s.decisionTitle} numberOfLines={1}>{decision.title}</Text>
                <Text style={s.decisionSub}>How did it turn out?</Text>
              </View>
              <Text style={s.reviewArrow}>Review →</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {activeInsights.length > 0 && (
        <PatternInsightCard
          insights={activeInsights.slice(0, 1)}
          onDismiss={(id) => onDismissInsight(id)}
          onAction={() => onInsightAction()}
        />
      )}

      {openDecisions.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Open Decisions</Text>
          {openDecisions.slice(0, 3).map((decision, i) => (
            <TouchableOpacity
              key={decision.id}
              style={s.decisionCard}
              onPress={() => onDecisionPress(decision.id)}
              activeOpacity={0.7}
            >
              <View style={[s.rankCircle, { backgroundColor: i === 0 ? colors.accent.muted : colors.background.tertiary }]}>
                <Text style={[s.rankText, { color: i === 0 ? colors.accent.primary : colors.text.tertiary }]}>{i + 1}</Text>
              </View>
              <View style={s.cardCenter}>
                <Text style={s.decisionTitle} numberOfLines={1}>{decision.title}</Text>
                <Text style={s.decisionDate}>
                  {new Date(decision.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <View style={[s.statusDot, { backgroundColor: decision.status === 'analyzed' ? colors.status.success : colors.accent.primary }]} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {todayPrompt && (
        <DailyClarityPractice
          prompt={todayPrompt}
          streakCount={practiceStreak}
          isCompleted={practiceCompleted}
          onComplete={onCompletePractice}
          onSkip={onSkipPractice}
          isSubmitting={false}
        />
      )}
    </>
  );
}

const s = StyleSheet.create({
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