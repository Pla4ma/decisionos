// HindsightComparisonCard — The "path not taken" analysis UI
// Shows users what they predicted vs what happened, and what they learned
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { HindsightComparison } from '@/features/decisions/hindsightTypes';

interface HindsightComparisonCardProps {
  comparison: HindsightComparison;
}

export function HindsightComparisonCard({ comparison }: HindsightComparisonCardProps): JSX.Element {
  return (
    <View style={styles.container}>
      {/* Prediction Accuracy */}
      <Card variant="elevated">
        <Text style={styles.sectionTitle}>Prediction vs. Reality</Text>
        <Text style={styles.bodyText}>{comparison.prediction_accuracy}</Text>
      </Card>

      {/* Biases Exhibited */}
      {comparison.biases_exhibited.length > 0 && (
        <Card variant="elevated">
          <Text style={styles.sectionTitle}>Cognitive Biases Detected</Text>
          {comparison.biases_exhibited.map((bias, index) => (
            <View key={index} style={styles.biasRow}>
              <View style={styles.biasHeader}>
                <Text style={styles.biasName}>{bias.bias_name}</Text>
                <Badge
                  title={bias.would_have_changed_outcome === 'likely' ? 'High Impact' : bias.would_have_changed_outcome === 'possibly' ? 'Moderate' : 'Low'}
                  variant={bias.would_have_changed_outcome === 'likely' ? 'error' : bias.would_have_changed_outcome === 'possibly' ? 'warning' : 'default'}
                  size="small"
                />
              </View>
              <Text style={styles.bodyText}>{bias.how_it_manifested}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Path Not Taken */}
      {comparison.path_not_taken && (
        <Card variant="elevated" style={styles.pathNotTakenCard}>
          <View style={styles.pathHeader}>
            <Text style={styles.pathIcon}>⚡</Text>
            <Text style={styles.sectionTitle}>The Path Not Taken</Text>
          </View>
          <Text style={styles.pathTitle}>Alternative: {comparison.path_not_taken.alternative_option}</Text>
          <Text style={styles.bodyText}>{comparison.path_not_taken.predicted_alternative_outcome}</Text>
          <View style={styles.pathRejection}>
            <Text style={styles.rejectionLabel}>Why it was rejected:</Text>
            <Text style={styles.bodyText}>{comparison.path_not_taken.why_it_was_rejected_originally}</Text>
          </View>
        </Card>
      )}

      {/* Lessons */}
      {comparison.lessons.length > 0 && (
        <Card variant="elevated">
          <Text style={styles.sectionTitle}>Key Lessons</Text>
          {comparison.lessons.map((lesson, index) => (
            <View key={index} style={styles.lessonRow}>
              <Text style={styles.lessonNumber}>{index + 1}.</Text>
              <Text style={styles.bodyText}>{lesson}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Growth Insight */}
      <Card variant="elevated" style={styles.growthCard}>
        <Text style={styles.growthLabel}>Growth Insight</Text>
        <Text style={styles.growthText}>{comparison.growth_insight}</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  bodyText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  biasRow: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  biasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  biasName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.warning || '#F59E0B',
  },
  pathNotTakenCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.primary,
  },
  pathHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  pathIcon: {
    fontSize: 18,
  },
  pathTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.accent.primary,
    marginBottom: spacing.xs,
  },
  pathRejection: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
  },
  rejectionLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  lessonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  lessonNumber: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.accent.primary,
    minWidth: 20,
  },
  growthCard: {
    backgroundColor: '#065F46',
  },
  growthLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: '#A7F3D0',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  growthText: {
    fontSize: typography.size.sm,
    color: '#D1FAE5',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
