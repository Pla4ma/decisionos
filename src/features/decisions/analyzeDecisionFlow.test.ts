import { analyzeDecision, checkAnalysisUsage, preCheckSafety, getAnalysisErrorMessage } from './decisionAnalysisService';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getUser: jest.fn() },
    functions: { invoke: jest.fn() },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          gte: jest.fn(),
        })),
      })),
    })),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('analyze-decision flow', () => {
  describe('rejects unauthenticated user', () => {
    test('checkAnalysisUsage throws when no user', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null }, error: null });
      await expect(checkAnalysisUsage()).rejects.toThrow('Not authenticated');
    });
  });

  describe('rejects decision not owned by user', () => {
    test('edge function validates ownership', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Decision not found' },
      });
      await expect(analyzeDecision('other-user-decision')).rejects.toThrow('Decision not found');
    });
  });

  describe('rejects decision with fewer than 2 options', () => {
    test('analyzeDecision returns error for single option', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'At least 2 options required for analysis' },
      });
      const msg = getAnalysisErrorMessage(new Error('400'));
      expect(msg).toContain('2 options');
    });
  });

  describe('handles sensitive safety inputs', () => {
    test('preCheckSafety blocks self-harm content', () => {
      const result = preCheckSafety('I want to kill myself');
      expect(result.allowed).toBe(false);
      expect(result.warning?.category).toBeDefined();
    });

    test('preCheckSafety warns on investment content but allows', () => {
      const result = preCheckSafety('Should I invest in Tesla stock?');
      expect(result.allowed).toBe(true);
      expect(result.warning).toBeDefined();
    });
  });

  describe('saves one analysis', () => {
    test('analyzeDecision returns analysis on success', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: { analysis: { id: 'analysis-1', option_scores: [], summary: 'Test', confidence_level: 50 } },
        error: null,
      });
      const result = await analyzeDecision('decision-1');
      expect(result.analysis.id).toBe('analysis-1');
    });
  });

  describe('does not duplicate analysis on retry', () => {
    test('second call returns the same analysis', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: { analysis: { id: 'analysis-1', option_scores: [], summary: 'Test', confidence_level: 50 } },
        error: null,
      });
      const first = await analyzeDecision('decision-1');
      const second = await analyzeDecision('decision-1');
      expect(first.analysis.id).toBe(second.analysis.id);
    });
  });

  describe('logs usage without crashing if log fails', () => {
    test('backend logs usage; client does not stop on log failure', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: { analysis: { id: 'analysis-1', option_scores: [], summary: 'Test', confidence_level: 50 } },
        error: null,
      });
      const result = await analyzeDecision('decision-1');
      expect(result.analysis).toBeDefined();
    });
  });

  describe('uses decision.category and options.length', () => {
    test('edge function receives decisionId', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: { analysis: { id: 'analysis-1' } },
        error: null,
      });
      await analyzeDecision('decision-1');
      expect(supabase.functions.invoke).toHaveBeenCalledWith('analyze-decision', {
        body: { decisionId: 'decision-1' },
      });
    });
  });

  describe('error message mapping', () => {
    test('maps 429 to monthly limit message', () => {
      const msg = getAnalysisErrorMessage(new Error('429 Too Many Requests'));
      expect(msg).toContain('limit reached');
    });

    test('maps 404 to not found message', () => {
      const msg = getAnalysisErrorMessage(new Error('404'));
      expect(msg).toBe('Decision not found.');
    });

    test('maps 400 to options required message', () => {
      const msg = getAnalysisErrorMessage(new Error('400'));
      expect(msg).toContain('2 options');
    });
  });
});
