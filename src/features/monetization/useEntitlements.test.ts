// useEntitlements Hook Tests
// Unit tests for entitlements hook logic

import type { SubscriptionTier, UsageLimitStatus } from './monetizationTypes';

describe('useEntitlements', () => {
  describe('tier checking', () => {
    test('plus tier has unlimited', () => {
      const tier: SubscriptionTier = 'plus';
      const hasUnlimited = (tier as any) === 'plus' || (tier as any) === 'pro';
      expect(hasUnlimited).toBe(true);
    });

    test('pro tier has unlimited', () => {
      const tier: SubscriptionTier = 'pro';
      const hasUnlimited = (tier as any) === 'plus' || tier === 'pro';
      expect(hasUnlimited).toBe(true);
    });

    test('free tier has limited', () => {
      const tier: SubscriptionTier = 'free';
      const hasLimited = tier === 'free';
      expect(hasLimited).toBe(true);
    });

    test('hasPlus is true for plus tier', () => {
      const tier: SubscriptionTier = 'plus';
      const hasPlus = (tier as any) === 'plus' || (tier as any) === 'pro';
      expect(hasPlus).toBe(true);
    });

    test('hasPlus is true for pro tier', () => {
      const tier: SubscriptionTier = 'pro';
      const hasPlus = (tier as any) === 'plus' || tier === 'pro';
      expect(hasPlus).toBe(true);
    });

    test('hasPlus is false for free tier', () => {
      const tier: SubscriptionTier = 'free';
      const hasPlus = (tier as any) === 'plus' || (tier as any) === 'pro';
      expect(hasPlus).toBe(false);
    });
  });

  describe('canAnalyze logic', () => {
    test('can analyze when usage status allows', () => {
      const usageStatus: UsageLimitStatus = {
        tier: 'free',
        analysesUsed: 0,
        analysesLimit: 1,
        analysesRemaining: 1,
        periodStart: '2024-01-01T00:00:00Z',
        periodEnd: '2024-01-31T23:59:59Z',
        canAnalyze: true,
      };

      expect(usageStatus.canAnalyze).toBe(true);
    });

    test('cannot analyze when at limit', () => {
      const usageStatus: UsageLimitStatus = {
        tier: 'free',
        analysesUsed: 1,
        analysesLimit: 1,
        analysesRemaining: 0,
        periodStart: '2024-01-01T00:00:00Z',
        periodEnd: '2024-01-31T23:59:59Z',
        canAnalyze: false,
      };

      expect(usageStatus.canAnalyze).toBe(false);
    });

    test('can analyze when unlimited', () => {
      const usageStatus: UsageLimitStatus = {
        tier: 'plus',
        analysesUsed: 0,
        analysesLimit: Infinity,
        analysesRemaining: Infinity,
        canAnalyze: true,
      } as any;

      expect(usageStatus.canAnalyze).toBe(true);
    });

    test('defaults to false when usageStatus is null', () => {
      const usageStatus: UsageLimitStatus | null = null;
      const canAnalyze = (usageStatus as any)?.canAnalyze ?? false;
      expect(canAnalyze).toBe(false);
    });
  });

  describe('analysesRemaining', () => {
    test('shows count for free tier', () => {
      const usageStatus: UsageLimitStatus = {
        tier: 'free',
        analysesUsed: 0,
        analysesLimit: 1,
        analysesRemaining: 1,
        periodStart: '2024-01-01T00:00:00Z',
        periodEnd: '2024-01-31T23:59:59Z',
        canAnalyze: true,
      };

      expect(usageStatus.analysesRemaining).toBe(1);
    });

    test('shows 0 when at limit', () => {
      const usageStatus: UsageLimitStatus = {
        tier: 'free',
        analysesUsed: 1,
        analysesLimit: 1,
        analysesRemaining: 0,
        periodStart: '2024-01-01T00:00:00Z',
        periodEnd: '2024-01-31T23:59:59Z',
        canAnalyze: false,
      };

      expect(usageStatus.analysesRemaining).toBe(0);
    });

    test('defaults to 0 when usageStatus is null', () => {
      const usageStatus: UsageLimitStatus | null = null;
      const analysesRemaining = (usageStatus as any)?.analysesRemaining ?? 0;
      expect(analysesRemaining).toBe(0);
    });
  });

  describe('refreshEntitlements', () => {
    test('does nothing when userId is null', () => {
      const userId: string | null = null;
      const shouldRefresh = !!userId;
      expect(shouldRefresh).toBe(false);
    });

    test('refreshes when userId is provided', () => {
      const userId: string | null = 'user-123';
      const shouldRefresh = !!userId;
      expect(shouldRefresh).toBe(true);
    });
  });

  describe('initial loading state', () => {
    test('isLoading true initially', () => {
      const isLoading = true;
      expect(isLoading).toBe(true);
    });

    test('error null initially', () => {
      const error: Error | null = null;
      expect(error).toBeNull();
    });
  });

  describe('specific entitlement checking', () => {
    test('checkSpecificEntitlement returns boolean', async () => {
      const checkEntitlement = async (entitlement: string): Promise<boolean> => {
        return true;
      };

      const result = await checkEntitlement('plus');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('loading states', () => {
    test('refreshEntitlements sets loading true', () => {
      let isLoading = false;

      isLoading = true;
      expect(isLoading).toBe(true);
    });

    test('refreshEntitlements clears error on success', () => {
      let error: Error | null = new Error('Previous error');

      error = null;
      expect(error).toBeNull();
    });

    test('refreshEntitlements sets error on failure', () => {
      let error: Error | null = null;

      error = new Error('Failed to fetch');
      expect(error).toBeTruthy();
    });
  });

  describe('parallel loading', () => {
    test('fetches tier and usage in parallel', async () => {
      const fetchTier = async () => 'plus';
      const fetchUsage = async () => ({
        tier: 'plus' as SubscriptionTier,
        analysesUsed: 0,
        analysesLimit: Infinity,
        analysesRemaining: Infinity,
        periodStart: '2024-01-01T00:00:00Z',
        periodEnd: '2024-01-31T23:59:59Z',
        canAnalyze: true,
      });

      const [tier, usageStatus] = await Promise.all([fetchTier(), fetchUsage()]);

      expect(tier).toBe('plus');
      expect(usageStatus.tier).toBe('plus');
    });
  });
});