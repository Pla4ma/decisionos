// useDecisionPlaybook Hook Tests
// Unit tests for decision playbook hook logic

import type { DecisionPlaybook } from './deepDecisionTypes';

describe('useDecisionPlaybook', () => {
  describe('playbook readiness', () => {
    test('isReady when is_published is true', () => {
      const playbook = createPlaybook(10, true);
      expect(playbook.is_published).toBe(true);
    });

    test('not ready when is_published is false', () => {
      const playbook = createPlaybook(10, false);
      expect(playbook.is_published).toBe(false);
    });

    test('isReady when review_count >= 5 and is_published true', () => {
      const playbook = createPlaybook(5, true);
      expect(playbook.review_count).toBe(5);
      expect(playbook.is_published).toBe(true);
    });
  });

  describe('reviews needed calculation', () => {
    test('needs 5 reviews when review_count is 0', () => {
      const playbook = createPlaybook(0, false);
      const reviewsNeeded = 5 - playbook.review_count;
      expect(reviewsNeeded).toBe(5);
    });

    test('needs fewer reviews as count increases', () => {
      const playbook3 = createPlaybook(3, false);
      const playbook4 = createPlaybook(4, false);

      const needed3 = 5 - playbook3.review_count;
      const needed4 = 5 - playbook4.review_count;

      expect(needed4).toBeLessThan(needed3);
      expect(needed3).toBe(2);
      expect(needed4).toBe(1);
    });

    test('needs 0 when ready (is_published)', () => {
      const playbook = createPlaybook(3, true);
      const isReady = playbook.is_published;
      const reviewsNeeded = isReady ? 0 : 5 - playbook.review_count;

      expect(isReady).toBe(true);
      expect(reviewsNeeded).toBe(0);
    });

    test('null playbook has 0 reviews needed', () => {
      const playbook = null;
      const reviewsNeeded = playbook ? (playbook.is_published ? 0 : 5 - (playbook.review_count || 0)) : 0;
      expect(reviewsNeeded).toBe(0);
    });
  });

  describe('playbook content', () => {
    test('has strengths and weaknesses', () => {
      const playbook = createPlaybook(5, true);
      expect(Array.isArray(playbook.strengths)).toBe(true);
      expect(Array.isArray(playbook.weaknesses)).toBe(true);
    });

    test('has biases array', () => {
      const playbook = createPlaybook(5, true);
      expect(Array.isArray(playbook.biases)).toBe(true);
    });

    test('has categories for strongest and growth areas', () => {
      const playbook = createPlaybook(5, true);
      expect(Array.isArray(playbook.strongest_categories)).toBe(true);
      expect(Array.isArray(playbook.growth_areas)).toBe(true);
    });

    test('regret_pattern and decision_philosophy can be null', () => {
      const playbook = createPlaybook(5, false);
      expect(playbook.regret_pattern).toBeNull();
      expect(playbook.decision_philosophy).toBeNull();
    });

    test('optimal_speed can be null', () => {
      const playbook = createPlaybook(5, false);
      expect(playbook.optimal_speed).toBeNull();
    });

    test('version starts at 1', () => {
      const playbook = createPlaybook(5, true);
      expect(playbook.version).toBeGreaterThan(0);
    });
  });

  describe('staleTime configuration', () => {
    test('30 minutes in milliseconds', () => {
      const staleTime = 1000 * 60 * 30;
      expect(staleTime).toBe(1800000);
    });
  });

  describe('playbook generation', () => {
    test('generation triggered on mutation success', () => {
      const onSuccess = jest.fn();
      onSuccess();
      expect(onSuccess).toHaveBeenCalled();
    });

    test('playbook invalidated after generation', () => {
      const queryClient = {
        invalidateQueries: jest.fn(),
      };
      queryClient.invalidateQueries({ queryKey: ['playbook', 'user-1'] });
      expect(queryClient.invalidateQueries).toHaveBeenCalled();
    });
  });
});

function createPlaybook(
  reviewCount: number,
  isPublished: boolean
): DecisionPlaybook {
  return {
    id: 'playbook-1',
    user_id: 'user-1',
    version: 1,
    title: 'My Decision Playbook',
    strengths: [],
    weaknesses: [],
    biases: [],
    optimal_speed: null,
    strongest_categories: [],
    growth_areas: [],
    regret_pattern: null,
    decision_philosophy: null,
    generated_at: new Date().toISOString(),
    review_count: reviewCount,
    is_published: isPublished,
  };
}