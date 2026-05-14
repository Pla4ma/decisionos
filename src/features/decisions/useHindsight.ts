// useHindsight — Hook for accessing hindsight comparison data
// Generates and manages the "path not taken" analysis after decision review
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/useAuth';
import { useStreak } from '@/features/progression/useStreak';
import {
  generateHindsightComparison,
  saveHindsightReport,
  fetchHindsightReport,
} from './hindsightService';
import { HindsightComparison, HindsightReviewInput } from './hindsightTypes';

interface UseHindsightReturn {
  /** The hindsight comparison data */
  comparison: HindsightComparison | null;
  /** Whether the data is loading */
  isLoading: boolean;
  /** Whether a generation is currently in progress */
  isGenerating: boolean;
  /** Error state */
  error: Error | null;
  /** Whether hindsight data exists for this decision */
  hasHindsight: boolean;
  /** Generate a new hindsight comparison after submitting a review */
  generateHindsight: (decisionId: string, input: HindsightReviewInput) => Promise<void>;
}

export function useHindsight(decisionId: string): UseHindsightReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { updateStreak } = useStreak(user?.id ?? null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch existing hindsight report
  const { data: comparison, isLoading } = useQuery({
    queryKey: ['hindsight', decisionId],
    queryFn: () => fetchHindsightReport(decisionId),
    enabled: !!decisionId && !!user,
  });

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: async ({
      decisionId: id,
      input,
    }: { decisionId: string; input: HindsightReviewInput }) => {
      setIsGenerating(true);
      try {
        const result = await generateHindsightComparison(id, input);
        if (result) {
          await saveHindsightReport(id, result);
          // Trigger CBMI recalculation (bias awareness = improvement)
          await updateStreak();
          return result;
        }
        throw new Error('Failed to generate hindsight comparison');
      } finally {
        setIsGenerating(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hindsight', decisionId] });
    },
  });

  const generateHindsight = useCallback(
    async (id: string, input: HindsightReviewInput) => {
      await generateMutation.mutateAsync({ decisionId: id, input });
    },
    [generateMutation],
  );

  return {
    comparison: comparison ?? null,
    isLoading,
    isGenerating,
    error: generateMutation.error as Error | null,
    hasHindsight: !!comparison,
    generateHindsight,
  };
}
