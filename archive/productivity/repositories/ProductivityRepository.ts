/**
 * Productivity Repository
 * 
 * Handles all persistence operations for productivity data.
 * Uses Supabase for data storage with proper error handling and caching.
 */

import { createDebugger } from '../../utils/debug';
import { supabase } from '../../lib/supabase';
import type { RealGoal, MicroCommitment, FocusSession, HabitPattern } from '../core/ProductivityEngine';

const debug = createDebugger('productivity:repository');

// ============================================================================
// REPOSITORY INTERFACES
// ============================================================================

export interface RepositoryResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  retryable: boolean;
}

export interface RepositoryOptions {
  useCache?: boolean;
  retryCount?: number;
  timeout?: number;
}

// ============================================================================
// PRODUCTIVITY REPOSITORY
// ============================================================================

export class ProductivityRepository {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private readonly DEFAULT_TIMEOUT = 10000; // 10 seconds

  // ============================================================================
  // GOAL OPERATIONS
  // ============================================================================

  async createGoal(goal: Omit<RealGoal, 'id'>, options: RepositoryOptions = {}): Promise<RepositoryResult<RealGoal>> {
    return this.withErrorHandling('createGoal', async () => {
      const { data, error } = await supabase
        .from('productivity_goals')
        .insert([{
          user_id: goal.userId,
          title: goal.title,
          description: goal.description,
          category: goal.category,
          priority: goal.priority,
          target_outcome: goal.targetOutcome,
          success_metrics: goal.successMetrics,
          estimated_impact: goal.estimatedImpact,
          target_date: goal.targetDate,
          status: goal.status,
          progress: goal.progress,
          total_investment_minutes: goal.totalInvestmentMinutes,
          actual_outcomes: goal.actualOutcomes,
        }])
        .select()
        .single();

      if (error) throw error;
      
      const transformedData = this.transformGoalFromDB(data);
      this.setCache(`goal:${transformedData.id}`, transformedData);
      
      return transformedData;
    }, options);
  }

  async getGoal(goalId: string, options: RepositoryOptions = {}): Promise<RepositoryResult<RealGoal>> {
    return this.withErrorHandling('getGoal', async () => {
      // Check cache first
      if (options.useCache !== false) {
        const cached = this.getCache(`goal:${goalId}`);
        if (cached) return cached;
      }

      const { data, error } = await supabase
        .from('productivity_goals')
        .select('*')
        .eq('id', goalId)
        .single();

      if (error) throw error;
      
      const transformedData = this.transformGoalFromDB(data);
      this.setCache(`goal:${goalId}`, transformedData);
      
      return transformedData;
    }, options);
  }

  async updateGoal(goalId: string, updates: Partial<RealGoal>, options: RepositoryOptions = {}): Promise<RepositoryResult<RealGoal>> {
    return this.withErrorHandling('updateGoal', async () => {
      const dbUpdates = this.transformGoalToDB(updates);
      
      const { data, error } = await supabase
        .from('productivity_goals')
        .update(dbUpdates)
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;
      
      const transformedData = this.transformGoalFromDB(data);
      this.setCache(`goal:${goalId}`, transformedData);
      
      return transformedData;
    }, options);
  }

