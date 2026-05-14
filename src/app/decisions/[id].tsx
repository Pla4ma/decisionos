// FLOW: /decisions/[id] — Decision Detail
// FROM: / (home) — tap decision row
//       /decisions — tap decision row
//       Notification deep link
// TO: /decisions/[id]/analysis (tap "View Analysis")
//     /decisions/[id]/commit (tap "Make Choice")
//     /decisions/[id]/review (tap "Review")
//     /decisions/[id]/schedule (tap "Schedule Review")
// This is the HUB screen for a single decision. All decision actions flow through here.
// See FLOW_ARCHITECTURE.md §2 — Complete Screen Map
import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { getDecision, getDecisionOptions, getDecisionAnswers } from '@/features/decisions/decisionRepository';
import { fetchDecisionAnalysis } from '@/features/decisions/decisionAnalysisService';
import { useHindsight } from '@/features/decisions/useHindsight';
import { useQuickReview } from '@/features/engagement/useQuickReview';
import { DecisionInfo } from '@/components/decisions/DecisionInfo';
import { DecisionDetail } from '@/components/decisions/DecisionDetail';
import { DecisionActions } from '@/components/decisions/DecisionActions';
import { ReflectionModal } from '@/components/decisions/ReflectionModal';
import { QuickReviewPrompt } from '@/components/home/QuickReviewPrompt';
import { useReflections } from '@/features/decisions/useReflections';
import { useAuth } from '@/features/auth';
import type { QuickReviewFeeling } from '@/features/engagement/quickReviewTypes';

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'accent' }> = {
  draft: { label: 'Draft', variant: 'default' },
  questions: { label: 'In Progress', variant: 'info' },
  ready_for_analysis: { label: 'Ready to Analyze', variant: 'warning' },
  analyzed: { label: 'Analyzed', variant: 'success' },
  chosen: { label: 'Chosen', variant: 'success' },
  quick_reviewed: { label: 'Checked In', variant: 'info' },
  review_scheduled: { label: 'Review Pending', variant: 'warning' },
  reviewed: { label: 'Completed', variant: 'default' },
  archived: { label: 'Archived', variant: 'default' },
};

const categoryLabels: Record<string, string> = { school: 'Education', career: 'Career', money: 'Financial', moving: 'Relocation', business: 'Business', personal_goals: 'Personal', other: 'Other' };

export default function DecisionDetailScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [showReflection, setShowReflection] = useState(false);
  const [showQuickReview, setShowQuickReview] = useState(false);
  const { addReflection } = useReflections(user?.id ?? null);
  const { submitQuickReview, needsQuickReview, isSubmitting } = useQuickReview();

  const { data: decision, isLoading, error } = useQuery({ queryKey: ['decision', id], queryFn: () => getDecision(id) });
  const { data: options } = useQuery({ queryKey: ['options', id], queryFn: () => getDecisionOptions(id) });
  const { data: answers } = useQuery({ queryKey: ['answers', id], queryFn: () => getDecisionAnswers(id) });
  const { data: analysis } = useQuery({ queryKey: ['analysis', id], queryFn: () => fetchDecisionAnalysis(id) });
  const { comparison: hindsightComparison } = useHindsight(id);

  const isQuickReviewDue = decision && (decision.status === 'chosen') && needsQuickReview(decision.updated_at);

  const handleQuickReview = useCallback(async (feeling: QuickReviewFeeling) => {
    await submitQuickReview(id, feeling);
    setShowQuickReview(false);
    Alert.alert('Check-In Saved', 'Your quick review has been recorded and your DQ score updated.');
  }, [id, submitQuickReview]);

  if (isLoading) return <LoadingState message="Loading..." />;
  if (error || !decision) return <ErrorState message="Not found" onRetry={() => router.back()} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DecisionInfo decision={decision} categoryLabel={categoryLabels[decision.category] || decision.category} statusConfig={statusConfig[decision.status as keyof typeof statusConfig]} />

      {isQuickReviewDue && !showQuickReview && (
        <TouchableOpacity style={styles.quickReviewBanner} onPress={() => setShowQuickReview(true)} activeOpacity={0.7}>
          <Text style={styles.quickReviewBannerIcon}>📝</Text>
          <View style={styles.quickReviewBannerContent}>
            <Text style={styles.quickReviewBannerTitle}>Quick Check-In Available</Text>
            <Text style={styles.quickReviewBannerText}>How are you feeling about this choice? 10-second check-in.</Text>
          </View>
        </TouchableOpacity>
      )}

      {showQuickReview && (
        <QuickReviewPrompt
          decisionTitle={decision.title}
          decisionId={id}
          onSelect={handleQuickReview}
          onDismiss={() => setShowQuickReview(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {decision.is_practice && (
        <View style={styles.practiceBanner}>
          <Badge title="Practice Decision" variant="accent" size="small" />
          <Text style={styles.practiceBannerText}>
            This is a practice decision. It helps you train your framework without real stakes.
          </Text>
        </View>
      )}

      <DecisionDetail decision={decision} options={options || []} answers={answers || []} analysis={analysis || null} id={id} hindsightComparison={hindsightComparison} />
      <DecisionActions
        decision={decision}
        id={id}
        onAnalyze={() => router.push(`/decisions/${id}/analysis`)}
        onEdit={() => router.push(`/decisions/${id}/edit`)}
        onCheckIn={() => setShowReflection(true)}
      />
      <ReflectionModal
        visible={showReflection}
        onClose={() => setShowReflection(false)}
        onSubmit={async (feeling) => {
          await addReflection({ decisionId: id, weekNumber: 1, feeling });
          setShowReflection(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  quickReviewBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.accent.secondary + '15',
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    padding: spacing.md, borderRadius: 12,
    borderWidth: 1, borderColor: colors.accent.secondary + '30',
  },
  quickReviewBannerIcon: { fontSize: 20, marginRight: spacing.md },
  quickReviewBannerContent: { flex: 1 },
  quickReviewBannerTitle: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary, marginBottom: 2 },
  quickReviewBannerText: { fontSize: typography.size.sm, color: colors.text.secondary },
  practiceBanner: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    padding: spacing.md, borderRadius: 12,
    gap: spacing.sm,
  },
  practiceBannerText: { fontSize: typography.size.sm, color: colors.text.tertiary, flex: 1, fontStyle: 'italic' },
});
