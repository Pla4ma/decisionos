// useCbmi — Hook for accessing Cognitive Bias Mitigation Index data
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { fetchUserBiasProfile, fetchCbmiHistory, triggerCbmiRecalculation } from './cbmiService';
import { UserBiasProfile, CbmiScoreSnapshot, getPersonaForScore } from './cbmiTypes';

interface UseCbmiReturn {
  profile: UserBiasProfile | null;
  history: CbmiScoreSnapshot[];
  currentPersona: ReturnType<typeof getPersonaForScore>;
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useCbmi(): UseCbmiReturn {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserBiasProfile | null>(null);
  const [history, setHistory] = useState<CbmiScoreSnapshot[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      // Trigger recalculation to ensure fresh data
      await triggerCbmiRecalculation(user.id);

      const [fetchedProfile, fetchedHistory] = await Promise.all([
        fetchUserBiasProfile(user.id),
        fetchCbmiHistory(user.id),
      ]);

      setProfile(fetchedProfile);
      setHistory(fetchedHistory);
      setIsLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load CBMI data'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !isLoaded) {
      refresh();
    }
  }, [user, isLoaded, refresh]);

  const currentPersona = profile
    ? getPersonaForScore(profile.current_cbmi)
    : getPersonaForScore(0);

  return {
    profile,
    history,
    currentPersona,
    isLoaded,
    isLoading,
    error,
    refresh,
  };
}
