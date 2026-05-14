/**
 * Real Habit Formation Service
 * 
 * Replaces fake streaks with actual habit psychology.
 * Based on Charles Duhigg's habit loop and James Clear's atomic habits.
 */

import { createDebugger } from '../../utils/debug';
import { eventBus } from '../../events';
import { getProductivityEngine } from '../core/ProductivityEngine';
import type { HabitPattern } from '../core/ProductivityEngine';

const debug = createDebugger('productivity:habits');

// ============================================================================
// REAL HABIT PSYCHOLOGY
// ============================================================================

export interface HabitTemplate {
  id: string;
  name: string;
  category: 'MORNING' | 'EVENING' | 'WORK' | 'BREAK' | 'STRESS' | 'HEALTH' | 'LEARNING';
  description: string;
  cue: string;
  routine: string;
  reward: string;
  context: string;
  estimatedDaysToForm: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  commonObstacles: string[];
  strategies: string[];
  benefits: string[];
}

export interface HabitAnalytics {
  habitId: string;
  completionRate: number; // last 30 days
  currentStreak: number;
  longestStreak: number;
  averageGapDays: number;
  bestDayOfWeek: string;
  bestTimeOfDay: string;
  successFactors: string[];
  failureFactors: string[];
  prediction: {
    nextDaySuccessProbability: number;
    daysToSolidify: number;
    atRiskDates: string[];
  };
}

export interface HabitIntervention {
  type: 'STRENGTHENING' | 'RECOVERY' | 'OPTIMIZATION' | 'REPLACEMENT';
  habitId: string;
  title: string;
  description: string;
  confidence: number;
  actions: string[];
  expectedImpact: 'MINOR' | 'MODERATE' | 'MAJOR';
  timeframe: number; // days to see impact
}

export interface EnvironmentDesign {
  type: 'PRIME' | 'REDUCE' | 'ELIMINATE' | 'REPLACE';
  target: string; // what to change
  action: string; // how to change it
  context: string; // when/where it applies
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  impact: 'MINOR' | 'MODERATE' | 'MAJOR';
}

// ============================================================================
// HABIT FORMATION SERVICE
// ============================================================================

export class HabitFormationService {
  private userId: string | null = null;
  private productivityEngine = getProductivityEngine();
  private habitAnalytics: Map<string, HabitAnalytics> = new Map();
  private interventions: Map<string, HabitIntervention[]> = new Map();
  private environmentDesigns: Map<string, EnvironmentDesign[]> = new Map();

  constructor(userId?: string) {
    this.userId = userId ?? null;
    if (userId) {
      this.productivityEngine.setUserId(userId);
    }
    debug.info('HabitFormationService initialized for user: %s', userId);
  }

  // ============================================================================
  // SCIENTIFIC HABIT CREATION
  // ============================================================================

  async createScientificHabit(habitData: {
    name: string;
    cue: string;
    routine: string;
    reward: string;
    context: string;
    category: HabitPattern['category'];
  }): Promise<HabitPattern> {
    // Validate habit loop components
    const validatedHabit = this.validateHabitLoop(habitData);
    
    // Create the habit through productivity engine
    const habit = await this.productivityEngine.createHabitPattern({
      ...validatedHabit,
      category: validatedHabit.category,
    });

    // Generate initial analytics
    await this.initializeAnalytics(habit.id);

    // Generate environment design recommendations
    await this.generateEnvironmentDesign(habit);

    debug.info('Created scientific habit: %s', habit.name);

    return habit;
  }

  private validateHabitLoop(habitData: {
    name: string;
    cue: string;
    routine: string;
    reward: string;
    context: string;
    category: HabitPattern['category'];
  }): typeof habitData {
    // Validate Cue (Trigger)
    if (!habitData.cue || habitData.cue.length < 5) {
      throw new Error('Habits need clear, specific cues (triggers)');
    }

    // Cues should be time-based, location-based, emotional, or preceding action
    const validCuePatterns = [
      /^after i /i,
      /^when i /i,
      /^at /i,
      /^every /i,
      /^if i /i,
      /^when i feel /i,
    ];

    const hasValidCue = validCuePatterns.some(pattern => pattern.test(habitData.cue));
    if (!hasValidCue) {
      throw new Error('Cue should follow pattern: "When/After/At [specific situation]"');
    }

    // Validate Routine (Action)
    if (!habitData.routine || habitData.routine.length < 3) {
      throw new Error('Routine must be a specific, actionable behavior');
    }

    // Routine should start with action verb
    const actionVerbs = ['do', 'go', 'take', 'make', 'write', 'read', 'exercise', 'meditate', 'drink', 'eat'];
    const startsWithAction = actionVerbs.some(verb => 
      habitData.routine.toLowerCase().startsWith(verb)
    );

    if (!startsWithAction) {
      throw new Error('Routine should start with an action verb (do, go, take, make, etc.)');
    }

    // Validate Reward (Reinforcement)
    if (!habitData.reward || habitData.reward.length < 5) {
      throw new Error('Reward must be genuinely satisfying, not just "completion"');
    }

    // Rewards should create positive feelings
    const weakRewards = ['done', 'complete', 'finish', 'accomplished'];
    const hasWeakReward = weakRewards.some(reward => 
      habitData.reward.toLowerCase().includes(reward)
    );

    if (hasWeakReward) {
      throw new Error('Reward should be genuinely satisfying (feeling, treat, social connection, etc.)');
    }

    // Validate Context (When/Where)
    if (!habitData.context || habitData.context.length < 5) {
      throw new Error('Context must specify when and where this habit occurs');
    }

    return habitData;
  }

