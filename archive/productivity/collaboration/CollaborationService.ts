/**
 * Real Collaboration Service
 * 
 * Replaces fake social features with actual meaningful collaboration.
 * Built around real goal achievement and mutual accountability.
 */

import { createDebugger } from '../../utils/debug';
import { eventBus } from '../../events';
import { getProductivityEngine } from '../core/ProductivityEngine';
import { getGoalTrackingService } from '../goals/GoalTrackingService';
import { getHabitFormationService } from '../habits/HabitFormationService';
import { getRealProgressionService } from '../progression/RealProgressionService';
import type { RealGoal, HabitPattern } from '../core/ProductivityEngine';

const debug = createDebugger('productivity:collaboration');

// ============================================================================
// REAL COLLABORATION PSYCHOLOGY
// ============================================================================

export interface CollaborationGroup {
  id: string;
  name: string;
  description: string;
  type: 'ACCOUNTABILITY' | 'MASTERMIND' | 'SKILL_SHARE' | 'PROJECT_TEAM' | 'COMPETITION' | 'SUPPORT';
  purpose: string;
  maxMembers: number;
  currentMembers: string[];
  createdBy: string;
  createdAt: number;
  status: 'ACTIVE' | 'PAUSED' | 'ENDED';
  sharedGoals: string[]; // Goal IDs that multiple members work on
  collaborationRules: string[];
  successMetrics: string[];
  achievements: string[]; // Group achievements
}

export interface AccountabilityPartnership {
  id: string;
  partner1Id: string;
  partner2Id: string;
  establishedAt: number;
  status: 'ACTIVE' | 'PAUSED' | 'ENDED';
  checkInFrequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY';
  sharedGoals: string[];
  commitmentLevel: 'LIGHT' | 'MODERATE' | 'INTENSE';
  successRate: number; // 0-100 based on goal completion
  totalCheckIns: number;
  missedCheckIns: number;
  interventions: string[]; // Times partners helped each other
}

export interface MastermindGroup {
  id: string;
  name: string;
  members: string[];
  facilitatorId: string;
  meetingFrequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  nextMeeting: number;
  format: 'GOAL_FOCUS' | 'PROBLEM_SOLVING' | 'SKILL_SHARE' | 'ACCOUNTABILITY';
  guidelines: string[];
  hotSeatRotation: string[]; // Member IDs in rotation order
  sharedResources: string[]; // Resources members have shared
  breakthroughs: string[]; // Major breakthroughs from group sessions
  memberContributions: Map<string, number>; // Contribution scores per member
}

export interface SkillExchange {
  id: string;
  skillOffered: string;
  skillRequested: string;
  offeredBy: string;
  requestedBy: string;
  status: 'PROPOSED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  exchangeFormat: 'MENTORING' | 'PEER_EXCHANGE' | 'PROJECT_COLLAB' | 'RESOURCE_SHARE';
  timeline: number; // Expected completion
  actualOutcomes: string[];
  mutualValue: number; // 0-100 how valuable both parties found it
}

export interface ProjectCollaboration {
  id: string;
  projectId: string; // Goal ID that represents the project
  collaborators: string[];
  roles: Map<string, string>; // Member ID -> Role
  contributions: Map<string, string>; // Member ID -> Contribution description
  milestones: Array<{
    title: string;
    assignedTo: string;
    dueDate: number;
    completedAt?: number;
    quality: 'POOR' | 'GOOD' | 'EXCELLENT';
  }>;
  communicationChannels: string[];
  decisionMakingProcess: string;
  conflictResolutionMethod: string;
  overallSuccess: number; // 0-100
}

// ============================================================================
// COLLABORATION SERVICE
// ============================================================================

export class CollaborationService {
  private userId: string | null = null;
  private productivityEngine = getProductivityEngine();
  private goalTrackingService = getGoalTrackingService();
  private habitFormationService = getHabitFormationService();
  private progressionService = getRealProgressionService();
  
