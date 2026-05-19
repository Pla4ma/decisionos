import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { StreakRecovery } from '@/features/progression/dailyStreakTypes';

interface WelcomeBackBannerProps {
  recovery: StreakRecovery;
  currentStreak: number;
  onCheckIn: () => void;
  onForgive: () => void;
  isSubmitting?: boolean;
}

export function WelcomeBackBanner({ recovery, currentStreak, onCheckIn, onForgive, isSubmitting }: WelcomeBackBannerProps): JSX.Element {
  const isForgiveness = recovery.recoveryAction === 'forgive_and_continue';

  return (
    <View style={styles.container}>
      <View style={styles.iconRow}>
        <Text style={styles.icon}>🫂</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {recovery.missedDays} day{recovery.missedDays > 1 ? 's' : ''} missed
          </Text>
        </View>
      </View>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.message}>{recovery.recoveryMessage}</Text>
      {isForgiveness && (
        <Text style={styles.graceNote}>
          {recovery.graceDaysRemaining} grace day{recovery.graceDaysRemaining > 1 ? 's' : ''} remaining this month
        </Text>
      )}
      <View style={styles.actions}>
        {isForgiveness ? (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onForgive}
            activeOpacity={0.7}
            disabled={isSubmitting}
          >
            <Text style={styles.primaryBtnText}>
              Keep my {currentStreak}-day streak
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onCheckIn}
            activeOpacity={0.7}
            disabled={isSubmitting}
          >
            <Text style={styles.primaryBtnText}>Check in — continue where I left off</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.accent,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  icon: { fontSize: 32 },
  badge: {
    backgroundColor: colors.accent.muted,
    borderRadius: 9999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: typography.size.xs,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  graceNote: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.accent.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: typography.size.md,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});