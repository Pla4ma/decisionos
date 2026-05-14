/**
 * Goal Repository
 * 
 * Specialized repository for goal-related operations with advanced querying capabilities.
 */

import { createDebugger } from '../../utils/debug';
import { getProductivityRepository } from './ProductivityRepository';
import type { RealGoal } from '../core/ProductivityEngine';

const debug = createDebugger('productivity:goal-repository');

// ============================================================================
// GOAL REPOSITORY
// ============================================================================

export class GoalRepository {
  private baseRepository = getProductivityRepository();

  // ============================================================================
  // ADVANCED GOAL QUERIES
  // ============================================================================

  async getGoalsByCategory(userId: string, category: RealGoal['category']): Promise<RealGoal[]> {
    debug.info('Getting goals by category: %s for user: %s', category, userId);
    
    const result = await this.baseRepository.getUserGoals(userId);
    if (result.error || !result.data) {
      return [];
    }
    
    return result.data.filter(goal => goal.category === category);
  }

  async getGoalsByStatus(userId: string, status: RealGoal['status']): Promise<RealGoal[]> {
    debug.info('Getting goals by status: %s for user: %s', status, userId);
    
    const result = await this.baseRepository.getUserGoals(userId);
    if (result.error || !result.data) {
      return [];
    }
    
    return result.data.filter(goal => goal.status === status);
  }

  async getGoalsByPriority(userId: string, priority: RealGoal['priority']): Promise<RealGoal[]> {
    debug.info('Getting goals by priority: %s for user: %s', priority, userId);
    
    const result = await this.baseRepository.getUserGoals(userId);
    if (result.error || !result.data) {
      return [];
    }
    
    return result.data.filter(goal => goal.priority === priority);
  }

  async getOverdueGoals(userId: string): Promise<RealGoal[]> {
    debug.info('Getting overdue goals for user: %s', userId);
    
    const result = await this.baseRepository.getUserGoals(userId);
    if (result.error || !result.data) {
      return [];
    }
    
    const now = Date.now();
    return result.data.filter(goal => 
      goal.targetDate && 
      goal.targetDate < now && 
      goal.status !== 'COMPLETED' && 
      goal.status !== 'CANCELLED'
    );
  }

  async getGoalsNearCompletion(userId: string, threshold: number = 75): Promise<RealGoal[]> {
    debug.info('Getting goals near completion for user: %s', userId);
    
    const result = await this.baseRepository.getUserGoals(userId);
    if (result.error || !result.data) {
      return [];
    }
    
    return result.data.filter(goal => 
      goal.progress >= threshold && 
      goal.status === 'ACTIVE'
    );
  }

  async getStalledGoals(userId: string, threshold: number = 30): Promise<RealGoal[]> {
    debug.info('Getting stalled goals for user: %s', userId);
    
    const result = await this.baseRepository.getUserGoals(userId);
    if (result.error || !result.data) {
      return [];
    }
    
    return result.data.filter(goal => 
      goal.progress > 0 && 
      goal.progress < threshold && 
      goal.status === 'ACTIVE'
    );
  }

  async getGoalsByImpact(userId: string, impact: RealGoal['estimatedImpact']): Promise<RealGoal[]> {
    debug.info('Getting goals by impact: %s for user: %s', impact, userId);
    
    const result = await this.baseRepository.getUserGoals(userId);
    if (result.error || !result.data) {
      return [];
    }
    
    return result.data.filter(goal => goal.estimatedImpact === impact);
  }

  async getRecentGoals(userId: string, days: number = 30): Promise<RealGoal[]> {
    debug.info('Getting recent goals for user: %s (last %d days)', userId, days);
    
    const result = await this.baseRepository.getUserGoals(userId);
    if (result.error || !result.data) {
      return [];
    }
    
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    return result.data.filter(goal => goal.createdAt >= cutoffDate);
  }

