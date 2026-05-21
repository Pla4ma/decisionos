import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { getDecision, getDecisionOptions } from '@/features/decisions/decisionRepository';
import { fetchDecisionAnalysis } from '@/features/decisions/decisionAnalysisService';
import { useHindsight } from '@/features/decisions/useHindsight';
import { useQuickReview } from '@/features/engagement/useQuickReview';
import { QuickReviewPrompt } from '@/components/home/QuickReviewPrompt';
import { HindsightComparisonCard } from '@/components/decisions/HindsightComparisonCard';
import { useAuth } from '@/features/auth';
import { ROUTES } from '@/config/routes';
import type { QuickReviewFeeling } from '@/features/engagement/quickReviewTypes';
import type { DecisionOption } from '@/features/decisions/decisionTypes';

const STATUS_META: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'accent'; color: string }> = {
  draft: { label: 'Draft', variant: 'default', color: colors.text.tertiary },
  questions: { label: 'In Progress', variant: 'info', color: colors.status.info },
  ready_for_analysis: { label: 'Ready', variant: 'warning', color: colors.status.warning },
  analyzed: { label: 'Analyzed', variant: 'success', color: colors.status.success },
  chosen: { label: 'Decided', variant: 'success', color: colors.accent.primary },
  quick_reviewed: { label: 'Checked In', variant: 'info', color: colors.status.info },
  review_scheduled: { label: 'Review Due', variant: 'warning', color: colors.status.warning },
  reviewed: { label: 'Completed', variant: 'default', color: colors.text.disabled },
  archived: { label: 'Archived', variant: 'default', color: colors.text.disabled },
};

const CATEGORY_EMOJI: Record<string, string> = {
  school: '🎓', career: '💼', money: '💰', moving: '🏠', business: '🏢', personal_goals: '🎯', other: '📌',
};

