// OptionComparisonCard — Side-by-side option comparison
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';

interface OptionComparison {
  optionId: string;
  optionTitle: string;
  overallScore: number;
}

interface OptionComparisonCardProps {
  options: OptionComparison[];
}

export function OptionComparisonCard({ options }: OptionComparisonCardProps): JSX.Element {
  const sorted = [...options].sort((a, b) => b.overallScore - a.overallScore);
  const maxScore = Math.max(...options.map((o) => o.overallScore));

  return (
    <Card variant="outlined" style={styles.card}>
      <Text style={styles.title}>Option Comparison</Text>

      <View style={styles.comparisonContainer}>
        {sorted.map((option, index) => {
          const percentage = maxScore > 0 ? (option.overallScore / maxScore) * 100 : 0;
          const isTop = index === 0;

          return (
            <View key={option.optionId} style={styles.optionRow}>
              <View style={styles.rankColumn}>
                <Text style={[styles.rank, isTop && styles.rankTop]}>#{index + 1}</Text>
              </View>

              <View style={styles.infoColumn}>
                <Text style={styles.optionName} numberOfLines={1}>
                  {option.optionTitle}
                </Text>
                <View style={styles.barContainer}>
                  <View style={[styles.bar, { width: `${percentage}%` }, isTop && styles.barTop]} />
                </View>
              </View>

              <View style={styles.scoreColumn}>
                <Text style={[styles.score, isTop && styles.scoreTop]}>{option.overallScore}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.lg },
  title: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.text.primary, marginBottom: spacing.md },
  comparisonContainer: {},
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  rankColumn: { width: 32, alignItems: 'center' },
  rank: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.text.tertiary },
  rankTop: { color: colors.status.success },
  infoColumn: { flex: 1, marginRight: spacing.sm },
  optionName: { fontSize: typography.size.sm, color: colors.text.primary, marginBottom: spacing.xs },
  barContainer: { height: 8, backgroundColor: colors.background.tertiary, borderRadius: 4, overflow: 'hidden' },
  bar: { height: '100%', backgroundColor: colors.text.tertiary, borderRadius: 4 },
  barTop: { backgroundColor: colors.status.success },
  scoreColumn: { width: 40, alignItems: 'flex-end' },
  score: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.text.secondary },
  scoreTop: { color: colors.status.success },
});
