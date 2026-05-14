import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/useAuth';
import { useDecisionPlaybook } from '@/features/decisions/useDecisionPlaybook';
import { useBlindSpots } from '@/features/decisions/useBlindSpots';
import { useRealInsights } from '@/features/decisions/useRealInsights';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Screen } from '@/components/ui/Screen';
import { LoadingState } from '@/components/ui/LoadingState';

export default function PlaybookScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { playbook, isLoading, isReady } = useDecisionPlaybook(user?.id ?? null);
  const { blindSpots } = useBlindSpots(user?.id ?? null);
  const { userStats } = useRealInsights(user?.id ?? null);

  if (isLoading) {
    return <Screen padding={false}><LoadingState message="Loading your playbook..." /></Screen>;
  }

  if (!isReady || !playbook) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Decision Playbook</Text>
          <Text style={styles.notReady}>Complete 5 outcome reviews to unlock your personal decision intelligence report.</Text>
          <Text style={styles.notReadySub}>Current: {playbook?.review_count || 0}/5 reviews</Text>
        </ScrollView>
      </View>
    );
  }

  const hasStrengths = playbook.strengths && playbook.strengths.length > 0;
  const hasWeaknesses = playbook.weaknesses && playbook.weaknesses.length > 0;
  const hasBiases = playbook.biases && playbook.biases.length > 0;

  return (
    <Screen padding={false}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Text style={styles.title}>{playbook.title}</Text>
          <Text style={styles.subtitle}>Version {playbook.version} · Generated {new Date(playbook.generated_at).toLocaleDateString()}</Text>
          <Text style={styles.philosophy}>{playbook.decision_philosophy}</Text>

          {/* Key Metrics */}
          <View style={styles.metricsRow}>
            <MetricBox label="Decisions" value={userStats?.total_decisions_made ?? 0} />
            <MetricBox label="Reviews" value={userStats?.total_reviews_completed ?? 0} />
            <MetricBox label="Regret Rate" value={userStats?.regret_rate != null ? `${Math.round(userStats.regret_rate)}%` : '--'} />
            <MetricBox label="Avg Score" value={userStats?.avg_satisfaction != null ? userStats.avg_satisfaction.toFixed(1) : '--'} />
          </View>

          {/* Optimal Speed */}
          {playbook.optimal_speed && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚡ Optimal Decision Speed</Text>
              <Text style={styles.body}>{playbook.optimal_speed}</Text>
            </View>
          )}

          {/* Strengths */}
          {hasStrengths && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Strengths</Text>
              {playbook.strengths.map((s, i) => (
                <View key={i} style={styles.itemCard}>
                  <Text style={styles.itemTitle}>{s.title}</Text>
                  <Text style={styles.itemDesc}>{s.description}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Weaknesses */}
          {hasWeaknesses && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Growth Areas</Text>
              {playbook.weaknesses.map((w, i) => (
                <View key={i} style={styles.itemCard}>
                  <Text style={styles.itemTitle}>{w.title}</Text>
                  <Text style={styles.itemDesc}>{w.description}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Active Blind Spots */}
          {(blindSpots && blindSpots.length > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Blind Spots</Text>
              {blindSpots.map(bs => (
                <View key={bs.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{bs.title}</Text>
                    <Text style={[styles.severityBadge, bs.severity === 'significant' ? styles.severityHigh : styles.severityMod]}>{bs.severity}</Text>
                  </View>
                  <Text style={styles.itemDesc}>{bs.description}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Regret Pattern */}
          {playbook.regret_pattern && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Regret Pattern</Text>
              <Text style={styles.body}>{playbook.regret_pattern}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}

function MetricBox({ label, value }: { label: string; value: number | string }): JSX.Element {
  return (
    <View style={s.metricBox}>
      <Text style={s.metricValue}>{value}</Text>
      <Text style={s.metricLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { padding: spacing.lg },
  title: { fontSize: 24, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.text.tertiary, marginBottom: spacing.md },
  philosophy: { fontSize: 16, color: colors.text.primary, fontStyle: 'italic', lineHeight: 24, marginBottom: spacing.xl, padding: spacing.md, backgroundColor: colors.accent.primary + '08', borderRadius: 12 },
  metricsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  metricBox: { flex: 1, alignItems: 'center', backgroundColor: colors.background.secondary, borderRadius: 10, padding: spacing.md },
  metricValue: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  metricLabel: { fontSize: 11, color: colors.text.tertiary, marginTop: 2 },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.md },
  body: { fontSize: 14, color: colors.text.secondary, lineHeight: 22 },
  itemCard: { backgroundColor: colors.background.secondary, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  itemTitle: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  itemDesc: { fontSize: 13, color: colors.text.secondary, lineHeight: 19, marginTop: spacing.xs },
  severityBadge: { fontSize: 10, fontWeight: '700', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 4 },
  severityHigh: { backgroundColor: colors.status.error + '20', color: colors.status.error },
  severityMod: { backgroundColor: colors.status.warning + '20', color: colors.status.warning },
  notReady: { fontSize: 16, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.xl, lineHeight: 24 },
  notReadySub: { fontSize: 14, color: colors.text.tertiary, textAlign: 'center', marginTop: spacing.md },
});

const styles = StyleSheet.create({
  container: s.container,
  content: s.content,
  title: s.title,
  subtitle: s.subtitle,
  philosophy: s.philosophy,
  section: s.section,
  sectionTitle: s.sectionTitle,
  body: s.body,
  itemCard: s.itemCard,
  itemTitle: s.itemTitle,
  itemDesc: s.itemDesc,
  notReady: s.notReady,
  notReadySub: s.notReadySub,
});
