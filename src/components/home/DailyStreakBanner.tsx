import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface DailyStreakBannerProps {
  currentStreak: number;
  longestStreak: number;
  checkedInToday: boolean;
  isAtRisk: boolean;
  isOnFire: boolean;
  onCheckIn: () => void;
}

export function DailyStreakBanner({ currentStreak, longestStreak, checkedInToday, isAtRisk, isOnFire, onCheckIn }: DailyStreakBannerProps) {
  return (
    <TouchableOpacity
      style={[styles.container, checkedInToday && styles.checkedIn, isAtRisk && styles.atRisk]}
      onPress={onCheckIn}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>
          {isOnFire ? '🔥' : isAtRisk ? '⚠️' : checkedInToday ? '✅' : '📅'}
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.streakCount}>
          {currentStreak > 0 ? `${currentStreak} day streak` : 'Start your streak'}
        </Text>
        <Text style={styles.action}>
          {checkedInToday
            ? 'You checked in today'
            : isAtRisk
              ? 'Tap to check in — streak at risk!'
              : 'Tap to check in'}
        </Text>
      </View>
      {longestStreak > currentStreak && (
        <Text style={styles.best}>Best: {longestStreak}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12, padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border.primary,
  },
  checkedIn: {
    borderColor: colors.status.success + '40',
    backgroundColor: colors.status.success + '08',
  },
  atRisk: {
    borderColor: colors.status.warning + '50',
    backgroundColor: colors.status.warning + '10',
  },
  iconContainer: { marginRight: spacing.md },
  icon: { fontSize: 24 },
  content: { flex: 1 },
  streakCount: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  action: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  best: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
});
