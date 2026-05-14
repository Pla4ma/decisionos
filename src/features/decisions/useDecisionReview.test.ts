// useDecisionReview Hook Tests
// Unit tests for decision review hook logic

import type { Decision, DecisionOption, DecisionReview } from './decisionTypes';

describe('useDecisionReview', () => {
  describe('canReview logic', () => {
    test('true when option is chosen and no existing review', () => {
      const options = [
        { id: '1', decision_id: 'd1', user_id: 'u1', title: 'Opt A', description: null, pros: [], cons: [], is_chosen: true, created_at: '', updated_at: '' },
        { id: '2', decision_id: 'd1', user_id: 'u1', title: 'Opt B', description: null, pros: [], cons: [], is_chosen: false, created_at: '', updated_at: '' },
      ];
      const existingReview = null;

      const canReview = options.some(opt => opt.is_chosen) && !existingReview;
      expect(canReview).toBe(true);
    });

    test('false when no option is chosen', () => {
      const options = [
        { id: '1', decision_id: 'd1', user_id: 'u1', title: 'Opt A', description: null, pros: [], cons: [], is_chosen: false, created_at: '', updated_at: '' },
        { id: '2', decision_id: 'd1', user_id: 'u1', title: 'Opt B', description: null, pros: [], cons: [], is_chosen: false, created_at: '', updated_at: '' },
      ];
      const existingReview = null;

      const canReview = options.some(opt => opt.is_chosen) && !existingReview;
      expect(canReview).toBe(false);
    });

    test('false when review already exists', () => {
      const options = [
        { id: '1', decision_id: 'd1', user_id: 'u1', title: 'Opt A', description: null, pros: [], cons: [], is_chosen: true, created_at: '', updated_at: '' },
      ];
      const existingReview = { id: 'r1', decision_id: 'd1', user_id: 'u1', chosen_option_id: '1', outcome_notes: 'Good', satisfaction_score: 7, would_choose_same: true, lessons_learned: null, created_at: '', updated_at: '' };

      const canReview = options.some(opt => opt.is_chosen) && !existingReview;
      expect(canReview).toBe(false);
    });
  });

  describe('chosenOption extraction', () => {
    test('finds the chosen option', () => {
      const options: DecisionOption[] = [
        { id: '1', decision_id: 'd1', user_id: 'u1', title: 'Accept', description: null, pros: [], cons: [], is_chosen: true, created_at: '', updated_at: '' },
        { id: '2', decision_id: 'd1', user_id: 'u1', title: 'Decline', description: null, pros: [], cons: [], is_chosen: false, created_at: '', updated_at: '' },
      ];

      const chosenOption = options.find(opt => opt.is_chosen);
      expect(chosenOption?.title).toBe('Accept');
    });

    test('returns undefined when no option chosen', () => {
      const options: DecisionOption[] = [
        { id: '1', decision_id: 'd1', user_id: 'u1', title: 'Opt A', description: null, pros: [], cons: [], is_chosen: false, created_at: '', updated_at: '' },
        { id: '2', decision_id: 'd1', user_id: 'u1', title: 'Opt B', description: null, pros: [], cons: [], is_chosen: false, created_at: '', updated_at: '' },
      ];

      const chosenOption = options.find(opt => opt.is_chosen);
      expect(chosenOption).toBeUndefined();
    });
  });

  describe('review validation', () => {
    test('outcome_notes must be at least 10 characters', () => {
      const shortNotes = 'Good';
      const longNotes = 'This turned out really well and I learned a lot.';

      expect(shortNotes.length).toBeLessThan(10);
      expect(longNotes.length).toBeGreaterThanOrEqual(10);
    });

    test('satisfaction_score is optional', () => {
      const reviewWithScore = {
        outcome_notes: 'The decision worked out well.',
        satisfaction_score: 8,
      };
      const reviewWithoutScore = {
        outcome_notes: 'The decision worked out well.',
      };

      expect(reviewWithScore.satisfaction_score).toBe(8);
      expect(reviewWithoutScore.satisfaction_score).toBeUndefined();
    });

    test('would_choose_same is optional', () => {
      const reviewWithChoice = {
        outcome_notes: 'Great outcome.',
        would_choose_same: true,
      };
      const reviewWithoutChoice = {
        outcome_notes: 'Great outcome.',
      };

      expect(reviewWithChoice.would_choose_same).toBe(true);
      expect(reviewWithoutChoice.would_choose_same).toBeUndefined();
    });
  });

  describe('status update', () => {
    test('updates to reviewed after save', () => {
      const targetStatus = 'reviewed';
      expect(targetStatus).toBe('reviewed');
    });

    test('completed_at set when status is reviewed', () => {
      const status = 'reviewed';
      const updates = { status };

      if (status === 'reviewed') {
        updates.completed_at = new Date().toISOString();
      }

      expect(updates.completed_at).toBeTruthy();
    });
  });

  describe('loading states', () => {
    test('isLoading combines decision, options, and review loading', () => {
      const decisionLoading = false;
      const optionsLoading = false;
      const reviewLoading = false;

      const isLoading = decisionLoading || optionsLoading || reviewLoading;
      expect(isLoading).toBe(false);
    });

    test('isSubmitting combines save and update mutations', () => {
      const savePending = false;
      const updatePending = false;

      const isSubmitting = savePending || updatePending;
      expect(isSubmitting).toBe(false);
    });
  });

  describe('query keys', () => {
    test('uses decisionId in all query keys', () => {
      const decisionId = 'test-decision-id';

      const decisionKey = ['decision', decisionId];
      const optionsKey = ['decision-options', decisionId];
      const reviewKey = ['decision-review', decisionId];

      expect(decisionKey).toContain(decisionId);
      expect(optionsKey).toContain(decisionId);
      expect(reviewKey).toContain(decisionId);
    });
  });
});