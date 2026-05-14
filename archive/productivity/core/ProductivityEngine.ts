/**
 * VEX Productivity Engine
 *
 * Replaces fantasy combat with real productivity psychology.
 * This is the new core of the app - focused on real achievement.
 */

import { createDebugger } from '../../utils/debug';
import { eventBus } from '../../events';
import { getProductivityRepository } from '../repositories/ProductivityRepository';
import { GoalValidators } from '../validation/ProductivityValidators';
import { getProductivityAnalytics } from '../analytics/ProductivityAnalytics';

const debug = createDebugger('productivity:engine');

// ============================================================================
// CORE PRODUCTIVITY PSYCHOLOGY
// ============================================================================

export interface RealGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'CAREER' | 'HEALTH' | 'RELATIONSHIPS' | 'LEARNING' | 'FINANCIAL' | 'CREATIVE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  targetOutcome: string; // What real-world result looks like
  successMetrics: string[]; // How we know it's achieved
  estimatedImpact: 'MINOR' | 'MODERATE' | 'MAJOR' | 'TRANSFORMATIVE';
  createdAt: number;
  targetDate: number | null;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  progress: number; // 0-100 based on real metrics
  lastMilestoneDate: number | null;
  totalInvestmentMinutes: number;
  actualOutcomes: string[]; // Real results achieved
}

export interface MicroCommitment {
  id: string;
  goalId: string;
  title: string;
  estimatedMinutes: number;
  actualMinutes: number | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXTREME';
  context: string; // When/where this should be done
  completionCriteria: string; // What "done" looks like
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  createdAt: number;
  completedAt: number | null;
  realOutcome: string | null; // What actually happened
}

export interface FocusSession {
  id: string;
  goalId: string | null;
  commitmentId: string | null;
  startTime: number;
  endTime: number | null;
  plannedMinutes: number;
  actualMinutes: number | null;
  quality: 'LOW' | 'MEDIUM' | 'HIGH' | 'FLOW';
  distractions: number;
  interruptions: number;
  notes: string;
  realAccomplishments: string[]; // What was actually done
}

export interface HabitPattern {
  id: string;
  userId: string;
  name: string;
  cue: string; // What triggers it
  routine: string; // What you do
  reward: string; // What you get
  context: string; // When/where
  strength: number; // 0-100 how automatic it is
  streak: number; // Consecutive days completed
  lastCompleted: number | null;
  missedDays: number[];
  category: 'MORNING' | 'EVENING' | 'WORK' | 'BREAK' | 'STRESS';
}

// ============================================================================
// PRODUCTIVITY ENGINE
// ============================================================================

export class ProductivityEngine {
  private userId: string | null = null;
  private activeGoals: Map<string, RealGoal> = new Map();
  private activeHabits: Map<string, HabitPattern> = new Map();
  private currentSession: FocusSession | null = null;
  private sessionHistory: FocusSession[] = [];

  constructor(userId?: string) {
    this.userId = userId ?? null;
    debug.info('ProductivityEngine initialized for user: %s', userId);
  }

  // ============================================================================
  // GOAL MANAGEMENT (REAL GOALS, NOT FANTASY)
  // ============================================================================

  async createGoal(goalData: Omit<RealGoal, 'id' | 'userId' | 'createdAt' | 'progress' | 'totalInvestmentMinutes' | 'actualOutcomes'>): Promise<RealGoal> {
    if (!this.userId) {
      throw new Error('ProductivityEngine: No user set');
    }

    const goal: RealGoal = {
      id: this.generateId(),
      userId: this.userId,
      ...goalData,
      createdAt: Date.now(),
      progress: 0,
      totalInvestmentMinutes: 0,
      actualOutcomes: [],
    };

    // Validate that this is a real, meaningful goal
    this.validateGoal(goal);
    
    this.activeGoals.set(goal.id, goal);
    await this.saveGoal(goal);

    debug.info('Created real goal: %s', goal.title);
    
    eventBus.publish('goal:created', {
      goalId: goal.id,
      userId: this.userId,
      category: goal.category,
      impact: goal.estimatedImpact,
    });

    return goal;
  }