  private groups: Map<string, CollaborationGroup> = new Map();
  private partnerships: Map<string, AccountabilityPartnership> = new Map();
  private masterminds: Map<string, MastermindGroup> = new Map();
  private skillExchanges: Map<string, SkillExchange> = new Map();
  private projectCollabs: Map<string, ProjectCollaboration> = new Map();

  constructor(userId?: string) {
    this.userId = userId ?? null;
    if (userId) {
      this.productivityEngine.setUserId(userId);
      this.goalTrackingService.setUserId(userId);
      this.habitFormationService.setUserId(userId);
      this.progressionService.setUserId(userId);
    }
    debug.info('CollaborationService initialized for user: %s', userId);
  }

  // ============================================================================
  // ACCOUNTABILITY PARTNERSHIPS (REAL MUTUAL ACCOUNTABILITY)
  // ============================================================================

  async createAccountabilityPartnership(partnerId: string, options: {
    checkInFrequency: AccountabilityPartnership['checkInFrequency'];
    commitmentLevel: AccountabilityPartnership['commitmentLevel'];
    sharedGoals?: string[];
  }): Promise<AccountabilityPartnership> {
    if (!this.userId) {
      throw new Error('User not set');
    }

    const partnership: AccountabilityPartnership = {
      id: this.generateId(),
      partner1Id: this.userId,
      partner2Id: partnerId,
      establishedAt: Date.now(),
      status: 'ACTIVE',
      checkInFrequency: options.checkInFrequency,
      sharedGoals: options.sharedGoals || [],
      commitmentLevel: options.commitmentLevel,
      successRate: 0,
      totalCheckIns: 0,
      missedCheckIns: 0,
      interventions: [],
    };

    this.partnerships.set(partnership.id, partnership);

    debug.info('Created accountability partnership with user: %s', partnerId);

    eventBus.publish('collaboration:partnership_created', {
      partnershipId: partnership.id,
      partnerId,
      commitmentLevel: options.commitmentLevel,
      checkInFrequency: options.checkInFrequency,
    });

    return partnership;
  }

  async recordAccountabilityCheckIn(partnershipId: string, checkInData: {
    goalsProgress: Array<{ goalId: string; progress: number; challenges: string; nextSteps: string }>;
    habitsStatus: Array<{ habitId: string; completed: boolean; challenges: string }>;
    supportNeeded: string;
    supportOffered: string;
  }): Promise<void> {
    const partnership = this.partnerships.get(partnershipId);
    if (!partnership) {
      throw new Error(`Partnership not found: ${partnershipId}`);
    }

    partnership.totalCheckIns++;

    // Analyze check-in quality and provide insights
    const insights = this.analyzeAccountabilityCheckIn(checkInData);
    
    // Update success rate based on goal progress
    const avgProgress = checkInData.goalsProgress.reduce((sum, g) => sum + g.progress, 0) / Math.max(1, checkInData.goalsProgress.length);
    partnership.successRate = Math.round((partnership.successRate + avgProgress) / 2);

    debug.info('Recorded accountability check-in for partnership: %s', partnershipId);

    eventBus.publish('collaboration:check_in_completed', {
      partnershipId,
      insights,
      avgProgress,
      supportNeeded: checkInData.supportNeeded,
      supportOffered: checkInData.supportOffered,
    });
  }

