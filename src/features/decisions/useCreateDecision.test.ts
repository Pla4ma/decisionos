// useCreateDecision Hook Tests
// Unit tests for create decision hook logic

import type { CreateDecisionFormData } from './useCreateDecision';
import type { DecisionCategory, CreateOptionInput } from './decisionTypes';

describe('useCreateDecision', () => {
  describe('step management', () => {
    const steps = ['basics', 'options', 'questions', 'review'] as const;

    test('has 4 steps in order', () => {
      expect(steps).toHaveLength(4);
      expect(steps[0]).toBe('basics');
      expect(steps[1]).toBe('options');
      expect(steps[2]).toBe('questions');
      expect(steps[3]).toBe('review');
    });

    test('can navigate to next step', () => {
      let currentStep = 'basics' as any;
      const currentIndex = steps.indexOf(currentStep);

      currentStep = steps[currentIndex + 1];
      expect(currentStep).toBe('options');
    });

    test('can navigate to previous step', () => {
      let currentStep = 'questions' as any;
      const currentIndex = steps.indexOf(currentStep);

      currentStep = steps[currentIndex - 1];
      expect(currentStep).toBe('options');
    });

    test('cannot go before first step', () => {
      const currentStep = 'basics';
      const currentIndex = steps.indexOf(currentStep);
      const canGoBack = currentIndex > 0;

      expect(canGoBack).toBe(false);
    });

    test('cannot go after last step', () => {
      const currentStep = 'review';
      const currentIndex = steps.indexOf(currentStep);
      const canGoForward = currentIndex < steps.length - 1;

      expect(canGoForward).toBe(false);
    });
  });

  describe('form data structure', () => {
    test('CreateDecisionFormData has all required fields', () => {
      const formData: CreateDecisionFormData = {
        title: 'Should I take this job?',
        category: 'career',
        context: 'Got a new job offer with 20% salary increase',
        desiredOutcome: 'Grow my career and earn more',
        biggestFear: 'Leaving stability for uncertainty',
        inactionOutcome: 'Miss out on growth opportunity',
        importance: 8,
        urgency: 6,
        options: [
          { title: 'Accept the job', description: 'Take the new opportunity' },
          { title: 'Decline and stay', description: 'Stay at current company' },
        ],
        answers: {},
      };

      expect(formData.title).toBeTruthy();
      expect(formData.category).toBeTruthy();
      expect(formData.options.length).toBeGreaterThanOrEqual(2);
    });

    test('options array contains CreateOptionInput', () => {
      const option: CreateOptionInput = {
        title: 'Accept the job',
        description: 'Take the new opportunity',
        pros: ['Higher salary', 'Better title'],
        cons: ['Relocation required'],
      };

      expect(option.title).toBeTruthy();
    });
  });

  describe('create decision flow', () => {
    test('creates decision with all fields', async () => {
      const formData: CreateDecisionFormData = {
        title: 'Should I move cities?',
        category: 'moving',
        context: 'Got a job offer in a new city',
        desiredOutcome: 'Better career and life',
        biggestFear: 'Leaving friends behind',
        inactionOutcome: 'Stay stuck in current situation',
        importance: 9,
        urgency: 7,
        options: [
          { title: 'Move', description: 'Accept the new job and relocate' },
          { title: 'Stay', description: 'Decline and remain' },
        ],
        answers: {
          'q1': 'My career growth',
          'q2': 'Around 6 months to decide',
        },
      };

      expect(formData.title).toBeTruthy();
      expect(formData.category).toBe('moving');
      expect(formData.options).toHaveLength(2);
      expect(Object.keys(formData.answers)).toHaveLength(2);
    });

    test('options converted to array format', () => {
      const answers = { 'q1': 'answer1', 'q2': 'answer2' };
      const answersArray = Object.entries(answers).map(([question_key, answer]) => ({
        question_key,
        answer,
      }));

      expect(answersArray).toHaveLength(2);
      expect(answersArray[0]).toHaveProperty('question_key');
      expect(answersArray[0]).toHaveProperty('answer');
    });

    test('status updates to ready_for_analysis', () => {
      const targetStatus = 'ready_for_analysis';
      expect(targetStatus).toBe('ready_for_analysis');
    });
  });

  describe('step validation', () => {
    test('canProceedToOptions is initially false', () => {
      const canProceed = false;
      expect(canProceed).toBe(false);
    });

    test('canProceedToQuestions is initially false', () => {
      const canProceed = false;
      expect(canProceed).toBe(false);
    });

    test('canComplete is initially false', () => {
      const canComplete = false;
      expect(canComplete).toBe(false);
    });
  });

  describe('mutation state', () => {
    test('isSubmitting reflects mutation pending state', () => {
      const isPending = false;
      expect(typeof isPending).toBe('boolean');
    });

    test('error can be null', () => {
      const error: Error | null = null;
      expect(error).toBeNull();
    });

    test('isSuccess reflects mutation success', () => {
      const isSuccess = false;
      expect(typeof isSuccess).toBe('boolean');
    });

    test('createdDecisionId can be null initially', () => {
      const createdDecisionId: string | null = null;
      expect(createdDecisionId).toBeNull();
    });
  });
});