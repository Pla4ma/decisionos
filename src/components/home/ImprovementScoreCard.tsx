// ImprovementScoreCard — Personal decision quality improvement tracking
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { ImprovementScore } from '@/features/social/benchmarkTypes';

interface ImprovementScoreCardProps {
  score: ImprovementScore;
  onPress?: () => void;
}

export function ImprovementScoreCard({ score, onPress }: ImprovementScoreCardProps): JSX.Element {
  if (!score.ready) return <></>;

  const trendLabel = {
    improving: 'Improving',
    declining: 'Declining',
    stable: 'Stable',
  };
  const trendColor = {
    improving: '#34C759',
    declining: '#FF3B30',
    stable: colors.accent.primary,
  };

  return (
    <Card variant="elevated" style={styles.container} onPress={onPress}>
      <Text style={styles.title}>Your Decision Quality</Text>
      <View style={styles.scoreRow}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNumber}>{score.overall_score ?? '-'}</Text>
        </View>
        <View style={styles.scoreInfo}>
          <Text style={styles.scoreLabel}>Quality Score</Text>
          <View style={styles.trendRow}>
            <View style={[styles.trendDot, { backgroundColor: trendColor[score.trend ?? 'stable'] }]} />
            <Text style={[styles.trendText, { color: trendColor[score.trend ?? 'stable'] }]}>
              {trendLabel[score.trend ?? 'stable']}
            </Text>
          </View>
          <Text style={styles.reviewCount}>Based on {score.total_reviews} reviews</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  title: {
    fontSize: typography.size.sm,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.accent.primary + '30',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent.primary,
  },
  scoreInfo: { flex: 1 },
  scoreLabel: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  trendDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.xs },
  trendText: { fontSize: typography.size.sm, fontWeight: '500' },
  reviewCount: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 2 },
});
