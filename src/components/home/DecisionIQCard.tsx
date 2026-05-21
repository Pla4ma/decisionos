import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';
import { DecisionIQScore } from '@/features/dq/decisionIQ';

interface Props {
  score: DecisionIQScore;
}

function ScoreRing({ value, size = 80, strokeWidth = 6, color }: { value: number; size?: number; strokeWidth?: number; color: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * (1 - value / 100);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth, borderColor: `${color}30`,
        position: 'absolute',
      }} />
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth, borderColor: 'transparent',
        borderTopColor: color, borderRightColor: color,
        transform: [{ rotate: `${-90 + (value / 100) * 360}deg` }],
        position: 'absolute',
      }} />
      <Text style={{ fontSize: size * 0.35, fontWeight: '700', color }}>{value}</Text>
    </View>
  );
}

const COMPONENT_LABELS: Record<string, string> = {
  analysisCompleteness: 'Analysis',
  reviewConsistency: 'Reviews',
  biasAwareness: 'Bias Awareness',
  decisionVelocity: 'Velocity',
  streakConsistency: 'Consistency',
  reflectionDepth: 'Reflection',
};

export function DecisionIQCard({ score }: Props): JSX.Element {
  const scoreColor = score.overall >= 75 ? colors.status.success : score.overall >= 50 ? colors.status.warning : colors.status.info;

  return (
    <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Decision IQ</Text>
        <Text style={styles.level}>{score.level}</Text>
      </View>

      <View style={styles.ringRow}>
        <ScoreRing value={score.overall} size={88} strokeWidth={6} color={scoreColor} />
        <View style={styles.ringStats}>
          {Object.entries(score.components).slice(0, 3).map(([key, val]) => (
            <View key={key} style={styles.componentRow}>
              <View style={[styles.miniBar, { width: `${Math.max(val, 4)}%`, backgroundColor: val >= 60 ? colors.status.success : val >= 30 ? colors.status.warning : colors.status.error }]} />
              <Text style={styles.componentLabel}>{COMPONENT_LABELS[key] || key}</Text>
              <Text style={styles.componentValue}>{val}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.componentsGrid}>
        {Object.entries(score.components).map(([key, val], idx) => (
          <Animated.View key={key} entering={FadeIn.delay(200 + idx * 80)} style={styles.componentCard}>
            <Text style={styles.componentTitle}>{COMPONENT_LABELS[key] || key}</Text>
            <View style={styles.statRow}>
              <Text style={[styles.statValue, { color: val >= 60 ? colors.status.success : colors.status.warning }]}>{val}</Text>
              <Text style={styles.statUnit}>/100</Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: '700',
    color: colors.text.primary,
  },
  level: {
    fontSize: typography.size.xs,
    fontWeight: '600',
    color: colors.accent.primary,
    backgroundColor: colors.accent.muted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  ringStats: {
    flex: 1,
    gap: spacing.xs,
  },
  componentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: 20,
  },
  miniBar: {
    height: 6,
    borderRadius: 3,
    minWidth: 8,
  },
  componentLabel: {
    fontSize: typography.size.xs,
    color: colors.text.secondary,
    flex: 1,
  },
  componentValue: {
    fontSize: typography.size.xs,
    fontWeight: '600',
    color: colors.text.primary,
  },
  componentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  componentCard: {
    width: '31%',
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.sm,
    padding: spacing.sm,
    alignItems: 'center',
  },
  componentTitle: {
    fontSize: 9,
    color: colors.text.tertiary,
    marginBottom: 2,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: typography.size.md,
    fontWeight: '700',
  },
  statUnit: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
});
