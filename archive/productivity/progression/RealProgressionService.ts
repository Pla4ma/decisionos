/**
 * Real Progression Service
 * 
 * Replaces fake levels with actual capability development.
 * Progress based on real achievements, not fantasy points.
 */

import { createDebugger } from '../../utils/debug';
import { eventBus } from '../../events';
import { getProductivityEngine } from '../core/ProductivityEngine';
import { getGoalTrackingService } from '../goals/GoalTrackingService';
import { getHabitFormationService } from '../habits/HabitFormationService';
import type { RealGoal, HabitPattern } from '../core/ProductivityEngine';

const debug = createDebugger('productivity:progression');

// ============================================================================
// REAL CAPABILITY DEVELOPMENT
// ============================================================================

export interface Capability {
  id: string;
  name: string;
  category: 'DISCIPLINE' | 'FOCUS' | 'CONSISTENCY' | 'PLANNING' | 'EXECUTION' | 'RESILIENCE' | 'LEARNING' | 'COMMUNICATION';
  description: string;
  currentLevel: number; // 1-100 based on actual demonstrated ability
  targetLevel: number;
  evidence: string[]; // Real proof of capability
  lastDemonstrated: number;
  growthRate: number; // How fast this capability is developing
  applications: string[]; // How this capability has been applied
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'GOAL_COMPLETION' | 'HABIT_FORMATION' | 'CONSISTENCY' | 'BREAKTHROUGH' | 'MASTERY' | 'TRANSFORMATION';
  significance: 'MINOR' | 'MODERATE' | 'MAJOR' | 'TRANSFORMATIONAL';
  achievedAt: number;
  evidence: string[]; // Real proof this was earned
  capabilitiesDemonstrated: string[]; // What capabilities this proves
  impact: {
    personal: string;
    ripple: string[]; // How this affected other areas
  };
}

export interface ProgressionInsight {
  type: 'STRENGTH' | 'OPPORTUNITY' | 'PATTERN' | 'WARNING' | 'BREAKTHROUGH';
  title: string;
  description: string;
  data: {
    capabilityGrowth: Array<{ capability: string; growth: number }>;
    achievementPatterns: Array<{ category: string; frequency: number }>;
    developmentAreas: string[];
    momentumFactors: string[];
  };
  recommendations: string[];
  confidence: number;
}

export interface LifeDomain {
  domain: 'CAREER' | 'HEALTH' | 'RELATIONSHIPS' | 'FINANCIAL' | 'LEARNING' | 'CREATIVE' | 'SPIRITUAL';
  health: number; // 0-100 based on real metrics
  trajectory: 'DECLINING' | 'STABLE' | 'IMPROVING' | 'THRIVING';
  keyAchievements: string[];
  challenges: string[];
  opportunities: string[];
  nextMilestone: string;
}

// ============================================================================
// REAL PROGRESSION SERVICE
// ============================================================================

export class RealProgressionService {
  private userId: string | null = null;
  private productivityEngine = getProductivityEngine();
  private goalTrackingService = getGoalTrackingService();
  private habitFormationService = getHabitFormationService();
  
  private capabilities: Map<string, Capability> = new Map();
  private achievements: Achievement[] = [];
  private lifeDomains: Map<string, LifeDomain> = new Map();
  private insights: ProgressionInsight[] = [];

  constructor(userId?: string) {
    this.userId = userId ?? null;
    if (userId) {
      this.productivityEngine.setUserId(userId);
      this.goalTrackingService.setUserId(userId);
      this.habitFormationService.setUserId(userId);
    }
    debug.info('RealProgressionService initialized for user: %s', userId);
  }

  // ============================================================================
  // CAPABILITY DEVELOPMENT (REAL SKILLS, NOT FANTASY LEVELS)
  // ============================================================================

  async analyzeCapabilityDevelopment(): Promise<void> {
    const goals = this.goalTrackingService.getAllGoals();
    const habits = this.habitFormationService.getAllHabits();
    
    // Analyze real capability development from actual achievements
    await this.analyzeDisciplineCapability(goals, habits);
    await this.analyzeFocusCapability(goals);
    await this.analyzeConsistencyCapability(habits);
    await this.analyzePlanningCapability(goals);
    await this.analyzeExecutionCapability(goals);
    await this.analyzeResilienceCapability(goals, habits);
    await this.analyzeLearningCapability(goals);
    await this.analyzeCommunicationCapability(goals);

    debug.info('Analyzed capability development across 8 domains');
  }

  private async analyzeDisciplineCapability(goals: RealGoal[], habits: HabitPattern[]): Promise<void> {
    const discipline = this.getOrCreateCapability('DISCIPLINE');
    
    // Evidence from goal completion despite obstacles
    const completedGoals = goals.filter(g => g.status === 'COMPLETED');
    const evidence: string[] = [];
    
    if (completedGoals.length > 0) {
      evidence.push(`Completed ${completedGoals.length} goals despite distractions`);
    }

    // Evidence from habit maintenance
    const strongHabits = habits.filter(h => h.strength > 70);
    if (strongHabits.length > 0) {
      evidence.push(`Maintained ${strongHabits.length} habits with high strength`);
    }

    // Calculate level based on real evidence
    const level = this.calculateCapabilityLevel(evidence.length, completedGoals.length, strongHabits.length);
    
    discipline.currentLevel = level;
    discipline.evidence = evidence;
    discipline.lastDemonstrated = Date.now();
    discipline.growthRate = this.calculateGrowthRate(discipline, evidence);

    debug.info('Discipline capability analyzed: level %d', level);
  }