  async searchGoals(userId: string, query: string): Promise<RealGoal[]> {
    debug.info('Searching goals for user: %s with query: %s', userId, query);
    
    const result = await this.baseRepository.getUserGoals(userId);
    if (result.error || !result.data) {
      return [];
    }
    
    const lowerQuery = query.toLowerCase();
    return result.data.filter(goal => 
      goal.title.toLowerCase().includes(lowerQuery) ||
      goal.description.toLowerCase().includes(lowerQuery) ||
      goal.targetOutcome.toLowerCase().includes(lowerQuery) ||
      goal.actualOutcomes.some(outcome => outcome.toLowerCase().includes(lowerQuery))
    );
  }

  // ============================================================================
  // GOAL ANALYTICS
  // ============================================================================

  async getGoalStatistics(userId: string): Promise<{
    total: number;
    completed: number;
    active: number;
    paused: number;
    cancelled: number;
    averageProgress: number;
    totalInvestmentMinutes: number;
    completionRate: number;
    byCategory: Record<RealGoal['category'], number>;
    byPriority: Record<RealGoal['priority'], number>;
    byImpact: Record<RealGoal['estimatedImpact'], number>;
  }> {
    debug.info('Getting goal statistics for user: %s', userId);
    
    const result = await this.baseRepository.getUserGoals(userId);
    if (result.error || !result.data) {
      return {
        total: 0,
        completed: 0,
        active: 0,
        paused: 0,
        cancelled: 0,
        averageProgress: 0,
        totalInvestmentMinutes: 0,
        completionRate: 0,
        byCategory: {} as Record<RealGoal['category'], number>,
        byPriority: {} as Record<RealGoal['priority'], number>,
        byImpact: {} as Record<RealGoal['estimatedImpact'], number>,
      };
    }
    
    const goals = result.data;
    
    const stats = {
      total: goals.length,
      completed: goals.filter(g => g.status === 'COMPLETED').length,
      active: goals.filter(g => g.status === 'ACTIVE').length,
      paused: goals.filter(g => g.status === 'PAUSED').length,
      cancelled: goals.filter(g => g.status === 'CANCELLED').length,
      averageProgress: goals.reduce((sum, g) => sum + g.progress, 0) / Math.max(1, goals.length),
      totalInvestmentMinutes: goals.reduce((sum, g) => sum + g.totalInvestmentMinutes, 0),
      completionRate: 0,
      byCategory: {} as Record<RealGoal['category'], number>,
      byPriority: {} as Record<RealGoal['priority'], number>,
      byImpact: {} as Record<RealGoal['estimatedImpact'], number>,
    };
    
    stats.completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
    
    // Calculate by category
    const categories: RealGoal['category'][] = ['CAREER', 'HEALTH', 'RELATIONSHIPS', 'LEARNING', 'FINANCIAL', 'CREATIVE'];
    categories.forEach(cat => {
      stats.byCategory[cat] = goals.filter(g => g.category === cat).length;
    });
    
    // Calculate by priority
    const priorities: RealGoal['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    priorities.forEach(pri => {
      stats.byPriority[pri] = goals.filter(g => g.priority === pri).length;
    });
    
    // Calculate by impact
    const impacts: RealGoal['estimatedImpact'][] = ['MINOR', 'MODERATE', 'MAJOR', 'TRANSFORMATIVE'];
    impacts.forEach(imp => {
      stats.byImpact[imp] = goals.filter(g => g.estimatedImpact === imp).length;
    });
    
