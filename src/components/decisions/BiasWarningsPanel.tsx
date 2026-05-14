// BiasWarningsPanel — Renders a stack of active bias warnings during drafting
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { BiasWarning } from '@/features/ai/geminiSchemas';
import { BiasWarningCard } from './BiasWarningCard';

interface BiasWarningsPanelProps {
  warnings: BiasWarning[];
  isAnalyzing: boolean;
  hasDetected: boolean;
  totalDetected: number;
}

export function BiasWarningsPanel({
  warnings,
  isAnalyzing,
  hasDetected,
  totalDetected,
}: BiasWarningsPanelProps): JSX.Element | null {
  if (isAnalyzing && warnings.length === 0) {
    return (
      <View style={styles.analyzingContainer}>
        <ActivityIndicator size="small" color={colors.text.tertiary} />
        <Text style={styles.analyzingText}>Analyzing for cognitive biases...</Text>
      </View>
    );
  }

  if (warnings.length === 0 && !hasDetected) return null;

  if (warnings.length === 0 && hasDetected) {
    return (
      <View style={styles.clearedContainer}>
        <Text style={styles.clearedText}>No active biases detected in current text</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Cognitive Bias Alerts</Text>
        <Text style={styles.sectionCount}>{totalDetected} total detected</Text>
      </View>
      {warnings.map((warning, index) => (
        <BiasWarningCard key={`${warning.bias_name}-${index}`} warning={warning} index={index + 1} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  sectionCount: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  analyzingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  analyzingText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  clearedContainer: {
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  clearedText: {
    fontSize: typography.size.sm,
    color: colors.status.success,
    fontStyle: 'italic',
  },
});
