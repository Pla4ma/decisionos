// BenchmarkCard — Anonymous social comparison display
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { AnonymousBenchmark } from '@/features/social/benchmarkTypes';

interface BenchmarkCardProps {
  benchmark: AnonymousBenchmark;
}

export function BenchmarkCard({ benchmark }: BenchmarkCardProps): JSX.Element {
  if (!benchmark.eligible) return <></>;

  const items = [
    benchmark.regret_rate ? {
      label: 'Regret Rate',
      yours: `${benchmark.regret_rate.yours}%`,
      comparison: `Top ${100 - (benchmark.regret_rate.percentile || 50)}%`,
      better: benchmark.regret_rate.yours < benchmark.regret_rate.median,
    } : null,
    benchmark.satisfaction ? {
      label: 'Satisfaction',
      yours: `${benchmark.satisfaction.yours}/5`,
      comparison: `Median: ${benchmark.satisfaction.median}/5`,
      better: benchmark.satisfaction.yours >= benchmark.satisfaction.median,
    } : null,
    benchmark.consistency ? {
      label: 'Consistency',
      yours: `${benchmark.consistency.yours} days`,
      comparison: `Avg: ${benchmark.consistency.avg} days`,
      better: benchmark.consistency.yours >= benchmark.consistency.avg,
    } : null,
  ].filter(Boolean);

  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>How You Compare</Text>
        <Text style={styles.peerCount}>Among {benchmark.peer_count || 0} peers</Text>
      </View>
      {items.map((item: any, idx: number) => (
        <View key={idx} style={styles.row}>
          <View style={styles.labelCol}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.yours}>{item.yours}</Text>
          </View>
          <View style={styles.compCol}>
            <Text style={styles.comparison}>{item.comparison}</Text>
            <Text style={[styles.badge, item.better ? styles.badgeGood : styles.badgeAvg]}>
              {item.better ? 'Above avg' : 'Below avg'}
            </Text>
          </View>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: {
    fontSize: typography.size.sm, fontWeight: '600', color: colors.text.secondary,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  peerCount: { fontSize: typography.size.xs, color: colors.text.tertiary },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border.light },
  labelCol: {},
  compCol: { alignItems: 'flex-end' },
  label: { fontSize: typography.size.sm, fontWeight: '500', color: colors.text.primary },
  yours: { fontSize: typography.size.lg, fontWeight: '700', color: colors.text.primary },
  comparison: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 2 },
  badge: { fontSize: typography.size.xs, fontWeight: '600', marginTop: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  badgeGood: { color: '#34C759', backgroundColor: '#34C75915' },
  badgeAvg: { color: colors.text.tertiary, backgroundColor: colors.background.tertiary },
});
