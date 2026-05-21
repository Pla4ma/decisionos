// Entitlement Service Tests
// Unit tests for entitlement and usage limit checking

import {
  canPerformAnalysis,
  checkEntitlement,
  formatRemainingAnalyses,
} from './entitlementService';

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock revenueCatService
jest.mock('./revenueCatService', () => ({
  getCurrentTier: jest.fn(),
  hasEntitlement: jest.fn(),
}));

describe('entitlementService', () => {
  const { supabase } = require('@/lib/supabase');
  const { getCurrentTier } = require('./revenueCatService');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canPerformAnalysis', () => {
    test('plus users have 50 analyses per month', async () => {
      getCurrentTier.mockResolvedValue('plus');

      const result = await canPerformAnalysis('user-123');

      expect(result.tier).toBe('plus');
      expect(result.canAnalyze).toBe(true);
      expect(result.analysesRemaining).toBe(50);
      expect(result.analysesLimit).toBe(50);
    });

    test('pro users have 200 analyses per month', async () => {
      getCurrentTier.mockResolvedValue('pro');

      const result = await canPerformAnalysis('user-123');

      expect(result.tier).toBe('pro');
      expect(result.canAnalyze).toBe(true);
      expect(result.analysesRemaining).toBe(200);
      expect(result.analysesLimit).toBe(200);
    });

    test('free users checked against server', async () => {
      getCurrentTier.mockResolvedValue('free');

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ count: 0, error: null }),
      };
      supabase.from.mockReturnValue(mockQuery);

      const result = await canPerformAnalysis('user-123');

      expect(result.tier).toBe('free');
      expect(result.analysesLimit).toBe(3);
    });

    test('free user at limit cannot analyze', async () => {
      getCurrentTier.mockResolvedValue('free');

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ count: 3, error: null }),
      };
      supabase.from.mockReturnValue(mockQuery);

      const result = await canPerformAnalysis('user-123');

      expect(result.canAnalyze).toBe(false);
      expect(result.analysesRemaining).toBe(0);
    });

    test('graceful degradation on error', async () => {
      getCurrentTier.mockResolvedValue('free');

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        then: (_resolve: any, reject: any) => reject({ message: 'Error' }),
      };
      supabase.from.mockReturnValue(mockQuery);

      const result = await canPerformAnalysis('user-123');

      expect(result.canAnalyze).toBe(true);
    });
  });

  describe('checkEntitlement', () => {
    test('delegates to revenueCatService', async () => {
      const { hasEntitlement } = require('./revenueCatService');
      hasEntitlement.mockResolvedValue(true);

      const result = await checkEntitlement('plus');

      expect(hasEntitlement).toHaveBeenCalledWith('plus');
      expect(result).toBe(true);
    });
  });

  describe('formatRemainingAnalyses', () => {
    test('returns Unlimited for infinity', () => {
      const result = formatRemainingAnalyses(Infinity);
      expect(result).toBe('Unlimited');
    });

    test('returns count for finite remaining', () => {
      const result = formatRemainingAnalyses(2);
      expect(result).toBe('2 remaining this month');
    });

    test('returns 1 remaining correctly', () => {
      const result = formatRemainingAnalyses(1);
      expect(result).toBe('1 remaining this month');
    });

    test('returns 0 remaining correctly', () => {
      const result = formatRemainingAnalyses(0);
      expect(result).toBe('0 remaining this month');
    });
  });

  describe('canPerformAnalysis period boundaries', () => {
    function makeMockQuery(countVal: number) {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ count: countVal, error: null }),
      };
    }

    test('sets period start to beginning of month', async () => {
      getCurrentTier.mockResolvedValue('free');
      supabase.from.mockReturnValue(makeMockQuery(0));

      const result = await canPerformAnalysis('user-123');

      const now = new Date();
      const expectedStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const actualStart = new Date(result.periodStart);

      expect(actualStart.getFullYear()).toBe(expectedStart.getFullYear());
      expect(actualStart.getMonth()).toBe(expectedStart.getMonth());
      expect(actualStart.getDate()).toBe(1);
    });

    test('sets period end to end of month', async () => {
      getCurrentTier.mockResolvedValue('free');
      supabase.from.mockReturnValue(makeMockQuery(0));

      const result = await canPerformAnalysis('user-123');

      const now = new Date();
      const expectedEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const actualEnd = new Date(result.periodEnd);

      expect(actualEnd.getFullYear()).toBe(expectedEnd.getFullYear());
      expect(actualEnd.getMonth()).toBe(expectedEnd.getMonth());
      expect(actualEnd.getDate()).toBe(expectedEnd.getDate());
    });
  });
});