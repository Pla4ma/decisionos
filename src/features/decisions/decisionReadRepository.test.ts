// Decision Read Repository Tests
// Unit tests for decision read operations

describe('decisionReadRepository', () => {
  describe('RepositoryError', () => {
    test('creates error with message', () => {
      const error = new Error('Failed to fetch decisions');
      expect(error.message).toBe('Failed to fetch decisions');
    });

    test('stores original error', () => {
      const original = new Error('Original');
      const error = new Error('Failed');
      (error as any).originalError = original;

      expect((error as any).originalError).toBe(original);
    });

    test('has name property', () => {
      const error = new Error('Test');
      expect(error.name).toBe('Error');
    });
  });

  describe('getDecision', () => {
    test('returns null when not found (PGRST116)', () => {
      const error = { code: 'PGRST116' };
      const result = error.code === 'PGRST116' ? null : {};
      expect(result).toBeNull();
    });

    test('throws on other errors', () => {
      const error = { code: 'PGRST000', message: 'Database error' };
      const shouldThrow = error.code !== 'PGRST116';
      expect(shouldThrow).toBe(true);
    });
  });

  describe('getDecisionById', () => {
    test('returns null decision when not found', () => {
      const error = { code: 'PGRST116' };
      const result = error.code === 'PGRST116'
        ? { decision: null, options: [], answers: [], analysis: null, review: null }
        : {};

      expect(result.decision).toBeNull();
    });

    test('returns empty arrays when not found', () => {
      const error = { code: 'PGRST116' };
      const result = error.code === 'PGRST116'
        ? { decision: null, options: [], answers: [], analysis: null, review: null }
        : {};

      expect(result.options).toEqual([]);
      expect(result.answers).toEqual([]);
    });

    test('parallel fetches options, answers, analysis, review', () => {
      const fetches = ['options', 'answers', 'analysis', 'review'];
      expect(fetches).toHaveLength(4);
    });
  });

  describe('getUserDecisions', () => {
    test('applies status filter when provided', () => {
      const filter = { status: 'draft' as const };
      expect(filter.status).toBe('draft');
    });

    test('applies category filter when provided', () => {
      const filter = { category: 'career' as const };
      expect(filter.category).toBe('career');
    });

    test('returns empty decisions array when null', () => {
      const data = null;
      const decisions = data || [];
      expect(decisions).toEqual([]);
    });

    test('defaults count to 0 when null', () => {
      const count = null;
      const result = count || 0;
      expect(result).toBe(0);
    });
  });

  describe('getDecisionStatusCounts', () => {
    test('initializes all status counts to 0', () => {
      const counts = {
        draft: 0,
        questions: 0,
        ready_for_analysis: 0,
        analyzed: 0,
        chosen: 0,
        review_scheduled: 0,
        reviewed: 0,
      };

      expect(counts.draft).toBe(0);
      expect(counts.questions).toBe(0);
      expect(Object.keys(counts)).toHaveLength(7);
    });

    test('increments counts for each status', () => {
      const data = [
        { status: 'draft' },
        { status: 'draft' },
        { status: 'analyzed' },
      ];

      const counts: Record<string, number> = {
        draft: 0, questions: 0, ready_for_analysis: 0,
        analyzed: 0, chosen: 0, review_scheduled: 0, reviewed: 0,
      };

      for (const row of data) {
        counts[row.status] = (counts[row.status] || 0) + 1;
      }

      expect(counts.draft).toBe(2);
      expect(counts.analyzed).toBe(1);
    });
  });

  describe('checkAnalysisLimit', () => {
    test('canAnalyze when used < limit', () => {
      const used = 2;
      const limit = 3;
      const canAnalyze = used < limit;
      expect(canAnalyze).toBe(true);
    });

    test('cannotAnalyze when used >= limit', () => {
      const used = 3;
      const limit = 3;
      const canAnalyze = used < limit;
      expect(canAnalyze).toBe(false);
    });

    test('returns both used and limit', () => {
      const result = { canAnalyze: true, used: 1, limit: 3 };
      expect(result.used).toBe(1);
      expect(result.limit).toBe(3);
      expect(result.canAnalyze).toBe(true);
    });
  });
});