export default function DecisionDetailScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [showQuickReview, setShowQuickReview] = useState(false);
  const { submitQuickReview, needsQuickReview, isSubmitting } = useQuickReview();

  const { data: decision, isLoading, error } = useQuery({ queryKey: ['decision', id], queryFn: () => getDecision(id), staleTime: 30_000 });
  const { data: options } = useQuery({ queryKey: ['options', id], queryFn: () => getDecisionOptions(id), staleTime: 30_000 });
  const { data: analysis } = useQuery({ queryKey: ['analysis', id], queryFn: () => fetchDecisionAnalysis(id), staleTime: 30_000 });
  const { comparison: hindsightComparison } = useHindsight(id);

  const topOptionTitle = analysis?.option_scores?.length
    ? analysis.option_scores.reduce((best, current) =>
        current.overall_score > best.overall_score ? current : best
      ).option_title
    : null;

  const isQuickReviewDue = decision && decision.status === 'chosen' && needsQuickReview(decision.updated_at);

  const handleQuickReview = useCallback(async (feeling: QuickReviewFeeling) => {
    await submitQuickReview(id, feeling);
    setShowQuickReview(false);
    Alert.alert('Saved', 'Your quick check-in has been recorded.');
  }, [id, submitQuickReview]);

  if (isLoading) return <LoadingState message="Loading..." />;
  if (error || !decision) return <ErrorState message="Not found" onRetry={() => router.back()} />;

  const statusMeta = STATUS_META[decision.status as keyof typeof STATUS_META] || STATUS_META.draft;
  const categoryEmoji = CATEGORY_EMOJI[decision.category] || '📌';

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Decision</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" style={s.titleCard}>
          <Text style={s.categoryEmoji}>{categoryEmoji}</Text>
          <Text style={s.decisionTitle}>{decision.title}</Text>
          {decision.context && (
            <Text style={s.decisionDescription}>{decision.context}</Text>
          )}
          <View style={s.metaRow}>
            <Badge title={statusMeta.label} variant={statusMeta.variant} size="small" />
            {decision.category && (
              <Text style={s.categoryLabel}>{decision.category.replace(/_/g, ' ')}</Text>
            )}
          </View>
        </Card>

        {isQuickReviewDue && !showQuickReview && (
          <TouchableOpacity style={s.quickReviewBanner} onPress={() => setShowQuickReview(true)} activeOpacity={0.7}>
            <Text style={s.quickReviewIcon}>📝</Text>
            <View style={s.quickReviewContent}>
              <Text style={s.quickReviewTitle}>Quick Check-In</Text>
              <Text style={s.quickReviewText}>How are you feeling about this choice?</Text>
            </View>
            <Text style={s.quickReviewArrow}>→</Text>
          </TouchableOpacity>
        )}

        {showQuickReview && (
          <Card variant="elevated" style={s.quickReviewCard}>
            <QuickReviewPrompt
              decisionTitle={decision.title}
              decisionId={id}
              onSelect={handleQuickReview}
              onDismiss={() => setShowQuickReview(false)}
              isSubmitting={isSubmitting}
            />
          </Card>
        )}

        {decision.is_practice && (
          <Card variant="default" style={s.practiceCard}>
            <Text style={s.practiceIcon}>🧪</Text>
            <View style={s.practiceContent}>
              <Text style={s.practiceTitle}>Practice Decision</Text>
              <Text style={s.practiceText}>Train your framework without real stakes.</Text>
            </View>
          </Card>
        )}

        <View style={s.actionsGrid}>
          {decision.status !== 'analyzed' && decision.status !== 'chosen' && (
            <TouchableOpacity style={s.actionCard} onPress={() => router.push(ROUTES.DECISION_ANALYSIS(id))} activeOpacity={0.7}>
              <Text style={s.actionIcon}>🔮</Text>
              <Text style={s.actionLabel}>Analyze</Text>
              <Text style={s.actionDesc}>AI-powered scores</Text>
            </TouchableOpacity>
          )}

          {(decision.status === 'analyzed' || decision.status === 'chosen') && (
            <TouchableOpacity style={s.actionCard} onPress={() => router.push(ROUTES.DECISION_ANALYSIS(id))} activeOpacity={0.7}>
              <Text style={s.actionIcon}>📊</Text>
              <Text style={s.actionLabel}>View Analysis</Text>
              <Text style={s.actionDesc}>See scores & tradeoffs</Text>
            </TouchableOpacity>
          )}

          {decision.status === 'analyzed' && (
            <TouchableOpacity style={s.actionCard} onPress={() => router.push(ROUTES.DECISION_COMMIT(id))} activeOpacity={0.7}>
              <Text style={s.actionIcon}>✅</Text>
              <Text style={s.actionLabel}>Make Choice</Text>
              <Text style={s.actionDesc}>Commit & schedule review</Text>
            </TouchableOpacity>
          )}

          {decision.status === 'chosen' && (
            <TouchableOpacity style={s.actionCard} onPress={() => router.push(ROUTES.DECISION_SCHEDULE(id))} activeOpacity={0.7}>
              <Text style={s.actionIcon}>📅</Text>
              <Text style={s.actionLabel}>Schedule Review</Text>
              <Text style={s.actionDesc}>Set a check-in date</Text>
            </TouchableOpacity>
          )}

          {(decision.status === 'review_scheduled' || decision.status === 'chosen') && (
            <TouchableOpacity style={s.actionCard} onPress={() => router.push(ROUTES.DECISION_REVIEW(id))} activeOpacity={0.7}>
              <Text style={s.actionIcon}>📋</Text>
              <Text style={s.actionLabel}>Review</Text>
              <Text style={s.actionDesc}>How did it go?</Text>
            </TouchableOpacity>
          )}

        </View>

        {options && options.length > 0 && (
          <Card variant="default" style={s.optionsCard}>
            <Text style={s.sectionTitle}>Options ({options.length})</Text>
            {(options as DecisionOption[]).slice(0, 5).map((opt, i) => {
              const isRecommended = topOptionTitle === opt.title;
              return (
                <View key={opt.id || i} style={s.optionRow}>
                  <View style={[s.optionRank, { backgroundColor: isRecommended ? colors.accent.primary + '25' : colors.background.tertiary }]}>
                    <Text style={[s.optionRankText, { color: isRecommended ? colors.accent.primary : colors.text.tertiary }]}>
                      {isRecommended ? '★' : `${i + 1}`}
                    </Text>
                  </View>
                  <Text style={[s.optionTitle, isRecommended && s.optionRecommended]} numberOfLines={1}>
                    {opt.title}
                    {isRecommended && <Text style={s.recommendedTag}> Recommended</Text>}
                  </Text>
                </View>
              );
            })}
          </Card>
        )}

        {hindsightComparison && (
          <Card variant="default" style={s.hindsightCard}>
            <Text style={s.sectionTitle}>Hindsight Comparison</Text>
            <HindsightComparisonCard comparison={hindsightComparison} />
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backBtn: { minWidth: 60 },
  backText: { fontSize: typography.size.md, color: colors.accent.primary, fontWeight: '500' },
  headerTitle: { fontSize: typography.size.lg, fontWeight: '700', color: colors.text.primary },
  scrollContent: { padding: spacing.md, paddingBottom: 120, gap: spacing.md },
  titleCard: { padding: spacing.lg, alignItems: 'center' },
  categoryEmoji: { fontSize: 40, marginBottom: spacing.md },
  decisionTitle: { fontSize: typography.size.xl, fontWeight: '700', color: colors.text.primary, textAlign: 'center', marginBottom: spacing.sm },
  decisionDescription: { fontSize: typography.size.sm, color: colors.text.secondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  categoryLabel: { fontSize: typography.size.xs, color: colors.text.tertiary, textTransform: 'capitalize' },
  quickReviewBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accent.secondary + '15', padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.accent.secondary + '30' },
  quickReviewIcon: { fontSize: 20, marginRight: spacing.md },
  quickReviewContent: { flex: 1 },
  quickReviewTitle: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary },
  quickReviewText: { fontSize: typography.size.xs, color: colors.text.secondary, marginTop: 2 },
  quickReviewArrow: { fontSize: typography.size.lg, color: colors.accent.secondary },
  quickReviewCard: { padding: spacing.md },
  practiceCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  practiceIcon: { fontSize: 20 },
  practiceContent: { flex: 1 },
  practiceTitle: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary },
  practiceText: { fontSize: typography.size.xs, color: colors.text.tertiary, fontStyle: 'italic' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionCard: { flex: 1, minWidth: '45%', backgroundColor: colors.background.secondary, borderRadius: 12, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border.primary },
  actionIcon: { fontSize: 24, marginBottom: spacing.sm },
  actionLabel: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary },
  actionDesc: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 2, textAlign: 'center' },
  optionsCard: { padding: spacing.lg },
  sectionTitle: { fontSize: typography.size.sm, fontWeight: '700', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  optionRank: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  optionRankText: { fontSize: typography.size.xs, fontWeight: '700' },
  optionTitle: { flex: 1, fontSize: typography.size.sm, color: colors.text.primary },
  optionRecommended: { fontWeight: '600' },
  recommendedTag: { fontSize: typography.size.xs, color: colors.accent.primary, fontWeight: '600' },
  hindsightCard: { padding: spacing.lg },
  hindsightText: { fontSize: typography.size.sm, color: colors.text.secondary, lineHeight: 20 },
});