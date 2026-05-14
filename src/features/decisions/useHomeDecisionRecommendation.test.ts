// useHomeDecisionRecommendation Tests
// Unit tests for home screen recommendation logic

import {
  generateRecommendation,
  type HomeRecommendation,
} from './useHomeDecisionRecommendation';
import type { Decision, DecisionStatus } from './decisionTypes';

describe('useHomeDecisionRecommendation', () => {
  describe('generateRecommendation', () => {
    test('returns review_due when review is scheduled', () => {
      const decisions: Decision[] = [
        {
          id: '1',
          user_id: 'user-1',
          title: 'Should I move?',
          context: null,
          category: 'moving',
          status: 'review_scheduled',
          importance: 8,
          urgency: 6,
          created_at: '',
          updated_at: '',
          scheduled_review_at: new Date().toISOString(),
          completed_at: null,
        },
      ];

      const counts = createEmptyCounts();
      const result = generateRecommendation(decisions, counts);

      expect(result?.type).toBe('review_due');
      expect(result?.decisionId).toBe('1');
      expect(result?.decisionTitle).toBe('Should I move?');
    });

    test('returns add_options when draft exists', () => {
      const decisions: Decision[] = [
        {
          id: '1',
          user_id: 'user-1',
          title: 'Job decision',
          context: null,
          category: 'career',
          status: 'draft',
          importance: 7,
          urgency: 5,
          created_at: '',
          updated_at: '',
          scheduled_review_at: null,
          completed_at: null,
        },
      ];

      const counts = createEmptyCounts();
      const result = generateRecommendation(decisions, counts);

      expect(result?.type).toBe('add_options');
      expect(result?.decisionId).toBe('1');
    });

    test('returns answer_questions when questions status exists', () => {
      const decisions: Decision[] = [
        {
          id: '1',
          user_id: 'user-1',
          title: 'Career move',
          context: null,
          category: 'career',
          status: 'questions',
          importance: 8,
          urgency: 6,
          created_at: '',
          updated_at: '',
          scheduled_review_at: null,
          completed_at: null,
        },
      ];

      const counts = createEmptyCounts();
      const result = generateRecommendation(decisions, counts);

      expect(result?.type).toBe('answer_questions');
      expect(result?.decisionId).toBe('1');
    });

    test('returns run_analysis when ready for analysis', () => {
      const decisions: Decision[] = [
        {
          id: '1',
          user_id: 'user-1',
          title: 'Investment choice',
          context: null,
          category: 'money',
          status: 'ready_for_analysis',
          importance: 9,
          urgency: 7,
          created_at: '',
          updated_at: '',
          scheduled_review_at: null,
          completed_at: null,
        },
      ];

      const counts = createEmptyCounts();
      const result = generateRecommendation(decisions, counts);

      expect(result?.type).toBe('run_analysis');
      expect(result?.decisionId).toBe('1');
    });

    test('returns choose_option when analyzed but not chosen', () => {
      const decisions: Decision[] = [
        {
          id: '1',
          user_id: 'user-1',
          title: 'Business decision',
          context: null,
          category: 'business',
          status: 'analyzed',
          importance: 8,
          urgency: 5,
          created_at: '',
          updated_at: '',
          scheduled_review_at: null,
          completed_at: null,
        },
      ];

      const counts = createEmptyCounts();
      const result = generateRecommendation(decisions, counts);

      expect(result?.type).toBe('choose_option');
      expect(result?.decisionId).toBe('1');
    });

    test('returns create_first when no decisions exist', () => {
      const decisions: Decision[] = [];
      const counts = createEmptyCounts();

      const result = generateRecommendation(decisions, counts);

      expect(result?.type).toBe('create_first');
      expect(result?.title).toContain('first decision');
    });

    test('returns null when all decisions are completed', () => {
      const decisions: Decision[] = [
        {
          id: '1',
          user_id: 'user-1',
          title: 'Old decision',
          context: null,
          category: 'career',
          status: 'reviewed',
          importance: 5,
          urgency: 5,
          created_at: '',
          updated_at: '',
          scheduled_review_at: null,
          completed_at: new Date().toISOString(),
        },
      ];

      const counts = createEmptyCounts();
      const result = generateRecommendation(decisions, counts);

      expect(result).toBeNull();
    });

    test('priority: review_scheduled before draft', () => {
      const decisions: Decision[] = [
        {
          id: '1',
          user_id: 'user-1',
          title: 'Draft decision',
          context: null,
          category: 'career',
          status: 'draft',
          importance: 5,
          urgency: 5,
          created_at: '',
          updated_at: '',
          scheduled_review_at: null,
          completed_at: null,
        },
        {
          id: '2',
          user_id: 'user-1',
          title: 'Review due',
          context: null,
          category: 'career',
          status: 'review_scheduled',
          importance: 5,
          urgency: 5,
          created_at: '',
          updated_at: '',
          scheduled_review_at: new Date().toISOString(),
          completed_at: null,
        },
      ];

      const counts = createEmptyCounts();
      const result = generateRecommendation(decisions, counts);

      expect(result?.type).toBe('review_due');
      expect(result?.decisionId).toBe('2');
    });

    test('priority: draft before questions', () => {
      const decisions: Decision[] = [
        {
          id: '1',
          user_id: 'user-1',
          title: 'Questions pending',
          context: null,
          category: 'career',
          status: 'questions',
          importance: 5,
          urgency: 5,
          created_at: '',
          updated_at: '',
          scheduled_review_at: null,
          completed_at: null,
        },
        {
          id: '2',
          user_id: 'user-1',
          title: 'Draft decision',
          context: null,
          category: 'career',
          status: 'draft',
          importance: 5,
          urgency: 5,
          created_at: '',
          updated_at: '',
          scheduled_review_at: null,
          completed_at: null,
        },
      ];

      const counts = createEmptyCounts();
      const result = generateRecommendation(decisions, counts);

      expect(result?.type).toBe('add_options');
      expect(result?.decisionId).toBe('2');
    });

    test('returns first decision in priority order', () => {
      const decisions: Decision[] = [
        {
          id: '3',
          user_id: 'user-1',
          title: 'Ready for analysis',
          context: null,
          category: 'career',
          status: 'ready_for_analysis',
          importance: 5,
          urgency: 5,
          created_at: '',
          updated_at: '',
          scheduled_review_at: null,
          completed_at: null,
        },
        {
          id: '2',
          user_id: 'user-1',
          title: 'Questions pending',
          context: null,
          category: 'career',
          status: 'questions',
          importance: 5,
          urgency: 5,
          created_at: '',
          updated_at: '',
          scheduled_review_at: null,
          completed_at: null,
        },
        {
          id: '1',
          user_id: 'user-1',
          title: 'Draft decision',
          context: null,
          category: 'career',
          status: 'draft',
          importance: 5,
          urgency: 5,
          created_at: '',
          updated_at: '',
          scheduled_review_at: null,
          completed_at: null,
        },
      ];

      const counts = createEmptyCounts();
      const result = generateRecommendation(decisions, counts);

      expect(result?.type).toBe('answer_questions');
      expect(result?.decisionId).toBe('2');
    });
  });

  describe('recommendation types', () => {
    test('all recommendation types have titles', () => {
      const types: HomeRecommendation['type'][] = [
        'create_first',
        'add_options',
        'answer_questions',
        'run_analysis',
        'choose_option',
        'review_due',
      ];

      types.forEach((type) => {
        const decisions: Decision[] = [
          {
            id: '1',
            user_id: 'user-1',
            title: 'Test',
            context: null,
            category: 'career',
            status: type === 'create_first' ? 'draft' : type === 'add_options' ? 'draft' : type === 'answer_questions' ? 'questions' : type === 'run_analysis' ? 'ready_for_analysis' : type === 'choose_option' ? 'analyzed' : 'review_scheduled',
            importance: 5,
            urgency: 5,
            created_at: '',
            updated_at: '',
            scheduled_review_at: type === 'review_due' ? new Date().toISOString() : null,
            completed_at: null,
          },
        ];

        const counts = createEmptyCounts();
        const result = type === 'create_first'
          ? generateRecommendation([], counts)
          : generateRecommendation(
              decisions.filter(d => d.status !== 'draft'),
              counts
            );

        expect(result?.title).toBeTruthy();
      });
    });

    test('recommendations have descriptions', () => {
      const decisions: Decision[] = [
        {
          id: '1',
          user_id: 'user-1',
          title: 'Test',
          context: null,
          category: 'career',
          status: 'draft',
          importance: 5,
          urgency: 5,
          created_at: '',
          updated_at: '',
          scheduled_review_at: null,
          completed_at: null,
        },
      ];

      const counts = createEmptyCounts();
      const result = generateRecommendation(decisions, counts);

      expect(result?.description).toBeTruthy();
    });
  });
});

function createEmptyCounts(): Record<DecisionStatus, number> {
  return {
    draft: 0,
    questions: 0,
    ready_for_analysis: 0,
    analyzed: 0,
    chosen: 0,
    review_scheduled: 0,
    reviewed: 0,
  };
}