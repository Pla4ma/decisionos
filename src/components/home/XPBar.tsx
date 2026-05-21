import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';
import { getLevel, getUnlockedAchievements, AchievementStats } from '@/features/gamification/achievements';

interface Props {
  xp: number;
  stats: AchievementStats;
}

export function XPBar({ xp, stats }: Props): JSX.Element {
  const { level, xpForNext, progress } = getLevel(xp);
  const unlocked = getUnlockedAchievements(stats);
  const latestAchievement = unlocked.length > 0 ? unlocked[unlocked.length - 1] : null;

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{level}</Text>
        </View>
        <View style={styles.xpInfo}>
          <Text style={styles.xpLabel}>Level {level} · {xp} XP</Text>
          <Text style={styles.xpNext}>{xpForNext > 0 ? `${xpForNext} XP to next level` : 'Max level'}</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {latestAchievement && (
        <Animated.View entering={ZoomIn.duration(300)} style={styles.achievementPill}>
          <Text style={styles.achievementIcon}>{latestAchievement.icon}</Text>
          <Text style={styles.achievementText}>{latestAchievement.title}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.accent,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontSize: typography.size.lg,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  xpInfo: {
    flex: 1,
  },
  xpLabel: {
    fontSize: typography.size.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  xpNext: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.background.tertiary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: 3,
  },
  achievementPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent.muted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  achievementIcon: {
    fontSize: 14,
  },
  achievementText: {
    fontSize: typography.size.xs,
    fontWeight: '600',
    color: colors.accent.primary,
  },
});
