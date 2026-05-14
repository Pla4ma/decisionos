// ConfidenceBadge — Visual indicator for confidence level
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface ConfidenceBadgeProps {
  score: number; // 0-100 (higher is better)
  size?: 'small' | 'medium';
}

export function ConfidenceBadge({ score, size = 'medium' }: ConfidenceBadgeProps): JSX.Element {
  const getLevel = (s: number): { label: string; color: string } => {
    if (s >= 70) return { label: 'High Confidence', color: colors.status.success };
    if (s >= 40) return { label: 'Moderate', color: colors.status.warning };
    return { label: 'Low Confidence', color: colors.status.error };
  };

  const level = getLevel(score);
  const isSmall = size === 'small';

  return (
    <View style={[styles.container, { backgroundColor: level.color + '20', borderColor: level.color }, isSmall && styles.containerSmall]}>
      <Text style={[styles.label, { color: level.color }, isSmall && styles.labelSmall]}>{level.label}</Text>
      {!isSmall && <Text style={[styles.score, { color: level.color }]}>{score}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 16, borderWidth: 1, alignSelf: 'flex-start' },
  containerSmall: { paddingHorizontal: spacing.xs, paddingVertical: 2 },
  label: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  labelSmall: { fontSize: typography.size.xs },
  score: { fontSize: typography.size.sm, fontWeight: typography.weight.bold, marginLeft: spacing.xs },
});
