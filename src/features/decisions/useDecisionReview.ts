// Decision Review Hook - Extracted from review.tsx to meet 200-line limit
import { useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  getDecision,
  getDecisionOptions,
  getDecisionReview,
  saveDecisionReview,
  updateDecisionStatus,
} from '@/features/decisions/decisionRepository';
import { useAuth } from '@/features/auth';
import { useStreak } from '@/features/progression/useStreak';
import { useEarnedAnalyses } from '@/features/monetization/useEarnedAnalyses';
import { ROUTES } from '@/config/routes';

export function useDecisionReview(decisionId: string) {
  const router = useRouter();
  const { user } = useAuth();
  const { updateStreak } = useStreak(user?.id ?? null);
  const { awardAnalysis } = useEarnedAnalyses(user?.id ?? null);

  // Load decision data
  const { data: decision, isLoading: decisionLoading } = useQuery({
    queryKey: ['decision', decisionId],
    queryFn: () => getDecision(decisionId),
    enabled: !!decisionId && !!user,
  });

  const { data: options, isLoading: optionsLoading } = useQuery({
    queryKey: ['decision-options', decisionId],
    queryFn: () => getDecisionOptions(decisionId),
    enabled: !!decisionId && !!user,
  });

  const { data: existingReview, isLoading: reviewLoading } = useQuery({
    queryKey: ['decision-review', decisionId],
    queryFn: () => getDecisionReview(decisionId),
    enabled: !!decisionId && !!user,
  });

  // Save review mutation
  const saveReviewMutation = useMutation({
    mutationFn: (data: any) => saveDecisionReview(decisionId, data),
    onSuccess: async () => {
      // Trigger retention systems
      await Promise.allSettled([
        updateStreak(),
        awardAnalysis(decisionId),
      ]);
      Alert.alert('Review Saved', 'Your review has been saved successfully. You earned an extra AI analysis!');
      router.push(ROUTES.DECISION_DETAIL(decisionId));
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to save review. Please try again.');
      console.error('Review save error:', error);
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: any) => updateDecisionStatus(decisionId, status),
  });

  const handleSubmitReview = useCallback(
    (data: any) => {
      // Validate required fields
      if (!data.outcome_notes || data.outcome_notes.length < 10) {
        Alert.alert('Missing Information', 'Please provide at least 10 characters for the outcome notes.');
        return;
      }

      // Save review
      saveReviewMutation.mutate(data);

      // Update status to reviewed
      updateStatusMutation.mutate('reviewed');
    },
    [decisionId, saveReviewMutation, updateStatusMutation]
  );

  const isLoading = decisionLoading || optionsLoading || reviewLoading;
  const isSubmitting = saveReviewMutation.isPending || updateStatusMutation.isPending;

  // Check if decision has a chosen option
  const canReview = options?.some(opt => opt.is_chosen) && !existingReview;
  const chosenOption = options?.find(opt => opt.is_chosen);

  return {
    decision,
    options,
    existingReview,
    chosenOption,
    isLoading,
    isSubmitting,
    canReview,
    handleSubmitReview,
  };
}
