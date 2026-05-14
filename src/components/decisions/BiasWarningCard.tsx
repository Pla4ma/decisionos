// BiasWarningCard — Displays a detected cognitive bias with mitigation strategy
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { BiasWarning } from '@/features/ai/geminiSchemas';

interface BiasWarningCardProps {
  warning: BiasWarning;
  /** Index for display numbering (1-based) */
  index: number;
}

export function BiasWarningCard({ warning, index }: BiasWarningCardProps): JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>#{index}</Text>
        </View>
        <Text style={styles.biasName}>{warning.bias_name}</Text>
      </View>

      <Text style={styles.description}>{warning.description}</Text>

      <View style={styles.contextBox}>
        <Text style={styles.contextLabel}>Detected in:</Text>
        <Text style={styles.contextText}>"{warning.context_in_decision}"</Text>
      </View>

      <View style={styles.mitigationBox}>
        <Text style={styles.mitigationLabel}>Action to counter this:</Text>
        <Text style={styles.mitigationText}>{warning.mitigation_strategy}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.status.warning,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badgeContainer: {
    backgroundColor: colors.status.warning,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  biasName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  contextBox: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    padding: spacing.sm,
  },
  contextLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  contextText: {
    fontSize: typography.size.sm,
    color: colors.text.primary,
    fontStyle: 'italic',
  },
  mitigationBox: {
    backgroundColor: '#065F46',
    borderRadius: 8,
    padding: spacing.sm,
  },
  mitigationLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: '#A7F3D0',
    marginBottom: 2,
  },
  mitigationText: {
    fontSize: typography.size.sm,
    color: '#D1FAE5',
    lineHeight: 20,
  },
});