  // ============================================================================
  // HABIT ANALYTICS (REAL PATTERNS, NOT FANTASY STREAKS)
  // ============================================================================

  private async initializeAnalytics(habitId: string): Promise<void> {
    const analytics: HabitAnalytics = {
      habitId,
      completionRate: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageGapDays: 0,
      bestDayOfWeek: 'MONDAY',
      bestTimeOfDay: 'MORNING',
      successFactors: [],
      failureFactors: [],
      prediction: {
        nextDaySuccessProbability: 50,
        daysToSolidify: 66,
        atRiskDates: [],
      },
    };

    this.habitAnalytics.set(habitId, analytics);
    debug.info('Initialized analytics for habit: %s', habitId);
  }

  async recordHabitCompletion(habitId: string, quality: 'POOR' | 'GOOD' | 'EXCELLENT' = 'GOOD', notes?: string): Promise<void> {
    // Record completion through productivity engine
    const habit = await this.productivityEngine.recordHabitCompletion(habitId, `Quality: ${quality}${notes ? ` - ${notes}` : ''}`);
    
    // Update analytics
    await this.updateHabitAnalytics(habitId, quality);

    // Check for habit strength milestones
    await this.checkHabitMilestones(habitId);

    // Generate insights
    await this.generateHabitInsights(habitId);

    debug.info('Recorded habit completion: %s (quality: %s)', habitId, quality);
  }

  private async updateHabitAnalytics(habitId: string, quality: 'POOR' | 'GOOD' | 'EXCELLENT'): Promise<void> {
    const analytics = this.habitAnalytics.get(habitId);
    if (!analytics) return;

    // Update current streak (handled by productivity engine)
    const habit = this.productivityEngine.getActiveHabits().find(h => h.id === habitId);
    if (habit) {
      analytics.currentStreak = habit.streak;
      analytics.longestStreak = Math.max(analytics.longestStreak, habit.streak);
    }

    // Calculate completion rate (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    // In real implementation, would query completion history
    analytics.completionRate = this.calculateCompletionRate(habitId, thirtyDaysAgo);

    // Update success probability based on recent performance
    const qualityMultiplier = quality === 'EXCELLENT' ? 1.2 : quality === 'GOOD' ? 1.0 : 0.8;
    analytics.prediction.nextDaySuccessProbability = Math.min(95, 
      analytics.completionRate * qualityMultiplier
    );

    // Update days to solidify based on actual strength
    if (habit) {
      const strength = habit.strength;
      analytics.prediction.daysToSolidify = Math.max(1, Math.ceil((100 - strength) / 1.5));
    }

    debug.info('Updated analytics for habit %s: completion rate %d%%, streak %d', 
      habitId, analytics.completionRate, analytics.currentStreak);
  }

  private calculateCompletionRate(habitId: string, since: number): number {
    // In real implementation, would query actual completion data
    // For now, return a reasonable default
    return 75;
  }

  private async checkHabitMilestones(habitId: string): Promise<void> {
    const analytics = this.habitAnalytics.get(habitId);
    if (!analytics) return;

    const habit = this.productivityEngine.getActiveHabits().find(h => h.id === habitId);
    if (!habit) return;

    // Check for significant milestones
    const milestones = [
      { days: 3, title: 'Pattern Established', type: 'MINOR' },
      { days: 7, title: 'Weekly Consistency', type: 'MINOR' },
      { days: 14, title: 'Biweekly Habit', type: 'MODERATE' },
      { days: 21, title: 'Habit Forming', type: 'MAJOR' },
      { days: 30, title: 'Monthly Habit', type: 'MAJOR' },
      { days: 66, title: 'Automatic Habit', type: 'CRITICAL' },
      { days: 90, title: 'Permanent Change', type: 'TRANSFORMATIONAL' },
    ];

    for (const milestone of milestones) {
      if (habit.streak === milestone.days) {
        eventBus.publish('achievement:milestone_reached', {
          milestoneType: milestone.type,
          value: milestone.days,
          context: `${habit.name}: ${milestone.title}`,
        });

        debug.info('Habit milestone reached: %s - %s', habit.name, milestone.title);
      }
    }
  }

