import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface RegretRiskBadgeProps {
  score: number;
  size?: 'small' | 'medium';
}

export function RegretRiskBadge({ score, size = 'medium' }: RegretRiskBadgeProps): JSX.Element {
  const getLevel = (s: number): { label: string; color: string } => {
    if (s <= 30) return { label: 'Seems aligned', color: colors.status.success };
    if (s <= 60) return { label: 'Consider tradeoffs', color: colors.accent.secondary };
    return { label: 'Worth extra reflection', color: colors.status.warning };
  };

  const level = getLevel(score);
  const isSmall = size === 'small';

  return (
    <View style={[styles.container, { backgroundColor: level.color + '15', borderColor: level.color + '30' }, isSmall && styles.containerSmall]}>
      <Text style={[styles.label, { color: level.color }, isSmall && styles.labelSmall]}>{level.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 16, borderWidth: 1, alignSelf: 'flex-start' },
  containerSmall: { paddingHorizontal: spacing.xs, paddingVertical: 2 },
  label: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  labelSmall: { fontSize: typography.size.xs },
});
