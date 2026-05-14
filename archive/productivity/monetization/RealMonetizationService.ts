/**
 * Real Monetization Service
 * 
 * Replaces fake currency with actual premium value.
 * Users pay for features that solve real problems and accelerate their success.
 */

import { createDebugger } from '../../utils/debug';
import { eventBus } from '../../events';
import { getProductivityEngine } from '../core/ProductivityEngine';
import { getGoalTrackingService } from '../goals/GoalTrackingService';
import { getHabitFormationService } from '../habits/HabitFormationService';
import { getRealProgressionService } from '../progression/RealProgressionService';
import { getCollaborationService } from '../collaboration/CollaborationService';
import type { RealGoal } from '../core/ProductivityEngine';

const debug = createDebugger('productivity:monetization');

// ============================================================================
// REAL PREMIUM VALUE PSYCHOLOGY
// ============================================================================

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  category: 'ANALYTICS' | 'COACHING' | 'AUTOMATION' | 'INTEGRATION' | 'COLLABORATION' | 'PLANNING';
  valueProposition: string; // What real problem this solves
  pricingModel: 'MONTHLY' | 'ANNUAL' | 'LIFETIME' | 'USAGE_BASED';
  price: number; // In cents
  valueROI: number; // Estimated return on investment (1-100x)
  targetUser: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL';
  requiredFeatures: string[]; // Prerequisites
  outcomes: string[]; // Expected real outcomes
  timeToValue: number; // Days to see value
  retentionDriver: number; // How much this drives long-term retention (1-100)
}

export interface PremiumSubscription {
  id: string;
  userId: string;
  tier: 'BASIC' | 'PROFESSIONAL' | 'BUSINESS' | 'ENTERPRISE';
  features: string[];
  status: 'ACTIVE' | 'CANCELLED' | 'PAUSED' | 'EXPIRED';
  startDate: number;
  endDate: number | null;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  totalValue: number; // Total value delivered
  usageMetrics: {
    goalsCompleted: number;
    habitsFormed: number;
    insightsGenerated: number;
    collaborationsInitiated: number;
    roiScore: number; // Actual ROI achieved
  };
}

export interface PersonalCoaching {
  id: string;
  userId: string;
  coachId: string;
  package: 'INTRODUCTORY' | 'MONTHLY' | 'QUARTERLY' | 'INTENSIVE';
  focus: 'CAREER' | 'HEALTH' | 'RELATIONSHIPS' | 'FINANCIAL' | 'PRODUCTIVITY' | 'COMPREHENSIVE';
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  sessionsCompleted: number;
  totalSessions: number;
  outcomes: string[];
  breakthroughs: string[];
  satisfactionScore: number; // 1-100
  roiMultiple: number; // Financial/impact return multiple
}

export interface TeamPlan {
  id: string;
  organizationId: string;
  teamSize: number;
  features: string[];
  pricing: 'PER_USER' | 'TIERED' | 'UNLIMITED';
  status: 'ACTIVE' | 'CANCELLED' | 'TRIAL';
  teamMetrics: {
    productivityGain: number; // Percentage increase
    goalCompletionRate: number;
    collaborationEffectiveness: number;
    employeeRetention: number;
    overallROI: number;
  };
  integrations: string[];
  supportLevel: 'BASIC' | 'PREMIUM' | 'DEDICATED';
}

export interface ValueMeasurement {
  userId: string;
  period: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  metrics: {
    productivityGain: number; // Hours saved per week
    goalAcceleration: number; // How much faster goals are completed
    habitFormationRate: number; // Success rate vs baseline
    collaborationValue: number; // Value from teamwork improvements
    insightQuality: number; // Actionability and accuracy of insights
    overallLifeImprovement: number; // Self-reported life satisfaction
  };
  financialImpact: {
    careerAdvancement: number; // Salary/promotion value
    healthCostSavings: number; // Reduced healthcare costs
    opportunityCost: number; // Value of better decisions
    timeValue: number; // Monetary value of time saved
  };
  satisfactionScore: number; // 1-100
  renewalProbability: number; // 1-100
}

// ============================================================================
// REAL MONETIZATION SERVICE
// ============================================================================

