// useCreateDecision — Hook for creating a new decision with full flow
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { createDecision, addDecisionOption, saveDecisionAnswers, updateDecisionStatus } from './decisionRepository';
import { DecisionCategory, CreateOptionInput } from './decisionTypes';
import { useDecisionDraftStore } from '@/stores/decisionDraftStore';
import { canProceedFromBasics, canProceedFromOptions, canProceedFromQuestions, validateDecisionBasics, validateDecisionOptions, validateDecisionQuestions } from './decisionValidation';
import { ROUTES } from '@/config/routes';

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
  is_practice?: boolean;
  quick_mode?: boolean;
  skip_questions?: boolean;
}


export type CreateStep = 'basics' | 'options' | 'questions' | 'review';

export interface DecisionValidationErrors {
  basics?: string[];
  options?: string[];
  questions?: string[];
  review?: string[];
}

export interface UseCreateDecisionReturn {
  currentStep: CreateStep;
  setCurrentStep: (step: CreateStep) => void;
  canProceedToOptions: boolean;
  canProceedToQuestions: boolean;
  canComplete: boolean;
  validationErrors: DecisionValidationErrors;
  submitDecision: (data: CreateDecisionFormData) => Promise<string | undefined>;
  isSubmitting: boolean;
  error: Error | null;
  isSuccess: boolean;
  createdDecisionId: string | null;
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
      const decision = await createDecision({
        title: data.title,
        category: data.category,
        context: data.context || undefined,
        importance: data.importance,
        urgency: data.urgency,
        is_practice: data.is_practice || false,
      });

      for (const option of data.options) {
        await addDecisionOption(decision.id, option);
      }

      if (!data.skip_questions) {
        const answersArray = Object.entries(data.answers).map(([question_key, answer]) => ({
          question_key,
          answer,
        }));
        if (answersArray.length > 0) {
          await saveDecisionAnswers(decision.id, answersArray);
        }
      }

      await updateDecisionStatus(decision.id, 'ready_for_analysis');

      return decision.id;
    },
    onSuccess: (decisionId) => {
      setCreatedDecisionId(decisionId);
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      queryClient.invalidateQueries({ queryKey: ['decisionCounts'] });
      router.replace(ROUTES.DECISION_DETAIL(decisionId));
    },
  });

  const submitDecision = useCallback(async (data: CreateDecisionFormData): Promise<string | undefined> => {
    return createMutation.mutateAsync(data);
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

  const draft = useDecisionDraftStore((s) => s.draft);

  const computedCanProceedToOptions = draft ? canProceedFromBasics(draft) : false;
  const computedCanProceedToQuestions = draft ? canProceedFromOptions(draft.options) : false;
  const computedCanComplete = draft ? canProceedFromQuestions(draft.answers, draft.context) : false;
  const computedErrors: DecisionValidationErrors = {
    basics: draft ? validateDecisionBasics(draft) : ['No draft'],
    options: draft ? (validateDecisionOptions(draft.options).length > 0 ? validateDecisionOptions(draft.options) : undefined) : undefined,
    questions: draft ? (validateDecisionQuestions(draft.answers).length > 0 ? validateDecisionQuestions(draft.answers) : undefined) : undefined,
  };

  return {
    currentStep,
    setCurrentStep,
    canProceedToOptions: computedCanProceedToOptions,
    canProceedToQuestions: computedCanProceedToQuestions,
    canComplete: computedCanComplete,
    validationErrors: computedErrors,
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
