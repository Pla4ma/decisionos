// PendingDecisionCard — Compact summary of a decision needing attention
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Decision, DecisionStatus } from '@/features/decisions/decisionTypes';

interface PendingDecisionCardProps {
  decision: Decision;
  onPress: (decisionId: string) => void;
}

function getStatusBadgeVariant(status: DecisionStatus): 'default' | 'primary' | 'success' | 'warning' {
  switch (status) {
    case 'draft':
      return 'default';
    case 'questions':
    case 'ready_for_analysis':
      return 'primary';
    case 'analyzed':
      return 'success';
    case 'chosen':
    case 'review_scheduled':
      return 'warning';
    default:
      return 'default';
  }
}

function formatStatusLabel(status: DecisionStatus): string {
  return status.replace(/_/g, ' ');
}

export function PendingDecisionCard({
  decision,
  onPress,
}: PendingDecisionCardProps): JSX.Element {
  const badgeVariant = getStatusBadgeVariant(decision.status);
  const statusLabel = formatStatusLabel(decision.status);

  return (
    <Card
      variant="default"
      padding="small"
      onPress={() => onPress(decision.id)}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Badge title={statusLabel} variant={badgeVariant} size="small" />
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {decision.title}
        </Text>
        <Text style={styles.meta}>
          {decision.category.replace(/_/g, ' ')} • Importance {decision.importance}/10
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.tight * typography.size.md,
    marginBottom: spacing.xs,
  },
  meta: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    textTransform: 'capitalize',
  },
});
