import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface PracticeModeCardProps {
  onStart: () => void;
  scenariosAvailable: number;
}

export function PracticeModeCard({ onStart, scenariosAvailable }: PracticeModeCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onStart} activeOpacity={0.7}>
      <View style={styles.iconRow}>
        <Text style={styles.icon}>🧠</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{scenariosAvailable} scenarios</Text>
        </View>
      </View>
      <Text style={styles.title}>Practice Mode</Text>
      <Text style={styles.description}>
        Run through real-life decision scenarios. Sharpen your thinking without real stakes.
      </Text>
      <Text style={styles.action}>Start a practice session →</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.accent.primary + '08',
    borderRadius: 12, padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.accent.primary + '30',
  },
  iconRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: { fontSize: 24 },
  countBadge: {
    backgroundColor: colors.accent.primary + '20',
    borderRadius: 9999, paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  countText: {
    fontSize: 11, fontWeight: '600', color: colors.accent.primary,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  action: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.accent.primary,
  },
});
