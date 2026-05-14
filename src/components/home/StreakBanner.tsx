// StreakBanner — Weekly decision consistency streak display
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface StreakBannerProps {
  currentStreak: number;
  longestStreak: number;
  isAtRisk?: boolean;
}

export function StreakBanner({ currentStreak, longestStreak, isAtRisk }: StreakBannerProps): JSX.Element {
  if (currentStreak === 0) return <></>;

  return (
    <Card variant="filled" style={[styles.container, isAtRisk && styles.atRisk]}>
      <View style={styles.row}>
        <View style={styles.streakBlock}>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>week streak</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.streakBlock}>
          <Text style={styles.streakNumber}>{longestStreak}</Text>
          <Text style={styles.streakLabel}>best</Text>
        </View>
      </View>
      {isAtRisk && (
        <Badge variant="warning" text="At risk today" style={styles.riskBadge} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.accent.primary + '10',
    borderWidth: 1,
    borderColor: colors.accent.primary + '30',
  },
  atRisk: {
    borderColor: '#FF9500' + '50',
    backgroundColor: '#FF9500' + '10',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBlock: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
  },
  streakLabel: {
    fontSize: typography.size.xs,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light,
  },
  riskBadge: {
    marginTop: spacing.sm,
  },
});
