// Playbook Preview Card — Shows readiness for Decision Playbook
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface PlaybookPreviewCardProps {
  isReady: boolean;
  reviewsNeeded: number;
  reviewCount: number;
  onView: () => void;
}

export function PlaybookPreviewCard({
  isReady,
  reviewsNeeded,
  reviewCount,
  onView,
}: PlaybookPreviewCardProps): JSX.Element {
  return (
    <Card variant="elevated" style={styles.container}>
      <Text style={styles.icon}>📖</Text>
      {isReady ? (
        <>
          <Text style={styles.title}>Your Decision Playbook is Ready</Text>
          <Text style={styles.description}>
            Based on {reviewCount} reviewed decisions. See your strengths, blind spots, and optimal decision style.
          </Text>
          <TouchableOpacity style={styles.button} onPress={onView} activeOpacity={0.7}>
            <Text style={styles.buttonText}>View Playbook</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Building Your Decision Playbook</Text>
          <Text style={styles.description}>
            Complete {reviewsNeeded} more outcome review{reviewsNeeded !== 1 ? 's' : ''} to unlock your personal decision intelligence report — strengths, biases, and optimal approach.
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(100, (reviewCount / 5) * 100)}%` }]} />
          </View>
          <Text style={styles.progressText}>{reviewCount}/5 reviews completed</Text>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    alignItems: 'flex-start',
    backgroundColor: colors.accent.primary + '08',
  },
  icon: { fontSize: 28, marginBottom: spacing.sm },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: 2,
    width: '100%',
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  button: {
    backgroundColor: colors.accent.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: '#FFFFFF',
  },
});
