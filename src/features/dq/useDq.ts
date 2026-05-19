// useDq — Unified Decision Quotient hook
// Merges all decision intelligence into ONE score + archetype
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import {
  fetchDqData,
  computeCalibrationAccuracy,
  computeVelocityScore,
  computeReviewConsistency,
  computeDqScore,
  saveDqScore,
} from './dqService';
import { DqScore, getArchetype } from './dqTypes';

interface UseDqOptions {
  enabled?: boolean;
}

interface UseDqReturn {
  dq: DqScore | null;
  isLoading: boolean;
  isLoaded: boolean;
  refresh: () => Promise<void>;
}

export function useDq(options?: UseDqOptions): UseDqReturn {
  const { user } = useAuth();
  const [dq, setDq] = useState<DqScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const data = await fetchDqData(user.id);

      const calibrationAccuracy = computeCalibrationAccuracy(data.predictions);
      const velocityScore = computeVelocityScore(data.velocities);
      const reviewConsistency = computeReviewConsistency(data.totalDecisions, data.totalReviews);
      const overall = computeDqScore(
        calibrationAccuracy,
        data.biasMitigationRate,
        velocityScore,
        reviewConsistency,
      );

      const archetype = getArchetype(overall);
      const trend = data.previousDq !== null
        ? (overall > data.previousDq + 2 ? 'rising' : overall < data.previousDq - 2 ? 'declining' : 'stable')
        : 'stable';

      const dqScore: DqScore = {
        overall,
        calibrationAccuracy,
        biasMitigationRate: data.biasMitigationRate,
        velocityScore,
        reviewConsistency,
        archetype,
        trend,
        updatedAt: new Date().toISOString(),
      };

      setDq(dqScore);
      setIsLoaded(true);

      // Persist every refresh (debounced by the hook caller)
      saveDqScore(user.id, dqScore).catch(() => {});
    } catch (err) {
      console.error('Failed to compute DQ:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if ((options?.enabled ?? true) === false) return;
    if (user && !isLoaded) {
      refresh();
    }
  }, [user, isLoaded, refresh, options?.enabled]);

  return { dq, isLoading, isLoaded, refresh };
}