  private async analyzeFocusCapability(goals: RealGoal[]): Promise<void> {
    const focus = this.getOrCreateCapability('FOCUS');
    
    // Evidence from session quality and goal progress
    const evidence: string[] = [];
    let focusScore = 0;

    // Analyze goal progress patterns
    for (const goal of goals) {
      if (goal.progress > 50) {
        focusScore += 20;
        evidence.push(`Maintained focus on ${goal.title} beyond 50% completion`);
      }
      
      if (goal.totalInvestmentMinutes > 0) {
        const efficiency = goal.progress / (goal.totalInvestmentMinutes / 60); // progress per hour
        if (efficiency > 5) {
          focusScore += 15;
          evidence.push(`High efficiency progress on ${goal.title}`);
        }
      }
    }

    const level = Math.min(100, Math.max(1, focusScore));
    
    focus.currentLevel = level;
    focus.evidence = evidence;
    focus.lastDemonstrated = Date.now();
    focus.growthRate = this.calculateGrowthRate(focus, evidence);

    debug.info('Focus capability analyzed: level %d', level);
  }

  private async analyzeConsistencyCapability(habits: HabitPattern[]): Promise<void> {
    const consistency = this.getOrCreateCapability('CONSISTENCY');
    
    const evidence: string[] = [];
    let consistencyScore = 0;

    for (const habit of habits) {
      const analytics = this.habitFormationService.getHabitAnalytics(habit.id);
      if (analytics) {
        if (analytics.completionRate > 80) {
          consistencyScore += 25;
          evidence.push(`${analytics.completionRate}% completion rate for ${habit.name}`);
        }
        
        if (analytics.currentStreak > 14) {
          consistencyScore += 15;
          evidence.push(`${analytics.currentStreak} day streak for ${habit.name}`);
        }
        
        if (analytics.longestStreak > 30) {
          consistencyScore += 10;
          evidence.push(`${analytics.longestStreak} day longest streak for ${habit.name}`);
        }
      }
    }

    const level = Math.min(100, Math.max(1, consistencyScore));
    
    consistency.currentLevel = level;
    consistency.evidence = evidence;
    consistency.lastDemonstrated = Date.now();
    consistency.growthRate = this.calculateGrowthRate(consistency, evidence);

    debug.info('Consistency capability analyzed: level %d', level);
  }

  private async analyzePlanningCapability(goals: RealGoal[]): Promise<void> {
    const planning = this.getOrCreateCapability('PLANNING');
    
    const evidence: string[] = [];
    let planningScore = 0;

    for (const goal of goals) {
      // Well-structured goals with clear success metrics
      if (goal.successMetrics && goal.successMetrics.length >= 3) {
        planningScore += 15;
        evidence.push(`Detailed planning for ${goal.title} with ${goal.successMetrics.length} success metrics`);
      }
      
      // Goals with target dates that are being met
      if (goal.targetDate && goal.progress > 0) {
        const timeProgress = (Date.now() - goal.createdAt) / (goal.targetDate - goal.createdAt);
        const progressRatio = goal.progress / 100;
        
        if (progressRatio >= timeProgress * 0.8) { // On track or ahead
          planningScore += 20;
          evidence.push(`On-track progress for ${goal.title}`);
        }
      }
    }

    const level = Math.min(100, Math.max(1, planningScore));
    
    planning.currentLevel = level;
    planning.evidence = evidence;
    planning.lastDemonstrated = Date.now();
    planning.growthRate = this.calculateGrowthRate(planning, evidence);

    debug.info('Planning capability analyzed: level %d', level);
  }

  private async analyzeExecutionCapability(goals: RealGoal[]): Promise<void> {
    const execution = this.getOrCreateCapability('EXECUTION');
    
    const evidence: string[] = [];
    let executionScore = 0;

    const completedGoals = goals.filter(g => g.status === 'COMPLETED');
    
    for (const goal of completedGoals) {
      // High-impact goals completed
      if (goal.estimatedImpact === 'TRANSFORMATIVE' || goal.estimatedImpact === 'MAJOR') {
        executionScore += 30;
        evidence.push(`Executed ${goal.estimatedImpact} goal: ${goal.title}`);
      }
      
      // Goals completed efficiently
      if (goal.totalInvestmentMinutes > 0 && goal.estimatedImpact !== 'MINOR') {
        const efficiency = this.calculateExecutionEfficiency(goal);
        if (efficiency > 0.8) {
          executionScore += 20;
          evidence.push(`Efficient execution of ${goal.title}`);
        }
      }
      
      // Real outcomes achieved
      if (goal.actualOutcomes && goal.actualOutcomes.length > 0) {
        executionScore += 15;
        evidence.push(`Achieved real outcomes for ${goal.title}: ${goal.actualOutcomes.join(', ')}`);
      }
    }

    const level = Math.min(100, Math.max(1, executionScore));
    
    execution.currentLevel = level;
    execution.evidence = evidence;
    execution.lastDemonstrated = Date.now();
    execution.growthRate = this.calculateGrowthRate(execution, evidence);

    debug.info('Execution capability analyzed: level %d', level);
  }

  private async analyzeResilienceCapability(goals: RealGoal[], habits: HabitPattern[]): Promise<void> {
    const resilience = this.getOrCreateCapability('RESILIENCE');
    
    const evidence: string[] = [];
    let resilienceScore = 50; // Base score for having goals/habits

    // Evidence from habit recovery
    for (const habit of habits) {
      const analytics = this.habitFormationService.getHabitAnalytics(habit.id);
      if (analytics && analytics.currentStreak > 0 && analytics.averageGapDays > 0) {
        resilienceScore += 10;
        evidence.push(`Recovered from gaps in ${habit.name} habit`);
      }
    }

    // Evidence from goal persistence
    for (const goal of goals) {
      if (goal.totalInvestmentMinutes > 1000 && goal.progress > 0) {
        resilienceScore += 15;
        evidence.push(`Persisted with ${goal.title} through challenges`);
      }
    }

    const level = Math.min(100, Math.max(1, resilienceScore));
    
    resilience.currentLevel = level;
    resilience.evidence = evidence;
    resilience.lastDemonstrated = Date.now();
    resilience.growthRate = this.calculateGrowthRate(resilience, evidence);

    debug.info('Resilience capability analyzed: level %d', level);
  }