export class RealMonetizationService {
  private userId: string | null = null;
  private productivityEngine = getProductivityEngine();
  private goalTrackingService = getGoalTrackingService();
  private habitFormationService = getHabitFormationService();
  private progressionService = getRealProgressionService();
  private collaborationService = getCollaborationService();
  
  private premiumFeatures: Map<string, PremiumFeature> = new Map();
  private subscriptions: Map<string, PremiumSubscription> = new Map();
  private coaching: Map<string, PersonalCoaching> = new Map();
  private teamPlans: Map<string, TeamPlan> = new Map();
  private valueMeasurements: Map<string, ValueMeasurement[]> = new Map();

  constructor(userId?: string) {
    this.userId = userId ?? null;
    if (userId) {
      this.productivityEngine.setUserId(userId);
      this.goalTrackingService.setUserId(userId);
      this.habitFormationService.setUserId(userId);
      this.progressionService.setUserId(userId);
      this.collaborationService.setUserId(userId);
    }
    
    this.initializePremiumFeatures();
    debug.info('RealMonetizationService initialized for user: %s', userId);
  }

  // ============================================================================
  // PREMIUM FEATURES (REAL VALUE, NOT FANTASY BENEFITS)
  // ============================================================================

  private initializePremiumFeatures(): void {
    const features: PremiumFeature[] = [
      {
        id: 'advanced-analytics',
        name: 'Advanced Analytics',
        description: 'Deep insights into your productivity patterns, bottlenecks, and optimization opportunities',
        category: 'ANALYTICS',
        valueProposition: 'Stop guessing what works - get data-driven insights to optimize your productivity',
        pricingModel: 'MONTHLY',
        price: 1999, // $19.99/month
        valueROI: 10, // 10x ROI through time savings
        targetUser: 'INTERMEDIATE',
        requiredFeatures: [],
        outcomes: [
          'Identify and eliminate productivity bottlenecks',
          'Optimize daily routines for maximum efficiency',
          'Predict and prevent goal abandonment',
          'Quantify actual time savings and productivity gains',
        ],
        timeToValue: 7,
        retentionDriver: 85,
      },
      {
        id: 'ai-coaching',
        name: 'AI Success Coach',
        description: 'Personalized AI coaching based on your actual progress patterns and psychology',
        category: 'COACHING',
        valueProposition: 'Get expert guidance 24/7 at a fraction of human coaching cost',
        pricingModel: 'MONTHLY',
        price: 4999, // $49.99/month
        valueROI: 15, // 15x ROI through better decisions
        targetUser: 'ALL',
        requiredFeatures: ['advanced-analytics'],
        outcomes: [
          'Personalized strategy adjustments based on real performance',
          'Early intervention when goals are at risk',
          'Optimized habit formation schedules',
          'Breakthrough identification and acceleration',
        ],
        timeToValue: 3,
        retentionDriver: 90,
      },
      {
        id: 'workflow-automation',
        name: 'Workflow Automation',
        description: 'Automate routine productivity tasks and integrate with your favorite tools',
        category: 'AUTOMATION',
        valueProposition: 'Save 5+ hours per week by automating repetitive productivity tasks',
        pricingModel: 'MONTHLY',
        price: 2999, // $29.99/month
        valueROI: 20, // 20x ROI through time savings
        targetUser: 'INTERMEDIATE',
        requiredFeatures: [],
        outcomes: [
          'Automated goal progress tracking',
          'Smart habit reminders and scheduling',
          'Integration with calendar and task tools',
          'Automated reporting and insights',
        ],
        timeToValue: 1,
        retentionDriver: 95,
      },
      {
        id: 'team-collaboration',
        name: 'Team Collaboration',
        description: 'Advanced tools for team goal setting, accountability, and project management',
        category: 'COLLABORATION',
        valueProposition: 'Increase team productivity by 30% through better collaboration',
        pricingModel: 'PER_USER',
        price: 1499, // $14.99/user/month
        valueROI: 25, // 25x ROI for teams
        targetUser: 'ALL',
        requiredFeatures: [],
        outcomes: [
          'Shared goal tracking and accountability',
          'Team productivity analytics',
          'Automated progress reporting',
          'Integrated communication tools',
        ],
        timeToValue: 14,
        retentionDriver: 80,
      },
      {
        id: 'integrations',
        name: 'Premium Integrations',
        description: 'Deep integrations with 50+ business and productivity tools',
        category: 'INTEGRATION',
        valueProposition: 'Seamless workflow with tools you already use',
        pricingModel: 'MONTHLY',
        price: 999, // $9.99/month
        valueROI: 8, // 8x ROI through efficiency
        targetUser: 'ADVANCED',
        requiredFeatures: [],
        outcomes: [
          'Two-way sync with calendar tools',
          'Integration with project management software',
          'Automated data import from fitness trackers',
          'API access for custom integrations',
        ],
        timeToValue: 2,
        retentionDriver: 70,
      },
      {
        id: 'strategic-planning',
        name: 'Strategic Planning Suite',
        description: 'Advanced tools for long-term goal planning and life design',
        category: 'PLANNING',
        valueProposition: 'Create a comprehensive life plan with built-in accountability',
        pricingModel: 'MONTHLY',
        price: 2499, // $24.99/month
        valueROI: 12, // 12x ROI through better life decisions
        targetUser: 'ADVANCED',
        requiredFeatures: ['advanced-analytics'],
        outcomes: [
          '5-year life planning with milestone tracking',
          'Scenario planning and risk assessment',
          'Resource allocation optimization',
          'Progress visualization and reporting',
        ],
        timeToValue: 21,
        retentionDriver: 75,
      },
    ];

    for (const feature of features) {
      this.premiumFeatures.set(feature.id, feature);
    }

    debug.info('Initialized %d premium features', features.length);
  }

