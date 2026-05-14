/**
 * Productivity Engine Tests
 * 
 * Comprehensive test suite for the core ProductivityEngine.
 * Tests all functionality including edge cases and error handling.
 */

import { ProductivityEngine } from '../core/ProductivityEngine';
import { GoalValidators } from '../validation/ProductivityValidators';
import { getProductivityRepository } from '../repositories/ProductivityRepository';

// Mock dependencies
jest.mock('../repositories/ProductivityRepository');
jest.mock('../../events', () => ({
  eventBus: {
    subscribe: jest.fn(),
    publish: jest.fn(),
  },
}));

describe('ProductivityEngine', () => {
  let engine: ProductivityEngine;
  let mockRepository: jest.MockedFunction<typeof getProductivityRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = getProductivityRepository as jest.MockedFunction<typeof getProductivityRepository>;
    
    const mockRepoInstance = {
      createGoal: jest.fn(),
      getGoal: jest.fn(),
      updateGoal: jest.fn(),
      deleteGoal: jest.fn(),
      getUserGoals: jest.fn(),
      createHabit: jest.fn(),
      getHabit: jest.fn(),
      updateHabit: jest.fn(),
      getUserHabits: jest.fn(),
      createFocusSession: jest.fn(),
      updateFocusSession: jest.fn(),
      getUserSessions: jest.fn(),
    };
    
    mockRepository.mockReturnValue(mockRepoInstance);
    engine = new ProductivityEngine('test-user-id');
  });

  describe('Goal Management', () => {
    describe('createGoal', () => {
      it('should create a valid goal successfully', async () => {
        const goalData = {
          title: 'Learn TypeScript',
          description: 'Master TypeScript fundamentals',
          category: 'LEARNING' as const,
          priority: 'HIGH' as const,
          targetOutcome: 'Complete TypeScript course',
          successMetrics: ['Complete course', 'Build project'],
          estimatedImpact: 'MODERATE' as const,
          targetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        };

        const mockGoal = {
          id: 'goal-1',
          userId: 'test-user-id',
          ...goalData,
          status: 'ACTIVE' as const,
          progress: 0,
          createdAt: Date.now(),
          lastMilestoneDate: null,
          totalInvestmentMinutes: 0,
          actualOutcomes: [],
        };

        mockRepository().createGoal.mockResolvedValue({
          data: mockGoal,
          error: null,
          loading: false,
          retryable: false,
        });

        const result = await engine.createGoal(goalData);

        expect(result).toEqual(mockGoal);
        expect(mockRepository().createGoal).toHaveBeenCalledWith(goalData, expect.any(Object));
      });

      it('should reject invalid goal data', async () => {
        const invalidGoalData = {
          title: '', // Empty title
          description: 'Test',
          category: 'LEARNING' as const,
          priority: 'HIGH' as const,
          targetOutcome: 'Test',
          successMetrics: [],
          estimatedImpact: 'MODERATE' as const,
        };

        await expect(engine.createGoal(invalidGoalData)).rejects.toThrow('Goal validation failed');
      });

      it('should handle repository errors gracefully', async () => {
        const goalData = {
          title: 'Test Goal',
          description: 'Test Description',
          category: 'LEARNING' as const,
          priority: 'HIGH' as const,
          targetOutcome: 'Test Outcome',
          successMetrics: ['Test Metric'],
          estimatedImpact: 'MODERATE' as const,
        };

        mockRepository().createGoal.mockResolvedValue({
          data: null,
          error: 'Database error',
          loading: false,
          retryable: true,
        });

        await expect(engine.createGoal(goalData)).rejects.toThrow('Database error');
      });
    });

    describe('updateGoal', () => {
      it('should update a goal successfully', async () => {
        const updates = {
          title: 'Updated Goal Title',
          progress: 50,
        };

        const existingGoal = {
          id: 'goal-1',
          userId: 'test-user-id',
          title: 'Original Title',
          description: 'Test',
          category: 'LEARNING' as const,
          priority: 'HIGH' as const,
          targetOutcome: 'Test',
          successMetrics: ['Test'],
          estimatedImpact: 'MODERATE' as const,
          status: 'ACTIVE' as const,
          progress: 0,
          createdAt: Date.now(),
          lastMilestoneDate: null,
          totalInvestmentMinutes: 0,
          actualOutcomes: [],
        };

        const updatedGoal = {
          ...existingGoal,
          ...updates,
        };

        mockRepository().getGoal.mockResolvedValue({
          data: existingGoal,
          error: null,
          loading: false,
          retryable: false,
        });

        mockRepository().updateGoal.mockResolvedValue({
          data: updatedGoal,
          error: null,
          loading: false,
          retryable: false,
        });

        const result = await engine.updateGoal('goal-1', updates);

        expect(result).toEqual(updatedGoal);
        expect(mockRepository().updateGoal).toHaveBeenCalledWith('goal-1', updates, expect.any(Object));
      });

      it('should prevent invalid status transitions', async () => {
        const updates = {
          status: 'ACTIVE' as const,
        };

        const completedGoal = {
          id: 'goal-1',
          userId: 'test-user-id',
          title: 'Completed Goal',
          description: 'Test',
          category: 'LEARNING' as const,
          priority: 'HIGH' as const,
          targetOutcome: 'Test',
          successMetrics: ['Test'],
          estimatedImpact: 'MODERATE' as const,
          status: 'COMPLETED' as const,
          progress: 100,
          createdAt: Date.now(),
          lastMilestoneDate: Date.now(),
          totalInvestmentMinutes: 100,
          actualOutcomes: ['Completed'],
        };

        mockRepository().getGoal.mockResolvedValue({
          data: completedGoal,
          error: null,
          loading: false,
          retryable: false,
        });

        await expect(engine.updateGoal('goal-1', updates)).rejects.toThrow('Cannot change status from COMPLETED');
      });
    });

    describe('deleteGoal', () => {
      it('should delete a goal successfully', async () => {
        mockRepository().deleteGoal.mockResolvedValue({
          data: true,
          error: null,
          loading: false,
          retryable: false,
        });

        await expect(engine.deleteGoal('goal-1')).resolves.toBe(true);
        expect(mockRepository().deleteGoal).toHaveBeenCalledWith('goal-1', expect.any(Object));
      });

      it('should handle deletion errors', async () => {
        mockRepository().deleteGoal.mockResolvedValue({
          data: null,
          error: 'Goal not found',
          loading: false,
          retryable: false,
        });

        await expect(engine.deleteGoal('goal-1')).rejects.toThrow('Goal not found');
      });
    });
  });

  describe('Habit Management', () => {
    describe('createHabit', () => {
      it('should create a valid habit successfully', async () => {
        const habitData = {
          name: 'Morning Exercise',
          cue: 'Wake up at 6 AM',
          routine: 'Do 15 minutes of exercise',
          reward: 'Feel energized',
          context: 'Home',
          category: 'HEALTH' as const,
        };

        const mockHabit = {
          id: 'habit-1',
          userId: 'test-user-id',
          ...habitData,
          strength: 0,
          streak: 0,
          lastCompleted: null,
          missedDays: [],
        };

        mockRepository().createHabit.mockResolvedValue({
          data: mockHabit,
          error: null,
          loading: false,
          retryable: false,
        });

        const result = await engine.createHabit(habitData);

        expect(result).toEqual(mockHabit);
        expect(mockRepository().createHabit).toHaveBeenCalledWith(habitData, expect.any(Object));
      });

      it('should reject invalid habit data', async () => {
        const invalidHabitData = {
          name: '', // Empty name
          cue: 'Test',
          routine: 'Test',
          reward: 'Test',
          context: 'Test',
          category: 'HEALTH' as const,
        };

        await expect(engine.createHabit(invalidHabitData)).rejects.toThrow('Habit validation failed');
      });
    });

    describe('completeHabit', () => {
      it('should complete a habit and increase strength', async () => {
        const habit = {
          id: 'habit-1',
          userId: 'test-user-id',
          name: 'Morning Exercise',
          cue: 'Wake up at 6 AM',
          routine: 'Do 15 minutes of exercise',
          reward: 'Feel energized',
          context: 'Home',
          category: 'HEALTH' as const,
          strength: 50,
          streak: 5,
          lastCompleted: Date.now() - 24 * 60 * 60 * 1000,
          missedDays: [],
        };

        const updatedHabit = {
          ...habit,
          strength: 55,
          streak: 6,
          lastCompleted: Date.now(),
        };

        mockRepository().getHabit.mockResolvedValue({
          data: habit,
          error: null,
          loading: false,
          retryable: false,
        });

        mockRepository().updateHabit.mockResolvedValue({
          data: updatedHabit,
          error: null,
          loading: false,
          retryable: false,
        });

        const result = await engine.completeHabit('habit-1');

        expect(result).toEqual(updatedHabit);
        expect(result.strength).toBeGreaterThan(habit.strength);
        expect(result.streak).toBe(habit.streak + 1);
      });

      it('should handle habit completion validation', async () => {
        const habit = {
          id: 'habit-1',
          userId: 'test-user-id',
          name: 'Morning Exercise',
          cue: 'Wake up at 6 AM',
          routine: 'Do 15 minutes of exercise',
          reward: 'Feel energized',
          context: 'Home',
          category: 'HEALTH' as const,
          strength: 50,
          streak: 5,
          lastCompleted: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
          missedDays: [],
        };

        mockRepository().getHabit.mockResolvedValue({
          data: habit,
          error: null,
          loading: false,
          retryable: false,
        });

        await expect(engine.completeHabit('habit-1')).rejects.toThrow('Habit completion validation failed');
      });
    });
  });

  describe('Focus Session Management', () => {
    describe('startFocusSession', () => {
      it('should start a focus session successfully', async () => {
        const sessionData = {
          goalId: 'goal-1',
          commitmentId: 'commitment-1',
          plannedMinutes: 30,
        };

        const mockSession = {
          id: 'session-1',
          ...sessionData,
          startTime: Date.now(),
          endTime: null,
          actualMinutes: 0,
          quality: 'GOOD' as const,
          distractions: 0,
          interruptions: 0,
          notes: '',
          realAccomplishments: [],
        };

        mockRepository().createFocusSession.mockResolvedValue({
          data: mockSession,
          error: null,
          loading: false,
          retryable: false,
        });

        const result = await engine.startFocusSession('goal-1', 'commitment-1', 30);

        expect(result).toEqual(mockSession);
        expect(result.startTime).toBeLessThanOrEqual(Date.now());
        expect(mockRepository().createFocusSession).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
      });

      it('should validate session parameters', async () => {
        await expect(engine.startFocusSession('goal-1', 'commitment-1', 0)).rejects.toThrow('Session validation failed');
        await expect(engine.startFocusSession('goal-1', 'commitment-1', 500)).rejects.toThrow('Session validation failed');
      });
    });

    describe('endFocusSession', () => {
      it('should end a focus session successfully', async () => {
        const activeSession = {
          id: 'session-1',
          goalId: 'goal-1',
          commitmentId: 'commitment-1',
          startTime: Date.now() - 30 * 60 * 1000,
          endTime: null,
          plannedMinutes: 30,
          actualMinutes: 0,
          quality: 'GOOD' as const,
          distractions: 0,
          interruptions: 0,
          notes: '',
          realAccomplishments: [],
        };

        const endedSession = {
          ...activeSession,
          endTime: Date.now(),
          actualMinutes: 30,
        };

        mockRepository().updateFocusSession.mockResolvedValue({
          data: endedSession,
          error: null,
          loading: false,
          retryable: false,
        });

        const result = await engine.endFocusSession('session-1', 'EXCELLENT', 2, 1, 'Great session!');

        expect(result).toEqual(endedSession);
        expect(result.endTime).toBeGreaterThan(activeSession.startTime);
        expect(result.actualMinutes).toBeGreaterThan(0);
      });

      it('should handle ending non-existent sessions', async () => {
        mockRepository().updateFocusSession.mockResolvedValue({
          data: null,
          error: 'Session not found',
          loading: false,
          retryable: false,
        });

        await expect(engine.endFocusSession('invalid-session')).rejects.toThrow('Session not found');
      });
    });
  });

  describe('Micro Commitment Management', () => {
    describe('createMicroCommitment', () => {
      it('should create a micro commitment successfully', async () => {
        const commitmentData = {
          goalId: 'goal-1',
          title: 'Read TypeScript documentation',
          estimatedMinutes: 15,
          difficulty: 'EASY' as const,
          context: 'Morning',
          completionCriteria: 'Read 5 pages',
        };

        const mockCommitment = {
          id: 'commitment-1',
          ...commitmentData,
          actualMinutes: null,
          status: 'PENDING' as const,
          createdAt: Date.now(),
          completedAt: null,
          realOutcome: null,
        };

        const result = await engine.createMicroCommitment(commitmentData);

        expect(result).toEqual(mockCommitment);
        expect(result.status).toBe('PENDING');
      });

      it('should validate commitment data', async () => {
        const invalidCommitment = {
          goalId: '',
          title: '',
          estimatedMinutes: -5,
          difficulty: 'EASY' as const,
          context: '',
          completionCriteria: '',
        };

        await expect(engine.createMicroCommitment(invalidCommitment)).rejects.toThrow('Commitment validation failed');
      });
    });

    describe('completeMicroCommitment', () => {
      it('should complete a micro commitment successfully', async () => {
        const commitment = {
          id: 'commitment-1',
          goalId: 'goal-1',
          title: 'Read TypeScript documentation',
          estimatedMinutes: 15,
          actualMinutes: null,
          difficulty: 'EASY' as const,
          context: 'Morning',
          completionCriteria: 'Read 5 pages',
          status: 'PENDING' as const,
          createdAt: Date.now(),
          completedAt: null,
          realOutcome: null,
        };

        const completedCommitment = {
          ...commitment,
          status: 'COMPLETED' as const,
          actualMinutes: 20,
          completedAt: Date.now(),
          realOutcome: 'Read 6 pages and took notes',
        };

        const result = await engine.completeMicroCommitment('commitment-1', 20, 'Read 6 pages and took notes');

        expect(result).toEqual(completedCommitment);
        expect(result.status).toBe('COMPLETED');
        expect(result.actualMinutes).toBe(20);
        expect(result.realOutcome).toBe('Read 6 pages and took notes');
      });
    });
  });

  describe('Analytics and Insights', () => {
    describe('getProductivityMetrics', () => {
      it('should calculate productivity metrics correctly', async () => {
        const mockGoals = [
          { id: '1', status: 'ACTIVE', progress: 50 },
          { id: '2', status: 'COMPLETED', progress: 100 },
          { id: '3', status: 'ACTIVE', progress: 25 },
        ];

        const mockHabits = [
          { id: '1', strength: 80, streak: 10 },
          { id: '2', strength: 60, streak: 5 },
        ];

        const mockSessions = [
          { actualMinutes: 30, quality: 'GOOD' },
          { actualMinutes: 45, quality: 'EXCELLENT' },
          { actualMinutes: 20, quality: 'FAIR' },
        ];

        jest.spyOn(engine, 'getUserGoals').mockResolvedValue(mockGoals as any);
        jest.spyOn(engine, 'getUserHabits').mockResolvedValue(mockHabits as any);
        jest.spyOn(engine, 'getUserFocusSessions').mockResolvedValue(mockSessions as any);

        const metrics = await engine.getProductivityMetrics();

        expect(metrics).toHaveProperty('goalCompletionRate');
        expect(metrics).toHaveProperty('habitStrength');
        expect(metrics).toHaveProperty('focusEfficiency');
        expect(metrics).toHaveProperty('overallProductivity');
        expect(metrics.goalCompletionRate).toBeGreaterThan(0);
        expect(metrics.habitStrength).toBeGreaterThan(0);
        expect(metrics.focusEfficiency).toBeGreaterThan(0);
      });
    });

    describe('generateInsights', () => {
      it('should generate meaningful insights', async () => {
        const mockGoals = [
          { status: 'COMPLETED', progress: 100 },
          { status: 'COMPLETED', progress: 100 },
          { status: 'ACTIVE', progress: 10 },
        ];

        jest.spyOn(engine, 'getUserGoals').mockResolvedValue(mockGoals as any);

        const insights = await engine.generateInsights();

        expect(Array.isArray(insights)).toBe(true);
        expect(insights.length).toBeGreaterThan(0);
        
        insights.forEach(insight => {
          expect(insight).toHaveProperty('type');
          expect(insight).toHaveProperty('title');
          expect(insight).toHaveProperty('description');
          expect(insight).toHaveProperty('recommendations');
          expect(insight).toHaveProperty('confidence');
          expect(insight).toHaveProperty('priority');
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle repository connection errors', async () => {
      mockRepository().getUserGoals.mockRejectedValue(new Error('Connection failed'));

      await expect(engine.getUserGoals()).rejects.toThrow('Connection failed');
    });

    it('should handle validation errors gracefully', async () => {
      const invalidGoal = {
        title: '',
        description: '',
        category: 'INVALID' as any,
        priority: 'INVALID' as any,
        targetOutcome: '',
        successMetrics: [],
        estimatedImpact: 'INVALID' as any,
      };

      await expect(engine.createGoal(invalidGoal)).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      mockRepository().createGoal.mockImplementation(() => 
        new Promise((resolve) => setTimeout(resolve, 15000))
      );

      const goalData = {
        title: 'Test Goal',
        description: 'Test',
        category: 'LEARNING' as const,
        priority: 'HIGH' as const,
        targetOutcome: 'Test',
        successMetrics: ['Test'],
        estimatedImpact: 'MODERATE' as const,
      };

      await expect(engine.createGoal(goalData)).rejects.toThrow('Operation timeout');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data sets', async () => {
      mockRepository().getUserGoals.mockResolvedValue({
        data: [],
        error: null,
        loading: false,
        retryable: false,
      });

      mockRepository().getUserHabits.mockResolvedValue({
        data: [],
        error: null,
        loading: false,
        retryable: false,
      });

      mockRepository().getUserSessions.mockResolvedValue({
        data: [],
        error: null,
        loading: false,
        retryable: false,
      });

      const goals = await engine.getUserGoals();
      const habits = await engine.getUserHabits();
      const sessions = await engine.getUserFocusSessions();

      expect(goals).toEqual([]);
      expect(habits).toEqual([]);
      expect(sessions).toEqual([]);
    });

    it('should handle concurrent operations', async () => {
      const goalData = {
        title: 'Concurrent Goal',
        description: 'Test',
        category: 'LEARNING' as const,
        priority: 'HIGH' as const,
        targetOutcome: 'Test',
        successMetrics: ['Test'],
        estimatedImpact: 'MODERATE' as const,
      };

      const mockGoal = {
        id: 'goal-1',
        userId: 'test-user-id',
        ...goalData,
        status: 'ACTIVE' as const,
        progress: 0,
        createdAt: Date.now(),
        lastMilestoneDate: null,
        totalInvestmentMinutes: 0,
        actualOutcomes: [],
      };

      mockRepository().createGoal.mockResolvedValue({
        data: mockGoal,
        error: null,
        loading: false,
        retryable: false,
      });

      const promises = Array(10).fill(null).map(() => engine.createGoal(goalData));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toEqual(mockGoal);
      });
    });

    it('should handle malformed data from repository', async () => {
      mockRepository().getGoal.mockResolvedValue({
        data: null,
        error: null,
        loading: false,
        retryable: false,
      });

      await expect(engine.getGoalById('goal-1')).rejects.toThrow('Goal not found');
    });
  });

  describe('Performance', () => {
    it('should handle large data sets efficiently', async () => {
      const largeGoalSet = Array(1000).fill(null).map((_, index) => ({
        id: `goal-${index}`,
        userId: 'test-user-id',
        title: `Goal ${index}`,
        description: `Description ${index}`,
        category: 'LEARNING' as const,
        priority: 'MEDIUM' as const,
        targetOutcome: `Outcome ${index}`,
        successMetrics: [`Metric ${index}`],
        estimatedImpact: 'MODERATE' as const,
        status: 'ACTIVE' as const,
        progress: Math.floor(Math.random() * 100),
        createdAt: Date.now() - index * 1000,
        lastMilestoneDate: null,
        totalInvestmentMinutes: index * 10,
        actualOutcomes: [],
      }));

      mockRepository().getUserGoals.mockResolvedValue({
        data: largeGoalSet,
        error: null,
        loading: false,
        retryable: false,
      });

      const startTime = Date.now();
      const goals = await engine.getUserGoals();
      const endTime = Date.now();

      expect(goals).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