  private async analyzeLearningCapability(goals: RealGoal[]): Promise<void> {
    const learning = this.getOrCreateCapability('LEARNING');
    
    const evidence: string[] = [];
    let learningScore = 0;

    const learningGoals = goals.filter(g => g.category === 'LEARNING');
    
    for (const goal of learningGoals) {
      if (goal.progress > 50) {
        learningScore += 25;
        evidence.push(`Progressed in learning goal: ${goal.title}`);
      }
      
      if (goal.status === 'COMPLETED') {
        learningScore += 35;
        evidence.push(`Completed learning goal: ${goal.title}`);
      }
    }

    // Evidence from applying learning in other domains
    const otherGoals = goals.filter(g => g.category !== 'LEARNING');
    for (const goal of otherGoals) {
      if (goal.actualOutcomes && goal.actualOutcomes.some(outcome => 
        outcome.toLowerCase().includes('learned') || 
        outcome.toLowerCase().includes('skill') ||
        outcome.toLowerCase().includes('knowledge')
      )) {
        learningScore += 15;
        evidence.push(`Applied learning in ${goal.title}`);
      }
    }

    const level = Math.min(100, Math.max(1, learningScore));
    
    learning.currentLevel = level;
    learning.evidence = evidence;
    learning.lastDemonstrated = Date.now();
    learning.growthRate = this.calculateGrowthRate(learning, evidence);

    debug.info('Learning capability analyzed: level %d', level);
  }

  private async analyzeCommunicationCapability(goals: RealGoal[]): Promise<void> {
    const communication = this.getOrCreateCapability('COMMUNICATION');
    
    const evidence: string[] = [];
    let communicationScore = 0;

    const relationshipGoals = goals.filter(g => g.category === 'RELATIONSHIPS');
    
    for (const goal of relationshipGoals) {
      if (goal.progress > 30) {
        communicationScore += 20;
        evidence.push(`Improved communication through ${goal.title}`);
      }
    }

    // Evidence from collaboration in other goals
    for (const goal of goals) {
      if (goal.actualOutcomes && goal.actualOutcomes.some(outcome => 
        outcome.toLowerCase().includes('collabor') || 
        outcome.toLowerCase().includes('team') ||
        outcome.toLowerCase().includes('partner')
      )) {
        communicationScore += 15;
        evidence.push(`Collaborated effectively on ${goal.title}`);
      }
    }

    const level = Math.min(100, Math.max(1, communicationScore));
    
    communication.currentLevel = level;
    communication.evidence = evidence;
    communication.lastDemonstrated = Date.now();
    communication.growthRate = this.calculateGrowthRate(communication, evidence);

    debug.info('Communication capability analyzed: level %d', level);
  }

  // ============================================================================
  // ACHIEVEMENT RECOGNITION (REAL ACCOMPLISHMENTS)
  // ============================================================================

  async recognizeRealAchievements(): Promise<void> {
    const goals = this.goalTrackingService.getAllGoals();
    const habits = this.habitFormationService.getAllHabits();
    
    // Recognize goal completion achievements
    await this.recognizeGoalAchievements(goals);
    
    // Recognize habit formation achievements
    await this.recognizeHabitAchievements(habits);
    
    // Recognize consistency achievements
    await this.recognizeConsistencyAchievements(goals, habits);
    
    // Recognize breakthrough achievements
    await this.recognizeBreakthroughAchievements(goals, habits);
    
    // Recognize mastery achievements
    await this.recognizeMasteryAchievements();
    
    // Recognize transformation achievements
    await this.recognizeTransformationAchievements();
  }

  private async recognizeGoalAchievements(goals: RealGoal[]): Promise<void> {
    const completedGoals = goals.filter(g => g.status === 'COMPLETED');
    
    for (const goal of completedGoals) {
      // Check if this achievement was already recognized
      const exists = this.achievements.some(a => 
        a.title.includes(goal.title) && a.category === 'GOAL_COMPLETION'
      );
      
      if (!exists) {
        const achievement: Achievement = {
          id: this.generateId(),
          title: `Completed: ${goal.title}`,
          description: `Successfully achieved ${goal.targetOutcome}`,
          category: 'GOAL_COMPLETION',
          significance: this.getGoalSignificance(goal),
          achievedAt: Date.now(),
          evidence: goal.actualOutcomes.length > 0 ? goal.actualOutcomes : [`${goal.title} completed`],
          capabilitiesDemonstrated: this.getCapabilitiesFromGoal(goal),
          impact: {
            personal: `Achieved ${goal.estimatedImpact.toLowerCase()} impact in ${goal.category.toLowerCase()}`,
            ripple: this.calculateRippleImpact(goal),
          },
        };
        
        this.achievements.push(achievement);
        
        eventBus.publish('achievement:real_celebration', {
          type: achievement.significance === 'TRANSFORMATIONAL' ? 'PUBLIC' : 
                achievement.significance === 'MAJOR' ? 'SOCIAL' : 'PERSONAL',
          goalTitle: goal.title,
          impactScore: this.calculateImpactScore(goal),
          realOutcomes: achievement.evidence,
          investmentMinutes: goal.totalInvestmentMinutes,
        });
        
        debug.info('Recognized goal achievement: %s', goal.title);
      }
    }
  }

