// useCreateDecision — Hook for creating a new decision with full flow
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { createDecision, addDecisionOption, saveDecisionAnswers, updateDecisionStatus } from './decisionRepository';
import { DecisionCategory, CreateOptionInput } from './decisionTypes';

export interface CreateDecisionFormData {
  title: string;
  category: DecisionCategory;
  context: string;
  desiredOutcome: string;
  biggestFear: string;
  inactionOutcome: string;
  importance: number;
  urgency: number;
  options: CreateOptionInput[];
  answers: Record<string, string>;
}

// Export the type for use in components
export type { CreateDecisionFormData };

export type CreateStep = 'basics' | 'options' | 'questions' | 'review';

export interface UseCreateDecisionReturn {
  // Current step
  currentStep: CreateStep;
  setCurrentStep: (step: CreateStep) => void;

  // Step validation
  canProceedToOptions: boolean;
  canProceedToQuestions: boolean;
  canComplete: boolean;

  // Submission
  submitDecision: (data: CreateDecisionFormData) => void;
  isSubmitting: boolean;
  error: Error | null;
  isSuccess: boolean;
  createdDecisionId: string | null;

  // Progress
  stepOrder: CreateStep[];
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const STEP_ORDER: CreateStep[] = ['basics', 'options', 'questions', 'review'];

export function useCreateDecision(): UseCreateDecisionReturn {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<CreateStep>('basics');
  const [createdDecisionId, setCreatedDecisionId] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async (data: CreateDecisionFormData) => {
      // Step 1: Create the decision
      const decision = await createDecision({
        title: data.title,
        category: data.category,
        context: data.context || undefined,
        importance: data.importance,
        urgency: data.urgency,
      });

      // Step 2: Add options
      for (const option of data.options) {
        await addDecisionOption(decision.id, option);
      }

      // Step 3: Save answers (convert answers object to array format)
      const answersArray = Object.entries(data.answers).map(([question_key, answer]) => ({
        question_key,
        answer,
      }));
      if (answersArray.length > 0) {
        await saveDecisionAnswers(decision.id, answersArray);
      }

      // Step 4: Update status to ready_for_analysis
      await updateDecisionStatus(decision.id, 'ready_for_analysis');

      return decision.id;
    },
    onSuccess: (decisionId) => {
      setCreatedDecisionId(decisionId);
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      queryClient.invalidateQueries({ queryKey: ['decisionCounts'] });
      router.replace(`/decisions/${decisionId}`);
    },
  });

  const submitDecision = useCallback((data: CreateDecisionFormData) => {
    createMutation.mutate(data);
  }, [createMutation]);

  const goToNextStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      setCurrentStep(STEP_ORDER[currentIndex + 1]);
    }
  }, [currentStep]);

  const goToPreviousStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEP_ORDER[currentIndex - 1]);
    }
  }, [currentStep]);

  return {
    currentStep,
    setCurrentStep,
    canProceedToOptions: false, // Set by consuming component based on draft
    canProceedToQuestions: false, // Set by consuming component based on options
    canComplete: false, // Set by consuming component
    submitDecision,
    isSubmitting: createMutation.isPending,
    error: createMutation.error as Error | null,
    isSuccess: createMutation.isSuccess,
    createdDecisionId,
    stepOrder: STEP_ORDER,
    goToNextStep,
    goToPreviousStep,
  };
}
