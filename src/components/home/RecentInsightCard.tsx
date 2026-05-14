// RecentInsightCard — Shows a pattern insight if available
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { DecisionPatternInsight } from '@/features/decisions/decisionTypes';

interface RecentInsightCardProps {
  insight: DecisionPatternInsight | null;
  onPress?: () => void;
}

function getInsightTypeColor(type: DecisionPatternInsight['insight_type']): 'primary' | 'success' | 'warning' | 'default' {
  switch (type) {
    case 'strength':
      return 'success';
    case 'bias':
      return 'warning';
    case 'pattern':
      return 'primary';
    case 'suggestion':
    default:
      return 'default';
  }
}

export function RecentInsightCard({
  insight,
  onPress,
}: RecentInsightCardProps): JSX.Element | null {
  if (!insight) {
    return null;
  }

  const typeColor = getInsightTypeColor(insight.insight_type);

  return (
    <Card
      variant="outlined"
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.header}>
        <Badge title={insight.insight_type} variant={typeColor} size="small" />
        <Text style={styles.evidenceCount}>
          Based on {insight.evidence_count} decisions
        </Text>
      </View>
      <Text style={styles.title}>{insight.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {insight.description}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    borderColor: colors.border.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  evidenceCount: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.tight * typography.size.md,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.size.sm,
  },
});
