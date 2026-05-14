/**
 * VEX Productivity System Integration
 * 
 * The unified system that connects all real productivity components.
 * This replaces the old fantasy game system with actual life improvement.
 */

import { createDebugger } from '../../utils/debug';
import { eventBus } from '../../events';
import { getProductivityEngine } from './core/ProductivityEngine';
import { getGoalTrackingService } from './goals/GoalTrackingService';
import { getHabitFormationService } from './habits/HabitFormationService';
import { getRealProgressionService } from './progression/RealProgressionService';
import { getCollaborationService } from './collaboration/CollaborationService';
import { getRealMonetizationService } from './monetization/RealMonetizationService';

const debug = createDebugger('productivity:system');

// ============================================================================
// UNIFIED PRODUCTIVITY SYSTEM
// ============================================================================

export interface VEXProductivitySystemConfig {
  userId: string;
  enableAnalytics: boolean;
  enableCollaboration: boolean;
  enableMonetization: boolean;
  autoSync: boolean;
  notificationPreferences: {
    goalReminders: boolean;
    habitReminders: boolean;
    collaborationAlerts: boolean;
    insights: boolean;
  };
}

export interface SystemMetrics {
  overallProductivity: number; // 0-100
  goalVelocity: number; // Goals completed per month
  habitStrength: number; // Average habit strength
  capabilityGrowth: number; // Capability development rate
  collaborationEffectiveness: number; // Collaboration success rate
  satisfactionScore: number; // User satisfaction
  retentionScore: number; // Likelihood to continue using
  overallROI: number; // Return on investment
}

export interface DailyInsight {
  type: 'CELEBRATION' | 'OPPORTUNITY' | 'WARNING' | 'STRATEGY' | 'MOTIVATION';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  data: Record<string, unknown>;
  recommendations: string[];
}

// ============================================================================
// MAIN PRODUCTIVITY SYSTEM
// ============================================================================

export class VEXProductivitySystem {
  private config: VEXProductivitySystemConfig;
  private productivityEngine = getProductivityEngine();
  private goalTrackingService = getGoalTrackingService();
  private habitFormationService = getHabitFormationService();
  private progressionService = getRealProgressionService();
  private collaborationService = getCollaborationService();
  private monetizationService = getRealMonetizationService();

  private isInitialized = false;
  private lastSync = 0;
  private metrics: SystemMetrics | null = null;
  private dailyInsights: DailyInsight[] = [];

  constructor(config: VEXProductivitySystemConfig) {
    this.config = config;
    this.initializeServices();
  }

  // ============================================================================
  // SYSTEM INITIALIZATION
  // ============================================================================

