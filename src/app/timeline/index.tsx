import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/useAuth';
import { useBlindSpots } from '@/features/decisions/useBlindSpots';
import { useDecisionPlaybook } from '@/features/decisions/useDecisionPlaybook';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Screen } from '@/components/ui/Screen';
import { LoadingState } from '@/components/ui/LoadingState';

interface TimelineDecision {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
  satisfaction_score: number | null;
  would_choose_same: boolean | null;
  importance: number;
}

export default function TimelineScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { blindSpots } = useBlindSpots(user?.id ?? null);
  const { playbook, isReady: playbookReady } = useDecisionPlaybook(user?.id ?? null);

  const { data: decisions, isLoading } = useQuery({
    queryKey: ['timeline', user?.id],
    queryFn: async (): Promise<TimelineDecision[]> => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('decisions')
        .select('id, title, category, status, created_at, importance')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!data) return [];

      const decisionIds = data.map(d => d.id);
      const { data: reviews } = await supabase
        .from('decision_reviews')
        .select('decision_id, satisfaction_score, would_choose_same')
        .in('decision_id', decisionIds);

      const reviewMap = new Map((reviews || []).map(r => [r.decision_id, r]));
      return data.map(d => ({
        ...d,
        satisfaction_score: reviewMap.get(d.id)?.satisfaction_score ?? null,
        would_choose_same: reviewMap.get(d.id)?.would_choose_same ?? null,
      }));
    },
    enabled: !!user?.id,
  });

  if (isLoading) return <Screen padding={false}><LoadingState message="Loading your timeline..." /></Screen>;

  const reviewedDecisions = (decisions || []).filter(d => d.status === 'reviewed' || d.satisfaction_score != null);
  const satisfactionTrend = reviewedDecisions.map(d => d.satisfaction_score).filter(Boolean) as number[];
  const trendUp = satisfactionTrend.length >= 2 && satisfactionTrend[0] >= (satisfactionTrend[satisfactionTrend.length - 1] || 0);
  const regrettedCount = reviewedDecisions.filter(d => d.would_choose_same === false).length;
  const regretRate = reviewedDecisions.length > 0 ? Math.round((regrettedCount / reviewedDecisions.length) * 100) : 0;

  return (
    <Screen padding={false}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Text style={styles.title}>Your Decision Timeline</Text>
          <Text style={styles.subtitle}>{(decisions || []).length} decisions · {reviewedDecisions.length} reviewed</Text>

          {/* Summary cards */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{reviewedDecisions.length}</Text>
              <Text style={styles.summaryLabel}>Reviewed</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: regretRate > 30 ? colors.accent.error : colors.accent.success }]}>
                {regretRate}%
              </Text>
              <Text style={styles.summaryLabel}>Regret Rate</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: trendUp ? colors.accent.success : colors.accent.warning }]}>
                {trendUp ? '↑' : '↓'}
              </Text>
              <Text style={styles.summaryLabel}>
                {trendUp ? 'Improving' : 'Watch trend'}
              </Text>
            </View>
          </View>

          {/* Blind spots summary */}
          {(blindSpots || []).length > 0 && (
            <View style={styles.blindSpotSection}>
              <Text style={styles.sectionTitle}>Blind Spots Detected</Text>
              {blindSpots!.filter(b => b.is_active).map(spot => (
                <View key={spot.id} style={styles.spotCard}>
                  <Text style={styles.spotTitle}>{spot.title}</Text>
                  <Text style={styles.spotDesc}>{spot.description}</Text>
                  <Text style={[styles.spotSeverity, spot.severity === 'significant' ? styles.sevHigh : styles.sevMod]}>
                    {spot.severity} · {spot.evidence_count} evidence
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Playbook status */}
          {playbookReady && playbook && (
            <View style={styles.playbookSection}>
              <Text style={styles.sectionTitle}>Decision Philosophy</Text>
              <Text style={styles.philosophy}>{playbook.decision_philosophy}</Text>
              {playbook.optimal_speed && (
                <Text style={styles.optimalSpeed}>⚡ {playbook.optimal_speed}</Text>
              )}
            </View>
          )}

          {/* Decision timeline */}
          <Text style={styles.sectionTitle}>Full History</Text>
          {(decisions || []).map((d, i) => (
            <View key={d.id} style={styles.timelineItem}>
              <View style={styles.timelineDot}>
                <View style={[styles.dot, d.satisfaction_score != null ? (d.satisfaction_score >= 4 ? styles.dotGood : styles.dotBad) : styles.dotNeutral]} />
                {i < (decisions || []).length - 1 && <View style={styles.dotLine} />}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.decisionTitle}>{d.title}</Text>
                <Text style={styles.decisionMeta}>
                  {d.category} · {new Date(d.created_at).toLocaleDateString()}
                  {d.satisfaction_score != null ? ` · ${d.satisfaction_score}/5` : ''}
                  {d.would_choose_same === false ? ' · Would change' : ''}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { padding: spacing.lg },
  title: { fontSize: 24, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.text.secondary, marginBottom: spacing.xl },
  summaryRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  summaryCard: { flex: 1, alignItems: 'center', backgroundColor: colors.background.secondary, borderRadius: 12, padding: spacing.md },
  summaryValue: { fontSize: 24, fontWeight: '700', color: colors.text.primary },
  summaryLabel: { fontSize: 11, color: colors.text.tertiary, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.md, marginTop: spacing.lg },
  blindSpotSection: { marginBottom: spacing.xl },
  spotCard: { backgroundColor: colors.background.secondary, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm },
  spotTitle: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  spotDesc: { fontSize: 13, color: colors.text.secondary, lineHeight: 19, marginTop: 4 },
  spotSeverity: { fontSize: 11, marginTop: 6 },
  sevHigh: { color: colors.accent.error, fontWeight: '600' },
  sevMod: { color: colors.accent.warning },
  playbookSection: { marginBottom: spacing.xl, backgroundColor: colors.accent.primary + '08', borderRadius: 12, padding: spacing.md },
  philosophy: { fontSize: 15, color: colors.text.primary, fontStyle: 'italic', lineHeight: 22 },
  optimalSpeed: { fontSize: 13, color: colors.accent.primary, marginTop: spacing.sm },
  timelineItem: { flexDirection: 'row', marginBottom: spacing.xs },
  timelineDot: { alignItems: 'center', width: 24, marginRight: spacing.md },
  dot: { width: 12, height: 12, borderRadius: 6 },
  dotGood: { backgroundColor: colors.accent.success },
  dotBad: { backgroundColor: colors.accent.error },
  dotNeutral: { backgroundColor: colors.text.tertiary },
  dotLine: { width: 2, flex: 1, backgroundColor: colors.background.tertiary, marginTop: 4 },
  timelineContent: { flex: 1, paddingBottom: spacing.lg },
  decisionTitle: { fontSize: 14, fontWeight: '500', color: colors.text.primary },
  decisionMeta: { fontSize: 12, color: colors.text.tertiary, marginTop: 2 },
});