  private validateGoal(goal: RealGoal): void {
    // Ensure goals are specific and measurable
    if (!goal.targetOutcome || goal.targetOutcome.length < 10) {
      throw new Error('Goals must have specific, measurable outcomes');
    }

    if (!goal.successMetrics || goal.successMetrics.length === 0) {
      throw new Error('Goals must have clear success metrics');
    }

    // Ensure it's actually meaningful
    const lowValueKeywords = ['finish', 'complete', 'start', 'try'];
    const hasLowValueTitle = lowValueKeywords.some(keyword => 
      goal.title.toLowerCase().includes(keyword)
    );
    
    if (hasLowValueTitle) {
      throw new Error('Goal titles should focus on outcomes, not activities');
    }
  }

  async updateGoalProgress(goalId: string, newProgress: number, realOutcome?: string): Promise<RealGoal> {
    const goal = this.activeGoals.get(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    const oldProgress = goal.progress;
    goal.progress = Math.min(100, Math.max(0, newProgress));

    if (realOutcome) {
      goal.actualOutcomes.push(realOutcome);
    }

    if (goal.progress === 100 && oldProgress < 100) {
      goal.status = 'COMPLETED';
      await this.handleGoalCompletion(goal);
    }

    await this.saveGoal(goal);

    eventBus.publish('goal:progress_updated', {
      goalId,
      userId: this.userId,
      oldProgress,
      newProgress: goal.progress,
      realOutcome,
    });

    return goal;
  }

  private async handleGoalCompletion(goal: RealGoal): Promise<void> {
    debug.info('GOAL COMPLETED: %s', goal.title);

    // Calculate real impact
    const impactScore = this.calculateRealImpact(goal);
    
    eventBus.publish('goal:completed', {
      goalId: goal.id,
      userId: this.userId,
      title: goal.title,
      category: goal.category,
      impactScore,
      investmentMinutes: goal.totalInvestmentMinutes,
      actualOutcomes: goal.actualOutcomes,
    });

    // Create celebration based on real achievement
    await this.createRealCelebration(goal, impactScore);
  }

  private calculateRealImpact(goal: RealGoal): number {
    // Base score from category and impact level
    const categoryMultipliers = {
      'CAREER': 1.5,
      'HEALTH': 1.3,
      'FINANCIAL': 1.4,
      'RELATIONSHIPS': 1.2,
      'LEARNING': 1.1,
      'CREATIVE': 1.0,
    };

    const impactMultipliers = {
      'MINOR': 1.0,
      'MODERATE': 2.0,
      'MAJOR': 3.0,
      'TRANSFORMATIVE': 5.0,
    };

    const baseScore = 100;
    const categoryMultiplier = categoryMultipliers[goal.category];
    const impactMultiplier = impactMultipliers[goal.estimatedImpact];
    
    // Bonus for efficiency (less time than expected)
    const efficiencyBonus = goal.totalInvestmentMinutes > 0 ? 
      Math.max(0, 1 - (goal.totalInvestmentMinutes / (goal.estimatedImpact === 'TRANSFORMATIVE' ? 10000 : 5000))) : 0;

    return Math.floor(baseScore * categoryMultiplier * impactMultiplier * (1 + efficiencyBonus));
  }

  private async createRealCelebration(goal: RealGoal, impactScore: number): Promise<void> {
    // Real celebration based on actual achievement
    const celebrationType = impactScore > 500 ? 'MAJOR' : impactScore > 200 ? 'MODERATE' : 'MINOR';
    
    eventBus.publish('achievement:real_celebration', {
      type: celebrationType,
      goalTitle: goal.title,
      impactScore,
      realOutcomes: goal.actualOutcomes,
      investmentMinutes: goal.totalInvestmentMinutes,
    });
  }

  // ============================================================================
  // MICRO-COMMITMENTS (REAL ACTIONS, NOT FANTASY COMBAT)
  // ============================================================================

  async createMicroCommitment(goalId: string, commitmentData: Omit<MicroCommitment, 'id' | 'goalId' | 'createdAt' | 'actualMinutes' | 'status' | 'completedAt' | 'realOutcome'>): Promise<MicroCommitment> {
    const goal = this.activeGoals.get(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    const commitment: MicroCommitment = {
      id: this.generateId(),
      goalId,
      ...commitmentData,
      createdAt: Date.now(),
      actualMinutes: null,
      status: 'PENDING',
      completedAt: null,
      realOutcome: null,
    };

    // Validate that this is actionable and specific
    this.validateCommitment(commitment);

    // Store commitment (in real implementation, would save to database)
    debug.info('Created micro-commitment: %s', commitment.title);

    eventBus.publish('commitment:created', {
      commitmentId: commitment.id,
      goalId,
      difficulty: commitment.difficulty,
      estimatedMinutes: commitment.estimatedMinutes,
    });

    return commitment;
  }

  private validateCommitment(commitment: MicroCommitment): void {
    if (!commitment.completionCriteria || commitment.completionCriteria.length < 5) {
      throw new Error('Micro-commitments must have clear completion criteria');
    }

    if (commitment.estimatedMinutes < 1 || commitment.estimatedMinutes > 180) {
      throw new Error('Micro-commitments should be 1-180 minutes');
    }

    // Ensure it's actually "micro" - not a whole project
    const projectKeywords = ['project', 'build', 'create', 'develop', 'design'];
    const isProject = projectKeywords.some(keyword => 
      commitment.title.toLowerCase().includes(keyword)
    );
    
    if (isProject && commitment.estimatedMinutes > 60) {
      throw new Error('This sounds like a project, not a micro-commitment');
    }
  }

  // ============================================================================
  // FOCUS SESSIONS (REAL WORK, NOT FANTASY BATTLES)
  // ============================================================================

  async startFocusSession(goalId: string | null, commitmentId: string | null, plannedMinutes: number): Promise<FocusSession> {
    if (this.currentSession) {
      await this.endCurrentSession();
    }

    const session: FocusSession = {
      id: this.generateId(),
      goalId,
      commitmentId,
      startTime: Date.now(),
      endTime: null,
      plannedMinutes,
      actualMinutes: null,
      quality: 'LOW',
      distractions: 0,
      interruptions: 0,
      notes: '',
      realAccomplishments: [],
    };

    this.currentSession = session;

    debug.info('Started focus session for %d minutes', plannedMinutes);

    eventBus.publish('focus:started', {
      sessionId: session.id,
      goalId,
      commitmentId,
      plannedMinutes,
    });

    // Set up session monitoring
    this.setupSessionMonitoring();

    return session;
  }

  async endCurrentSession(): Promise<FocusSession> {
    if (!this.currentSession) {
      throw new Error('No active session to end');
    }

    const session = this.currentSession;
    session.endTime = Date.now();
    session.actualMinutes = Math.floor((session.endTime - session.startTime) / (1000 * 60));

    // Calculate session quality based on real factors
    session.quality = this.calculateSessionQuality(session);

    // Update goal investment time
    if (session.goalId) {
      const goal = this.activeGoals.get(session.goalId);
      if (goal) {
        goal.totalInvestmentMinutes += session.actualMinutes;
        await this.saveGoal(goal);
      }
    }

    this.sessionHistory.push(session);
    this.currentSession = null;

    debug.info('Ended focus session: %d minutes, quality: %s', session.actualMinutes, session.quality);

    eventBus.publish('focus:ended', {
      sessionId: session.id,
      actualMinutes: session.actualMinutes,
      quality: session.quality,
      realAccomplishments: session.realAccomplishments,
    });

    return session;
  }

  private calculateSessionQuality(session: FocusSession): 'LOW' | 'MEDIUM' | 'HIGH' | 'FLOW' {
    const efficiency = session.actualMinutes && session.plannedMinutes ? 
      session.actualMinutes / session.plannedMinutes : 1;
    
    const distractionRatio = session.actualMinutes ? session.distractions / session.actualMinutes : 0;
    const interruptionRatio = session.actualMinutes ? session.interruptions / session.actualMinutes : 0;

    // Real quality metrics based on actual work characteristics
    if (distractionRatio < 0.1 && interruptionRatio < 0.1 && efficiency > 0.8) {
      return 'FLOW';
    } else if (distractionRatio < 0.3 && interruptionRatio < 0.2 && efficiency > 0.6) {
      return 'HIGH';
    } else if (distractionRatio < 0.5 && interruptionRatio < 0.4 && efficiency > 0.4) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  private setupSessionMonitoring(): void {
    // In real implementation, would set up distraction tracking, 
    // interruption monitoring, etc.
    debug.info('Session monitoring started');
  }

  // ============================================================================
  // HABIT FORMATION (REAL PSYCHOLOGY, NOT FANTASY STREAKS)
  // ============================================================================

  async createHabitPattern(habitData: Omit<HabitPattern, 'id' | 'userId' | 'strength' | 'streak' | 'lastCompleted' | 'missedDays'>): Promise<HabitPattern> {
    if (!this.userId) {
      throw new Error('ProductivityEngine: No user set');
    }

    const habit: HabitPattern = {
      id: this.generateId(),
      userId: this.userId,
      ...habitData,
      strength: 0,
      streak: 0,
      lastCompleted: null,
      missedDays: [],
    };

    // Validate habit psychology
    this.validateHabit(habit);

    this.activeHabits.set(habit.id, habit);

    debug.info('Created habit pattern: %s', habit.name);

    eventBus.publish('habit:created', {
      habitId: habit.id,
      category: habit.category,
      cue: habit.cue,
    });

    return habit;
  }

  private validateHabit(habit: HabitPattern): void {
    // Ensure all components of habit loop are present
    if (!habit.cue || !habit.routine || !habit.reward) {
      throw new Error('Habits must have clear cue, routine, and reward');
    }

    // Ensure context is specific
    if (!habit.context || habit.context.length < 5) {
      throw new Error('Habits need specific context (when/where)');
    }

    // Validate that reward is actually rewarding
    const weakRewards = ['done', 'complete', 'finish'];
    const hasWeakReward = weakRewards.some(reward => 
      habit.reward.toLowerCase().includes(reward)
    );
    
    if (hasWeakReward) {
      throw new Error('Habit rewards should be genuinely satisfying, not just completion');
    }
  }

  async recordHabitCompletion(habitId: string, realOutcome?: string): Promise<HabitPattern> {
    const habit = this.activeHabits.get(habitId);
    if (!habit) {
      throw new Error(`Habit not found: ${habitId}`);
    }

    const today = new Date().toDateString();
    const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted).toDateString() : null;

    if (lastCompleted === today) {
      throw new Error('Habit already completed today');
    }

    // Update streak based on consecutive days
    if (lastCompleted === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()) {
      habit.streak += 1;
    } else {
      habit.streak = 1;
    }

    habit.lastCompleted = Date.now();
    
    // Strengthen habit based on repetition
    habit.strength = Math.min(100, habit.strength + (100 / 66)); // Takes ~66 days to reach 100

    debug.info('Habit completed: %s (streak: %d, strength: %d)', habit.name, habit.streak, habit.strength);

    eventBus.publish('habit:completed', {
      habitId,
      streak: habit.streak,
      strength: habit.strength,
      realOutcome,
    });

    return habit;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async saveGoal(goal: RealGoal): Promise<void> {
    // In real implementation, would save to database
    debug.info('Goal saved: %s', goal.id);
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  getCurrentSession(): FocusSession | null {
    return this.currentSession;
  }

  getActiveGoals(): RealGoal[] {
    return Array.from(this.activeGoals.values()).filter(goal => goal.status === 'ACTIVE');
  }

  getGoalById(goalId: string): RealGoal | undefined {
    return this.activeGoals.get(goalId);
  }

  getSessionHistory(): FocusSession[] {
    return [...this.sessionHistory];
  }

  getActiveHabits(): HabitPattern[] {
    return Array.from(this.activeHabits.values());
  }

  setUserId(userId: string): void {
    this.userId = userId;
    // In real implementation, would load user's goals, habits, etc.
    debug.info('ProductivityEngine user set: %s', userId);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let productivityEngineInstance: ProductivityEngine | null = null;

export function getProductivityEngine(userId?: string): ProductivityEngine {
  if (!productivityEngineInstance) {
    productivityEngineInstance = new ProductivityEngine(userId);
  } else if (userId) {
    productivityEngineInstance.setUserId(userId);
  }
  return productivityEngineInstance;
}