  private analyzeAccountabilityCheckIn(checkInData: {
    goalsProgress: Array<{ goalId: string; progress: number; challenges: string; nextSteps: string }>;
    habitsStatus: Array<{ habitId: string; completed: boolean; challenges: string }>;
    supportNeeded: string;
    supportOffered: string;
  }): string[] {
    const insights: string[] = [];

    // Analyze goal progress patterns
    const progressingGoals = checkInData.goalsProgress.filter(g => g.progress > 0);
    const stalledGoals = checkInData.goalsProgress.filter(g => g.progress === 0);

    if (progressingGoals.length > stalledGoals.length) {
      insights.push('Strong momentum - most goals showing progress');
    } else if (stalledGoals.length > progressingGoals.length) {
      insights.push('Multiple goals stalled - may need intervention');
    }

    // Analyze habit consistency
    const completedHabits = checkInData.habitsStatus.filter(h => h.completed);
    if (completedHabits.length === checkInData.habitsStatus.length) {
      insights.push('Perfect habit consistency - keep it up!');
    } else if (completedHabits.length < checkInData.habitsStatus.length / 2) {
      insights.push('Habit consistency low - focus on foundation habits');
    }

    // Analyze support dynamics
    if (checkInData.supportNeeded.length > 100 && checkInData.supportOffered.length > 100) {
      insights.push('Healthy support exchange - both giving and receiving');
    } else if (checkInData.supportNeeded.length > 200) {
      insights.push('High support need - partner may need additional help');
    }

    return insights;
  }

  // ============================================================================
  // MASTERMIND GROUPS (REAL PEER MASTERY)
  // ============================================================================

  async createMastermindGroup(options: {
    name: string;
    description: string;
    maxMembers: number;
    meetingFrequency: MastermindGroup['meetingFrequency'];
    format: MastermindGroup['format'];
  }): Promise<MastermindGroup> {
    if (!this.userId) {
      throw new Error('User not set');
    }

    const mastermind: MastermindGroup = {
      id: this.generateId(),
      name: options.name,
      members: [this.userId],
      facilitatorId: this.userId,
      meetingFrequency: options.meetingFrequency,
      nextMeeting: this.calculateNextMeeting(options.meetingFrequency),
      format: options.format,
      guidelines: this.generateMastermindGuidelines(options.format),
      hotSeatRotation: [this.userId],
      sharedResources: [],
      breakthroughs: [],
      memberContributions: new Map([[this.userId, 0]]),
    };

    this.masterminds.set(mastermind.id, mastermind);

    debug.info('Created mastermind group: %s', options.name);

    eventBus.publish('collaboration:mastermind_created', {
      mastermindId: mastermind.id,
      name: options.name,
      format: options.format,
      meetingFrequency: options.meetingFrequency,
    });

    return mastermind;
  }

  async joinMastermindGroup(mastermindId: string): Promise<void> {
    const mastermind = this.masterminds.get(mastermindId);
    if (!mastermind) {
      throw new Error(`Mastermind not found: ${mastermindId}`);
    }

    if (!this.userId) {
      throw new Error('User not set');
    }

    if (mastermind.members.includes(this.userId)) {
      throw new Error('Already a member of this mastermind');
    }

    if (mastermind.members.length >= 8) { // Reasonable max for masterminds
      throw new Error('Mastermind group is full');
    }

    mastermind.members.push(this.userId);
    mastermind.hotSeatRotation.push(this.userId);
    mastermind.memberContributions.set(this.userId, 0);

    debug.info('Joined mastermind group: %s', mastermind.name);

    eventBus.publish('collaboration:mastermind_joined', {
      mastermindId,
      memberCount: mastermind.members.length,
    });
  }

  async conductMastermindSession(mastermindId: string, sessionData: {
    hotSeatMember: string;
    challenge: string;
    contributions: Array<{ memberId: string; contribution: string; quality: 'POOR' | 'GOOD' | 'EXCELLENT' }>;
    breakthroughs: string[];
    actionSteps: string[];
  }): Promise<void> {
    const mastermind = this.masterminds.get(mastermindId);
    if (!mastermind) {
      throw new Error(`Mastermind not found: ${mastermindId}`);
    }

    // Update member contributions
    for (const contribution of sessionData.contributions) {
      const current = mastermind.memberContributions.get(contribution.memberId) || 0;
      const qualityMultiplier = contribution.quality === 'EXCELLENT' ? 3 : contribution.quality === 'GOOD' ? 2 : 1;
      mastermind.memberContributions.set(contribution.memberId, current + qualityMultiplier);
    }

    // Record breakthroughs
    for (const breakthrough of sessionData.breakthroughs) {
      mastermind.breakthroughs.push(breakthrough);
    }

    // Schedule next meeting
    mastermind.nextMeeting = this.calculateNextMeeting(mastermind.meetingFrequency);

    // Rotate hot seat
    const currentIndex = mastermind.hotSeatRotation.indexOf(sessionData.hotSeatMember);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % mastermind.hotSeatRotation.length;
      // In real implementation, would handle rotation properly
    }

