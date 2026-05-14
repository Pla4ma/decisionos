// [id].tsx - Refactored for clean structure with Hindsight Feedback integration
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { getDecision, getDecisionOptions, getDecisionAnswers } from '@/features/decisions/decisionRepository';
import { fetchDecisionAnalysis } from '@/features/decisions/decisionAnalysisService';
import { useHindsight } from '@/features/decisions/useHindsight';
import { DecisionInfo } from '@/components/decisions/DecisionInfo';
import { DecisionDetail } from '@/components/decisions/DecisionDetail';
import { DecisionActions } from '@/components/decisions/DecisionActions';
import { ReflectionModal } from '@/components/decisions/ReflectionModal';
import { useReflections } from '@/features/decisions/useReflections';
import { useAuth } from '@/features/auth';

const statusConfig = {
  draft: { label: 'Draft', variant: 'default' as const },
  questions: { label: 'In Progress', variant: 'info' as const },
  ready_for_analysis: { label: 'Ready to Analyze', variant: 'warning' as const },
  analyzed: { label: 'Analyzed', variant: 'success' as const },
  chosen: { label: 'Chosen', variant: 'success' as const },
  review_scheduled: { label: 'Review Pending', variant: 'warning' as const },
  reviewed: { label: 'Completed', variant: 'default' as const },
};

const categoryLabels: Record<string, string> = { school: 'Education', career: 'Career', money: 'Financial', moving: 'Relocation', business: 'Business', personal_goals: 'Personal', other: 'Other' };

export default function DecisionDetailScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [showReflection, setShowReflection] = useState(false);
  const { addReflection } = useReflections(user?.id ?? null);

  const { data: decision, isLoading, error } = useQuery({ queryKey: ['decision', id], queryFn: () => getDecision(id) });
  const { data: options } = useQuery({ queryKey: ['options', id], queryFn: () => getDecisionOptions(id) });
  const { data: answers } = useQuery({ queryKey: ['answers', id], queryFn: () => getDecisionAnswers(id) });
  const { data: analysis } = useQuery({ queryKey: ['analysis', id], queryFn: () => fetchDecisionAnalysis(id) });
  const { comparison: hindsightComparison } = useHindsight(id);

  if (isLoading) return <LoadingState message="Loading..." />;
  if (error || !decision) return <ErrorState message="Not found" onRetry={() => router.back()} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DecisionInfo decision={decision} categoryLabel={categoryLabels[decision.category] || decision.category} statusConfig={statusConfig[decision.status as keyof typeof statusConfig]} />
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

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background.primary } });