  async deleteGoal(goalId: string, options: RepositoryOptions = {}): Promise<RepositoryResult<boolean>> {
    return this.withErrorHandling('deleteGoal', async () => {
      const { error } = await supabase
        .from('productivity_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      
      this.deleteCache(`goal:${goalId}`);
      return true;
    }, options);
  }

  async getUserGoals(userId: string, options: RepositoryOptions = {}): Promise<RepositoryResult<RealGoal[]>> {
    return this.withErrorHandling('getUserGoals', async () => {
      const cacheKey = `user_goals:${userId}`;
      
      // Check cache first
      if (options.useCache !== false) {
        const cached = this.getCache(cacheKey);
        if (cached) return cached;
      }

      const { data, error } = await supabase
        .from('productivity_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = data.map(this.transformGoalFromDB);
      this.setCache(cacheKey, transformedData);
      
      return transformedData;
    }, options);
  }

  // ============================================================================
  // HABIT OPERATIONS
  // ============================================================================

  async createHabit(habit: Omit<HabitPattern, 'id'>, options: RepositoryOptions = {}): Promise<RepositoryResult<HabitPattern>> {
    return this.withErrorHandling('createHabit', async () => {
      const { data, error } = await supabase
        .from('productivity_habits')
        .insert([{
          user_id: habit.userId,
          name: habit.name,
          cue: habit.cue,
          routine: habit.routine,
          reward: habit.reward,
          context: habit.context,
          category: habit.category,
          strength: habit.strength,
          streak: habit.streak,
          last_completed: habit.lastCompleted,
          missed_days: habit.missedDays,
        }])
        .select()
        .single();

      if (error) throw error;
      
      const transformedData = this.transformHabitFromDB(data);
      this.setCache(`habit:${transformedData.id}`, transformedData);
      
      return transformedData;
    }, options);
  }

  async getHabit(habitId: string, options: RepositoryOptions = {}): Promise<RepositoryResult<HabitPattern>> {
    return this.withErrorHandling('getHabit', async () => {
      // Check cache first
      if (options.useCache !== false) {
        const cached = this.getCache(`habit:${habitId}`);
        if (cached) return cached;
      }

      const { data, error } = await supabase
        .from('productivity_habits')
        .select('*')
        .eq('id', habitId)
        .single();

      if (error) throw error;
      
      const transformedData = this.transformHabitFromDB(data);
      this.setCache(`habit:${habitId}`, transformedData);
      
      return transformedData;
    }, options);
  }

  async updateHabit(habitId: string, updates: Partial<HabitPattern>, options: RepositoryOptions = {}): Promise<RepositoryResult<HabitPattern>> {
    return this.withErrorHandling('updateHabit', async () => {
      const dbUpdates = this.transformHabitToDB(updates);
      
      const { data, error } = await supabase
        .from('productivity_habits')
        .update(dbUpdates)
        .eq('id', habitId)
        .select()
        .single();

      if (error) throw error;
      
      const transformedData = this.transformHabitFromDB(data);
      this.setCache(`habit:${habitId}`, transformedData);
      
      return transformedData;
    }, options);
  }

  async getUserHabits(userId: string, options: RepositoryOptions = {}): Promise<RepositoryResult<HabitPattern[]>> {
    return this.withErrorHandling('getUserHabits', async () => {
      const cacheKey = `user_habits:${userId}`;
      
      // Check cache first
      if (options.useCache !== false) {
        const cached = this.getCache(cacheKey);
        if (cached) return cached;
      }

      const { data, error } = await supabase
        .from('productivity_habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = data.map(this.transformHabitFromDB);
      this.setCache(cacheKey, transformedData);
      
      return transformedData;
    }, options);
  }

  // ============================================================================
  // FOCUS SESSION OPERATIONS
  // ============================================================================

  async createFocusSession(session: Omit<FocusSession, 'id'>, options: RepositoryOptions = {}): Promise<RepositoryResult<FocusSession>> {
    return this.withErrorHandling('createFocusSession', async () => {
      const { data, error } = await supabase
        .from('productivity_sessions')
        .insert([{
          user_id: session.goalId ? this.getUserIdFromGoal(session.goalId) : null,
          goal_id: session.goalId,
          commitment_id: session.commitmentId,
          start_time: session.startTime,
          end_time: session.endTime,
          planned_minutes: session.plannedMinutes,
          actual_minutes: session.actualMinutes,
          quality: session.quality,
          distractions: session.distractions,
          interruptions: session.interruptions,
          notes: session.notes,
          real_accomplishments: session.realAccomplishments,
        }])
        .select()
        .single();

      if (error) throw error;
      
      const transformedData = this.transformSessionFromDB(data);
      this.setCache(`session:${transformedData.id}`, transformedData);
      
      return transformedData;
    }, options);
  }

  async updateFocusSession(sessionId: string, updates: Partial<FocusSession>, options: RepositoryOptions = {}): Promise<RepositoryResult<FocusSession>> {
    return this.withErrorHandling('updateFocusSession', async () => {
      const dbUpdates = this.transformSessionToDB(updates);
      
      const { data, error } = await supabase
        .from('productivity_sessions')
        .update(dbUpdates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      
      const transformedData = this.transformSessionFromDB(data);
      this.setCache(`session:${sessionId}`, transformedData);
      
      return transformedData;
    }, options);
  }

  async getUserSessions(userId: string, limit: number = 50, options: RepositoryOptions = {}): Promise<RepositoryResult<FocusSession[]>> {
    return this.withErrorHandling('getUserSessions', async () => {
      const cacheKey = `user_sessions:${userId}:${limit}`;
      
      // Check cache first
      if (options.useCache !== false) {
        const cached = this.getCache(cacheKey);
        if (cached) return cached;
      }

      const { data, error } = await supabase
        .from('productivity_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      const transformedData = data.map(this.transformSessionFromDB);
      this.setCache(cacheKey, transformedData);
      
      return transformedData;
    }, options);
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  private getCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  private setCache<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private deleteCache(key: string): void {
    this.cache.delete(key);
  }

  private clearUserCache(userId: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(userId) || key.startsWith('user_')
    );
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // ============================================================================
  // DATA TRANSFORMATION
  // ============================================================================

  private transformGoalFromDB(data: any): RealGoal {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      targetOutcome: data.target_outcome,
      successMetrics: data.success_metrics || [],
      estimatedImpact: data.estimated_impact,
      createdAt: new Date(data.created_at).getTime(),
      targetDate: data.target_date ? new Date(data.target_date).getTime() : null,
      status: data.status,
      progress: data.progress || 0,
      lastMilestoneDate: data.last_milestone_date ? new Date(data.last_milestone_date).getTime() : null,
      totalInvestmentMinutes: data.total_investment_minutes || 0,
      actualOutcomes: data.actual_outcomes || [],
    };
  }

  private transformGoalToDB(goal: Partial<RealGoal>): any {
    const transformed: any = {};
    
    if (goal.title !== undefined) transformed.title = goal.title;
    if (goal.description !== undefined) transformed.description = goal.description;
    if (goal.category !== undefined) transformed.category = goal.category;
    if (goal.priority !== undefined) transformed.priority = goal.priority;
    if (goal.targetOutcome !== undefined) transformed.target_outcome = goal.targetOutcome;
    if (goal.successMetrics !== undefined) transformed.success_metrics = goal.successMetrics;
    if (goal.estimatedImpact !== undefined) transformed.estimated_impact = goal.estimatedImpact;
    if (goal.targetDate !== undefined) transformed.target_date = goal.targetDate ? new Date(goal.targetDate).toISOString() : null;
    if (goal.status !== undefined) transformed.status = goal.status;
    if (goal.progress !== undefined) transformed.progress = goal.progress;
    if (goal.lastMilestoneDate !== undefined) transformed.last_milestone_date = goal.lastMilestoneDate ? new Date(goal.lastMilestoneDate).toISOString() : null;
    if (goal.totalInvestmentMinutes !== undefined) transformed.total_investment_minutes = goal.totalInvestmentMinutes;
    if (goal.actualOutcomes !== undefined) transformed.actual_outcomes = goal.actualOutcomes;
    
    return transformed;
  }

  private transformHabitFromDB(data: any): HabitPattern {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      cue: data.cue,
      routine: data.routine,
      reward: data.reward,
      context: data.context,
      category: data.category,
      strength: data.strength || 0,
      streak: data.streak || 0,
      lastCompleted: data.last_completed ? new Date(data.last_completed).getTime() : null,
      missedDays: data.missed_days || [],
    };
  }

  private transformHabitToDB(habit: Partial<HabitPattern>): any {
    const transformed: any = {};
    
    if (habit.name !== undefined) transformed.name = habit.name;
    if (habit.cue !== undefined) transformed.cue = habit.cue;
    if (habit.routine !== undefined) transformed.routine = habit.routine;
    if (habit.reward !== undefined) transformed.reward = habit.reward;
    if (habit.context !== undefined) transformed.context = habit.context;
    if (habit.category !== undefined) transformed.category = habit.category;
    if (habit.strength !== undefined) transformed.strength = habit.strength;
    if (habit.streak !== undefined) transformed.streak = habit.streak;
    if (habit.lastCompleted !== undefined) transformed.last_completed = habit.lastCompleted ? new Date(habit.lastCompleted).toISOString() : null;
    if (habit.missedDays !== undefined) transformed.missed_days = habit.missedDays;
    
    return transformed;
  }

  private transformSessionFromDB(data: any): FocusSession {
    return {
      id: data.id,
      goalId: data.goal_id,
      commitmentId: data.commitment_id,
      startTime: new Date(data.start_time).getTime(),
      endTime: data.end_time ? new Date(data.end_time).getTime() : null,
      plannedMinutes: data.planned_minutes,
      actualMinutes: data.actual_minutes,
      quality: data.quality,
      distractions: data.distractions || 0,
      interruptions: data.interruptions || 0,
      notes: data.notes || '',
      realAccomplishments: data.real_accomplishments || [],
    };
  }

  private transformSessionToDB(session: Partial<FocusSession>): any {
    const transformed: any = {};
    
    if (session.goalId !== undefined) transformed.goal_id = session.goalId;
    if (session.commitmentId !== undefined) transformed.commitment_id = session.commitmentId;
    if (session.startTime !== undefined) transformed.start_time = new Date(session.startTime).toISOString();
    if (session.endTime !== undefined) transformed.end_time = session.endTime ? new Date(session.endTime).toISOString() : null;
    if (session.plannedMinutes !== undefined) transformed.planned_minutes = session.plannedMinutes;
    if (session.actualMinutes !== undefined) transformed.actual_minutes = session.actualMinutes;
    if (session.quality !== undefined) transformed.quality = session.quality;
    if (session.distractions !== undefined) transformed.distractions = session.distractions;
    if (session.interruptions !== undefined) transformed.interruptions = session.interruptions;
    if (session.notes !== undefined) transformed.notes = session.notes;
    if (session.realAccomplishments !== undefined) transformed.real_accomplishments = session.realAccomplishments;
    
    return transformed;
  }

  // ============================================================================
  // ERROR HANDLING AND RETRY LOGIC
  // ============================================================================

  private async withErrorHandling<T>(
    operation: string,
    fn: () => Promise<T>,
    options: RepositoryOptions = {}
  ): Promise<RepositoryResult<T>> {
    const retryCount = options.retryCount || 0;
    const timeout = options.timeout || this.DEFAULT_TIMEOUT;

    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Operation timeout')), timeout)
        )
      ]);

      return {
        data: result,
        error: null,
        loading: false,
        retryable: false,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      debug.error('Repository operation failed: %s, Error: %s', operation, errorMessage);

      // Determine if error is retryable
      const retryable = this.isRetryableError(error);
      
      if (retryable && retryCount < this.MAX_RETRIES) {
        debug.info('Retrying operation %s (attempt %d/%d)', operation, retryCount + 1, this.MAX_RETRIES);
        
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.withErrorHandling(operation, fn, { ...options, retryCount: retryCount + 1 });
      }

      return {
        data: null,
        error: errorMessage,
        loading: false,
        retryable: retryable && retryCount < this.MAX_RETRIES,
      };
    }
  }

  private isRetryableError(error: any): boolean {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Network-related errors are typically retryable
    const retryablePatterns = [
      /network/i,
      /timeout/i,
      /connection/i,
      /unavailable/i,
      /rate limit/i,
      /502/i,
      /503/i,
      /504/i,
    ];

    return retryablePatterns.some(pattern => pattern.test(errorMessage));
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getUserIdFromGoal(goalId: string): string {
    // In a real implementation, this would cache goal data or make a query
    // For now, we'll assume the user ID is available from context
    return ''; // This would be implemented based on your auth context
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  async healthCheck(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    try {
      // Test basic connectivity
      const { error } = await supabase.from('productivity_goals').select('count').limit(1);
      
      if (error) {
        issues.push(`Database connectivity issue: ${error.message}`);
      }
    } catch (error) {
      issues.push(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check cache size
    if (this.cache.size > 1000) {
      issues.push('Cache size too large, may cause memory issues');
    }

    return {
      healthy: issues.length === 0,
      issues,
    };
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): {
    size: number;
    entries: Array<{ key: string; size: number; age: number; ttl: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      size: JSON.stringify(value.data).length,
      age: now - value.timestamp,
      ttl: value.ttl,
    }));

    return {
      size: this.cache.size,
      entries,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let productivityRepositoryInstance: ProductivityRepository | null = null;

export function getProductivityRepository(): ProductivityRepository {
  if (!productivityRepositoryInstance) {
    productivityRepositoryInstance = new ProductivityRepository();
  }
  return productivityRepositoryInstance;
}
