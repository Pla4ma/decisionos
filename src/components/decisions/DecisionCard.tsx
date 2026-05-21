// DecisionCard — List item card for a decision
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Decision, DecisionStatus } from '@/features/decisions/decisionTypes';

interface DecisionCardProps {
  decision: Decision;
  optionCount?: number;
  topScore?: number;
  onPress?: () => void;
}

const statusConfig: Record<DecisionStatus, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'error' }> = {
  draft: { label: 'Draft', variant: 'default' },
  questions: { label: 'In Progress', variant: 'info' },
  ready_for_analysis: { label: 'Ready to Analyze', variant: 'warning' },
  analyzed: { label: 'Analyzed', variant: 'success' },
  chosen: { label: 'Chosen', variant: 'success' },
  review_scheduled: { label: 'Review Pending', variant: 'warning' },
  reviewed: { label: 'Completed', variant: 'default' },
  quick_reviewed: { label: 'Quick Reviewed', variant: 'info' },
  archived: { label: 'Archived', variant: 'default' },
};

const categoryLabels: Record<string, string> = {
  school: 'Education',
  career: 'Career',
  money: 'Financial',
  moving: 'Relocation',
  business: 'Business',
  personal_goals: 'Personal',
  other: 'Other',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isReviewDue(decision: Decision): boolean {
  if (!decision.scheduled_review_at) return false;
  return new Date(decision.scheduled_review_at) <= new Date();
}

export function DecisionCard({ decision, optionCount, topScore, onPress }: DecisionCardProps): JSX.Element {
  const status = statusConfig[decision.status];
  const reviewDue = isReviewDue(decision);

  return (
    <Card variant="outlined" onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <Badge title={categoryLabels[decision.category] || decision.category} variant="default" size="small" />
        <Badge title={status.label} variant={status.variant} size="small" />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {decision.title}
      </Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Updated {formatDate(decision.updated_at)}</Text>
        {optionCount !== undefined && (
          <Text style={styles.metaText}>• {optionCount} option{optionCount !== 1 ? 's' : ''}</Text>
        )}
      </View>

      {decision.scheduled_review_at && (
        <View style={styles.reviewRow}>
          <Text style={[styles.reviewText, reviewDue && styles.reviewDue]}>
            {reviewDue ? '🔔 Review due' : `Review scheduled ${formatDate(decision.scheduled_review_at)}`}
          </Text>
        </View>
      )}

      {topScore !== undefined && decision.status === 'analyzed' && (
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Top option score</Text>
          <Text style={styles.scoreValue}>{topScore}/100</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.text.primary, marginBottom: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metaText: { fontSize: typography.size.sm, color: colors.text.tertiary },
  reviewRow: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border.secondary },
  reviewText: { fontSize: typography.size.sm, color: colors.text.secondary },
  reviewDue: { color: colors.status.warning, fontWeight: typography.weight.medium },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border.secondary },
  scoreLabel: { fontSize: typography.size.sm, color: colors.text.secondary },
  scoreValue: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.accent.primary },
});
