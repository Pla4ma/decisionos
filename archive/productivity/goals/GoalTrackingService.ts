/**
 * Real Goal Tracking Service
 * 
 * Replaces fake progression with actual goal achievement tracking.
 * This is how users make real progress in their lives.
 */

import { createDebugger } from '../../utils/debug';
import { eventBus } from '../../events';
import { getProductivityEngine } from '../core/ProductivityEngine';
import type { RealGoal, MicroCommitment } from '../core/ProductivityEngine';

const debug = createDebugger('productivity:goals');

// ============================================================================
// REAL GOAL PSYCHOLOGY
// ============================================================================

export interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  category: RealGoal['category'];
  impact: RealGoal['estimatedImpact'];
  typicalTimeframe: number; // days
  successCriteria: string[];
  microCommitments: string[];
  prerequisites: string[];
  commonObstacles: string[];
  strategies: string[];
}

export interface GoalProgress {
  goalId: string;
  currentProgress: number;
  lastWeekProgress: number;
  momentumScore: number; // -100 to 100, negative means declining
  consistencyScore: number; // 0-100, how consistent progress has been
  predictedCompletion: number | null; // timestamp or null if unpredictable
  riskFactors: string[];
  successFactors: string[];
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description: string;
  targetProgress: number; // percentage
  achievedAt: number | null;
  significance: 'MINOR' | 'MAJOR' | 'CRITICAL' | 'TRANSFORMATIONAL';
  celebrationType: 'QUIET' | 'PERSONAL' | 'SOCIAL' | 'PUBLIC';
}

export interface GoalInsight {
  type: 'PATTERN' | 'OBSTACLE' | 'OPPORTUNITY' | 'WARNING' | 'SUCCESS';
  title: string;
  description: string;
  confidence: number; // 0-100
  actionable: boolean;
  recommendations: string[];
  data: Record<string, unknown>;
}

// ============================================================================
// GOAL TRACKING SERVICE
// ============================================================================

export class GoalTrackingService {
  private userId: string | null = null;
  private productivityEngine = getProductivityEngine();
  private goalProgress: Map<string, GoalProgress> = new Map();
  private milestones: Map<string, Milestone[]> = new Map();
  private insights: Map<string, GoalInsight[]> = new Map();

  constructor(userId?: string) {
    this.userId = userId ?? null;
    if (userId) {
      this.productivityEngine.setUserId(userId);
    }
    debug.info('GoalTrackingService initialized for user: %s', userId);
  }

  // ============================================================================
  // SMART GOAL CREATION (REAL GOALS, NOT FANTASY)
  // ============================================================================

  async createSMARTGoal(goalData: {
    title: string;
    description: string;
    category: RealGoal['category'];
    targetOutcome: string;
    successMetrics: string[];
    targetDate?: number;
    priority?: RealGoal['priority'];
  }): Promise<RealGoal> {
    // Validate that this follows SMART principles
    const validatedGoal = this.validateSMARTGoal(goalData);
    
    // Create the goal through the productivity engine
    const goal = await this.productivityEngine.createGoal({
      ...validatedGoal,
      priority: validatedGoal.priority || 'MEDIUM',
      estimatedImpact: this.estimateImpact(validatedGoal),
      status: 'ACTIVE',
    });

    // Generate initial milestones
    await this.generateMilestones(goal);

    // Create initial insights
    await this.generateInitialInsights(goal);

    debug.info('Created SMART goal: %s', goal.title);

    return goal;
  }

  private validateSMARTGoal(goalData: {
    title: string;
    description: string;
    category: RealGoal['category'];
    targetOutcome: string;
    successMetrics: string[];
    targetDate?: number;
    priority?: RealGoal['priority'];
  }): typeof goalData {
    // S - Specific
    if (!goalData.title || goalData.title.length < 5) {
      throw new Error('Goal title must be specific and meaningful');
    }

    // M - Measurable
    if (!goalData.successMetrics || goalData.successMetrics.length === 0) {
      throw new Error('Goals must have clear, measurable success criteria');
    }

    // A - Achievable
    if (goalData.targetOutcome.length < 10) {
      throw new Error('Target outcome must be detailed enough to be achievable');
    }

    // R - Relevant
    if (!goalData.category || !['CAREER', 'HEALTH', 'RELATIONSHIPS', 'LEARNING', 'FINANCIAL', 'CREATIVE'].includes(goalData.category)) {
      throw new Error('Goal must be relevant to a life category');
    }

    // T - Time-bound
    if (goalData.targetDate && goalData.targetDate <= Date.now()) {
      throw new Error('Target date must be in the future');
    }

    // Additional validation for meaningful goals
    const weakWords = ['try', 'attempt', 'consider', 'maybe', 'hopefully'];
    const hasWeakWords = weakWords.some(word => 
      goalData.title.toLowerCase().includes(word) || 
      goalData.targetOutcome.toLowerCase().includes(word)
    );

    if (hasWeakWords) {
      throw new Error('Goals should be confident and committed, not tentative');
    }

    return goalData;
  }