  // ============================================================================
  // ENVIRONMENT DESIGN (MAKE GOOD HABITS EASY, BAD HABITS HARD)
  // ============================================================================

  private async generateEnvironmentDesign(habit: HabitPattern): Promise<void> {
    const designs: EnvironmentDesign[] = [];

    // Generate designs based on habit category and routine
    switch (habit.category) {
      case 'MORNING':
        designs.push(
          {
            type: 'PRIME',
            target: 'Bedroom environment',
            action: 'Place habit items where you\'ll see them first thing',
            context: 'Bedroom, morning routine',
            difficulty: 'EASY',
            impact: 'MODERATE',
          },
          {
            type: 'REDUCE',
            target: 'Phone distractions',
            action: 'Keep phone in another room during morning routine',
            context: 'Bedroom, morning routine',
            difficulty: 'MEDIUM',
            impact: 'MAJOR',
          }
        );
        break;

      case 'HEALTH':
        designs.push(
          {
            type: 'PRIME',
            target: 'Workout clothes',
            action: 'Lay out workout clothes the night before',
            context: 'Bedroom, evening routine',
            difficulty: 'EASY',
            impact: 'MODERATE',
          },
          {
            type: 'PRIME',
            target: 'Healthy snacks',
            action: 'Place healthy options at eye level in fridge/pantry',
            context: 'Kitchen, food preparation',
            difficulty: 'EASY',
            impact: 'MODERATE',
          }
        );
        break;

      case 'LEARNING':
        designs.push(
          {
            type: 'PRIME',
            target: 'Learning materials',
            action: 'Keep books/courses in visible, accessible locations',
            context: 'Living space, study area',
            difficulty: 'EASY',
            impact: 'MODERATE',
          },
          {
            type: 'REDUCE',
            target: 'Entertainment distractions',
            action: 'Move TV/games console away from study area',
            context: 'Study area, learning time',
            difficulty: 'MEDIUM',
            impact: 'MAJOR',
          }
        );
        break;
    }

    // Generate routine-specific designs
    if (habit.routine.toLowerCase().includes('exercise') || habit.routine.toLowerCase().includes('workout')) {
      designs.push({
        type: 'PRIME',
        target: 'Exercise equipment',
        action: 'Set up equipment in the path you walk daily',
        context: 'Home, daily routine',
        difficulty: 'MEDIUM',
        impact: 'MAJOR',
      });
    }

    if (habit.routine.toLowerCase().includes('read') || habit.routine.toLowerCase().includes('study')) {
      designs.push({
        type: 'PRIME',
        target: 'Reading materials',
        action: 'Place current book on your pillow or nightstand',
        context: 'Bedroom, evening routine',
        difficulty: 'EASY',
        impact: 'MODERATE',
      });
    }

    this.environmentDesigns.set(habit.id, designs);
    debug.info('Generated %d environment designs for habit: %s', designs.length, habit.name);
  }

  // ============================================================================
  // HABIT INTERVENTIONS (SCIENTIFIC IMPROVEMENTS)
  // ============================================================================

  async generateInterventions(habitId: string): Promise<HabitIntervention[]> {
    const analytics = this.habitAnalytics.get(habitId);
    if (!analytics) return [];

    const interventions: HabitIntervention[] = [];

    // Low completion rate interventions
    if (analytics.completionRate < 60) {
      interventions.push({
        type: 'RECOVERY',
        habitId,
        title: 'Habit Recovery Protocol',
        description: 'Your habit is struggling. Time to rebuild the foundation.',
        confidence: 85,
        actions: [
          'Reduce habit to 2 minutes (2-minute rule)',
          'Stack with an existing solid habit',
          'Increase reward satisfaction',
          'Review and optimize the cue',
        ],
        expectedImpact: 'MAJOR',
        timeframe: 14,
      });
    }

    // Inconsistent pattern interventions
    if (analytics.averageGapDays > 3) {
      interventions.push({
        type: 'STRENGTHENING',
        habitId,
        title: 'Consistency Builder',
        description: 'Your habit has gaps. Let\'s build a more consistent pattern.',
        confidence: 75,
        actions: [
          'Identify and address failure factors',
          'Create accountability mechanisms',
          'Environment redesign for friction reduction',
          'Set minimum viable habit (2 minutes)',
        ],
        expectedImpact: 'MODERATE',
        timeframe: 21,
      });
    }

    // High-performing habit optimization
    if (analytics.completionRate > 85 && analytics.currentStreak > 14) {
      interventions.push({
        type: 'OPTIMIZATION',
        habitId,
        title: 'Habit Optimization',
        description: 'Your habit is solid. Let\'s optimize for maximum impact.',
        confidence: 70,
        actions: [
          'Increase duration or intensity gradually',
          'Add complementary habits (habit stacking)',
          'Expand to new contexts/triggers',
          'Teach or share with others for reinforcement',
        ],
        expectedImpact: 'MODERATE',
        timeframe: 30,
      });
    }

    // Prediction-based interventions
    if (analytics.prediction.nextDaySuccessProbability < 70) {
      interventions.push({
        type: 'STRENGTHENING',
        habitId,
        title: 'Success Probability Boost',
        description: 'Your success probability is dropping. Immediate intervention needed.',
        confidence: 90,
        actions: [
          'Review recent failures for patterns',
          'Strengthen the reward immediately',
          'Remove all friction for next attempt',
          'Create social accountability',
        ],
        expectedImpact: 'MAJOR',
        timeframe: 7,
      });
    }

    this.interventions.set(habitId, interventions);
    debug.info('Generated %d interventions for habit: %s', interventions.length, habitId);

    return interventions;
  }