    return stats;
  }

  async getGoalProgressHistory(userId: string, goalId: string, days: number = 30): Promise<Array<{
    date: string;
    progress: number;
    investmentMinutes: number;
  }>> {
    debug.info('Getting goal progress history for user: %s, goal: %s', userId, goalId);
    
    // This would typically query a separate progress history table
    // For now, we'll return a simplified version based on current data
    const goalResult = await this.baseRepository.getGoal(goalId);
    if (goalResult.error || !goalResult.data) {
      return [];
    }
    
    const goal = goalResult.data;
    const history = [];
    
    // Generate sample history points (in real implementation, would query actual history)
    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
      const progress = Math.max(0, goal.progress - (i * 2)); // Sample progression
      const investment = Math.floor((goal.totalInvestmentMinutes * progress) / 100);
      
      history.push({
        date,
        progress,
        investmentMinutes: investment,
      });
    }
    
    return history;
  }

  // ============================================================================
  // GOAL RELATIONSHIPS
  // ============================================================================

  async getRelatedGoals(userId: string, goalId: string): Promise<RealGoal[]> {
    debug.info('Getting related goals for user: %s, goal: %s', userId, goalId);
    
    const goalResult = await this.baseRepository.getGoal(goalId);
    if (goalResult.error || !goalResult.data) {
      return [];
    }
    
    const goal = goalResult.data;
    const allGoalsResult = await this.baseRepository.getUserGoals(userId);
    if (allGoalsResult.error || !allGoalsResult.data) {
      return [];
    }
    
    const allGoals = allGoalsResult.data.filter(g => g.id !== goalId);
    
    // Find goals with same category
    const sameCategory = allGoals.filter(g => g.category === goal.category);
    
    // Find goals with similar priority
    const samePriority = allGoals.filter(g => g.priority === goal.priority);
    
    // Combine and remove duplicates, limit to 5
    const related = [...sameCategory, ...samePriority]
      .filter((goal, index, arr) => arr.findIndex(g => g.id === goal.id) === index)
      .slice(0, 5);
    
    return related;
  }

  async getGoalDependencies(userId: string, goalId: string): Promise<RealGoal[]> {
    debug.info('Getting goal dependencies for user: %s, goal: %s', userId, goalId);
    
    // This would typically query a goal dependencies table
    // For now, return empty array as dependencies aren't implemented yet
    return [];
  }

  async getBlockingGoals(userId: string, goalId: string): Promise<RealGoal[]> {
    debug.info('Getting blocking goals for user: %s, goal: %s', userId, goalId);
    
    // This would typically query a goal dependencies table
    // For now, return empty array as dependencies aren't implemented yet
    return [];
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  async bulkUpdateGoalStatus(goalIds: string[], status: RealGoal['status']): Promise<{
    success: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    debug.info('Bulk updating goal status for %d goals', goalIds.length);
    
    const success: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];
    
    for (const goalId of goalIds) {
      const result = await this.baseRepository.updateGoal(goalId, { status });
      
      if (result.error) {
        failed.push({ id: goalId, error: result.error });
      } else if (result.data) {
        success.push(goalId);
      }
    }
    
    return { success, failed };
  }

  async bulkDeleteGoals(goalIds: string[]): Promise<{
    success: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    debug.info('Bulk deleting %d goals', goalIds.length);
    
    const success: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];
    
    for (const goalId of goalIds) {
      const result = await this.baseRepository.deleteGoal(goalId);
      
      if (result.error) {
        failed.push({ id: goalId, error: result.error });
      } else if (result.data) {
        success.push(goalId);
      }
    }
    
    return { success, failed };
  }

  // ============================================================================
  // GOAL TEMPLATES
  // ============================================================================

  async getGoalTemplates(): Promise<Array<{
    id: string;
    title: string;
    description: string;
    category: RealGoal['category'];
    estimatedImpact: RealGoal['estimatedImpact'];
    successMetrics: string[];
    suggestedTimeframe: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  }>> {
    debug.info('Getting goal templates');
    
    // Return predefined goal templates
    return [
      {
        id: 'weight-loss',
        title: 'Lose Weight and Improve Health',
        description: 'Achieve sustainable weight loss through healthy eating and regular exercise',
        category: 'HEALTH',
        estimatedImpact: 'MAJOR',
        successMetrics: [
          'Weight loss of 10-20 pounds',
          'Consistent exercise 3+ times per week',
          'Improved energy levels',
          'Better sleep quality',
        ],
        suggestedTimeframe: 90,
        difficulty: 'MEDIUM',
      },
      {
        id: 'learn-skill',
        title: 'Learn a New Skill',
        description: 'Master a new professional or personal skill through dedicated practice',
        category: 'LEARNING',
        estimatedImpact: 'MODERATE',
        successMetrics: [
          'Complete structured learning program',
          'Apply skill in real project',
          'Receive positive feedback',
          'Feel confident using skill',
        ],
        suggestedTimeframe: 60,
        difficulty: 'MEDIUM',
      },
      {
        id: 'career-promotion',
        title: 'Get Promoted at Work',
        description: 'Achieve career advancement through exceptional performance and skill development',
        category: 'CAREER',
        estimatedImpact: 'TRANSFORMATIVE',
        successMetrics: [
          'Exceed performance expectations',
          'Develop leadership skills',
          'Take on additional responsibilities',
          'Receive promotion offer',
        ],
        suggestedTimeframe: 180,
        difficulty: 'HARD',
      },
      {
        id: 'save-money',
        title: 'Build Emergency Fund',
        description: 'Save 3-6 months of expenses for financial security',
        category: 'FINANCIAL',
        estimatedImpact: 'MODERATE',
        successMetrics: [
          'Save target amount',
          'Establish automatic savings',
          'Reduce unnecessary expenses',
          'Create budget system',
        ],
        suggestedTimeframe: 120,
        difficulty: 'EASY',
      },
      {
        id: 'improve-relationships',
        title: 'Strengthen Key Relationships',
        description: 'Deepen connections with important people in your life',
        category: 'RELATIONSHIPS',
        estimatedImpact: 'MAJOR',
        successMetrics: [
          'Regular meaningful conversations',
          'Resolve conflicts constructively',
          'Create shared experiences',
          'Express appreciation regularly',
        ],
        suggestedTimeframe: 90,
        difficulty: 'MEDIUM',
      },
      {
        id: 'creative-project',
        title: 'Complete Creative Project',
        description: 'Finish a creative work that expresses your unique vision',
        category: 'CREATIVE',
        estimatedImpact: 'MODERATE',
        successMetrics: [
          'Complete project to satisfaction',
          'Share work with others',
          'Receive meaningful feedback',
          'Feel proud of accomplishment',
        ],
        suggestedTimeframe: 60,
        difficulty: 'MEDIUM',
      },
    ];
  }

  async createGoalFromTemplate(userId: string, templateId: string, customizations?: {
    title?: string;
    description?: string;
    targetDate?: number;
    priority?: RealGoal['priority'];
  }): Promise<RealGoal | null> {
    debug.info('Creating goal from template: %s for user: %s', templateId, userId);
    
    const templates = await this.getGoalTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      debug.error('Template not found: %s', templateId);
      return null;
    }
    
    const goalData = {
      title: customizations?.title || template.title,
      description: customizations?.description || template.description,
      category: template.category,
      targetOutcome: template.description,
      successMetrics: template.successMetrics,
      estimatedImpact: template.estimatedImpact,
      targetDate: customizations?.targetDate || (Date.now() + template.suggestedTimeframe * 24 * 60 * 60 * 1000),
      priority: customizations?.priority || 'MEDIUM',
    };
    
    const result = await this.baseRepository.createGoal(goalData);
    
    if (result.error || !result.data) {
      debug.error('Failed to create goal from template: %s', result.error);
      return null;
    }
    
    return result.data;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let goalRepositoryInstance: GoalRepository | null = null;

export function getGoalRepository(): GoalRepository {
  if (!goalRepositoryInstance) {
    goalRepositoryInstance = new GoalRepository();
  }
  return goalRepositoryInstance;
}
