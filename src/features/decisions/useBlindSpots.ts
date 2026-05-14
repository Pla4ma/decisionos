// Blind Spot Detection Hook

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { UserBlindSpot } from './deepDecisionTypes';

export function useBlindSpots(userId: string | null) {
  const queryClient = useQueryClient();

  const { data: blindSpots, isLoading } = useQuery({
    queryKey: ['blindSpots', userId],
    queryFn: async (): Promise<UserBlindSpot[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_blind_spots')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('severity', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  });

  const detectBlindSpotsMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('No user');
      const { data, error } = await supabase.rpc('detect_user_blind_spots', {
        p_user_id: userId,
      });
      if (error) throw error;

      // Upsert detected blind spots
      for (const spot of (data || [])) {
        await supabase.from('user_blind_spots').upsert({
          user_id: userId,
          blind_spot_type: spot.blind_spot_type,
          title: spot.title,
          description: spot.description,
          evidence_count: spot.evidence_count,
          severity: spot.severity,
          last_detected_at: new Date().toISOString(),
        }, { onConflict: 'user_id,blind_spot_type' });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blindSpots', userId] });
    },
  });

  const significantBlindSpots = (blindSpots || []).filter(b => b.severity === 'significant');
  const hasBlindSpots = (blindSpots || []).length > 0;

  return {
    blindSpots: blindSpots || [],
    significantBlindSpots,
    hasBlindSpots,
    isLoading,
    detectBlindSpots: detectBlindSpotsMutation.mutateAsync,
    isDetecting: detectBlindSpotsMutation.isPending,
  };
}
