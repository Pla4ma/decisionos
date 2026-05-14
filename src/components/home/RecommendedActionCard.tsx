// RecommendedActionCard — Suggests next step based on decision state
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type RecommendationType =
  | 'review_due'
  | 'quick_check_in'
  | 'add_options'
  | 'answer_questions'
  | 'run_analysis'
  | 'choose_option'
  | 'create_first';

interface RecommendedAction {
  type: RecommendationType;
  title: string;
  description: string;
  decisionId?: string;
  decisionTitle?: string;
}

interface RecommendedActionCardProps {
  recommendation: RecommendedAction | null;
  onAction: (recommendation: RecommendedAction) => void;
  onDismiss?: () => void;
}

function getPriorityColor(type: RecommendationType): 'primary' | 'warning' | 'success' | 'default' {
  switch (type) {
    case 'review_due':
      return 'warning';
    case 'run_analysis':
    case 'choose_option':
      return 'success';
    default:
      return 'primary';
  }
}

function getActionLabel(type: RecommendationType): string {
  switch (type) {
    case 'review_due':
      return 'Review Outcome';
    case 'add_options':
      return 'Add Options';
    case 'answer_questions':
      return 'Continue';
    case 'run_analysis':
      return 'Analyze';
    case 'choose_option':
      return 'View Analysis';
    case 'create_first':
      return 'Start';
    default:
      return 'Go';
  }
}

export function RecommendedActionCard({
  recommendation,
  onAction,
}: RecommendedActionCardProps): JSX.Element | null {
  if (!recommendation) {
    return null;
  }

  const priorityColor = getPriorityColor(recommendation.type);
  const actionLabel = getActionLabel(recommendation.type);

  return (
    <Card variant="outlined" style={styles.container}>
      <View style={styles.header}>
        <Badge
          title={recommendation.type.replace(/_/g, ' ')}
          variant={priorityColor}
        />
      </View>
      
      <Text style={styles.title}>{recommendation.title}</Text>
      
      {recommendation.decisionTitle && (
        <Text style={styles.decisionTitle} numberOfLines={1}>
          "{recommendation.decisionTitle}"
        </Text>
      )}
      
      <Text style={styles.description}>{recommendation.description}</Text>
      
      <View style={styles.actionRow}>
        <Button
          title={actionLabel}
          onPress={() => onAction(recommendation)}
          variant="primary"
          size="medium"
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    borderColor: colors.border.accent,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.tight * typography.size.lg,
    marginBottom: spacing.xs,
  },
  decisionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.accent.secondary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.size.sm,
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
