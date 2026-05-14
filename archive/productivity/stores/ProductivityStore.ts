/**
 * Productivity Store
 * 
 * Central state management for all productivity data using Zustand.
 * Handles loading states, error states, and data synchronization.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { RealGoal, MicroCommitment, FocusSession, HabitPattern } from '../core/ProductivityEngine';
import type { SystemMetrics, DailyInsight } from '../integration/VEXProductivitySystem';

// ============================================================================
// STORE TYPES
// ============================================================================

interface ProductivityState {
  // User and system state
  userId: string | null;
  initialized: boolean;
  systemHealthy: boolean;
  
  // Data state
  goals: RealGoal[];
  habits: HabitPattern[];
  focusSessions: FocusSession[];
  microCommitments: MicroCommitment[];
  metrics: SystemMetrics | null;
  insights: DailyInsight[];
  
  // Loading states
  loading: {
    goals: boolean;
    habits: boolean;
    sessions: boolean;
    metrics: boolean;
    insights: boolean;
    system: boolean;
  };
  
  // Error states
  errors: {
    goals: string | null;
    habits: string | null;
    sessions: string | null;
    metrics: string | null;
    insights: string | null;
    system: string | null;
  };
  
  // Retry states
  retryCount: {
    goals: number;
    habits: number;
    sessions: number;
    metrics: number;
    insights: number;
    system: number;
  };
  
  // Last sync times
  lastSync: {
    goals: number | null;
    habits: number | null;
    sessions: number | null;
    metrics: number | null;
    insights: number | null;
  };
}

interface ProductivityActions {
  // User actions
  setUserId: (userId: string) => void;
  initialize: (userId: string) => Promise<void>;
  reset: () => void;
  
  // Goal actions
  setGoals: (goals: RealGoal[]) => void;
  addGoal: (goal: RealGoal) => void;
  updateGoal: (goalId: string, updates: Partial<RealGoal>) => void;
  removeGoal: (goalId: string) => void;
  refreshGoals: () => Promise<void>;
  
  // Habit actions
  setHabits: (habits: HabitPattern[]) => void;
  addHabit: (habit: HabitPattern) => void;
  updateHabit: (habitId: string, updates: Partial<HabitPattern>) => void;
  removeHabit: (habitId: string) => void;
  refreshHabits: () => Promise<void>;
  
  // Session actions
  setSessions: (sessions: FocusSession[]) => void;
  addSession: (session: FocusSession) => void;
  updateSession: (sessionId: string, updates: Partial<FocusSession>) => void;
  refreshSessions: () => Promise<void>;
  
  // Metrics and insights actions
  setMetrics: (metrics: SystemMetrics) => void;
  setInsights: (insights: DailyInsight[]) => void;
  refreshMetrics: () => Promise<void>;
  refreshInsights: () => Promise<void>;
  
  // Loading actions
  setLoading: (key: keyof ProductivityState['loading'], value: boolean) => void;
  
  // Error actions
  setError: (key: keyof ProductivityState['errors'], error: string | null) => void;
  clearError: (key: keyof ProductivityState['errors']) => void;
  clearAllErrors: () => void;
  
  // Retry actions
  incrementRetry: (key: keyof ProductivityState['retryCount']) => void;
  resetRetry: (key: keyof ProductivityState['retryCount']) => void;
  
  // Sync actions
  updateLastSync: (key: keyof ProductivityState['lastSync']) => void;
  
  // Health actions
  setSystemHealthy: (healthy: boolean) => void;
}

type ProductivityStore = ProductivityState & ProductivityActions;

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useProductivityStore = create<ProductivityStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        userId: null,
        initialized: false,
        systemHealthy: true,
        
        goals: [],
        habits: [],
        focusSessions: [],
        microCommitments: [],
        metrics: null,
        insights: [],
        
        loading: {
          goals: false,
          habits: false,
          sessions: false,
          metrics: false,
          insights: false,
          system: false,
        },
        
        errors: {
          goals: null,
          habits: null,
          sessions: null,
          metrics: null,
          insights: null,
          system: null,
        },
        
        retryCount: {
          goals: 0,
          habits: 0,
          sessions: 0,
          metrics: 0,
          insights: 0,
          system: 0,
        },
        
        lastSync: {
          goals: null,
          habits: null,
          sessions: null,
          metrics: null,
          insights: null,
        },
        
        // User actions
        setUserId: (userId) => set({ userId }),
        
        initialize: async (userId) => {
          const state = get();
          
          if (state.initialized && state.userId === userId) {
            return; // Already initialized
          }
          
          set((prev) => ({
            ...prev,
            loading: { ...prev.loading, system: true },
            errors: { ...prev.errors, system: null },
          }));
          
          try {
            // Initialize the productivity system
            // This would typically call the VEXProductivitySystem
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate initialization
            
            set({
              userId,
              initialized: true,
              systemHealthy: true,
              loading: { ...get().loading, system: false },
            });
            
            // Trigger initial data refresh
            await Promise.all([
              state.refreshGoals(),
              state.refreshHabits(),
              state.refreshSessions(),
              state.refreshMetrics(),
              state.refreshInsights(),
            ]);
            
          } catch (error) {
            set((prev) => ({
              ...prev,
              loading: { ...prev.loading, system: false },
              errors: { ...prev.errors, system: error instanceof Error ? error.message : 'Initialization failed' },
              systemHealthy: false,
            }));
          }
        },
        
        reset: () => set({
          userId: null,
          initialized: false,
          systemHealthy: true,
          goals: [],
          habits: [],
          focusSessions: [],
          microCommitments: [],
          metrics: null,
          insights: [],
          loading: {
            goals: false,
            habits: false,
            sessions: false,
            metrics: false,
            insights: false,
            system: false,
          },
          errors: {
            goals: null,
            habits: null,
            sessions: null,
            metrics: null,
            insights: null,
            system: null,
          },
          retryCount: {
            goals: 0,
            habits: 0,
            sessions: 0,
            metrics: 0,
            insights: 0,
            system: 0,
          },
          lastSync: {
            goals: null,
            habits: null,
            sessions: null,
            metrics: null,
            insights: null,
          },
        }),
        
        // Goal actions
        setGoals: (goals) => set({ goals }),
        
        addGoal: (goal) => set((state) => ({
          goals: [goal, ...state.goals],
        })),
        
        updateGoal: (goalId, updates) => set((state) => ({
          goals: state.goals.map(goal => 
            goal.id === goalId ? { ...goal, ...updates } : goal
          ),
        })),
        
        removeGoal: (goalId) => set((state) => ({
          goals: state.goals.filter(goal => goal.id !== goalId),
        })),
        
        refreshGoals: async () => {
          const state = get();
          
          set((prev) => ({
            ...prev,
            loading: { ...prev.loading, goals: true },
            errors: { ...prev.errors, goals: null },
          }));
          
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // This would fetch from the actual service
            const goals: RealGoal[] = [];
            
            set((prev) => ({
              ...prev,
              goals,
              loading: { ...prev.loading, goals: false },
              lastSync: { ...prev.lastSync, goals: Date.now() },
              retryCount: { ...prev.retryCount, goals: 0 },
            }));
            
          } catch (error) {
            const retryCount = state.retryCount.goals;
            const shouldRetry = retryCount < 3;
            
            set((prev) => ({
              ...prev,
              loading: { ...prev.loading, goals: false },
              errors: { 
                ...prev.errors, 
                goals: error instanceof Error ? error.message : 'Failed to load goals' 
              },
              retryCount: { 
                ...prev.retryCount, 
                goals: shouldRetry ? retryCount + 1 : retryCount 
              },
            }));
          }
        },
        
        // Habit actions
        setHabits: (habits) => set({ habits }),
        
        addHabit: (habit) => set((state) => ({
          habits: [habit, ...state.habits],
        })),
        
        updateHabit: (habitId, updates) => set((state) => ({
          habits: state.habits.map(habit => 
            habit.id === habitId ? { ...habit, ...updates } : habit
          ),
        })),
        
        removeHabit: (habitId) => set((state) => ({
          habits: state.habits.filter(habit => habit.id !== habitId),
        })),
        
        refreshHabits: async () => {
          const state = get();
          
          set((prev) => ({
            ...prev,
            loading: { ...prev.loading, habits: true },
            errors: { ...prev.errors, habits: null },
          }));
          
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const habits: HabitPattern[] = [];
            
            set((prev) => ({
              ...prev,
              habits,
              loading: { ...prev.loading, habits: false },
              lastSync: { ...prev.lastSync, habits: Date.now() },
              retryCount: { ...prev.retryCount, habits: 0 },
            }));
            
          } catch (error) {
            const retryCount = state.retryCount.habits;
            const shouldRetry = retryCount < 3;
            
            set((prev) => ({
              ...prev,
              loading: { ...prev.loading, habits: false },
              errors: { 
                ...prev.errors, 
                habits: error instanceof Error ? error.message : 'Failed to load habits' 
              },
              retryCount: { 
                ...prev.retryCount, 
                habits: shouldRetry ? retryCount + 1 : retryCount 
              },
            }));
          }
        },
        
        // Session actions
        setSessions: (sessions) => set({ focusSessions: sessions }),
        
        addSession: (session) => set((state) => ({
          focusSessions: [session, ...state.focusSessions],
        })),
        
        updateSession: (sessionId, updates) => set((state) => ({
          focusSessions: state.focusSessions.map(session => 
            session.id === sessionId ? { ...session, ...updates } : session
          ),
        })),
        
        refreshSessions: async () => {
          const state = get();
          
          set((prev) => ({
            ...prev,
            loading: { ...prev.loading, sessions: true },
            errors: { ...prev.errors, sessions: null },
          }));
          
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const sessions: FocusSession[] = [];
            
            set((prev) => ({
              ...prev,
              focusSessions: sessions,
              loading: { ...prev.loading, sessions: false },
              lastSync: { ...prev.lastSync, sessions: Date.now() },
              retryCount: { ...prev.retryCount, sessions: 0 },
            }));
            
          } catch (error) {
            const retryCount = state.retryCount.sessions;
            const shouldRetry = retryCount < 3;
            
            set((prev) => ({
              ...prev,
              loading: { ...prev.loading, sessions: false },
              errors: { 
                ...prev.errors, 
                sessions: error instanceof Error ? error.message : 'Failed to load sessions' 
              },
              retryCount: { 
                ...prev.retryCount, 
                sessions: shouldRetry ? retryCount + 1 : retryCount 
              },
            }));
          }
        },
        
        // Metrics and insights actions
        setMetrics: (metrics) => set({ metrics }),
        
        setInsights: (insights) => set({ insights }),
        
        refreshMetrics: async () => {
          const state = get();
          
          set((prev) => ({
            ...prev,
            loading: { ...prev.loading, metrics: true },
            errors: { ...prev.errors, metrics: null },
          }));
          
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const metrics: SystemMetrics = {
              overallProductivity: 75,
              goalVelocity: 2,
              habitStrength: 80,
              capabilityGrowth: 65,
              collaborationEffectiveness: 70,
              satisfactionScore: 85,
              retentionScore: 90,
              overallROI: 150,
            };
            
            set((prev) => ({
              ...prev,
              metrics,
              loading: { ...prev.loading, metrics: false },
              lastSync: { ...prev.lastSync, metrics: Date.now() },
              retryCount: { ...prev.retryCount, metrics: 0 },
            }));
            
          } catch (error) {
            const retryCount = state.retryCount.metrics;
            const shouldRetry = retryCount < 3;
            
            set((prev) => ({
              ...prev,
              loading: { ...prev.loading, metrics: false },
              errors: { 
                ...prev.errors, 
                metrics: error instanceof Error ? error.message : 'Failed to load metrics' 
              },
              retryCount: { 
                ...prev.retryCount, 
                metrics: shouldRetry ? retryCount + 1 : retryCount 
              },
            }));
          }
        },
        
        refreshInsights: async () => {
          const state = get();
          
          set((prev) => ({
            ...prev,
            loading: { ...prev.loading, insights: true },
            errors: { ...prev.errors, insights: null },
          }));
          
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const insights: DailyInsight[] = [];
            
            set((prev) => ({
              ...prev,
              insights,
              loading: { ...prev.loading, insights: false },
              lastSync: { ...prev.lastSync, insights: Date.now() },
              retryCount: { ...prev.retryCount, insights: 0 },
            }));
            
          } catch (error) {
            const retryCount = state.retryCount.insights;
            const shouldRetry = retryCount < 3;
            
            set((prev) => ({
              ...prev,
              loading: { ...prev.loading, insights: false },
              errors: { 
                ...prev.errors, 
                insights: error instanceof Error ? error.message : 'Failed to load insights' 
              },
              retryCount: { 
                ...prev.retryCount, 
                insights: shouldRetry ? retryCount + 1 : retryCount 
              },
            }));
          }
        },
        
        // Loading actions
        setLoading: (key, value) => set((state) => ({
          loading: { ...state.loading, [key]: value },
        })),
        
        // Error actions
        setError: (key, error) => set((state) => ({
          errors: { ...state.errors, [key]: error },
        })),
        
        clearError: (key) => set((state) => ({
          errors: { ...state.errors, [key]: null },
        })),
        
        clearAllErrors: () => set((state) => ({
          errors: {
            goals: null,
            habits: null,
            sessions: null,
            metrics: null,
            insights: null,
            system: null,
          },
        })),
        
        // Retry actions
        incrementRetry: (key) => set((state) => ({
          retryCount: { ...state.retryCount, [key]: state.retryCount[key] + 1 },
        })),
        
        resetRetry: (key) => set((state) => ({
          retryCount: { ...state.retryCount, [key]: 0 },
        })),
        
        // Sync actions
        updateLastSync: (key) => set((state) => ({
          lastSync: { ...state.lastSync, [key]: Date.now() },
        })),
        
        // Health actions
        setSystemHealthy: (healthy) => set({ systemHealthy: healthy }),
      }),
      {
        name: 'productivity-store',
        partialize: (state) => ({
          userId: state.userId,
          initialized: state.initialized,
          goals: state.goals,
          habits: state.habits,
          focusSessions: state.focusSessions,
          metrics: state.metrics,
          insights: state.insights,
        }),
      }
    ),
    {
      name: 'productivity-store',
    }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const useProductivityData = () => useProductivityStore((state) => ({
  goals: state.goals,
  habits: state.habits,
  focusSessions: state.focusSessions,
  metrics: state.metrics,
  insights: state.insights,
}));

export const useProductivityLoading = () => useProductivityStore((state) => state.loading);

export const useProductivityErrors = () => useProductivityStore((state) => state.errors);

export const useProductivityHealth = () => useProductivityStore((state) => ({
  initialized: state.initialized,
  systemHealthy: state.systemHealthy,
  userId: state.userId,
}));

export const useProductivityActions = () => useProductivityStore((state) => ({
  initialize: state.initialize,
  reset: state.reset,
  refreshGoals: state.refreshGoals,
  refreshHabits: state.refreshHabits,
  refreshSessions: state.refreshSessions,
  refreshMetrics: state.refreshMetrics,
  refreshInsights: state.refreshInsights,
  clearAllErrors: state.clearAllErrors,
}));

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export const useGoalById = (goalId: string) => {
  const goals = useProductivityStore((state) => state.goals);
  return goals.find(goal => goal.id === goalId);
};

export const useHabitById = (habitId: string) => {
  const habits = useProductivityStore((state) => state.habits);
  return habits.find(habit => habit.id === habitId);
};

export const useActiveGoals = () => {
  const goals = useProductivityStore((state) => state.goals);
  return goals.filter(goal => goal.status === 'ACTIVE');
};

export const useCompletedGoals = () => {
  const goals = useProductivityStore((state) => state.goals);
  return goals.filter(goal => goal.status === 'COMPLETED');
};

export const useStrongHabits = (threshold: number = 70) => {
  const habits = useProductivityStore((state) => state.habits);
  return habits.filter(habit => habit.strength >= threshold);
};

export const useRecentSessions = (limit: number = 10) => {
  const sessions = useProductivityStore((state) => state.focusSessions);
  return sessions
    .sort((a, b) => b.startTime - a.startTime)
    .slice(0, limit);
};

export const useProductivitySummary = () => {
  const goals = useProductivityStore((state) => state.goals);
  const habits = useProductivityStore((state) => state.habits);
  const metrics = useProductivityStore((state) => state.metrics);
  
  return {
    totalGoals: goals.length,
    activeGoals: goals.filter(g => g.status === 'ACTIVE').length,
    completedGoals: goals.filter(g => g.status === 'COMPLETED').length,
    totalHabits: habits.length,
    strongHabits: habits.filter(h => h.strength > 70).length,
    overallProductivity: metrics?.overallProductivity || 0,
    satisfactionScore: metrics?.satisfactionScore || 0,
  };
};