  private async initializeServices(): Promise<void> {
    try {
      // Initialize all services with user context
      this.productivityEngine.setUserId(this.config.userId);
      this.goalTrackingService.setUserId(this.config.userId);
      this.habitFormationService.setUserId(this.config.userId);
      this.progressionService.setUserId(this.config.userId);
      this.collaborationService.setUserId(this.config.userId);
      this.monetizationService.setUserId(this.config.userId);

      // Set up event listeners for cross-service communication
      this.setupEventListeners();

      // Perform initial data sync
      await this.performInitialSync();

      this.isInitialized = true;
      debug.info('VEX Productivity System initialized for user: %s', this.config.userId);

      eventBus.publish('system:initialized', {
        userId: this.config.userId,
        timestamp: Date.now(),
      });

    } catch (error) {
      debug.error('Failed to initialize VEX Productivity System: %O', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    // Goal events trigger progression updates
    eventBus.subscribe('goal:completed', (data) => {
      this.handleGoalCompleted(data);
    });

    // Habit events trigger analytics updates
    eventBus.subscribe('habit:completed', (data) => {
      this.handleHabitCompleted(data);
    });

    // Focus session events trigger productivity updates
    eventBus.subscribe('focus:ended', (data) => {
      this.handleFocusSessionEnded(data);
    });

    // Achievement events trigger celebration and insights
    eventBus.subscribe('achievement:real_celebration', (data) => {
      this.handleAchievement(data);
    });

    // Collaboration events trigger social insights
    eventBus.subscribe('collaboration:check_in_completed', (data) => {
      this.handleCollaborationUpdate(data);
    });
  }

  private async performInitialSync(): Promise<void> {
    // Update all services with latest data
    await this.progressionService.updateProgression();
    
    // Generate initial insights
    await this.generateDailyInsights();
    
    // Calculate initial metrics
    await this.updateSystemMetrics();

    this.lastSync = Date.now();
    debug.info('Initial sync completed');
  }

  // ============================================================================
  // CORE SYSTEM OPERATIONS
  // ============================================================================

  async createSMARTGoal(goalData: {
    title: string;
    description: string;
    category: string;
    targetOutcome: string;
    successMetrics: string[];
    targetDate?: number;
    priority?: string;
  }) {
    this.ensureInitialized();
    
    const goal = await this.goalTrackingService.createSMARTGoal(goalData);
    
    // Trigger system-wide updates
    await this.progressionService.updateProgression();
    await this.generateDailyInsights();
    await this.updateSystemMetrics();

    return goal;
  }

  async createScientificHabit(habitData: {
    name: string;
    cue: string;
    routine: string;
    reward: string;
    context: string;
    category: string;
  }) {
    this.ensureInitialized();
    
    const habit = await this.habitFormationService.createScientificHabit(habitData);
    
    // Trigger system-wide updates
    await this.progressionService.updateProgression();
    await this.generateDailyInsights();
    await this.updateSystemMetrics();

    return habit;
  }

  async startFocusSession(goalId?: string, commitmentId?: string, plannedMinutes: number = 25) {
    this.ensureInitialized();
    
    const session = await this.productivityEngine.startFocusSession(goalId, commitmentId, plannedMinutes);
    
    return session;
  }

  async endFocusSession() {
    this.ensureInitialized();
    
    const session = await this.productivityEngine.endCurrentSession();
    
    // Trigger system-wide updates
    await this.progressionService.updateProgression();
    await this.generateDailyInsights();
    await this.updateSystemMetrics();

    return session;
  }

  // ============================================================================
  // SYSTEM ANALYTICS AND INSIGHTS
  // ============================================================================

  async getSystemMetrics(): Promise<SystemMetrics> {
    this.ensureInitialized();
    
    if (!this.metrics || Date.now() - this.lastSync > 60000) { // Update every minute
      await this.updateSystemMetrics();
    }
    
    return this.metrics!;
  }

  private async updateSystemMetrics(): Promise<void> {
    const goals = this.goalTrackingService.getAllGoals();
    const habits = this.habitFormationService.getAllHabits();
    const capabilities = this.progressionService.getCapabilities();
    const collaborations = this.collaborationService.getAccountabilityPartnerships();
    const subscription = this.monetizationService.getUserSubscription();

    // Calculate overall productivity
    const completedGoals = goals.filter(g => g.status === 'COMPLETED').length;
    const activeGoals = goals.filter(g => g.status === 'ACTIVE').length;
    const goalCompletionRate = activeGoals > 0 ? (completedGoals / (completedGoals + activeGoals)) * 100 : 0;

    const strongHabits = habits.filter(h => h.strength > 70).length;
    const habitStrengthScore = habits.length > 0 ? (strongHabits / habits.length) * 100 : 0;

    const avgCapabilityLevel = capabilities.reduce((sum, c) => sum + c.currentLevel, 0) / Math.max(1, capabilities.length);

    const activeCollaborations = collaborations.filter(c => c.status === 'ACTIVE').length;
    const collaborationScore = collaborations.length > 0 ? (activeCollaborations / collaborations.length) * 100 : 0;

    // Calculate satisfaction and retention
    const valueMeasurements = this.monetizationService.getValueMeasurements();
    const latestMeasurement = valueMeasurements[valueMeasurements.length - 1];
    const satisfactionScore = latestMeasurement?.satisfactionScore || 50;
    const retentionScore = latestMeasurement?.renewalProbability || 50;

    // Calculate ROI
    const totalInvestment = subscription ? (subscription.features.length * 20) : 0; // Rough estimate
    const totalValue = completedGoals * 100 + strongHabits * 50 + avgCapabilityLevel * 10; // Rough value calculation
    const overallROI = totalInvestment > 0 ? ((totalValue - totalInvestment) / totalInvestment) * 100 : 0;

    this.metrics = {
      overallProductivity: Math.round((goalCompletionRate + habitStrengthScore + avgCapabilityLevel) / 3),
      goalVelocity: completedGoals, // Simplified - would calculate over time period
      habitStrength: Math.round(habitStrengthScore),
      capabilityGrowth: Math.round(avgCapabilityLevel),
      collaborationEffectiveness: Math.round(collaborationScore),
      satisfactionScore,
      retentionScore,
      overallROI: Math.round(overallROI),
    };

    this.lastSync = Date.now();
  }

  async getDailyInsights(): Promise<DailyInsight[]> {
    this.ensureInitialized();
    
    if (this.dailyInsights.length === 0 || Date.now() - this.lastSync > 3600000) { // Update every hour
      await this.generateDailyInsights();
    }
    
    return this.dailyInsights;
  }

  private async generateDailyInsights(): Promise<void> {
    this.dailyInsights = [];

    const goals = this.goalTrackingService.getAllGoals();
    const habits = this.habitFormationService.getAllHabits();
    const capabilities = this.progressionService.getCapabilities();
    const collaborations = this.collaborationService.getAccountabilityPartnerships();

    // Goal-based insights
    const stalledGoals = goals.filter(g => g.progress > 0 && g.progress < 30);
    if (stalledGoals.length > 0) {
      this.dailyInsights.push({
        type: 'WARNING',
        title: 'Goals Need Attention',
        description: `${stalledGoals.length} goals have stalled below 30% completion`,
        actionable: true,
        priority: 'HIGH',
        data: { stalledGoals: stalledGoals.map(g => g.title) },
        recommendations: [
          'Review what worked when you started these goals',
          'Consider reducing the scope or breaking into smaller steps',
          'Set up accountability for these specific goals',
        ],
      });
    }

    const nearCompletionGoals = goals.filter(g => g.progress > 75 && g.status !== 'COMPLETED');
    if (nearCompletionGoals.length > 0) {
      this.dailyInsights.push({
        type: 'CELEBRATION',
        title: 'Almost There!',
        description: `${nearCompletionGoals.length} goals are nearing completion`,
        actionable: true,
        priority: 'MEDIUM',
        data: { nearCompletion: nearCompletionGoals.map(g => g.title) },
        recommendations: [
          'Focus final push on these goals',
          'Plan how to maintain the achievement',
          'Celebrate the upcoming success',
        ],
      });
    }

    // Habit-based insights
    const strugglingHabits = habits.filter(h => h.strength < 30);
    if (strugglingHabits.length > 0) {
      this.dailyInsights.push({
        type: 'OPPORTUNITY',
        title: 'Habit Optimization',
        description: `${strugglingHabits.length} habits need strengthening`,
        actionable: true,
        priority: 'MEDIUM',
        data: { strugglingHabits: strugglingHabits.map(h => h.name) },
        recommendations: [
          'Review the habit loop - cue, routine, reward',
          'Reduce friction for these habits',
          'Increase the reward satisfaction',
        ],
      });
    }

    // Capability-based insights
    const strongCapabilities = capabilities.filter(c => c.currentLevel > 80);
    if (strongCapabilities.length > 0) {
      this.dailyInsights.push({
        type: 'STRATEGY',
        title: 'Leverage Your Strengths',
        description: `You have ${strongCapabilities.length} highly developed capabilities`,
        actionable: true,
        priority: 'LOW',
        data: { strongCapabilities: strongCapabilities.map(c => c.name) },
        recommendations: [
          'Apply these strengths to new challenges',
          'Consider mentoring others in these areas',
          'Build goals around these capabilities',
        ],
      });
    }

    // Collaboration-based insights
    if (collaborations.length === 0 && goals.length > 2) {
      this.dailyInsights.push({
        type: 'OPPORTUNITY',
        title: 'Consider Collaboration',
        description: 'You have multiple goals but no accountability partnerships',
        actionable: true,
        priority: 'MEDIUM',
        data: { goalCount: goals.length },
        recommendations: [
          'Find an accountability partner for your goals',
          'Join a mastermind group for peer support',
          'Consider skill exchanges to accelerate growth',
        ],
      });
    }

    debug.info('Generated %d daily insights', this.dailyInsights.length);
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  private async handleGoalCompleted(data: any): Promise<void> {
    debug.info('Goal completed event: %O', data);
    
    // Trigger celebration
    await this.progressionService.recognizeRealAchievements();
    
    // Update metrics
    await this.updateSystemMetrics();
    
    // Generate new insights
    await this.generateDailyInsights();
  }

  private async handleHabitCompleted(data: any): Promise<void> {
    debug.info('Habit completed event: %O', data);
    
    // Update progression
    await this.progressionService.updateProgression();
    
    // Update metrics
    await this.updateSystemMetrics();
  }

  private async handleFocusSessionEnded(data: any): Promise<void> {
    debug.info('Focus session ended event: %O', data);
    
    // Update progression
    await this.progressionService.updateProgression();
    
    // Update metrics
    await this.updateSystemMetrics();
  }

  private async handleAchievement(data: any): Promise<void> {
    debug.info('Achievement event: %O', data);
    
    // Generate celebration insight
    this.dailyInsights.push({
      type: 'CELEBRATION',
      title: 'Achievement Unlocked!',
      description: `Congratulations on ${data.goalTitle || 'your achievement'}!`,
      actionable: false,
      priority: 'LOW',
      data: { achievement: data },
      recommendations: [
        'Take a moment to celebrate this win',
        'Share your success with your support network',
        'Use this momentum for your next challenge',
      ],
    });
  }

  private async handleCollaborationUpdate(data: any): Promise<void> {
    debug.info('Collaboration update event: %O', data);
    
    // Update collaboration analytics
    await this.collaborationService.analyzeCollaborationEffectiveness();
    
    // Update metrics
    await this.updateSystemMetrics();
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('VEX Productivity System not initialized');
    }
  }

  async syncAllServices(): Promise<void> {
    this.ensureInitialized();
    
    debug.info('Starting full system sync...');
    
    // Update all services
    await this.progressionService.updateProgression();
    await this.collaborationService.analyzeCollaborationEffectiveness();
    await this.monetizationService.measureUserValue('MONTHLY');
    
    // Generate insights and metrics
    await this.generateDailyInsights();
    await this.updateSystemMetrics();
    
    this.lastSync = Date.now();
    
    debug.info('Full system sync completed');
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  getSystemStatus(): {
    initialized: boolean;
    lastSync: number;
    servicesHealthy: boolean;
    metrics: SystemMetrics | null;
  } {
    return {
      initialized: this.isInitialized,
      lastSync: this.lastSync,
      servicesHealthy: this.isInitialized, // Simplified health check
      metrics: this.metrics,
    };
  }

  async getUpgradeRecommendations(): Promise<Array<{
    feature: string;
    reason: string;
    expectedValue: number;
    urgency: string;
  }>> {
    this.ensureInitialized();
    
    const recommendations = await this.monetizationService.generateUpgradeRecommendations();
    
    return recommendations.map(r => ({
      feature: r.feature.name,
      reason: r.reason,
      expectedValue: r.expectedValue,
      urgency: r.urgency,
    }));
  }

  async exportUserData(): Promise<{
    goals: any[];
    habits: any[];
    capabilities: any[];
    achievements: any[];
    metrics: SystemMetrics;
    insights: DailyInsight[];
  }> {
    this.ensureInitialized();
    
    return {
      goals: this.goalTrackingService.getAllGoals(),
      habits: this.habitFormationService.getAllHabits(),
      capabilities: this.progressionService.getCapabilities(),
      achievements: this.progressionService.getAchievements(),
      metrics: await this.getSystemMetrics(),
      insights: await this.getDailyInsights(),
    };
  }
}

// ============================================================================
// SYSTEM FACTORY
// ============================================================================

export function createVEXProductivitySystem(config: VEXProductivitySystemConfig): VEXProductivitySystem {
  return new VEXProductivitySystem(config);
}

// ============================================================================
// GLOBAL SYSTEM INSTANCE (for backward compatibility)
// ============================================================================

let globalProductivitySystem: VEXProductivitySystem | null = null;

export function getVEXProductivitySystem(config?: VEXProductivitySystemConfig): VEXProductivitySystem {
  if (!globalProductivitySystem && config) {
    globalProductivitySystem = new VEXProductivitySystem(config);
  }
  
  if (!globalProductivitySystem) {
    throw new Error('VEX Productivity System not initialized. Call createVEXProductivitySystem first.');
  }
  
  return globalProductivitySystem;
}