  async purchasePremiumFeature(featureId: string, billingCycle: 'MONTHLY' | 'ANNUAL' = 'MONTHLY'): Promise<PremiumSubscription> {
    if (!this.userId) {
      throw new Error('User not set');
    }

    const feature = this.premiumFeatures.get(featureId);
    if (!feature) {
      throw new Error(`Feature not found: ${featureId}`);
    }

    // Calculate price based on billing cycle
    const price = billingCycle === 'ANNUAL' ? feature.price * 10 : feature.price; // 2 months free annually
    const endDate = billingCycle === 'ANNUAL' ? 
      Date.now() + (365 * 24 * 60 * 60 * 1000) : 
      Date.now() + (30 * 24 * 60 * 60 * 1000);

    // Create or update subscription
    let subscription = this.subscriptions.get(this.userId);
    if (!subscription) {
      subscription = {
        id: this.generateId(),
        userId: this.userId,
        tier: this.calculateTier(featureId),
        features: [featureId],
        status: 'ACTIVE',
        startDate: Date.now(),
        endDate,
        billingCycle,
        totalValue: 0,
        usageMetrics: {
          goalsCompleted: 0,
          habitsFormed: 0,
          insightsGenerated: 0,
          collaborationsInitiated: 0,
          roiScore: 0,
        },
      };
    } else {
      subscription.features.push(featureId);
      subscription.endDate = Math.max(subscription.endDate || 0, endDate);
      subscription.tier = this.calculateTier(subscription.features);
    }

    this.subscriptions.set(this.userId, subscription);

    debug.info('Purchased premium feature: %s (%s)', feature.name, billingCycle);

    eventBus.publish('monetization:feature_purchased', {
      userId: this.userId,
      featureId,
      feature: feature.name,
      price,
      billingCycle,
      expectedROI: feature.valueROI,
    });

    return subscription;
  }

  private calculateTier(featureIds: string[]): PremiumSubscription['tier'] {
    const featureCount = featureIds.length;
    
    if (featureCount >= 5) return 'BUSINESS';
    if (featureCount >= 3) return 'PROFESSIONAL';
    if (featureCount >= 1) return 'BASIC';
    return 'BASIC';
  }

  // ============================================================================
  // PERSONAL COACHING (REAL HUMAN COACHING)
  // ============================================================================

