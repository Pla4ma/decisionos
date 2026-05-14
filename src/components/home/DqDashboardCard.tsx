// DqDashboardCard — The CENTRAL identity card for the home screen
// Replaces: StreakBanner + CbmiDashboardCard + ImprovementScoreCard
// Shows ONE number: DQ (Decision Quotient) with archetype identity
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DqScore, ARCHETYPE_DEFINITIONS } from '@/features/dq/dqTypes';

interface DqDashboardCardProps {
  dq: DqScore;
  currentStreak?: number;
  onPress?: () => void;
}

function DqGauge({ score }: { score: number }): JSX.Element {
  const tiers = [
    { name: 'gambler', min: 0, color: '#F87171' },
    { name: 'overthinker', min: 30, color: '#FBBF24' },
    { name: 'learner', min: 50, color: '#60A5FA' },
    { name: 'decisive', min: 70, color: '#4ADE80' },
    { name: 'sage', min: 85, color: '#5EE7D4' },
  ] as const;
  
  const currentTier = [...tiers].reverse().find(t => score >= t.min) || tiers[0];
  const nextTier = tiers.find(t => t.min > score);
  const progressToNext = nextTier
    ? ((score - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  return (
    <View style={gaugeStyles.container}>
      <View style={gaugeStyles.scoreRow}>
        <Text style={[gaugeStyles.scoreNumber, { color: currentTier.color }]}>{score}</Text>
        <Text style={gaugeStyles.scoreLabel}>DQ</Text>
      </View>
      <Text style={[gaugeStyles.archetypeName, { color: currentTier.color }]}>
        {ARCHETYPE_DEFINITIONS[currentTier.name].title}
      </Text>
      {nextTier && (
        <View style={gaugeStyles.nextTierRow}>
          <Text style={gaugeStyles.nextTierText}>Next: {ARCHETYPE_DEFINITIONS[nextTier.name].title} ({nextTier.min})</Text>
          <View style={gaugeStyles.progressBar}>
            <View style={[gaugeStyles.progressFill, { width: `${Math.min(100, Math.max(0, progressToNext))}%`, backgroundColor: currentTier.color }]} />
          </View>
        </View>
      )}
      <Text style={gaugeStyles.description}>{ARCHETYPE_DEFINITIONS[currentTier.name].description}</Text>
    </View>
  );
}

const gaugeStyles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.sm },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 2 },
  scoreNumber: { fontSize: 64, fontWeight: '800', lineHeight: 70 },
  scoreLabel: { fontSize: 20, fontWeight: '700', color: colors.text.tertiary, marginTop: 8 },
  archetypeName: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  nextTierRow: { width: '100%', gap: 4 },
  nextTierText: { fontSize: typography.size.xs, color: colors.text.tertiary, textAlign: 'center' },
  progressBar: { height: 4, backgroundColor: colors.background.tertiary, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  description: { fontSize: typography.size.sm, color: colors.text.secondary, textAlign: 'center', lineHeight: 20, paddingHorizontal: spacing.md },
});

export function DqDashboardCard({ dq, currentStreak, onPress }: DqDashboardCardProps): JSX.Element {
  const trendIcon = dq.trend === 'rising' ? '↑' : dq.trend === 'declining' ? '↓' : '→';
  const trendColor = dq.trend === 'rising' ? colors.status.success : dq.trend === 'declining' ? colors.status.error : colors.text.tertiary;

  return (
    <Card onPress={onPress} variant="elevated" style={styles.card}>
      {/* Main identity section */}
      <DqGauge score={dq.overall} />

      {/* Trend + streak badge */}
      <View style={styles.trendRow}>
        <View style={[styles.trendBadge, { backgroundColor: trendColor + '20' }]}>
          <Text style={[styles.trendText, { color: trendColor }]}>{trendIcon} {dq.trend === 'rising' ? 'Improving' : dq.trend === 'declining' ? 'Declining' : 'Stable'}</Text>
        </View>
        {currentStreak !== undefined && currentStreak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {currentStreak}w</Text>
          </View>
        )}
      </View>

      {/* Sub-metrics */}
      <View style={styles.metricsGrid}>
        <MetricItem label="Calibration" value={`${dq.calibrationAccuracy}%`} color={colors.status.success} />
        <MetricItem label="Bias Control" value={`${dq.biasMitigationRate}%`} color={colors.status.info} />
        <MetricItem label="Velocity" value={`${dq.velocityScore}%`} color={colors.status.warning} />
        <MetricItem label="Review Rate" value={`${dq.reviewConsistency}%`} color={colors.status.error} />
      </View>
    </Card>
  );
}

function MetricItem({ label, value, color }: { label: string; value: string; color: string }): JSX.Element {
  return (
    <View style={metricStyles.container}>
      <Text style={[metricStyles.value, { color }]}>{value}</Text>
      <Text style={metricStyles.label}>{label}</Text>
    </View>
  );
}

const metricStyles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1 },
  value: { fontSize: typography.size.lg, fontWeight: '700' },
  label: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 2 },
});

const styles = StyleSheet.create({
  card: { paddingVertical: spacing.xl },
  trendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  trendBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 4 },
  trendText: { fontSize: typography.size.xs, fontWeight: '600' },
  streakBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 4, backgroundColor: colors.background.tertiary },
  streakText: { fontSize: typography.size.xs, color: colors.text.secondary },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border.primary },
});