  private async recognizeHabitAchievements(habits: HabitPattern[]): Promise<void> {
    for (const habit of habits) {
      const analytics = this.habitFormationService.getHabitAnalytics(habit.id);
      if (!analytics) continue;
      
      // Automatic habit achievement (66+ days)
      if (habit.strength >= 100 && analytics.longestStreak >= 66) {
        const exists = this.achievements.some(a => 
          a.title.includes(habit.name) && a.category === 'HABIT_FORMATION'
        );
        
        if (!exists) {
          const achievement: Achievement = {
            id: this.generateId(),
            title: `Automatic Habit: ${habit.name}`,
            description: `Developed ${habit.name} into an automatic habit (${analytics.longestStreak} day streak)`,
            category: 'HABIT_FORMATION',
            significance: analytics.longestStreak >= 90 ? 'MAJOR' : 'MODERATE',
            achievedAt: Date.now(),
            evidence: [
              `${analytics.longestStreak} day longest streak`,
              `${analytics.completionRate}% completion rate`,
              `Habit strength: ${habit.strength}%`,
            ],
            capabilitiesDemonstrated: ['DISCIPLINE', 'CONSISTENCY'],
            impact: {
              personal: `Integrated ${habit.name} into automatic behavior`,
              ripple: this.calculateHabitRippleImpact(habit),
            },
          };
          
          this.achievements.push(achievement);
          
          eventBus.publish('achievement:real_celebration', {
            type: 'SOCIAL',
            goalTitle: habit.name,
            impactScore: analytics.longestStreak * 2,
            realOutcomes: achievement.evidence,
            investmentMinutes: 0, // Would calculate from habit tracking
          });
          
          debug.info('Recognized habit achievement: %s', habit.name);
        }
      }
    }
  }

  private async recognizeConsistencyAchievements(goals: RealGoal[], habits: HabitPattern[]): Promise<void> {
    // Multi-goal consistency
    const activeGoals = goals.filter(g => g.status === 'ACTIVE');
    const progressingGoals = activeGoals.filter(g => g.progress > 0);
    
    if (progressingGoals.length >= 3) {
      const exists = this.achievements.some(a => 
        a.category === 'CONSISTENCY' && a.title.includes('Multi-Goal')
      );
      
      if (!exists) {
        const achievement: Achievement = {
          id: this.generateId(),
          title: 'Multi-Goal Consistency',
          description: `Maintained progress across ${progressingGoals.length} goals simultaneously`,
          category: 'CONSISTENCY',
          significance: progressingGoals.length >= 5 ? 'MAJOR' : 'MODERATE',
          achievedAt: Date.now(),
          evidence: progressingGoals.map(g => `${g.title}: ${g.progress}%`),
          capabilitiesDemonstrated: ['DISCIPLINE', 'PLANNING', 'EXECUTION'],
          impact: {
            personal: 'Developed ability to pursue multiple goals simultaneously',
            ripple: ['Increased productivity', 'Better time management', 'Reduced overwhelm'],
          },
        };
        
        this.achievements.push(achievement);
        debug.info('Recognized consistency achievement: Multi-Goal Consistency');
      }
    }
    
    // Habit consistency
    const strongHabits = habits.filter(h => h.strength > 70);
    if (strongHabits.length >= 3) {
      const exists = this.achievements.some(a => 
        a.category === 'CONSISTENCY' && a.title.includes('Habit System')
      );
      
      if (!exists) {
        const achievement: Achievement = {
          id: this.generateId(),
          title: 'Habit System Consistency',
          description: `Maintained ${strongHabits.length} strong habits simultaneously`,
          category: 'CONSISTENCY',
          significance: strongHabits.length >= 5 ? 'MAJOR' : 'MODERATE',
          achievedAt: Date.now(),
          evidence: strongHabits.map(h => `${h.name}: ${h.strength}% strength`),
          capabilitiesDemonstrated: ['DISCIPLINE', 'CONSISTENCY'],
          impact: {
            personal: 'Built reliable habit system',
            ripple: ['Automated positive behaviors', 'Reduced decision fatigue', 'Compound growth'],
          },
        };
        
        this.achievements.push(achievement);
        debug.info('Recognized consistency achievement: Habit System Consistency');
      }
    }
  }

  private async recognizeBreakthroughAchievements(goals: RealGoal[], habits: HabitPattern[]): Promise<void> {
    // Goal breakthroughs (major progress after stagnation)
    for (const goal of goals) {
      if (goal.progress > 75 && goal.totalInvestmentMinutes > 2000) {
        // This represents a breakthrough after significant investment
        const exists = this.achievements.some(a => 
          a.category === 'BREAKTHROUGH' && a.title.includes(goal.title)
        );
        
        if (!exists) {
          const achievement: Achievement = {
            id: this.generateId(),
            title: `Breakthrough: ${goal.title}`,
            description: `Achieved major breakthrough on ${goal.title} after persistent effort`,
            category: 'BREAKTHROUGH',
            significance: 'MAJOR',
            achievedAt: Date.now(),
            evidence: [
              `Reached ${goal.progress}% completion`,
              `Invested ${Math.round(goal.totalInvestmentMinutes / 60)} hours`,
              `Overcame significant challenges`,
            ],
            capabilitiesDemonstrated: ['RESILIENCE', 'EXECUTION', 'LEARNING'],
            impact: {
              personal: `Broke through barriers on ${goal.title}`,
              ripple: ['Increased confidence', 'New problem-solving approaches', 'Momentum in other areas'],
            },
          };
          
          this.achievements.push(achievement);
          debug.info('Recognized breakthrough achievement: %s', goal.title);
        }
      }
    }
  }

