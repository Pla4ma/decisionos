// Decision Draft Store
// Holds temporary form state across multi-step create flow
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DecisionCategory, CreateOptionInput } from '@/features/decisions/decisionTypes';

export interface DraftDecision {
  title: string;
  category: DecisionCategory | null;
  context: string;
  desiredOutcome: string;
  biggestFear: string;
  inactionOutcome: string;
  importance: number;
  urgency: number;
  options: CreateOptionInput[];
  answers: Record<string, string>;
}

interface DecisionDraftState {
  draft: DraftDecision | null;
  currentStep: number;
  isDirty: boolean;
}

interface DecisionDraftActions {
  startNewDraft: () => void;
  updateDraft: (updates: Partial<DraftDecision>) => void;
  addOption: (option: CreateOptionInput) => void;
  removeOption: (index: number) => void;
  updateOption: (index: number, updates: Partial<CreateOptionInput>) => void;
  setAnswer: (questionKey: string, answer: string) => void;
  setStep: (step: number) => void;
  clearDraft: () => void;
  markClean: () => void;
}

const defaultDraft: DraftDecision = {
  title: '',
  category: null,
  context: '',
  desiredOutcome: '',
  biggestFear: '',
  inactionOutcome: '',
  importance: 5,
  urgency: 5,
  options: [],
  answers: {},
};

export const useDecisionDraftStore = create<DecisionDraftState & DecisionDraftActions>()(
  persist(
    (set, get) => ({
      draft: null,
      currentStep: 0,
      isDirty: false,

      startNewDraft: () => {
        set({ draft: { ...defaultDraft }, currentStep: 0, isDirty: false });
      },

      updateDraft: (updates) => {
        const { draft } = get();
        if (!draft) return;
        set({ draft: { ...draft, ...updates }, isDirty: true });
      },

      addOption: (option) => {
        const { draft } = get();
        if (!draft) return;
        if (draft.options.length >= 5) return; // Max 5 options
        set({
          draft: { ...draft, options: [...draft.options, option] },
          isDirty: true,
        });
      },

      removeOption: (index) => {
        const { draft } = get();
        if (!draft) return;
        set({
          draft: {
            ...draft,
            options: draft.options.filter((_, i) => i !== index),
          },
          isDirty: true,
        });
      },

      updateOption: (index, updates) => {
        const { draft } = get();
        if (!draft) return;
        const newOptions = [...draft.options];
        newOptions[index] = { ...newOptions[index], ...updates };
        set({ draft: { ...draft, options: newOptions }, isDirty: true });
      },

      setAnswer: (questionKey, answer) => {
        const { draft } = get();
        if (!draft) return;
        set({
          draft: {
            ...draft,
            answers: { ...draft.answers, [questionKey]: answer },
          },
          isDirty: true,
        });
      },

      setStep: (step) => set({ currentStep: step }),

      clearDraft: () => set({ draft: null, currentStep: 0, isDirty: false }),

      markClean: () => set({ isDirty: false }),
    }),
    {
      name: 'decision-draft-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
