// useEntitlements Hook
// React hook for checking entitlements and usage limits

import { useState, useEffect, useCallback } from 'react';
import { UsageLimitStatus, Entitlement, SubscriptionTier } from './monetizationTypes';
import { canPerformAnalysis, checkEntitlement } from './entitlementService';
import { getCurrentTier } from './revenueCatService';

interface UseEntitlementsReturn {
  // Tier info
  tier: SubscriptionTier | null;
  isLoading: boolean;
  error: Error | null;

  // Analysis limits
  usageStatus: UsageLimitStatus | null;
  canAnalyze: boolean;
  analysesRemaining: number;

  // Entitlements
  hasPlus: boolean;

  // Actions
  refreshEntitlements: () => Promise<void>;
  checkSpecificEntitlement: (entitlement: Entitlement) => Promise<boolean>;
}

export function useEntitlements(userId: string | null): UseEntitlementsReturn {
  const [tier, setTier] = useState<SubscriptionTier | null>(null);
  const [usageStatus, setUsageStatus] = useState<UsageLimitStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshEntitlements = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch tier and usage in parallel
      const [currentTier, analysisStatus] = await Promise.all([
        getCurrentTier(),
        canPerformAnalysis(userId),
      ]);

      setTier(currentTier);
      setUsageStatus(analysisStatus);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch entitlements'));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const checkSpecificEntitlement = useCallback(async (entitlement: Entitlement): Promise<boolean> => {
    return checkEntitlement(entitlement);
  }, []);

  // Initial load
  useEffect(() => {
    refreshEntitlements();
  }, [refreshEntitlements]);

  const canAnalyze = usageStatus?.canAnalyze ?? false;
  const analysesRemaining = usageStatus?.analysesRemaining ?? 0;
  const hasPlus = tier === 'plus' || tier === 'pro';

  return {
    tier,
    isLoading,
    error,
    usageStatus,
    canAnalyze,
    analysesRemaining,
    hasPlus,
    refreshEntitlements,
    checkSpecificEntitlement,
  };
}