  private estimateImpact(goal: typeof goalData): RealGoal['estimatedImpact'] {
    // Estimate impact based on category and scope
    const categoryImpacts = {
      'CAREER': { base: 'MODERATE', keywords: ['PROMOTION', 'SALARY', 'BUSINESS', 'CAREER'] },
      'HEALTH': { base: 'MAJOR', keywords: ['HEALTH', 'FITNESS', 'WEIGHT', 'MEDICAL'] },
      'FINANCIAL': { base: 'MODERATE', keywords: ['MONEY', 'INVEST', 'DEBT', 'FINANCIAL'] },
      'RELATIONSHIPS': { base: 'MAJOR', keywords: ['RELATIONSHIP', 'FAMILY', 'FRIENDS', 'SOCIAL'] },
      'LEARNING': { base: 'MODERATE', keywords: ['LEARN', 'SKILL', 'EDUCATION', 'KNOWLEDGE'] },
      'CREATIVE': { base: 'MINOR', keywords: ['CREATE', 'ART', 'MUSIC', 'WRITING'] },
    };

    const categoryImpact = categoryImpacts[goal.category];
    let impact = categoryImpact.base;

    // Check for transformational keywords
    const transformationalKeywords = ['TRANSFORM', 'REVOLUTIONIZE', 'COMPLETELY', 'FUNDAMENTALLY'];
    const hasTransformational = transformationalKeywords.some(keyword =>
      goal.targetOutcome.toUpperCase().includes(keyword)
    );

    if (hasTransformational) {
      impact = 'TRANSFORMATIVE';
    } else {
      // Check for major impact keywords
      const majorKeywords = ['SIGNIFICANTLY', 'MAJOR', 'SUBSTANTIALLY', 'DRAMATICALLY'];
      const hasMajor = majorKeywords.some(keyword =>
        goal.targetOutcome.toUpperCase().includes(keyword)
      );

      if (hasMajor) {
        impact = 'MAJOR';
      }
    }

    return impact as RealGoal['estimatedImpact'];
  }

  // ============================================================================
  // MILESTONE MANAGEMENT (REAL PROGRESS MARKERS)
  // ============================================================================

  private async generateMilestones(goal: RealGoal): Promise<void> {
    const milestones: Milestone[] = [];

    // Generate logical milestones based on goal type and impact
    if (goal.estimatedImpact === 'TRANSFORMATIVE') {
      milestones.push(
        {
          id: this.generateId(),
          goalId: goal.id,
          title: 'Foundation Established',
          description: 'Basic structure and resources are in place',
          targetProgress: 10,
          achievedAt: null,
          significance: 'MINOR',
          celebrationType: 'QUIET',
        },
        {
          id: this.generateId(),
          goalId: goal.id,
          title: 'First Major Breakthrough',
          description: 'Significant progress toward the transformation',
          targetProgress: 25,
          achievedAt: null,
          significance: 'MAJOR',
          celebrationType: 'PERSONAL',
        },
        {
          id: this.generateId(),
          goalId: goal.id,
          title: 'Halfway Point',
          description: 'The transformation is taking shape',
          targetProgress: 50,
          achievedAt: null,
          significance: 'CRITICAL',
          celebrationType: 'SOCIAL',
        },
        {
          id: this.generateId(),
          goalId: goal.id,
          title: 'Final Push',
          description: 'The last phase of transformation',
          targetProgress: 75,
          achievedAt: null,
          significance: 'MAJOR',
          celebrationType: 'PERSONAL',
        }
      );
    } else if (goal.estimatedImpact === 'MAJOR') {
      milestones.push(
        {
          id: this.generateId(),
          goalId: goal.id,
          title: 'Momentum Built',
          description: 'Consistent progress established',
          targetProgress: 25,
          achievedAt: null,
          significance: 'MINOR',
          celebrationType: 'QUIET',
        },
        {
          id: this.generateId(),
          goalId: goal.id,
          title: 'Critical Mass',
          description: 'Major progress achieved',
          targetProgress: 60,
          achievedAt: null,
          significance: 'MAJOR',
          celebrationType: 'PERSONAL',
        }
      );
    } else {
      // Moderate or Minor impact - single milestone
      milestones.push({
        id: this.generateId(),
        goalId: goal.id,
        title: 'Goal Achieved',
        description: 'Successfully completed the objective',
        targetProgress: 100,
        achievedAt: null,
        significance: 'MAJOR',
        celebrationType: 'SOCIAL',
      });
    }

    this.milestones.set(goal.id, milestones);
    debug.info('Generated %d milestones for goal: %s', milestones.length, goal.title);
  }

