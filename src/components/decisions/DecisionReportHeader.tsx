// DecisionReportHeader — Analysis report header with confidence
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { ConfidenceBadge } from './ConfidenceBadge';

interface DecisionReportHeaderProps {
  title: string;
  summary: string;
  confidenceLevel: number;
  factorsConsidered: string[];
}

export function DecisionReportHeader({ title, summary, confidenceLevel, factorsConsidered }: DecisionReportHeaderProps): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.reportLabel}>Analysis Report</Text>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.confidenceContainer}>
        <ConfidenceBadge score={confidenceLevel} />
      </View>

      <Text style={styles.summary}>{summary}</Text>

      <View style={styles.factorsContainer}>
        <Text style={styles.factorsLabel}>Key Factors Considered</Text>
        <View style={styles.factorsList}>
          {factorsConsidered.map((factor, index) => (
            <View key={index} style={styles.factorItem}>
              <Text style={styles.factorBullet}>•</Text>
              <Text style={styles.factorText}>{factor}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  reportLabel: { fontSize: typography.size.xs, color: colors.accent.primary, fontWeight: typography.weight.semibold, textTransform: 'uppercase', marginBottom: spacing.xs },
  title: { fontSize: typography.size.xl, fontWeight: typography.weight.bold, color: colors.text.primary, marginBottom: spacing.md },
  confidenceContainer: { marginBottom: spacing.md },
  summary: { fontSize: typography.size.md, color: colors.text.primary, lineHeight: 24, marginBottom: spacing.lg },
  factorsContainer: { backgroundColor: colors.background.secondary, padding: spacing.md, borderRadius: 12 },
  factorsLabel: { fontSize: typography.size.sm, color: colors.text.secondary, fontWeight: typography.weight.semibold, marginBottom: spacing.sm },
  factorsList: {},
  factorItem: { flexDirection: 'row', marginBottom: spacing.xs },
  factorBullet: { color: colors.accent.primary, marginRight: spacing.xs, fontSize: typography.size.sm },
  factorText: { fontSize: typography.size.sm, color: colors.text.primary, flex: 1 },
});
