import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { DailyPractice, PracticePrompt, generateDailyPracticePrompt } from './dailyClarityPracticeTypes';
import { useAuth } from '@/features/auth';
import { fetchUserBiasProfile } from '@/features/cbmi/cbmiService';

interface UseDailyClarityPracticeOptions {
  enabled?: boolean;
}

interface UseDailyClarityPracticeReturn {
  todayPractice: DailyPractice | null;
  todayPrompt: PracticePrompt | null;
  isCompleted: boolean;
  isLoading: boolean;
  completePractice: (response: string, reflection?: string) => Promise<void>;
  skipPractice: () => Promise<void>;
  streakCount: number;
}

export function useDailyClarityPractice(options?: UseDailyClarityPracticeOptions): UseDailyClarityPracticeReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [todayPrompt, setTodayPrompt] = useState<PracticePrompt | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const { data: todayPractice, isLoading } = useQuery({
    queryKey: ['dailyPractice', user?.id, today],
    queryFn: async (): Promise<DailyPractice | null> => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('daily_practices')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data as DailyPractice | null;
    },
    enabled: !!user?.id && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5,
  });

  const { data: streakData } = useQuery({
    queryKey: ['dailyPracticeStreak', user?.id],
    queryFn: async (): Promise<number> => {
      if (!user?.id) return 0;
      const { data } = await supabase
        .from('daily_practices')
        .select('date')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .order('date', { ascending: false })
        .limit(30);
      if (!data || data.length === 0) return 0;
      let streak = 0;
      const todayDate = new Date();
      for (let i = 0; i < data.length; i++) {
        const expected = new Date(todayDate);
        expected.setDate(expected.getDate() - i);
        const expectedStr = expected.toISOString().split('T')[0];
        if (data[i].date === expectedStr) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    },
    enabled: !!user?.id && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 10,
  });

  // Generate prompt on mount if no practice exists today
  useEffect(() => {
    if ((options?.enabled ?? true) === false) return;
    if (!todayPractice && user?.id && !isLoading) {
      fetchUserBiasProfile(user.id).then(profile => {
        const biases = profile?.dominant_biases?.map((b: any) => b.bias_name) || [];
        const values = profile?.values || [];
        const decisionCount = profile?.total_decisions || 0;
        setTodayPrompt(generateDailyPracticePrompt(user.id, decisionCount, biases, values));
      }).catch(() => {
        setTodayPrompt(generateDailyPracticePrompt(user?.id || '', 0, [], []));
      });
    } else if (todayPractice) {
      setTodayPrompt(null);
    }
  }, [todayPractice, user?.id, isLoading]);

  const completeMutation = useMutation({
    mutationFn: async ({ response, reflection }: { response: string; reflection?: string }) => {
      if (!user?.id || !todayPrompt) return;
      const { error } = await supabase.from('daily_practices').insert({
        user_id: user.id,
        date: today,
        practice_type: todayPrompt.type,
        title: todayPrompt.title,
        prompt: todayPrompt.prompt,
        context: todayPrompt.context,
        is_completed: true,
        user_response: response,
        reflection: reflection || null,
        time_spent_seconds: Math.round(todayPrompt.estimated_minutes * 60),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyPractice', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['dailyPracticeStreak', user?.id] });
    },
  });

  const skipMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !todayPrompt) return;
      await supabase.from('daily_practices').insert({
        user_id: user.id,
        date: today,
        practice_type: todayPrompt.type,
        title: todayPrompt.title,
        prompt: todayPrompt.prompt,
        context: todayPrompt.context,
        is_completed: false,
        time_spent_seconds: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyPractice', user?.id] });
    },
  });

  return {
    todayPractice: todayPractice || null,
    todayPrompt,
    isCompleted: todayPractice?.is_completed ?? false,
    isLoading,
    completePractice: async (response, reflection) => completeMutation.mutateAsync({ response, reflection }),
    skipPractice: async () => skipMutation.mutateAsync(),
    streakCount: streakData || 0,
  };
}
