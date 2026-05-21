import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { FullDecisionWizard } from './FullDecisionWizard';

const mockSubmitDecision = jest.fn();
const mockStartNewDraft = jest.fn();
const mockUpdateDraft = jest.fn();
const mockAddOption = jest.fn();
const mockRemoveOption = jest.fn();
const mockUpdateOption = jest.fn();
const mockSetAnswer = jest.fn();
const mockClearDraft = jest.fn();
const mockSetCurrentStep = jest.fn();
const mockGoToNextStep = jest.fn();
const mockGoToPreviousStep = jest.fn();
const mockBasicsOnly = {
  title: 'Should I accept this new job offer?',
  category: 'career' as const,
  context: 'I have been at my current company for 3 years and received an offer from a startup. The pay is better but the role is riskier.',
  desiredOutcome: 'Career growth and better compensation',
  biggestFear: 'Regretting leaving a stable position',
  inactionOutcome: 'Staying in a role with limited growth',
  importance: 8,
  urgency: 5,
  options: [],
  answers: {},
};

const mockFullDraft = {
  ...mockBasicsOnly,
  options: [
    { title: 'Accept the job offer', description: 'Join the startup', pros: ['Higher salary'], cons: ['Less stability'] },
    { title: 'Stay at current job', description: 'Stay and grow', pros: ['Known quantity'], cons: ['Limited growth'] },
  ],
  answers: { what_matters_most: 'Career growth' },
};

jest.mock('@/features/ai/useBiasDetection', () => ({
  useBiasDetection: () => ({ warnings: [], status: 'idle', totalDetected: 0, reasoning: '', analyze: jest.fn(), reset: jest.fn() }),
}));

jest.mock('@/features/decisions/useCreateDecision', () => ({
  useCreateDecision: () => ({
    currentStep: 'review',
    setCurrentStep: mockSetCurrentStep,
    goToNextStep: mockGoToNextStep,
    goToPreviousStep: mockGoToPreviousStep,
    canProceedToOptions: true,
    canProceedToQuestions: true,
    canComplete: true,
    validationErrors: { basics: [], options: [], questions: [] },
    submitDecision: mockSubmitDecision,
    isSubmitting: false,
    error: null,
    isSuccess: false,
    createdDecisionId: null,
    stepOrder: ['basics', 'options', 'questions', 'review'],
  }),
}));

jest.mock('@/stores/decisionDraftStore', () => ({
  useDecisionDraftStore: (selector: any) => {
    const state = {
      draft:   mockFullDraft,
      currentStep: 0,
      isDirty: false,
      startNewDraft: mockStartNewDraft,
      updateDraft: mockUpdateDraft,
      addOption: mockAddOption,
      removeOption: mockRemoveOption,
      updateOption: mockUpdateOption,
      setAnswer: mockSetAnswer,
      clearDraft: mockClearDraft,
      setStep: jest.fn(),
      markClean: jest.fn(),
    };
    return selector(state);
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('FullDecisionWizard', () => {
  test('renders basics step by default', () => {
    const { getByText } = render(<FullDecisionWizard onCancel={jest.fn()} />);
    expect(getByText('New Decision')).toBeTruthy();
  });

  test('shows step indicator with 4 steps', () => {
    const { getAllByText, getByText } = render(<FullDecisionWizard onCancel={jest.fn()} />);
    expect(getByText('Basics')).toBeTruthy();
    expect(getAllByText('Options').length).toBeGreaterThanOrEqual(1);
    expect(getByText('Reflect')).toBeTruthy();
    expect(getByText('Review')).toBeTruthy();
  });

  test('calls onCancel when cancel pressed', () => {
    const onCancel = jest.fn();
    const { getByText } = render(<FullDecisionWizard onCancel={onCancel} />);
    fireEvent.press(getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  test('renders review step with Save & Analyze button', () => {
    const { getByText } = render(<FullDecisionWizard onCancel={jest.fn()} />);
    expect(getByText('Save & Analyze')).toBeTruthy();
  });

  test('does not call startNewDraft when draft already exists', () => {
    render(<FullDecisionWizard onCancel={jest.fn()} />);
    expect(mockStartNewDraft).not.toHaveBeenCalled();
  });

  test('saves valid full decision', async () => {
    mockSubmitDecision.mockResolvedValueOnce('decision-123');
    const { getByText } = render(<FullDecisionWizard onCancel={jest.fn()} />);
    fireEvent.press(getByText('Save & Analyze'));
    await waitFor(() => {
      expect(mockSubmitDecision).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Should I accept this new job offer?',
        category: 'career',
      }));
    });
  });

  test('saves category, context, options, answers', async () => {
    mockSubmitDecision.mockResolvedValueOnce('decision-123');
    const { getByText } = render(<FullDecisionWizard onCancel={jest.fn()} />);
    fireEvent.press(getByText('Save & Analyze'));
    await waitFor(() => {
      expect(mockSubmitDecision).toHaveBeenCalledWith(expect.objectContaining({
        category: 'career',
        context: expect.stringContaining('current company'),
        options: expect.arrayContaining([expect.objectContaining({ title: 'Accept the job offer' })]),
        answers: expect.objectContaining({ what_matters_most: 'Career growth' }),
      }));
    });
  });

  test('clears local state after success', async () => {
    mockSubmitDecision.mockResolvedValueOnce('decision-123');
    const { getByText } = render(<FullDecisionWizard onCancel={jest.fn()} />);
    fireEvent.press(getByText('Save & Analyze'));
    await waitFor(() => expect(mockClearDraft).toHaveBeenCalled());
  });

  test('shows error on failure', async () => {
    mockSubmitDecision.mockRejectedValueOnce(new Error('Network error'));
    const { getByText } = render(<FullDecisionWizard onCancel={jest.fn()} />);
    fireEvent.press(getByText('Save & Analyze'));
    await waitFor(() => {
      expect(getByText('Network error')).toBeTruthy();
    });
  });
});