  private async recognizeMasteryAchievements(): Promise<void> {
    // Capability mastery
    for (const [capabilityName, capability] of this.capabilities) {
      if (capability.currentLevel >= 85) {
        const exists = this.achievements.some(a => 
          a.category === 'MASTERY' && a.title.includes(capabilityName)
        );
        
        if (!exists) {
          const achievement: Achievement = {
            id: this.generateId(),
            title: `Mastery: ${capabilityName}`,
            description: `Achieved mastery level (${capability.currentLevel}%) in ${capabilityName}`,
            category: 'MASTERY',
            significance: 'MAJOR',
            achievedAt: Date.now(),
            evidence: capability.evidence,
            capabilitiesDemonstrated: [capabilityName],
            impact: {
              personal: `Mastered ${capabilityName.toLowerCase()} capability`,
              ripple: this.calculateCapabilityRippleImpact(capabilityName),
            },
          };
          
          this.achievements.push(achievement);
          debug.info('Recognized mastery achievement: %s', capabilityName);
        }
      }
    }
  }

  private async recognizeTransformationAchievements(): Promise<void> {
    // Life domain transformation
    const completedGoals = this.goalTrackingService.getAllGoals().filter(g => g.status === 'COMPLETED');
    const transformativeGoals = completedGoals.filter(g => g.estimatedImpact === 'TRANSFORMATIVE');
    
    if (transformativeGoals.length >= 2) {
      const exists = this.achievements.some(a => 
        a.category === 'TRANSFORMATION' && a.title.includes('Life Transformation')
      );
      
      if (!exists) {
        const achievement: Achievement = {
          id: this.generateId(),
          title: 'Life Transformation',
          description: `Achieved ${transformativeGoals.length} transformative life changes`,
          category: 'TRANSFORMATION',
          significance: 'TRANSFORMATIONAL',
          achievedAt: Date.now(),
          evidence: transformativeGoals.map(g => `${g.title}: ${g.targetOutcome}`),
          capabilitiesDemonstrated: ['EXECUTION', 'RESILIENCE', 'LEARNING'],
          impact: {
            personal: 'Transformed multiple life areas',
            ripple: ['New identity', 'Elevated standards', 'Expanded possibilities'],
          },
        };
        
        this.achievements.push(achievement);
        debug.info('Recognized transformation achievement: Life Transformation');
      }
    }
  }

  // ============================================================================
  // LIFE DOMAIN ANALYSIS
  // ============================================================================

  async analyzeLifeDomains(): Promise<void> {
    const goals = this.goalTrackingService.getAllGoals();
    
    // Analyze each life domain
    await this.analyzeCareerDomain(goals);
    await this.analyzeHealthDomain(goals);
    await this.analyzeRelationshipsDomain(goals);
    await this.analyzeFinancialDomain(goals);
    await this.analyzeLearningDomain(goals);
    await this.analyzeCreativeDomain(goals);
    
    debug.info('Analyzed all life domains');
  }

  private async analyzeCareerDomain(goals: RealGoal[]): Promise<void> {
    const careerGoals = goals.filter(g => g.category === 'CAREER');
    const domain = this.getOrCreateLifeDomain('CAREER');
    
    // Calculate health based on goal progress and completion
    const totalGoals = careerGoals.length;
    const completedGoals = careerGoals.filter(g => g.status === 'COMPLETED').length;
    const avgProgress = careerGoals.reduce((sum, g) => sum + g.progress, 0) / Math.max(1, totalGoals);
    
    domain.health = Math.round((completedGoals * 30) + (avgProgress * 0.7));
    domain.trajectory = this.calculateTrajectory(careerGoals);
    domain.keyAchievements = careerGoals.filter(g => g.status === 'COMPLETED').map(g => g.title);
    domain.challenges = this.identifyChallenges(careerGoals);
    domain.opportunities = this.identifyOpportunities(careerGoals);
    domain.nextMilestone = this.identifyNextMilestone(careerGoals);
  }

  private async analyzeHealthDomain(goals: RealGoal[]): Promise<void> {
    const healthGoals = goals.filter(g => g.category === 'HEALTH');
    const domain = this.getOrCreateLifeDomain('HEALTH');
    
    const totalGoals = healthGoals.length;
    const completedGoals = healthGoals.filter(g => g.status === 'COMPLETED').length;
    const avgProgress = healthGoals.reduce((sum, g) => sum + g.progress, 0) / Math.max(1, totalGoals);
    
    domain.health = Math.round((completedGoals * 30) + (avgProgress * 0.7));
    domain.trajectory = this.calculateTrajectory(healthGoals);
    domain.keyAchievements = healthGoals.filter(g => g.status === 'COMPLETED').map(g => g.title);
    domain.challenges = this.identifyChallenges(healthGoals);
    domain.opportunities = this.identifyOpportunities(healthGoals);
    domain.nextMilestone = this.identifyNextMilestone(healthGoals);
  }

  private async analyzeRelationshipsDomain(goals: RealGoal[]): Promise<void> {
    const relationshipGoals = goals.filter(g => g.category === 'RELATIONSHIPS');
    const domain = this.getOrCreateLifeDomain('RELATIONSHIPS');
    
    const totalGoals = relationshipGoals.length;
    const completedGoals = relationshipGoals.filter(g => g.status === 'COMPLETED').length;
    const avgProgress = relationshipGoals.reduce((sum, g) => sum + g.progress, 0) / Math.max(1, totalGoals);
    
    domain.health = Math.round((completedGoals * 30) + (avgProgress * 0.7));
    domain.trajectory = this.calculateTrajectory(relationshipGoals);
    domain.keyAchievements = relationshipGoals.filter(g => g.status === 'COMPLETED').map(g => g.title);
    domain.challenges = this.identifyChallenges(relationshipGoals);
    domain.opportunities = this.identifyOpportunities(relationshipGoals);
    domain.nextMilestone = this.identifyNextMilestone(relationshipGoals);
  }

