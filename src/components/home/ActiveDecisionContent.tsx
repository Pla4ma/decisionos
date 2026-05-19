import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { DraftContinuationCard } from './DraftContinuationCard';

interface DecisionItem {
  id: string;
  title: string;
  created_at: string;
  status: string;
}

interface ActiveDecisionContentProps {
  pendingDecisions: DecisionItem[];
  unfinishedDraft: { title: string; step: number; totalSteps: number } | null;
  onResumeDraft: () => void;
  onDecisionPress: (id: string) => void;
}

export function ActiveDecisionContent({ pendingDecisions, unfinishedDraft, onResumeDraft, onDecisionPress }: ActiveDecisionContentProps): JSX.Element {
  return (
    <>
      {unfinishedDraft && (
        <DraftContinuationCard
          draft={unfinishedDraft}
          onResume={onResumeDraft}
          onDismiss={() => {}}
        />
      )}
      {pendingDecisions.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Active Decisions</Text>
          {pendingDecisions.slice(0, 5).map((decision, i) => (
            <TouchableOpacity
              key={decision.id}
              style={s.decisionCard}
              onPress={() => onDecisionPress(decision.id)}
              activeOpacity={0.7}
            >
              <View style={s.cardLeft}>
                <View style={[s.rankCircle, { backgroundColor: i === 0 ? colors.accent.muted : colors.background.tertiary }]}>
                  <Text style={[s.rankText, { color: i === 0 ? colors.accent.primary : colors.text.tertiary }]}>{i + 1}</Text>
                </View>
              </View>
              <View style={s.cardCenter}>
                <Text style={s.decisionTitle} numberOfLines={1}>{decision.title}</Text>
                <Text style={s.decisionDate}>
                  {new Date(decision.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <View style={s.glanceDots}>
                <View style={[s.glanceDot, { backgroundColor: decision.status === 'ready_for_analysis' ? colors.status.warning : decision.status === 'analyzed' ? colors.status.success : colors.accent.primary }]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
}

const s = StyleSheet.create({
  section: { marginBottom: spacing.md },
  sectionTitle: {
    fontSize: 14, fontWeight: '600', color: colors.text.secondary,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md,
  },
  decisionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.background.secondary, borderRadius: 12,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border.primary,
  },
  cardLeft: { marginRight: spacing.md },
  rankCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: typography.size.xs, fontWeight: '700' },
  cardCenter: { flex: 1, marginRight: spacing.md },
  decisionTitle: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary },
  decisionDate: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 2 },
  glanceDots: { flexDirection: 'row', gap: 4 },
  glanceDot: { width: 8, height: 8, borderRadius: 4 },
});