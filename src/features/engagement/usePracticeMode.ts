import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useMutation } from '@tanstack/react-query';
import { PracticeScenario, PracticeSessionResult, getRandomScenarios, getScenarioById } from './practiceModeTypes';

interface UsePracticeModeReturn {
  currentScenario: PracticeScenario | null;
  scenariosCompleted: number;
  totalScenarios: number;
  startSession: () => void;
  completeScenario: (chosenOptionIndex: number) => void;
  nextScenario: () => void;
  endSession: () => void;
  isLoading: boolean;
  sessionActive: boolean;
  results: PracticeSessionResult[];
}

export function usePracticeMode(): UsePracticeModeReturn {
  const [scenarios, setScenarios] = useState<PracticeScenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<PracticeSessionResult[]>([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const logMutation = useMutation({
    mutationFn: async (result: PracticeSessionResult) => {
      const { error } = await supabase
        .from('practice_sessions')
        .insert({
          scenario_id: result.scenarioId,
          chosen_option_index: result.chosenOptionIndex,
          time_spent_seconds: result.timeSpentSeconds,
        });
      if (error) console.error('Failed to log practice session:', error);
    },
  });

  const startSession = useCallback(() => {
    const picked = getRandomScenarios(5);
    setScenarios(picked);
    setCurrentIndex(0);
    setResults([]);
    setSessionActive(true);
    setSessionStartTime(Date.now());
  }, []);

  const completeScenario = useCallback((chosenOptionIndex: number) => {
    const scenario = scenarios[currentIndex];
    if (!scenario) return;

    const timeSpent = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : 0;
    const result: PracticeSessionResult = {
      scenarioId: scenario.id,
      chosenOptionIndex,
      timeSpentSeconds: timeSpent,
      completedAt: new Date().toISOString(),
    };

    setResults(prev => [...prev, result]);
    logMutation.mutate(result);
  }, [scenarios, currentIndex, sessionStartTime, logMutation]);

  const nextScenario = useCallback(() => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSessionStartTime(Date.now());
    } else {
      setSessionActive(false);
    }
  }, [currentIndex, scenarios.length]);

  const endSession = useCallback(() => {
    setSessionActive(false);
    setScenarios([]);
    setCurrentIndex(0);
    setResults([]);
  }, []);

  const currentScenario = useMemo(() => scenarios[currentIndex] || null, [scenarios, currentIndex]);

  return {
    currentScenario,
    scenariosCompleted: results.length,
    totalScenarios: scenarios.length,
    startSession,
    completeScenario,
    nextScenario,
    endSession,
    isLoading: logMutation.isPending,
    sessionActive,
    results,
  };
}