  private async analyzeFinancialDomain(goals: RealGoal[]): Promise<void> {
    const financialGoals = goals.filter(g => g.category === 'FINANCIAL');
    const domain = this.getOrCreateLifeDomain('FINANCIAL');
    
    const totalGoals = financialGoals.length;
    const completedGoals = financialGoals.filter(g => g.status === 'COMPLETED').length;
    const avgProgress = financialGoals.reduce((sum, g) => sum + g.progress, 0) / Math.max(1, totalGoals);
    
    domain.health = Math.round((completedGoals * 30) + (avgProgress * 0.7));
    domain.trajectory = this.calculateTrajectory(financialGoals);
    domain.keyAchievements = financialGoals.filter(g => g.status === 'COMPLETED').map(g => g.title);
    domain.challenges = this.identifyChallenges(financialGoals);
    domain.opportunities = this.identifyOpportunities(financialGoals);
    domain.nextMilestone = this.identifyNextMilestone(financialGoals);
  }

  private async analyzeLearningDomain(goals: RealGoal[]): Promise<void> {
    const learningGoals = goals.filter(g => g.category === 'LEARNING');
    const domain = this.getOrCreateLifeDomain('LEARNING');
    
    const totalGoals = learningGoals.length;
    const completedGoals = learningGoals.filter(g => g.status === 'COMPLETED').length;
    const avgProgress = learningGoals.reduce((sum, g) => sum + g.progress, 0) / Math.max(1, totalGoals);
    
    domain.health = Math.round((completedGoals * 30) + (avgProgress * 0.7));
    domain.trajectory = this.calculateTrajectory(learningGoals);
    domain.keyAchievements = learningGoals.filter(g => g.status === 'COMPLETED').map(g => g.title);
    domain.challenges = this.identifyChallenges(learningGoals);
    domain.opportunities = this.identifyOpportunities(learningGoals);
    domain.nextMilestone = this.identifyNextMilestone(learningGoals);
  }

  private async analyzeCreativeDomain(goals: RealGoal[]): Promise<void> {
    const creativeGoals = goals.filter(g => g.category === 'CREATIVE');
    const domain = this.getOrCreateLifeDomain('CREATIVE');
    
    const totalGoals = creativeGoals.length;
    const completedGoals = creativeGoals.filter(g => g.status === 'COMPLETED').length;
    const avgProgress = creativeGoals.reduce((sum, g) => sum + g.progress, 0) / Math.max(1, totalGoals);
    
    domain.health = Math.round((completedGoals * 30) + (avgProgress * 0.7));
    domain.trajectory = this.calculateTrajectory(creativeGoals);
    domain.keyAchievements = creativeGoals.filter(g => g.status === 'COMPLETED').map(g => g.title);
    domain.challenges = this.identifyChallenges(creativeGoals);
    domain.opportunities = this.identifyOpportunities(creativeGoals);
    domain.nextMilestone = this.identifyNextMilestone(creativeGoals);
  }

  // ============================================================================
  // PROGRESSION INSIGHTS
  // ============================================================================