  async purchaseCoachingPackage(options: {
    package: PersonalCoaching['package'];
    focus: PersonalCoaching['focus'];
    preferredCoachId?: string;
  }): Promise<PersonalCoaching> {
    if (!this.userId) {
      throw new Error('User not set');
    }

    const coaching: PersonalCoaching = {
      id: this.generateId(),
      userId: this.userId,
      coachId: options.preferredCoachId || 'auto-assign',
      package: options.package,
      focus: options.focus,
      status: 'ACTIVE',
      sessionsCompleted: 0,
      totalSessions: this.getSessionCount(options.package),
      outcomes: [],
      breakthroughs: [],
      satisfactionScore: 0,
      roiMultiple: 0,
    };

    this.coaching.set(coaching.id, coaching);

    debug.info('Purchased coaching package: %s (%s)', options.package, options.focus);

    eventBus.publish('monetization:coaching_purchased', {
      coachingId: coaching.id,
      package: options.package,
      focus: options.focus,
      expectedSessions: coaching.totalSessions,
    });

    return coaching;
  }

  private getSessionCount(packageType: PersonalCoaching['package']): number {
    const sessionCounts = {
      'INTRODUCTORY': 3,
      'MONTHLY': 4,
      'QUARTERLY': 12,
      'INTENSIVE': 24,
    };
    
    return sessionCounts[packageType];
  }

  async completeCoachingSession(coachingId: string, sessionData: {
    breakthroughs: string[];
    actionItems: string[];
    satisfaction: number; // 1-100
    immediateValue: number; // Perceived value of session
  }): Promise<void> {
    const coaching = this.coaching.get(coachingId);
    if (!coaching) {
      throw new Error(`Coaching not found: ${coachingId}`);
    }

    coaching.sessionsCompleted++;
    coaching.breakthroughs.push(...sessionData.breakthroughs);
    coaching.satisfactionScore = Math.round(
      (coaching.satisfactionScore * (coaching.sessionsCompleted - 1) + sessionData.satisfaction) / 
      coaching.sessionsCompleted
    );

    debug.info('Completed coaching session: %s (%d/%d)', coachingId, coaching.sessionsCompleted, coaching.totalSessions);

    eventBus.publish('monetization:coaching_session_completed', {
      coachingId,
      sessionsCompleted: coaching.sessionsCompleted,
      breakthroughCount: sessionData.breakthroughs.length,
      satisfaction: sessionData.satisfaction,
    });

    // Check if coaching package is complete
    if (coaching.sessionsCompleted >= coaching.totalSessions) {
      coaching.status = 'COMPLETED';
      await this.calculateCoachingROI(coaching);
    }
  }

  private async calculateCoachingROI(coaching: PersonalCoaching): Promise<void> {
    // Calculate ROI based on outcomes and breakthroughs
    const baseROI = coaching.satisfactionScore / 100;
    const breakthroughMultiplier = coaching.breakthroughs.length * 0.5;
    coaching.roiMultiple = Math.round((baseROI + breakthroughMultiplier) * 10) / 10;

    debug.info('Calculated coaching ROI: %dx for coaching: %s', coaching.roiMultiple, coaching.id);
  }

  // ============================================================================
  // TEAM PLANS (REAL BUSINESS VALUE)
  // ============================================================================

  async purchaseTeamPlan(options: {
    organizationId: string;
    teamSize: number;
    features: string[];
    supportLevel: TeamPlan['supportLevel'];
  }): Promise<TeamPlan> {
    const teamPlan: TeamPlan = {
      id: this.generateId(),
      organizationId: options.organizationId,
      teamSize: options.teamSize,
      features: options.features,
      pricing: 'PER_USER',
      status: 'TRIAL', // 14-day trial
      teamMetrics: {
        productivityGain: 0,
        goalCompletionRate: 0,
        collaborationEffectiveness: 0,
        employeeRetention: 0,
        overallROI: 0,
      },
      integrations: [],
      supportLevel: options.supportLevel,
    };

    this.teamPlans.set(teamPlan.id, teamPlan);

    debug.info('Purchased team plan for organization: %s (%d users)', options.organizationId, options.teamSize);

    eventBus.publish('monetization:team_plan_purchased', {
      teamPlanId: teamPlan.id,
      organizationId: options.organizationId,
      teamSize: options.teamSize,
      features: options.features,
      supportLevel: options.supportLevel,
    });

    return teamPlan;
  }

  // ============================================================================
  // VALUE MEASUREMENT (PROVING REAL ROI)
  // ============================================================================