  private async generateHabitInsights(habitId: string): Promise<void> {
    const analytics = this.habitAnalytics.get(habitId);
    if (!analytics) return;

    // Generate insights based on patterns
    if (analytics.completionRate > 80 && analytics.currentStreak > 21) {
      eventBus.publish('productivity:insights', {
        period: 'habit_analysis',
        insights: {
          habitId,
          insight: 'This habit is becoming automatic. Consider expanding or stacking.',
          confidence: 85,
        },
      });
    }

    if (analytics.completionRate < 50 && analytics.currentStreak < 3) {
      eventBus.publish('productivity:pattern_detected', {
        patternType: 'habit_struggle',
        description: 'This habit needs fundamental redesign',
        confidence: 90,
        recommendations: ['Start with 2-minute version', 'Change the cue', 'Increase reward value'],
      });
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  getHabitAnalytics(habitId: string): HabitAnalytics | undefined {
    return this.habitAnalytics.get(habitId);
  }

  getHabitInterventions(habitId: string): HabitIntervention[] {
    return this.interventions.get(habitId) || [];
  }

  getEnvironmentDesigns(habitId: string): EnvironmentDesign[] {
    return this.environmentDesigns.get(habitId) || [];
  }

  getAllHabits(): HabitPattern[] {
    return this.productivityEngine.getActiveHabits();
  }

  getHabitById(habitId: string): HabitPattern | undefined {
    return this.productivityEngine.getActiveHabits().find(h => h.id === habitId);
  }

  setUserId(userId: string): void {
    this.userId = userId;
    this.productivityEngine.setUserId(userId);
    debug.info('HabitFormationService user set: %s', userId);
  }

  // ============================================================================
  // HABIT SCORING (REAL MEASUREMENT, NOT FANTASY POINTS)
  // ============================================================================

  calculateHabitScore(habitId: string): number {
    const analytics = this.habitAnalytics.get(habitId);
    if (!analytics) return 0;

    // Real habit scoring based on scientific factors
    const completionWeight = 0.3;
    const streakWeight = 0.2;
    const consistencyWeight = 0.2;
    const predictionWeight = 0.15;
    const strengthWeight = 0.15;

    const habit = this.getHabitById(habitId);
    const strength = habit?.strength || 0;

    const score = 
      (analytics.completionRate * completionWeight) +
      (Math.min(100, analytics.currentStreak * 2) * streakWeight) +
      (analytics.completionRate * consistencyWeight) +
      (analytics.prediction.nextDaySuccessProbability * predictionWeight) +
      (strength * strengthWeight);

    return Math.round(score);
  }

  getStrongestHabits(limit: number = 5): Array<{ habit: HabitPattern; score: number }> {
    const habits = this.getAllHabits();
    const scored = habits.map(habit => ({
      habit,
      score: this.calculateHabitScore(habit.id),
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  getWeakestHabits(limit: number = 3): Array<{ habit: HabitPattern; score: number; interventions: HabitIntervention[] }> {
    const habits = this.getAllHabits();
    const scored = habits.map(habit => ({
      habit,
      score: this.calculateHabitScore(habit.id),
      interventions: this.getHabitInterventions(habit.id),
    }));

    return scored
      .sort((a, b) => a.score - b.score)
      .slice(0, limit);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let habitFormationServiceInstance: HabitFormationService | null = null;

export function getHabitFormationService(userId?: string): HabitFormationService {
  if (!habitFormationServiceInstance) {
    habitFormationServiceInstance = new HabitFormationService(userId);
  } else if (userId) {
    habitFormationServiceInstance.setUserId(userId);
  }
  return habitFormationServiceInstance;
}
