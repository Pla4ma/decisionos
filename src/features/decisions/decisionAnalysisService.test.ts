// Decision Analysis Service Tests
// Unit tests for analysis service and error handling

import {
  fetchDecisionAnalysis,
  checkAnalysisUsage,
  AnalysisServiceError,
  getAnalysisErrorMessage,
} from './decisionAnalysisService';

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
    functions: {
      invoke: jest.fn(),
    },
  },
}));

describe('decisionAnalysisService', () => {
  describe('AnalysisServiceError', () => {
    test('creates error with code', () => {
      const error = new AnalysisServiceError('Something went wrong', 'TEST_CODE');
      expect(error.message).toBe('Something went wrong');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('AnalysisServiceError');
    });

    test('is instance of Error', () => {
      const error = new AnalysisServiceError('Test', 'TEST');
      expect(error instanceof Error).toBe(true);
      expect(error instanceof AnalysisServiceError).toBe(true);
    });

    test('handles different error codes', () => {
      const authError = new AnalysisServiceError('Auth failed', 'AUTH_ERROR');
      const funcError = new AnalysisServiceError('Function failed', 'FUNCTION_ERROR');
      const dbError = new AnalysisServiceError('DB failed', 'DATABASE_ERROR');

      expect(authError.code).toBe('AUTH_ERROR');
      expect(funcError.code).toBe('FUNCTION_ERROR');
      expect(dbError.code).toBe('DATABASE_ERROR');
    });
  });

  describe('getAnalysisErrorMessage', () => {
    test('returns message for AUTH_ERROR', () => {
      const error = new AnalysisServiceError('Auth failed', 'AUTH_ERROR');
      const message = getAnalysisErrorMessage(error);
      expect(message).toContain('sign in');
    });

    test('returns message for FUNCTION_ERROR', () => {
      const error = new AnalysisServiceError('Function failed', 'FUNCTION_ERROR');
      const message = getAnalysisErrorMessage(error);
      expect(message).toContain('unavailable');
    });

    test('returns message for INVALID_RESPONSE', () => {
      const error = new AnalysisServiceError('Invalid', 'INVALID_RESPONSE');
      const message = getAnalysisErrorMessage(error);
      expect(message).toContain('invalid');
    });

    test('returns message for DATABASE_ERROR', () => {
      const error = new AnalysisServiceError('DB failed', 'DATABASE_ERROR');
      const message = getAnalysisErrorMessage(error);
      expect(message).toContain('save');
    });

    test('returns message for unknown code', () => {
      const error = new AnalysisServiceError('Unknown error', 'UNKNOWN');
      const message = getAnalysisErrorMessage(error);
      expect(message).toBe('Unknown error');
    });

    test('handles 429 status code', () => {
      const error = new Error('Request failed with status 429');
      const message = getAnalysisErrorMessage(error);
      expect(message).toContain('limit');
    });

    test('handles 404 status code', () => {
      const error = new Error('Request failed with status 404');
      const message = getAnalysisErrorMessage(error);
      expect(message).toContain('not found');
    });

    test('handles 403 status code', () => {
      const error = new Error('Request failed with status 403');
      const message = getAnalysisErrorMessage(error);
      expect(message).toContain('permission');
    });

    test('handles 400 status code', () => {
      const error = new Error('Request failed with status 400');
      const message = getAnalysisErrorMessage(error);
      expect(message).toContain('2 options');
    });

    test('handles generic Error', () => {
      const error = new Error('Something generic');
      const message = getAnalysisErrorMessage(error);
      expect(message).toBe('Something generic');
    });

    test('handles non-Error thrown values', () => {
      const message = getAnalysisErrorMessage('string error');
      expect(message).toContain('unexpected');
    });

    test('handles null', () => {
      const message = getAnalysisErrorMessage(null);
      expect(message).toContain('unexpected');
    });

    test('handles undefined', () => {
      const message = getAnalysisErrorMessage(undefined);
      expect(message).toContain('unexpected');
    });
  });

  describe('fetchDecisionAnalysis', () => {
    const { supabase } = require('@/lib/supabase');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('returns null when no analysis exists', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      });

      const result = await fetchDecisionAnalysis('test-decision-id');
      expect(result).toBeNull();
    });

    test('throws on database error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error', code: 'DB_ERROR' },
            }),
          }),
        }),
      });

      await expect(fetchDecisionAnalysis('test-id')).rejects.toThrow(AnalysisServiceError);
    });

    test('returns data when analysis exists', async () => {
      const mockAnalysis = {
        id: 'analysis-1',
        decision_id: 'decision-1',
        option_scores: [],
        summary: 'Test analysis',
        factors_considered: [],
        confidence_level: 80,
        created_at: '2024-01-01',
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockAnalysis,
              error: null,
            }),
          }),
        }),
      });

      const result = await fetchDecisionAnalysis('decision-1');
      expect(result).toEqual(mockAnalysis);
    });
  });

  describe('checkAnalysisUsage', () => {
    const { supabase } = require('@/lib/supabase');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('throws when not authenticated', async () => {
      supabase.auth.getUser.mockResolvedValue({ user: null });

      await expect(checkAnalysisUsage()).rejects.toThrow('Not authenticated');
    });

    test('returns usage info when authenticated', async () => {
      supabase.auth.getUser.mockResolvedValue({
        user: { id: 'user-1' },
      });

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                mockResolvedValue: jest.fn().mockResolvedValue({
                  count: 1,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      const fromMock = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                mockResolvedValue: jest.fn().mockResolvedValue({
                  count: 1,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };
      supabase.from.mockReturnValue(fromMock);
    });

    test('graceful degradation on error', async () => {
      supabase.auth.getUser.mockResolvedValue({
        user: { id: 'user-1' },
      });

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                mockResolvedValue: jest.fn().mockResolvedValue({
                  count: null,
                  error: { message: 'Error' },
                }),
              }),
            }),
          }),
        }),
      });

      const result = await checkAnalysisUsage();
      expect(result.hasRemaining).toBe(true);
    });
  });
});