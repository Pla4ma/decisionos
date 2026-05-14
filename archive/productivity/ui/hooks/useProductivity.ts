/**
 * Productivity Hook
 * 
 * Main hook for accessing productivity functionality with state management,
 * error handling, and loading states.
 */

import { useState, useEffect, useCallback } from 'react';
import { getVEXProductivitySystem } from '../../integration/VEXProductivitySystem';
import type { VEXProductivitySystemConfig, SystemMetrics, DailyInsight } from '../../integration/VEXProductivitySystem';

interface UseProductivityState {
  system: any;
  metrics: SystemMetrics | null;
  insights: DailyInsight[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

interface UseProductivityActions {
  initialize: (config: VEXProductivitySystemConfig) => Promise<void>;
  refreshMetrics: () => Promise<void>;
  refreshInsights: () => Promise<void>;
  createGoal: (goalData: any) => Promise<any>;
  createHabit: (habitData: any) => Promise<any>;
  startFocusSession: (goalId?: string, commitmentId?: string, plannedMinutes?: number) => Promise<any>;
  endFocusSession: () => Promise<any>;
  syncAllServices: () => Promise<void>;
  clearError: () => void;
}

export const useProductivity = (userId?: string): UseProductivityState & UseProductivityActions => {
  const [state, setState] = useState<UseProductivityState>({
    system: null,
    metrics: null,
    insights: [],
    loading: false,
    error: null,
    initialized: false,
  });

  const initialize = useCallback(async (config: VEXProductivitySystemConfig) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const system = getVEXProductivitySystem(config);
      
      if (!system.getSystemStatus().initialized) {
        // The system initializes automatically in the constructor
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const [metrics, insights] = await Promise.all([
        system.getSystemMetrics(),
        system.getDailyInsights(),
      ]);

      setState({
        system,
        metrics,
        insights,
        loading: false,
        error: null,
        initialized: true,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize productivity system',
      }));
    }
  }, []);

  const refreshMetrics = useCallback(async () => {
    if (!state.system) return;

    try {
      const metrics = await state.system.getSystemMetrics();
      setState(prev => ({ ...prev, metrics }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh metrics',
      }));
    }
  }, [state.system]);

  const refreshInsights = useCallback(async () => {
    if (!state.system) return;

    try {
      const insights = await state.system.getDailyInsights();
      setState(prev => ({ ...prev, insights }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh insights',
      }));
    }
  }, [state.system]);

  const createGoal = useCallback(async (goalData: any) => {
    if (!state.system) throw new Error('System not initialized');

    try {
      const goal = await state.system.createSMARTGoal(goalData);
      await refreshMetrics();
      await refreshInsights();
      return goal;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create goal',
      }));
      throw error;
    }
  }, [state.system, refreshMetrics, refreshInsights]);

  const createHabit = useCallback(async (habitData: any) => {
    if (!state.system) throw new Error('System not initialized');

    try {
      const habit = await state.system.createScientificHabit(habitData);
      await refreshMetrics();
      await refreshInsights();
      return habit;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create habit',
      }));
      throw error;
    }
  }, [state.system, refreshMetrics, refreshInsights]);

  const startFocusSession = useCallback(async (
    goalId?: string,
    commitmentId?: string,
    plannedMinutes?: number
  ) => {
    if (!state.system) throw new Error('System not initialized');

    try {
      const session = await state.system.startFocusSession(goalId, commitmentId, plannedMinutes);
      return session;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start focus session',
      }));
      throw error;
    }
  }, [state.system]);

  const endFocusSession = useCallback(async () => {
    if (!state.system) throw new Error('System not initialized');

    try {
      const session = await state.system.endFocusSession();
      await refreshMetrics();
      await refreshInsights();
      return session;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to end focus session',
      }));
      throw error;
    }
  }, [state.system, refreshMetrics, refreshInsights]);

  const syncAllServices = useCallback(async () => {
    if (!state.system) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await state.system.syncAllServices();
      await refreshMetrics();
      await refreshInsights();
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to sync services',
      }));
    }
  }, [state.system, refreshMetrics, refreshInsights]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Auto-initialize if userId is provided
  useEffect(() => {
    if (userId && !state.initialized && !state.loading) {
      initialize({
        userId,
        enableAnalytics: true,
        enableCollaboration: true,
        enableMonetization: true,
        autoSync: true,
        notificationPreferences: {
          goalReminders: true,
          habitReminders: true,
          collaborationAlerts: true,
          insights: true,
        },
      });
    }
  }, [userId, state.initialized, state.loading, initialize]);

  return {
    ...state,
    initialize,
    refreshMetrics,
    refreshInsights,
    createGoal,
    createHabit,
    startFocusSession,
    endFocusSession,
    syncAllServices,
    clearError,
  };
};