  async measureUserValue(period: ValueMeasurement['period']): Promise<ValueMeasurement> {
    if (!this.userId) {
      throw new Error('User not set');
    }

    const measurement: ValueMeasurement = {
      userId: this.userId,
      period,
      metrics: await this.calculateProductivityMetrics(),
      financialImpact: await this.calculateFinancialImpact(),
      satisfactionScore: await this.calculateSatisfactionScore(),
      renewalProbability: await this.calculateRenewalProbability(),
    };

    // Store measurement
    const userMeasurements = this.valueMeasurements.get(this.userId) || [];
    userMeasurements.push(measurement);
    this.valueMeasurements.set(this.userId, userMeasurements);

    debug.info('Measured user value for %s: %d satisfaction', period, measurement.satisfactionScore);

    eventBus.publish('monetization:value_measured', {
      userId: this.userId,
      period,
      satisfactionScore: measurement.satisfactionScore,
      renewalProbability: measurement.renewalProbability,
      overallROI: measurement.financialImpact.timeValue,
    });

    return measurement;
  }

  private async calculateProductivityMetrics(): Promise<ValueMeasurement['metrics']> {
    const goals = this.goalTrackingService.getAllGoals();
    const habits = this.habitFormationService.getAllHabits();
    const capabilities = this.progressionService.getCapabilities();
    const collaborations = this.collaborationService.getAccountabilityPartnerships();

    // Calculate productivity metrics
    const completedGoals = goals.filter(g => g.status === 'COMPLETED').length;
    const strongHabits = habits.filter(h => h.strength > 70).length;
    const avgCapabilityLevel = capabilities.reduce((sum, c) => sum + c.currentLevel, 0) / Math.max(1, capabilities.length);
    const activeCollaborations = collaborations.filter(c => c.status === 'ACTIVE').length;

    // Estimate time savings (in hours per week)
    const productivityGain = (completedGoals * 2) + (strongHabits * 3) + (avgCapabilityLevel * 0.5) + (activeCollaborations * 1);

    return {
      productivityGain,
      goalAcceleration: completedGoals > 0 ? 150 : 100, // 50% faster with completed goals
      habitFormationRate: habits.length > 0 ? (strongHabits / habits.length) * 100 : 0,
      collaborationValue: activeCollaborations * 25, // Each collaboration worth 25 points
      insightQuality: avgCapabilityLevel, // Based on capability development
      overallLifeImprovement: Math.round((completedGoals + strongHabits + avgCapabilityLevel) / 3),
    };
  }

  private async calculateFinancialImpact(): Promise<ValueMeasurement['financialImpact']> {
    const subscription = this.subscriptions.get(this.userId);
    const coaching = Array.from(this.coaching.values()).find(c => c.userId === this.userId);
    
    // Estimate financial impacts
    const metrics = await this.calculateProductivityMetrics();
    
    return {
      careerAdvancement: metrics.overallLifeImprovement * 1000, // $1000 per improvement point
      healthCostSavings: metrics.habitFormationRate * 500, // $500 per habit formation percentage
      opportunityCost: metrics.productivityGain * 50, // $50 per hour saved per week
      timeValue: metrics.productivityGain * 52 * 25, // $25/hour * hours saved * weeks
    };
  }

  private async calculateSatisfactionScore(): Promise<number> {
    const subscription = this.subscriptions.get(this.userId);
    if (!subscription) return 50;

    // Calculate satisfaction based on usage metrics and outcomes
    const { usageMetrics } = subscription;
    
    let score = 50; // Base score
    
    // Bonus for actual usage
    score += Math.min(30, usageMetrics.goalsCompleted * 5);
    score += Math.min(20, usageMetrics.habitsFormed * 4);
    score += Math.min(15, usageMetrics.insightsGenerated * 2);
    score += Math.min(10, usageMetrics.collaborationsInitiated * 3);
    
    // Bonus for ROI
    score += Math.min(25, usageMetrics.roiScore / 4);

    return Math.min(100, Math.max(0, score));
  }