    debug.info('Conducted mastermind session for: %s', mastermind.name);

    eventBus.publish('collaboration:mastermind_session_completed', {
      mastermindId,
      hotSeatMember: sessionData.hotSeatMember,
      breakthroughCount: sessionData.breakthroughs.length,
      contributionCount: sessionData.contributions.length,
    });
  }

  private generateMastermindGuidelines(format: MastermindGroup['format']): string[] {
    const baseGuidelines = [
      'Be fully present and engaged',
      'Maintain confidentiality',
      'Focus on solutions, not problems',
      'Give and receive feedback constructively',
    ];

    const formatSpecific: Record<MastermindGroup['format'], string[]> = {
      'GOAL_FOCUS': [
        'Share specific, measurable goals',
        'Focus on accountability and progress',
        'Celebrate wins and analyze setbacks',
      ],
      'PROBLEM_SOLVING': [
        'Present clear, specific challenges',
        'Focus on actionable solutions',
        'Follow up on implemented solutions',
      ],
      'SKILL_SHARE': [
        'Share practical skills and knowledge',
        'Focus on immediate application',
        'Create teaching opportunities',
      ],
      'ACCOUNTABILITY': [
        'Review commitments from previous session',
        'Set clear, achievable next steps',
        'Track progress consistently',
      ],
    };

    return [...baseGuidelines, ...formatSpecific[format]];
  }

  private calculateNextMeeting(frequency: MastermindGroup['meetingFrequency']): number {
    const now = Date.now();
    const multipliers = {
      'WEEKLY': 7,
      'BIWEEKLY': 14,
      'MONTHLY': 30,
    };
    
    return now + (multipliers[frequency] * 24 * 60 * 60 * 1000);
  }

  // ============================================================================
  // SKILL EXCHANGE (REAL MUTUAL VALUE CREATION)
  // ============================================================================

  async proposeSkillExchange(options: {
    skillOffered: string;
    skillRequested: string;
    targetUserId: string;
    exchangeFormat: SkillExchange['exchangeFormat'];
    timeline: number;
  }): Promise<SkillExchange> {
    if (!this.userId) {
      throw new Error('User not set');
    }

    const exchange: SkillExchange = {
      id: this.generateId(),
      skillOffered: options.skillOffered,
      skillRequested: options.skillRequested,
      offeredBy: this.userId,
      requestedBy: options.targetUserId,
      status: 'PROPOSED',
      exchangeFormat: options.exchangeFormat,
      timeline: options.timeline,
      actualOutcomes: [],
      mutualValue: 0,
    };

    this.skillExchanges.set(exchange.id, exchange);

    debug.info('Proposed skill exchange: %s for %s', options.skillOffered, options.skillRequested);

    eventBus.publish('collaboration:skill_exchange_proposed', {
      exchangeId: exchange.id,
      skillOffered: options.skillOffered,
      skillRequested: options.skillRequested,
      exchangeFormat: options.exchangeFormat,
    });

    return exchange;
  }

  async acceptSkillExchange(exchangeId: string): Promise<void> {
    const exchange = this.skillExchanges.get(exchangeId);
    if (!exchange) {
      throw new Error(`Skill exchange not found: ${exchangeId}`);
    }

    if (!this.userId || exchange.requestedBy !== this.userId) {
      throw new Error('Cannot accept this exchange');
    }

    exchange.status = 'IN_PROGRESS';

    debug.info('Accepted skill exchange: %s', exchangeId);

    eventBus.publish('collaboration:skill_exchange_accepted', {
      exchangeId,
      skillOffered: exchange.skillOffered,
      skillRequested: exchange.skillRequested,
    });
  }

  async completeSkillExchange(exchangeId: string, outcomes: {
    actualOutcomes: string[];
    mutualValue: number;
    lessons: string[];
  }): Promise<void> {
    const exchange = this.skillExchanges.get(exchangeId);
    if (!exchange) {
      throw new Error(`Skill exchange not found: ${exchangeId}`);
    }

    exchange.status = 'COMPLETED';
    exchange.actualOutcomes = outcomes.actualOutcomes;
    exchange.mutualValue = outcomes.mutualValue;

    debug.info('Completed skill exchange: %s (value: %d)', exchangeId, outcomes.mutualValue);

    eventBus.publish('collaboration:skill_exchange_completed', {
      exchangeId,
      mutualValue: outcomes.mutualValue,
      outcomeCount: outcomes.actualOutcomes.length,
    });
  }

  // ============================================================================
  // PROJECT COLLABORATION (REAL TEAMWORK)
  // ============================================================================

  async initiateProjectCollaboration(goalId: string, options: {
    collaborators: string[];
    roles: Map<string, string>;
    communicationChannels: string[];
    decisionMakingProcess: string;
  }): Promise<ProjectCollaboration> {
    if (!this.userId) {
      throw new Error('User not set');
    }

    const goal = this.goalTrackingService.getGoalById(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    const collaboration: ProjectCollaboration = {
      id: this.generateId(),
      projectId: goalId,
      collaborators: [this.userId, ...options.collaborators],
      roles: new Map([...options.roles, [this.userId, 'Project Lead']]),
      contributions: new Map(),
      milestones: this.generateProjectMilestones(goal),
      communicationChannels: options.communicationChannels,
      decisionMakingProcess: options.decisionMakingProcess,
      conflictResolutionMethod: 'Consensus-based discussion',
      overallSuccess: 0,
    };

    this.projectCollabs.set(collaboration.id, collaboration);

    debug.info('Initiated project collaboration for goal: %s', goal.title);

    eventBus.publish('collaboration:project_started', {
      collaborationId: collaboration.id,
      projectId: goalId,
      collaboratorCount: collaboration.collaborators.length,
    });

    return collaboration;
  }

  async updateProjectProgress(collaborationId: string, updateData: {
    milestoneId: string;
    progress: number;
    quality: 'POOR' | 'GOOD' | 'EXCELLENT';
    challenges: string;
    nextSteps: string;
  }): Promise<void> {
    const collaboration = this.projectCollabs.get(collaborationId);
    if (!collaboration) {
      throw new Error(`Project collaboration not found: ${collaborationId}`);
    }

    // Find and update milestone
    const milestone = collaboration.milestones.find(m => m.title === updateData.milestoneId);
    if (milestone) {
      milestone.completedAt = Date.now();
      milestone.quality = updateData.quality;
    }

    // Update overall success based on milestone completion
    const completedMilestones = collaboration.milestones.filter(m => m.completedAt).length;
    collaboration.overallSuccess = Math.round((completedMilestones / collaboration.milestones.length) * 100);

    debug.info('Updated project progress: %s (%d%% complete)', collaborationId, collaboration.overallSuccess);

    eventBus.publish('collaboration:project_progress_updated', {
      collaborationId,
      overallSuccess: collaboration.overallSuccess,
      milestoneQuality: updateData.quality,
    });
  }

  private generateProjectMilestones(goal: RealGoal): ProjectCollaboration['milestones'] {
    const baseMilestones = [
      { title: 'Project Planning', assignedTo: '', dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000 },
      { title: 'Core Development', assignedTo: '', dueDate: Date.now() + 21 * 24 * 60 * 60 * 1000 },
      { title: 'Testing & Refinement', assignedTo: '', dueDate: Date.now() + 28 * 24 * 60 * 60 * 1000 },
      { title: 'Final Delivery', assignedTo: '', dueDate: goal.targetDate || Date.now() + 35 * 24 * 60 * 60 * 1000 },
    ];

    return baseMilestones.map(m => ({
      ...m,
      quality: 'GOOD' as const,
    }));
  }

  // ============================================================================
  // COLLABORATION ANALYTICS
  // ============================================================================

  async analyzeCollaborationEffectiveness(): Promise<{
    partnershipEffectiveness: number;
    mastermindValue: number;
    skillExchangeROI: number;
    projectSuccessRate: number;
    overallCollaborationScore: number;
    insights: string[];
  }> {
    const partnerships = Array.from(this.partnerships.values());
    const masterminds = Array.from(this.masterminds.values());
    const exchanges = Array.from(this.skillExchanges.values());
    const projects = Array.from(this.projectCollabs.values());

    // Calculate effectiveness metrics
    const partnershipEffectiveness = partnerships.length > 0 
      ? partnerships.reduce((sum, p) => sum + p.successRate, 0) / partnerships.length 
      : 0;

    const mastermindValue = masterminds.length > 0
      ? masterminds.reduce((sum, m) => sum + (m.breakthroughs.length * 20), 0) / masterminds.length
      : 0;

    const skillExchangeROI = exchanges.length > 0
      ? exchanges.reduce((sum, e) => sum + e.mutualValue, 0) / exchanges.length
      : 0;

    const projectSuccessRate = projects.length > 0
      ? projects.reduce((sum, p) => sum + p.overallSuccess, 0) / projects.length
      : 0;

    const overallCollaborationScore = Math.round(
      (partnershipEffectiveness * 0.3) +
      (mastermindValue * 0.25) +
      (skillExchangeROI * 0.2) +
      (projectSuccessRate * 0.25)
    );

    // Generate insights
    const insights = this.generateCollaborationInsights({
      partnershipEffectiveness,
      mastermindValue,
      skillExchangeROI,
      projectSuccessRate,
      partnerships,
      masterminds,
      exchanges,
      projects,
    });

    debug.info('Collaboration analysis completed: %d overall score', overallCollaborationScore);

    return {
      partnershipEffectiveness: Math.round(partnershipEffectiveness),
      mastermindValue: Math.round(mastermindValue),
      skillExchangeROI: Math.round(skillExchangeROI),
      projectSuccessRate: Math.round(projectSuccessRate),
      overallCollaborationScore,
      insights,
    };
  }

  private generateCollaborationInsights(data: {
    partnershipEffectiveness: number;
    mastermindValue: number;
    skillExchangeROI: number;
    projectSuccessRate: number;
    partnerships: AccountabilityPartnership[];
    masterminds: MastermindGroup[];
    exchanges: SkillExchange[];
    projects: ProjectCollaboration[];
  }): string[] {
    const insights: string[] = [];

    // Partnership insights
    if (data.partnershipEffectiveness > 80) {
      insights.push('Accountability partnerships are highly effective - maintain current approach');
    } else if (data.partnershipEffectiveness < 50) {
      insights.push('Accountability partnerships need attention - consider more structured check-ins');
    }

    // Mastermind insights
    if (data.mastermindValue > 60) {
      insights.push('Mastermind groups generating significant breakthroughs');
    } else if (data.masterminds.length === 0) {
      insights.push('Consider joining a mastermind group for peer learning');
    }

    // Skill exchange insights
    if (data.skillExchangeROI > 70) {
      insights.push('Skill exchanges creating high mutual value - expand this approach');
    } else if (data.exchanges.length < 2) {
      insights.push('More skill exchange opportunities could accelerate growth');
    }

    // Project insights
    if (data.projectSuccessRate > 75) {
      insights.push('Project collaborations highly successful - good teamwork dynamics');
    } else if (data.projectSuccessRate < 50) {
      insights.push('Project collaboration processes need improvement');
    }

    return insights;
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  getAccountabilityPartnerships(): AccountabilityPartnership[] {
    if (!this.userId) return [];
    return Array.from(this.partnerships.values()).filter(
      p => p.partner1Id === this.userId || p.partner2Id === this.userId
    );
  }

  getMastermindGroups(): MastermindGroup[] {
    if (!this.userId) return [];
    return Array.from(this.masterminds.values()).filter(
      m => m.members.includes(this.userId!)
    );
  }

  getSkillExchanges(): SkillExchange[] {
    if (!this.userId) return [];
    return Array.from(this.skillExchanges.values()).filter(
      e => e.offeredBy === this.userId || e.requestedBy === this.userId
    );
  }

  getProjectCollaborations(): ProjectCollaboration[] {
    if (!this.userId) return [];
    return Array.from(this.projectCollabs.values()).filter(
      p => p.collaborators.includes(this.userId!)
    );
  }

  getCollaborationOpportunities(): Array<{
    type: 'PARTNERSHIP' | 'MASTERMIND' | 'SKILL_EXCHANGE' | 'PROJECT';
    title: string;
    description: string;
    potentialValue: number;
    actionRequired: string;
  }> {
    const opportunities: Array<{
      type: 'PARTNERSHIP' | 'MASTERMIND' | 'SKILL_EXCHANGE' | 'PROJECT';
      title: string;
      description: string;
      potentialValue: number;
      actionRequired: string;
    }> = [];

    // Partnership opportunities
    const activeGoals = this.goalTrackingService.getAllGoals().filter(g => g.status === 'ACTIVE');
    if (activeGoals.length > 0 && this.getAccountabilityPartnerships().length === 0) {
      opportunities.push({
        type: 'PARTNERSHIP',
        title: 'Find Accountability Partner',
        description: 'You have active goals that could benefit from mutual accountability',
        potentialValue: 85,
        actionRequired: 'Reach out to potential partners with similar goals',
      });
    }

    // Mastermind opportunities
    const capabilities = this.progressionService.getCapabilities();
    const strongCapabilities = capabilities.filter(c => c.currentLevel > 70);
    if (strongCapabilities.length > 0 && this.getMastermindGroups().length === 0) {
      opportunities.push({
        type: 'MASTERMIND',
        title: 'Join or Start Mastermind',
        description: 'Your strong capabilities could benefit others in a mastermind setting',
        potentialValue: 75,
        actionRequired: 'Find existing mastermind or start one with peers',
      });
    }

    // Skill exchange opportunities
    const learningGoals = activeGoals.filter(g => g.category === 'LEARNING');
    if (learningGoals.length > 0) {
      opportunities.push({
        type: 'SKILL_EXCHANGE',
        title: 'Set Up Skill Exchanges',
        description: 'You have learning goals that could benefit from skill exchange',
        potentialValue: 70,
        actionRequired: 'Identify skills to offer and request from others',
      });
    }

    // Project opportunities
    const majorGoals = activeGoals.filter(g => g.estimatedImpact === 'MAJOR' || g.estimatedImpact === 'TRANSFORMATIVE');
    if (majorGoals.length > 0 && this.getProjectCollaborations().length === 0) {
      opportunities.push({
        type: 'PROJECT',
        title: 'Collaborate on Major Goals',
        description: 'Your major goals could benefit from collaborative effort',
        potentialValue: 90,
        actionRequired: 'Identify potential collaborators for your major goals',
      });
    }

    return opportunities.sort((a, b) => b.potentialValue - a.potentialValue);
  }

  setUserId(userId: string): void {
    this.userId = userId;
    this.productivityEngine.setUserId(userId);
    this.goalTrackingService.setUserId(userId);
    this.habitFormationService.setUserId(userId);
    this.progressionService.setUserId(userId);
    debug.info('CollaborationService user set: %s', userId);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let collaborationServiceInstance: CollaborationService | null = null;

export function getCollaborationService(userId?: string): CollaborationService {
  if (!collaborationServiceInstance) {
    collaborationServiceInstance = new CollaborationService(userId);
  } else if (userId) {
    collaborationServiceInstance.setUserId(userId);
  }
  return collaborationServiceInstance;
}
