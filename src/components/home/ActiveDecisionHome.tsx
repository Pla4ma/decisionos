import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { useHomeDecisionRecommendation } from '@/features/decisions/useHomeDecisionRecommendation';
import { useDecisionDraftStore } from '@/stores/decisionDraftStore';
import { useAuth } from '@/features/auth/useAuth';
import { ROUTES } from '@/config/routes';
import { DraftContinuationCard } from './DraftContinuationCard';

export function ActiveDecisionHome(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const { pendingDecisions } = useHomeDecisionRecommendation(user?.id ?? null);
  const { draft } = useDecisionDraftStore();
  const unfinishedDraft = draft?.title ? { title: draft.title, step: 0, totalSteps: 4 } : null;

  const hasChosen = pendingDecisions.some(d => d.status === 'chosen' || d.status === 'review_scheduled');
  if (hasChosen || pendingDecisions.length === 0) return <></>;

  return (
    <>
      {unfinishedDraft && (
        <DraftContinuationCard
          draft={unfinishedDraft}
          onResume={() => router.push(ROUTES.DECISIONS_NEW)}
          onDismiss={() => {}}
        />
      )}
      {pendingDecisions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Decisions</Text>
          {pendingDecisions.slice(0, 5).map((decision, i) => (
            <TouchableOpacity
              key={decision.id}
              style={styles.decisionCard}
              onPress={() => router.push(ROUTES.DECISION_DETAIL(decision.id))}
              activeOpacity={0.7}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.rankCircle, { backgroundColor: i === 0 ? colors.accent.muted : colors.background.tertiary }]}>
                  <Text style={[styles.rankText, { color: i === 0 ? colors.accent.primary : colors.text.tertiary }]}>{i + 1}</Text>
                </View>
              </View>
              <View style={styles.cardCenter}>
                <Text style={styles.decisionTitle} numberOfLines={1}>{decision.title}</Text>
                <Text style={styles.decisionDate}>
                  {new Date(decision.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <View style={styles.glanceDots}>
                <View style={[styles.glanceDot, { backgroundColor: decision.status === 'ready_for_analysis' ? colors.status.warning : decision.status === 'analyzed' ? colors.status.success : colors.accent.primary }]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.md },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md },
  decisionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.secondary, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border.primary },
  cardLeft: { marginRight: spacing.md },
  rankCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: typography.size.xs, fontWeight: '700' },
  cardCenter: { flex: 1, marginRight: spacing.md },
  decisionTitle: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary },
  decisionDate: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 2 },
  glanceDots: { flexDirection: 'row', gap: 4 },
  glanceDot: { width: 8, height: 8, borderRadius: 4 },
});