  private async calculateRenewalProbability(): Promise<number> {
    const measurement = await this.measureUserValue('MONTHLY');
    
    let probability = 50; // Base probability
    
    // Adjust based on satisfaction
    probability += (measurement.satisfactionScore - 50) * 0.5;
    
    // Adjust based on financial impact
    const totalFinancialImpact = Object.values(measurement.financialImpact).reduce((sum, val) => sum + val, 0);
    probability += Math.min(30, totalFinancialImpact / 1000 * 5);
    
    // Adjust based on usage patterns
    const subscription = this.subscriptions.get(this.userId);
    if (subscription) {
      const featureUsage = subscription.features.length;
      probability += Math.min(20, featureUsage * 4);
    }

    return Math.min(100, Math.max(0, probability));
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  getPremiumFeatures(): PremiumFeature[] {
    return Array.from(this.premiumFeatures.values());
  }

  getFeatureById(featureId: string): PremiumFeature | undefined {
    return this.premiumFeatures.get(featureId);
  }

  getUserSubscription(): PremiumSubscription | undefined {
    if (!this.userId) return undefined;
    return this.subscriptions.get(this.userId);
  }

  getUserCoaching(): PersonalCoaching[] {
    if (!this.userId) return [];
    return Array.from(this.coaching.values()).filter(c => c.userId === this.userId);
  }

  getValueMeasurements(): ValueMeasurement[] {
    if (!this.userId) return [];
    return this.valueMeasurements.get(this.userId) || [];
  }

  async generateUpgradeRecommendations(): Promise<Array<{
    feature: PremiumFeature;
    reason: string;
    expectedValue: number;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>> {
    if (!this.userId) return [];

    const subscription = this.subscriptions.get(this.userId);
    const currentFeatures = subscription?.features || [];
    const goals = this.goalTrackingService.getAllGoals();
    const habits = this.habitFormationService.getAllHabits();
    
    const recommendations: Array<{
      feature: PremiumFeature;
      reason: string;
      expectedValue: number;
      urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }> = [];

    // Analyze user patterns and recommend relevant features
    for (const feature of this.premiumFeatures.values()) {
      if (currentFeatures.includes(feature.id)) continue;

      let reason = '';
      let urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
      let expectedValue = feature.valueROI;

      // Custom recommendations based on user behavior
      switch (feature.id) {
        case 'advanced-analytics':
          if (goals.length > 3) {
            reason = 'You have multiple goals - analytics will help optimize your strategy';
            urgency = 'HIGH';
            expectedValue = 15;
          }
          break;

        case 'ai-coaching':
          if (goals.some(g => g.estimatedImpact === 'TRANSFORMATIVE')) {
            reason = 'You have transformative goals - AI coaching will accelerate success';
            urgency = 'CRITICAL';
            expectedValue = 25;
          }
          break;

        case 'workflow-automation':
          if (habits.length > 5) {
            reason = 'You have many habits - automation will save significant time';
            urgency = 'MEDIUM';
            expectedValue = 20;
          }
          break;

        case 'team-collaboration':
          const collaborations = this.collaborationService.getAccountabilityPartnerships();
          if (collaborations.length > 0) {
            reason = 'You already collaborate - upgrade to team features for better results';
            urgency = 'MEDIUM';
            expectedValue = 18;
          }
          break;

        case 'strategic-planning':
          if (goals.some(g => g.estimatedImpact === 'TRANSFORMATIVE' || g.estimatedImpact === 'MAJOR')) {
            reason = 'You have major goals - strategic planning will ensure success';
            urgency = 'HIGH';
            expectedValue = 12;
          }
          break;
      }

      if (reason) {
        recommendations.push({
          feature,
          reason,
          expectedValue,
          urgency,
        });
      }
    }

    return recommendations.sort((a, b) => {
      const urgencyOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
  }

  setUserId(userId: string): void {
    this.userId = userId;
    this.productivityEngine.setUserId(userId);
    this.goalTrackingService.setUserId(userId);
    this.habitFormationService.setUserId(userId);
    this.progressionService.setUserId(userId);
    this.collaborationService.setUserId(userId);
    debug.info('RealMonetizationService user set: %s', userId);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let realMonetizationServiceInstance: RealMonetizationService | null = null;

export function getRealMonetizationService(userId?: string): RealMonetizationService {
  if (!realMonetizationServiceInstance) {
    realMonetizationServiceInstance = new RealMonetizationService(userId);
  } else if (userId) {
    realMonetizationServiceInstance.setUserId(userId);
  }
  return realMonetizationServiceInstance;
}