  async updateGoalProgress(goalId: string, newProgress: number, realOutcome?: string): Promise<void> {
    const goal = this.productivityEngine.getGoalById(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    // Update progress through productivity engine
    await this.productivityEngine.updateGoalProgress(goalId, newProgress, realOutcome);

    // Update tracking data
    await this.updateProgressTracking(goalId, newProgress);

    // Check for milestone achievements
    await this.checkMilestones(goalId, newProgress);

    // Generate new insights
    await this.generateProgressInsights(goalId, newProgress);
  }

  private async updateProgressTracking(goalId: string, newProgress: number): Promise<void> {
    let progress = this.goalProgress.get(goalId);
    
    if (!progress) {
      progress = {
        goalId,
        currentProgress: newProgress,
        lastWeekProgress: 0,
        momentumScore: 0,
        consistencyScore: 100,
        predictedCompletion: null,
        riskFactors: [],
        successFactors: [],
      };
      this.goalProgress.set(goalId, progress);
    }

    const oldProgress = progress.currentProgress;
    progress.currentProgress = newProgress;

    // Calculate momentum (change in progress rate)
    const progressChange = newProgress - oldProgress;
    progress.momentumScore = Math.max(-100, Math.min(100, progress.momentumScore + progressChange * 2));

    // Update consistency based on regular progress
    if (progressChange > 0) {
      progress.consistencyScore = Math.min(100, progress.consistencyScore + 5);
    } else if (progressChange === 0) {
      progress.consistencyScore = Math.max(0, progress.consistencyScore - 2);
    }

    // Predict completion based on current rate
    if (progress.momentumScore > 0) {
      const daysToCompletion = Math.ceil((100 - newProgress) / Math.max(0.1, progress.momentumScore / 10));
      progress.predictedCompletion = Date.now() + (daysToCompletion * 24 * 60 * 60 * 1000);
    } else {
      progress.predictedCompletion = null;
    }

    debug.info('Updated progress tracking for goal %s: %d%%', goalId, newProgress);
  }

  private async checkMilestones(goalId: string, progress: number): Promise<void> {
    const milestones = this.milestones.get(goalId) || [];
    
    for (const milestone of milestones) {
      if (!milestone.achievedAt && progress >= milestone.targetProgress) {
        milestone.achievedAt = Date.now();
        
        debug.info('Milestone achieved: %s for goal %s', milestone.title, goalId);
        
        eventBus.publish('achievement:milestone_reached', {
          milestoneType: milestone.significance,
          value: milestone.targetProgress,
          context: milestone.title,
        });

        // Trigger celebration based on significance
        await this.celebrateMilestone(milestone);
      }
    }
  }

  private async celebrateMilestone(milestone: Milestone): Promise<void> {
    // Real celebration based on actual achievement
    const celebrationData = {
      type: milestone.celebrationType,
      title: milestone.title,
      description: milestone.description,
      significance: milestone.significance,
    };

    eventBus.publish('achievement:real_celebration', {
      type: milestone.celebrationType,
      goalTitle: milestone.title,
      impactScore: milestone.targetProgress,
      realOutcomes: [milestone.description],
      investmentMinutes: 0, // Would calculate from actual time spent
    });

    debug.info('Celebrating milestone: %s (%s)', milestone.title, milestone.celebrationType);
  }

  // ============================================================================
  // INSIGHTS GENERATION (REAL ANALYSIS, NOT FANTASY)
  // ============================================================================

  private async generateInitialInsights(goal: RealGoal): Promise<void> {
    const insights: GoalInsight[] = [];

    // Category-specific insights
    switch (goal.category) {
      case 'HEALTH':
        insights.push({
          type: 'OPPORTUNITY',
          title: 'Consistency is Key',
          description: 'Health goals benefit most from small, consistent daily actions rather than intense occasional efforts.',
          confidence: 85,
          actionable: true,
          recommendations: [
            'Start with 5-10 minute daily habits',
            'Track consistency rather than intensity',
            'Focus on showing up every day',
          ],
          data: { category: 'HEALTH' },
        });
        break;

      case 'CAREER':
        insights.push({
          type: 'OPPORTUNITY',
          title: 'Network Effects Compound',
          description: 'Career progress often accelerates as skills and connections compound over time.',
          confidence: 75,
          actionable: true,
          recommendations: [
            'Build relationships while building skills',
            'Document your progress and achievements',
            'Look for opportunities to apply new skills immediately',
          ],
          data: { category: 'CAREER' },
        });
        break;

      case 'FINANCIAL':
        insights.push({
          type: 'WARNING',
          title: 'Automation Beats Willpower',
          description: 'Financial goals succeed more often when automated rather than relying on daily decisions.',
          confidence: 90,
          actionable: true,
          recommendations: [
            'Set up automatic transfers first',
            'Create barriers to impulsive spending',
            'Review progress weekly, not daily',
          ],
          data: { category: 'FINANCIAL' },
        });
        break;
    }

    // Impact-specific insights
    if (goal.estimatedImpact === 'TRANSFORMATIVE') {
      insights.push({
        type: 'WARNING',
        title: 'Transformation Takes Time',
        description: 'Major life changes typically take 6-18 months to fully integrate. Prepare for the long journey.',
        confidence: 95,
        actionable: true,
        recommendations: [
          'Break into phases with mini-goals',
          'Expect setbacks and plan recovery strategies',
          'Focus on systems, not just outcomes',
        ],
        data: { impact: 'TRANSFORMATIVE' },
      });
    }

    this.insights.set(goal.id, insights);
    debug.info('Generated %d initial insights for goal: %s', insights.length, goal.title);
  }

  private async generateProgressInsights(goalId: string, progress: number): Promise<void> {
    const existingInsights = this.insights.get(goalId) || [];
    const progressData = this.goalProgress.get(goalId);
    
    if (!progressData) return;

    const newInsights: GoalInsight[] = [];

    // Momentum-based insights
    if (progressData.momentumScore < -30) {
      newInsights.push({
        type: 'WARNING',
        title: 'Losing Momentum',
        description: 'Progress has slowed significantly. This is a critical intervention point.',
        confidence: 80,
        actionable: true,
        recommendations: [
          'Review what worked in the beginning',
          'Reduce goal scope temporarily',
          'Seek accountability or support',
        ],
        data: { momentumScore: progressData.momentumScore },
      });
    } else if (progressData.momentumScore > 50) {
      newInsights.push({
        type: 'SUCCESS',
        title: 'Strong Momentum',
        description: 'Current approach is working well. Consider doubling down on what\'s effective.',
        confidence: 85,
        actionable: true,
        recommendations: [
          'Identify the key drivers of current success',
          'Increase investment in successful strategies',
          'Document your winning formula',
        ],
        data: { momentumScore: progressData.momentumScore },
      });
    }

    // Consistency-based insights
    if (progressData.consistencyScore < 50) {
      newInsights.push({
        type: 'PATTERN',
        title: 'Inconsistent Pattern Detected',
        description: 'Progress is sporadic. Regular small steps would be more effective than inconsistent large efforts.',
        confidence: 75,
        actionable: true,
        recommendations: [
          'Set minimum daily/weekly targets',
          'Create triggers for goal-related actions',
          'Build accountability mechanisms',
        ],
        data: { consistencyScore: progressData.consistencyScore },
      });
    }

    // Add new insights if they're not duplicates
    for (const newInsight of newInsights) {
      const isDuplicate = existingInsights.some(existing => 
        existing.title === newInsight.title && existing.type === newInsight.type
      );
      
      if (!isDuplicate) {
        existingInsights.push(newInsight);
        debug.info('New insight generated for goal %s: %s', goalId, newInsight.title);
      }
    }

    this.insights.set(goalId, existingInsights);
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  getGoalProgress(goalId: string): GoalProgress | undefined {
    return this.goalProgress.get(goalId);
  }

  getGoalMilestones(goalId: string): Milestone[] {
    return this.milestones.get(goalId) || [];
  }

  getGoalInsights(goalId: string): GoalInsight[] {
    return this.insights.get(goalId) || [];
  }

  getAllGoals(): RealGoal[] {
    return this.productivityEngine.getActiveGoals();
  }

  getGoalById(goalId: string): RealGoal | undefined {
    return this.productivityEngine.getGoalById(goalId);
  }

  setUserId(userId: string): void {
    this.userId = userId;
    this.productivityEngine.setUserId(userId);
    debug.info('GoalTrackingService user set: %s', userId);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let goalTrackingServiceInstance: GoalTrackingService | null = null;

export function getGoalTrackingService(userId?: string): GoalTrackingService {
  if (!goalTrackingServiceInstance) {
    goalTrackingServiceInstance = new GoalTrackingService(userId);
  } else if (userId) {
    goalTrackingServiceInstance.setUserId(userId);
  }
  return goalTrackingServiceInstance;
}