  async generateProgressionInsights(): Promise<ProgressionInsight[]> {
    const insights: ProgressionInsight[] = [];
    
    // Analyze capability growth patterns
    const capabilityGrowth = this.analyzeCapabilityGrowth();
    
    // Analyze achievement patterns
    const achievementPatterns = this.analyzeAchievementPatterns();
    
    // Identify development areas
    const developmentAreas = this.identifyDevelopmentAreas();
    
    // Identify momentum factors
    const momentumFactors = this.identifyMomentumFactors();
    
    // Generate insights based on analysis
    if (capabilityGrowth.some(c => c.growth > 20)) {
      insights.push({
        type: 'BREAKTHROUGH',
        title: 'Rapid Capability Development',
        description: 'One or more capabilities are developing at an accelerated rate.',
        data: {
          capabilityGrowth,
          achievementPatterns,
          developmentAreas,
          momentumFactors,
        },
        recommendations: [
          'Double down on what\'s working',
          'Apply successful patterns to other areas',
          'Document your winning strategies',
        ],
        confidence: 85,
      });
    }
    
    if (developmentAreas.length > 0) {
      insights.push({
        type: 'OPPORTUNITY',
        title: 'Development Opportunities Identified',
        description: 'Specific areas where focused effort could yield significant growth.',
        data: {
          capabilityGrowth,
          achievementPatterns,
          developmentAreas,
          momentumFactors,
        },
        recommendations: developmentAreas.map(area => `Focus on developing ${area}`),
        confidence: 75,
      });
    }
    
    if (momentumFactors.length > 2) {
      insights.push({
        type: 'STRENGTH',
        title: 'Strong Momentum Factors',
        description: 'Multiple factors supporting your continued growth and success.',
        data: {
          capabilityGrowth,
          achievementPatterns,
          developmentAreas,
          momentumFactors,
        },
        recommendations: [
          'Maintain current successful patterns',
          'Share your success with others',
          'Build on existing momentum',
        ],
        confidence: 90,
      });
    }
    
    this.insights = insights;
    debug.info('Generated %d progression insights', insights.length);
    
    return insights;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getOrCreateCapability(name: string): Capability {
    let capability = this.capabilities.get(name);
    
    if (!capability) {
      capability = {
        id: this.generateId(),
        name,
        category: name as Capability['category'],
        description: this.getCapabilityDescription(name),
        currentLevel: 1,
        targetLevel: 100,
        evidence: [],
        lastDemonstrated: Date.now(),
        growthRate: 0,
        applications: [],
      };
      
      this.capabilities.set(name, capability);
    }
    
    return capability;
  }

  private getCapabilityDescription(name: string): string {
    const descriptions: Record<string, string> = {
      'DISCIPLINE': 'Ability to stick to commitments and follow through despite distractions',
      'FOCUS': 'Ability to concentrate on tasks and maintain attention',
      'CONSISTENCY': 'Ability to maintain regular patterns and reliable performance',
      'PLANNING': 'Ability to create effective strategies and break down complex goals',
      'EXECUTION': 'Ability to turn plans into reality through effective action',
      'RESILIENCE': 'Ability to bounce back from setbacks and maintain progress',
      'LEARNING': 'Ability to acquire and apply new knowledge and skills',
      'COMMUNICATION': 'Ability to express ideas clearly and collaborate effectively',
    };
    
    return descriptions[name] || 'Capability under development';
  }

  private calculateCapabilityLevel(evidenceCount: number, completedGoals: number, strongHabits: number): number {
    return Math.min(100, Math.max(1, 
      (evidenceCount * 10) + 
      (completedGoals * 15) + 
      (strongHabits * 12)
    ));
  }

  private calculateGrowthRate(capability: Capability, newEvidence: string[]): number {
    // Simple growth rate calculation based on new evidence
    const evidenceGrowth = newEvidence.length - capability.evidence.length;
    return Math.max(-10, Math.min(20, evidenceGrowth * 5));
  }

  private calculateExecutionEfficiency(goal: RealGoal): number {
    if (goal.totalInvestmentMinutes === 0) return 0;
    
    const expectedMinutes = this.getExpectedMinutesForImpact(goal.estimatedImpact);
    const efficiency = expectedMinutes / goal.totalInvestmentMinutes;
    
    return Math.min(1, efficiency);
  }

  private getExpectedMinutesForImpact(impact: RealGoal['estimatedImpact']): number {
    const expectations: Record<RealGoal['estimatedImpact'], number> = {
      'MINOR': 300,      // 5 hours
      'MODERATE': 1200,  // 20 hours
      'MAJOR': 3000,     // 50 hours
      'TRANSFORMATIVE': 10000, // 167 hours
    };
    
    return expectations[impact] || 1200;
  }

  private getGoalSignificance(goal: RealGoal): Achievement['significance'] {
    const significanceMap: Record<RealGoal['estimatedImpact'], Achievement['significance']> = {
      'MINOR': 'MINOR',
      'MODERATE': 'MODERATE',
      'MAJOR': 'MAJOR',
      'TRANSFORMATIVE': 'TRANSFORMATIONAL',
    };
    
    return significanceMap[goal.estimatedImpact] || 'MODERATE';
  }

  private getCapabilitiesFromGoal(goal: RealGoal): string[] {
    const capabilities: string[] = ['EXECUTION'];
    
    if (goal.totalInvestmentMinutes > 2000) capabilities.push('RESILIENCE');
    if (goal.successMetrics && goal.successMetrics.length >= 3) capabilities.push('PLANNING');
    if (goal.category === 'LEARNING') capabilities.push('LEARNING');
    if (goal.category === 'RELATIONSHIPS') capabilities.push('COMMUNICATION');
    
    return capabilities;
  }

  private calculateRippleImpact(goal: RealGoal): string[] {
    const ripples: string[] = [];
    
    if (goal.estimatedImpact === 'TRANSFORMATIVE') {
      ripples.push('Identity shift', 'New possibilities', 'Elevated standards');
    } else if (goal.estimatedImpact === 'MAJOR') {
      ripples.push('Confidence boost', 'Momentum building');
    } else {
      ripples.push('Skill development', 'Pattern recognition');
    }
    
    return ripples;
  }

  private calculateImpactScore(goal: RealGoal): number {
    const impactMultipliers = {
      'MINOR': 100,
      'MODERATE': 250,
      'MAJOR': 500,
      'TRANSFORMATIVE': 1000,
    };
    
    return impactMultipliers[goal.estimatedImpact] || 250;
  }

  private calculateHabitRippleImpact(habit: HabitPattern): string[] {
    return [
      'Automated positive behavior',
      'Reduced decision fatigue',
      'Compound daily improvement',
    ];
  }

  private getOrCreateLifeDomain(domain: string): LifeDomain {
    let lifeDomain = this.lifeDomains.get(domain);
    
    if (!lifeDomain) {
      lifeDomain = {
        domain: domain as LifeDomain['domain'],
        health: 50,
        trajectory: 'STABLE',
        keyAchievements: [],
        challenges: [],
        opportunities: [],
        nextMilestone: '',
      };
      
      this.lifeDomains.set(domain, lifeDomain);
    }
    
    return lifeDomain;
  }

  private calculateTrajectory(goals: RealGoal[]): LifeDomain['trajectory'] {
    if (goals.length === 0) return 'STABLE';
    
    const avgProgress = goals.reduce((sum, g) => sum + g.progress, 0) / goals.length;
    const recentGoals = goals.filter(g => Date.now() - g.createdAt < 30 * 24 * 60 * 60 * 1000);
    const recentAvgProgress = recentGoals.reduce((sum, g) => sum + g.progress, 0) / Math.max(1, recentGoals.length);
    
    if (recentAvgProgress > avgProgress + 10) return 'THRIVING';
    if (recentAvgProgress > avgProgress) return 'IMPROVING';
    if (recentAvgProgress < avgProgress - 10) return 'DECLINING';
    return 'STABLE';
  }

  private identifyChallenges(goals: RealGoal[]): string[] {
    const challenges: string[] = [];
    
    const stalledGoals = goals.filter(g => g.progress > 0 && g.progress < 30);
    if (stalledGoals.length > 0) {
      challenges.push(`${stalledGoals.length} goals need attention`);
    }
    
    const overdueGoals = goals.filter(g => g.targetDate && g.targetDate < Date.now() && g.status !== 'COMPLETED');
    if (overdueGoals.length > 0) {
      challenges.push(`${overdueGoals.length} goals past target date`);
    }
    
    return challenges;
  }

  private identifyOpportunities(goals: RealGoal[]): string[] {
    const opportunities: string[] = [];
    
    const nearCompletionGoals = goals.filter(g => g.progress > 75 && g.status !== 'COMPLETED');
    if (nearCompletionGoals.length > 0) {
      opportunities.push(`${nearCompletionGoals.length} goals near completion`);
    }
    
    const highImpactGoals = goals.filter(g => g.estimatedImpact === 'TRANSFORMATIVE' || g.estimatedImpact === 'MAJOR');
    if (highImpactGoals.length > 0) {
      opportunities.push(`${highImpactGoals.length} high-impact goals in progress`);
    }
    
    return opportunities;
  }

  private identifyNextMilestone(goals: RealGoal[]): string {
    const nearCompletion = goals.filter(g => g.progress > 75 && g.status !== 'COMPLETED');
    if (nearCompletion.length > 0) {
      return `Complete ${nearCompletion[0].title}`;
    }
    
    const highProgress = goals.filter(g => g.progress > 50).sort((a, b) => b.progress - a.progress);
    if (highProgress.length > 0) {
      return `Reach 100% on ${highProgress[0].title}`;
    }
    
    return 'Establish consistent progress patterns';
  }

  private analyzeCapabilityGrowth(): Array<{ capability: string; growth: number }> {
    return Array.from(this.capabilities.values()).map(cap => ({
      capability: cap.name,
      growth: cap.growthRate,
    }));
  }

  private analyzeAchievementPatterns(): Array<{ category: string; frequency: number }> {
    const frequencies: Record<string, number> = {};
    
    for (const achievement of this.achievements) {
      frequencies[achievement.category] = (frequencies[achievement.category] || 0) + 1;
    }
    
    return Object.entries(frequencies).map(([category, frequency]) => ({
      category,
      frequency,
    }));
  }

  private identifyDevelopmentAreas(): string[] {
    return Array.from(this.capabilities.values())
      .filter(cap => cap.currentLevel < 50)
      .map(cap => cap.name);
  }

  private identifyMomentumFactors(): string[] {
    const factors: string[] = [];
    
    const strongCapabilities = Array.from(this.capabilities.values())
      .filter(cap => cap.currentLevel > 70)
      .map(cap => cap.name);
    
    if (strongCapabilities.length > 2) {
      factors.push('Multiple strong capabilities');
    }
    
    const recentAchievements = this.achievements.filter(a => 
      Date.now() - a.achievedAt < 7 * 24 * 60 * 60 * 1000
    );
    
    if (recentAchievements.length > 0) {
      factors.push('Recent achievement momentum');
    }
    
    const thrivingDomains = Array.from(this.lifeDomains.values())
      .filter(domain => domain.trajectory === 'THRIVING');
    
    if (thrivingDomains.length > 0) {
      factors.push('Thriving life domains');
    }
    
    return factors;
  }

  private calculateCapabilityRippleImpact(capabilityName: string): string[] {
    const rippleMap: Record<string, string[]> = {
      'DISCIPLINE': ['Goal completion', 'Habit maintenance', 'Follow-through'],
      'FOCUS': ['Deep work', 'Quality output', 'Reduced errors'],
      'CONSISTENCY': ['Compound growth', 'Reliability', 'Trust building'],
      'PLANNING': ['Efficiency', 'Strategic thinking', 'Resource optimization'],
      'EXECUTION': ['Results', 'Progress', 'Achievement'],
      'RESILIENCE': ['Recovery', 'Persistence', 'Long-term success'],
      'LEARNING': ['Adaptability', 'Skill acquisition', 'Problem solving'],
      'COMMUNICATION': ['Collaboration', 'Relationships', 'Influence'],
    };
    
    return rippleMap[capabilityName] || ['Personal growth'];
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  getCapabilities(): Capability[] {
    return Array.from(this.capabilities.values());
  }

  getCapability(name: string): Capability | undefined {
    return this.capabilities.get(name);
  }

  getAchievements(): Achievement[] {
    return this.achievements;
  }

  getLifeDomains(): LifeDomain[] {
    return Array.from(this.lifeDomains.values());
  }

  getLifeDomain(domain: string): LifeDomain | undefined {
    return this.lifeDomains.get(domain);
  }

  getProgressionInsights(): ProgressionInsight[] {
    return this.insights;
  }

  getOverallProgressionScore(): number {
    const capabilities = Array.from(this.capabilities.values());
    if (capabilities.length === 0) return 0;
    
    const totalScore = capabilities.reduce((sum, cap) => sum + cap.currentLevel, 0);
    return Math.round(totalScore / capabilities.length);
  }

  async updateProgression(): Promise<void> {
    await this.analyzeCapabilityDevelopment();
    await this.recognizeRealAchievements();
    await this.analyzeLifeDomains();
    await this.generateProgressionInsights();
    
    debug.info('Progression analysis completed');
  }

  setUserId(userId: string): void {
    this.userId = userId;
    this.productivityEngine.setUserId(userId);
    this.goalTrackingService.setUserId(userId);
    this.habitFormationService.setUserId(userId);
    debug.info('RealProgressionService user set: %s', userId);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let realProgressionServiceInstance: RealProgressionService | null = null;

export function getRealProgressionService(userId?: string): RealProgressionService {
  if (!realProgressionServiceInstance) {
    realProgressionServiceInstance = new RealProgressionService(userId);
  } else if (userId) {
    realProgressionServiceInstance.setUserId(userId);
  }
  return realProgressionServiceInstance;
}
