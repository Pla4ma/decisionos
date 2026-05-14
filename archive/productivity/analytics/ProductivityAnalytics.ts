/**
 * Productivity Analytics
 * 
 * Comprehensive analytics and insights for productivity data.
 * Tracks user behavior, generates insights, and provides recommendations.
 */

import { createDebugger } from '../../utils/debug';
import { eventBus } from '../../events';
import type { RealGoal, MicroCommitment, FocusSession, HabitPattern } from '../core/ProductivityEngine';

const debug = createDebugger('productivity:analytics');

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AnalyticsEvent {
  type: string;
  userId: string;
  timestamp: number;
  data: Record<string, any>;
  sessionId?: string;
  source: string;
}

export interface UserMetrics {
  userId: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  metrics: {
    goalsCreated: number;
    goalsCompleted: number;
    habitsCreated: number;
    habitsCompleted: number;
    focusSessions: number;
    totalFocusMinutes: number;
    averageSessionQuality: number;
    productivityScore: number;
    consistencyScore: number;
    growthRate: number;
  };
  trends: {
    goalCompletionRate: number;
    habitFormationRate: number;
    focusEfficiency: number;
    timeUtilization: number;
  };
  insights: AnalyticsInsight[];
}

export interface AnalyticsInsight {
  id: string;
  type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'OPPORTUNITY' | 'WARNING';
  title: string;
  description: string;
  data: Record<string, any>;
  recommendations: string[];
  confidence: number; // 0-100
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: number;
  expiresAt?: number;
}

export interface FunnelData {
  name: string;
  steps: Array<{
    step: string;
    count: number;
    conversionRate: number;
    dropoffReasons?: string[];
  }>;
  overallConversion: number;
}

export interface CohortAnalysis {
  cohortName: string;
  cohortSize: number;
  metrics: Array<{
    period: string;
    retentionRate: number;
    engagementScore: number;
    goalCompletionRate: number;
    habitFormationRate: number;
  }>;
}

// ============================================================================
// PRODUCTIVITY ANALYTICS ENGINE
// ============================================================================

export class ProductivityAnalytics {
  private userId: string | null = null;
  private events: AnalyticsEvent[] = [];
  private metrics: Map<string, UserMetrics> = new Map();
  private insights: AnalyticsInsight[] = [];
  private sessionMetrics: Map<string, any> = new Map();

  constructor(userId?: string) {
    this.userId = userId ?? null;
    this.setupEventListeners();
    debug.info('ProductivityAnalytics initialized for user: %s', userId);
  }

  // ============================================================================
  // EVENT TRACKING
  // ============================================================================

  private setupEventListeners(): void {
    // Goal events
    eventBus.subscribe('goal:created', (data) => this.trackEvent('goal_created', data));
    eventBus.subscribe('goal:updated', (data) => this.trackEvent('goal_updated', data));
    eventBus.subscribe('goal:completed', (data) => this.trackEvent('goal_completed', data));
    eventBus.subscribe('goal:cancelled', (data) => this.trackEvent('goal_cancelled', data));

    // Habit events
    eventBus.subscribe('habit:created', (data) => this.trackEvent('habit_created', data));
    eventBus.subscribe('habit:completed', (data) => this.trackEvent('habit_completed', data));
    eventBus.subscribe('habit:missed', (data) => this.trackEvent('habit_missed', data));
    eventBus.subscribe('habit:strength_changed', (data) => this.trackEvent('habit_strength_changed', data));

    // Focus session events
    eventBus.subscribe('focus:started', (data) => this.trackEvent('focus_started', data));
    eventBus.subscribe('focus:ended', (data) => this.trackEvent('focus_ended', data));
    eventBus.subscribe('focus:interrupted', (data) => this.trackEvent('focus_interrupted', data));

    // Achievement events
    eventBus.subscribe('achievement:real_celebration', (data) => this.trackEvent('achievement_earned', data));

    // Collaboration events
    eventBus.subscribe('collaboration:partnership_created', (data) => this.trackEvent('partnership_created', data));
    eventBus.subscribe('collaboration:check_in_completed', (data) => this.trackEvent('check_in_completed', data));
  }

  trackEvent(type: string, data: Record<string, any>, source: string = 'productivity'): void {
    if (!this.userId) {
      debug.warn('Cannot track event - user not set');
      return;
    }

    const event: AnalyticsEvent = {
      type,
      userId: this.userId,
      timestamp: Date.now(),
      data,
      source,
    };

    this.events.push(event);
    debug.info('Tracked event: %s for user: %s', type, this.userId);

    // Process event for real-time insights
    this.processEventForInsights(event);
  }

  // ============================================================================
  // METRICS CALCULATION
  // ============================================================================

  async calculateUserMetrics(period: UserMetrics['period']): Promise<UserMetrics> {
    if (!this.userId) {
      throw new Error('User not set');
    }

    const cacheKey = `${this.userId}_${period}`;
    
    // Check cache first
    const cached = this.metrics.get(cacheKey);
    if (cached && Date.now() - cached.metrics.productivityScore < 3600000) { // 1 hour cache
      return cached;
    }

    const metrics = await this.calculateMetricsFromEvents(period);
    this.metrics.set(cacheKey, metrics);

    return metrics;
  }

  private async calculateMetricsFromEvents(period: UserMetrics['period']): Promise<UserMetrics> {
    const timeRange = this.getTimeRange(period);
    const userEvents = this.events.filter(e => 
      e.userId === this.userId && 
      e.timestamp >= timeRange.start && 
      e.timestamp <= timeRange.end
    );

    const metrics = {
      userId: this.userId!,
      period,
      metrics: this.calculateBaseMetrics(userEvents),
      trends: this.calculateTrends(userEvents, timeRange),
      insights: await this.generateInsights(userEvents, period),
    };

    return metrics;
  }

  private calculateBaseMetrics(events: AnalyticsEvent[]): UserMetrics['metrics'] {
    const metrics = {
      goalsCreated: 0,
      goalsCompleted: 0,
      habitsCreated: 0,
      habitsCompleted: 0,
      focusSessions: 0,
      totalFocusMinutes: 0,
      averageSessionQuality: 0,
      productivityScore: 0,
      consistencyScore: 0,
      growthRate: 0,
    };

    const sessionQualities: number[] = [];

    events.forEach(event => {
      switch (event.type) {
        case 'goal_created':
          metrics.goalsCreated++;
          break;
        case 'goal_completed':
          metrics.goalsCompleted++;
          break;
        case 'habit_created':
          metrics.habitsCreated++;
          break;
        case 'habit_completed':
          metrics.habitsCompleted++;
          break;
        case 'focus_started':
          metrics.focusSessions++;
          break;
        case 'focus_ended':
          if (event.data.actualMinutes) {
            metrics.totalFocusMinutes += event.data.actualMinutes;
          }
          if (event.data.quality) {
            const qualityMap = { 'POOR': 1, 'FAIR': 2, 'GOOD': 3, 'EXCELLENT': 4 };
            sessionQualities.push(qualityMap[event.data.quality] || 2);
          }
          break;
      }
    });

    // Calculate derived metrics
    metrics.averageSessionQuality = sessionQualities.length > 0 
      ? sessionQualities.reduce((sum, q) => sum + q, 0) / sessionQualities.length 
      : 0;

    // Productivity score (0-100)
    const goalCompletionRate = metrics.goalsCreated > 0 ? (metrics.goalsCompleted / metrics.goalsCreated) * 100 : 0;
    const habitCompletionRate = metrics.habitsCreated > 0 ? (metrics.habitsCompleted / metrics.habitsCreated) * 100 : 0;
    const focusEfficiency = metrics.totalFocusMinutes > 0 ? (metrics.averageSessionQuality / 4) * 100 : 0;
    
    metrics.productivityScore = Math.round(
      (goalCompletionRate * 0.4) + 
      (habitCompletionRate * 0.3) + 
      (focusEfficiency * 0.3)
    );

    // Consistency score (0-100)
    const dailyGoalTarget = 1; // Target goals per day
    const dailyHabitTarget = 3; // Target habits per day
    const days = this.getDaysInPeriod(events);
    
    const goalConsistency = days > 0 ? Math.min(100, (metrics.goalsCreated / days / dailyGoalTarget) * 100) : 0;
    const habitConsistency = days > 0 ? Math.min(100, (metrics.habitsCompleted / days / dailyHabitTarget) * 100) : 0;
    
    metrics.consistencyScore = Math.round((goalConsistency + habitConsistency) / 2);

    // Growth rate (0-100)
    metrics.growthRate = this.calculateGrowthRate(events);

    return metrics;
  }

  private calculateTrends(events: AnalyticsEvent[], timeRange: { start: number; end: number }): UserMetrics['trends'] {
    const previousPeriod = this.getPreviousPeriod(timeRange);
    const previousEvents = this.events.filter(e => 
      e.userId === this.userId && 
      e.timestamp >= previousPeriod.start && 
      e.timestamp <= previousPeriod.end
    );

    const currentMetrics = this.calculateBaseMetrics(events);
    const previousMetrics = this.calculateBaseMetrics(previousEvents);

    return {
      goalCompletionRate: this.calculateTrendRate(previousMetrics.goalsCompleted, currentMetrics.goalsCompleted),
      habitFormationRate: this.calculateTrendRate(previousMetrics.habitsCompleted, currentMetrics.habitsCompleted),
      focusEfficiency: this.calculateTrendRate(previousMetrics.averageSessionQuality, currentMetrics.averageSessionQuality),
      timeUtilization: this.calculateTrendRate(previousMetrics.totalFocusMinutes, currentMetrics.totalFocusMinutes),
    };
  }

  private calculateTrendRate(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  private calculateGrowthRate(events: AnalyticsEvent[]): number {
    // Simple growth rate calculation based on activity frequency
    const days = this.getDaysInPeriod(events);
    if (days === 0) return 0;

    const activitiesPerDay = events.length / days;
    return Math.min(100, Math.round(activitiesPerDay * 10)); // Scale to 0-100
  }

  private getDaysInPeriod(events: AnalyticsEvent[]): number {
    if (events.length === 0) return 0;
    
    const timestamps = events.map(e => e.timestamp);
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    
    return Math.ceil((maxTime - minTime) / (24 * 60 * 60 * 1000)) + 1;
  }

  // ============================================================================
  // INSIGHTS GENERATION
  // ============================================================================

  private async generateInsights(events: AnalyticsEvent[], period: UserMetrics['period']): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];

    // Goal completion insights
    const goalInsights = this.generateGoalInsights(events);
    insights.push(...goalInsights);

    // Habit formation insights
    const habitInsights = this.generateHabitInsights(events);
    insights.push(...habitInsights);

    // Focus session insights
    const focusInsights = this.generateFocusInsights(events);
    insights.push(...focusInsights);

    // Productivity pattern insights
    const patternInsights = this.generatePatternInsights(events);
    insights.push(...patternInsights);

    // Sort by priority and confidence
    return insights
      .sort((a, b) => {
        const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return b.confidence - a.confidence;
      })
      .slice(0, 10); // Top 10 insights
  }

  private generateGoalInsights(events: AnalyticsEvent[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    const goalEvents = events.filter(e => e.type.startsWith('goal_'));
    
    const created = goalEvents.filter(e => e.type === 'goal_created').length;
    const completed = goalEvents.filter(e => e.type === 'goal_completed').length;
    const cancelled = goalEvents.filter(e => e.type === 'goal_cancelled').length;

    // High completion rate insight
    if (created > 0 && completed / created > 0.8) {
      insights.push({
        id: this.generateId(),
        type: 'POSITIVE',
        title: 'Excellent Goal Completion',
        description: `You're completing ${Math.round((completed / created) * 100)}% of your goals`,
        data: { created, completed, completionRate: completed / created },
        recommendations: [
          'Keep up the great work',
          'Consider setting more challenging goals',
          'Share your success with others',
        ],
        confidence: 90,
        priority: 'HIGH',
        createdAt: Date.now(),
      });
    }

    // Low completion rate insight
    if (created > 0 && completed / created < 0.3) {
      insights.push({
        id: this.generateId(),
        type: 'WARNING',
        title: 'Low Goal Completion Rate',
        description: `Only ${Math.round((completed / created) * 100)}% of goals are being completed`,
        data: { created, completed, completionRate: completed / created },
        recommendations: [
          'Review goal difficulty and adjust expectations',
          'Break large goals into smaller milestones',
          'Set up accountability partnerships',
        ],
        confidence: 85,
        priority: 'HIGH',
        createdAt: Date.now(),
      });
    }

    // High cancellation rate insight
    if (created > 0 && cancelled / created > 0.3) {
      insights.push({
        id: this.generateId(),
        type: 'NEGATIVE',
        title: 'High Goal Cancellation Rate',
        description: `${Math.round((cancelled / created) * 100)}% of goals are being cancelled`,
        data: { created, cancelled, cancellationRate: cancelled / created },
        recommendations: [
          'Review goal relevance before creating',
          'Set more realistic timelines',
          'Focus on fewer, more important goals',
        ],
        confidence: 80,
        priority: 'MEDIUM',
        createdAt: Date.now(),
      });
    }

    return insights;
  }

  private generateHabitInsights(events: AnalyticsEvent[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    const habitEvents = events.filter(e => e.type.startsWith('habit_'));
    
    const completed = habitEvents.filter(e => e.type === 'habit_completed').length;
    const missed = habitEvents.filter(e => e.type === 'habit_missed').length;
    const strengthEvents = habitEvents.filter(e => e.type === 'habit_strength_changed');

    // Strong habit consistency
    if (completed > 0 && missed === 0) {
      insights.push({
        id: this.generateId(),
        type: 'POSITIVE',
        title: 'Perfect Habit Consistency',
        description: `You've completed all ${completed} habit attempts without missing any`,
        data: { completed, missed, consistency: 100 },
        recommendations: [
          'Maintain this excellent consistency',
          'Consider adding new positive habits',
          'Share your habit success strategies',
        ],
        confidence: 95,
        priority: 'HIGH',
        createdAt: Date.now(),
      });
    }

    // Habit strength improvements
    const strengthIncreases = strengthEvents.filter(e => e.data.change > 0).length;
    if (strengthIncreases > 0) {
      insights.push({
        id: this.generateId(),
        type: 'POSITIVE',
        title: 'Habit Strength Improving',
        description: `Your habit strength has increased ${strengthIncreases} times`,
        data: { strengthIncreases, totalStrengthEvents: strengthEvents.length },
        recommendations: [
          'Continue with current habit strategies',
          'Focus on habits that need more attention',
          'Document what\'s working well',
        ],
        confidence: 85,
        priority: 'MEDIUM',
        createdAt: Date.now(),
      });
    }

    return insights;
  }

  private generateFocusInsights(events: AnalyticsEvent[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    const focusEvents = events.filter(e => e.type.startsWith('focus_'));
    
    const sessions = focusEvents.filter(e => e.type === 'focus_ended');
    const totalMinutes = sessions.reduce((sum, e) => sum + (e.data.actualMinutes || 0), 0);
    const avgQuality = sessions.reduce((sum, e) => {
      const qualityMap = { 'POOR': 1, 'FAIR': 2, 'GOOD': 3, 'EXCELLENT': 4 };
      return sum + (qualityMap[e.data.quality] || 2);
    }, 0) / Math.max(1, sessions.length);

    // High-quality focus sessions
    if (avgQuality >= 3.5) {
      insights.push({
        id: this.generateId(),
        type: 'POSITIVE',
        title: 'High-Quality Focus Sessions',
        description: `Your average session quality is excellent (${avgQuality.toFixed(1)}/4)`,
        data: { avgQuality, sessionCount: sessions.length, totalMinutes },
        recommendations: [
          'Maintain your focus environment',
          'Share your focus techniques',
          'Consider longer focus sessions',
        ],
        confidence: 90,
        priority: 'MEDIUM',
        createdAt: Date.now(),
      });
    }

    // Significant focus time
    if (totalMinutes > 600) { // More than 10 hours
      insights.push({
        id: this.generateId(),
        type: 'POSITIVE',
        title: 'Impressive Focus Time',
        description: `You've accumulated ${Math.round(totalMinutes / 60)} hours of focused work`,
        data: { totalMinutes, hours: totalMinutes / 60, sessionCount: sessions.length },
        recommendations: [
          'Track the impact of this focus time',
          'Consider optimizing session length',
          'Maintain this focus momentum',
        ],
        confidence: 85,
        priority: 'MEDIUM',
        createdAt: Date.now(),
      });
    }

    return insights;
  }

  private generatePatternInsights(events: AnalyticsEvent[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    // Time-of-day patterns
    const hourPatterns = this.analyzeTimePatterns(events);
    if (hourPatterns.peakHour) {
      insights.push({
        id: this.generateId(),
        type: 'NEUTRAL',
        title: 'Peak Productivity Hour',
        description: `You're most productive at ${hourPatterns.peakHour}:00`,
        data: hourPatterns,
        recommendations: [
          'Schedule important tasks during this hour',
          'Protect this time from distractions',
          'Experiment with extending this peak time',
        ],
        confidence: 75,
        priority: 'LOW',
        createdAt: Date.now(),
      });
    }

    return insights;
  }

  private analyzeTimePatterns(events: AnalyticsEvent[]): any {
    const hourCounts: Record<number, number> = {};
    
    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHour = Object.entries(hourCounts).reduce((max, [hour, count]) => 
      count > max.count ? { hour: parseInt(hour), count } : max,
      { hour: -1, count: 0 }
    );

    return {
      peakHour: peakHour.hour > -1 ? peakHour.hour : null,
      hourlyDistribution: hourCounts,
      totalEvents: events.length,
    };
  }

  // ============================================================================
  // REAL-TIME INSIGHT PROCESSING
  // ============================================================================

  private processEventForInsights(event: AnalyticsEvent): void {
    // Generate real-time insights based on individual events
    switch (event.type) {
      case 'goal_completed':
        this.processGoalCompletion(event);
        break;
      case 'habit_completed':
        this.processHabitCompletion(event);
        break;
      case 'focus_ended':
        this.processFocusSession(event);
        break;
    }
  }

  private processGoalCompletion(event: AnalyticsEvent): void {
    // Check for streak or milestone insights
    const recentCompletions = this.events.filter(e => 
      e.type === 'goal_completed' && 
      e.userId === this.userId &&
      Date.now() - e.timestamp < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    );

    if (recentCompletions.length >= 3) {
      const insight: AnalyticsInsight = {
        id: this.generateId(),
        type: 'POSITIVE',
        title: 'Goal Completion Streak',
        description: `You've completed ${recentCompletions.length} goals in the past week`,
        data: { streakLength: recentCompletions.length, recentCompletions },
        recommendations: [
          'Keep this momentum going',
          'Celebrate your achievements',
          'Set your next challenging goal',
        ],
        confidence: 90,
        priority: 'HIGH',
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Expires in 24 hours
      };

      this.insights.push(insight);
    }
  }

  private processHabitCompletion(event: AnalyticsEvent): void {
    // Check for habit streak insights
    const habitId = event.data.habitId;
    const habitCompletions = this.events.filter(e => 
      e.type === 'habit_completed' && 
      e.userId === this.userId &&
      e.data.habitId === habitId
    );

    if (habitCompletions.length >= 7) {
      const insight: AnalyticsInsight = {
        id: this.generateId(),
        type: 'POSITIVE',
        title: 'Habit Streak Achieved',
        description: `You've completed this habit ${habitCompletions.length} times`,
        data: { habitId, streakLength: habitCompletions.length },
        recommendations: [
          'Maintain this consistency',
          'The habit is becoming automatic',
          'Share your success',
        ],
        confidence: 85,
        priority: 'MEDIUM',
        createdAt: Date.now(),
        expiresAt: Date.now() + 3 * 24 * 60 * 60 * 1000, // Expires in 3 days
      };

      this.insights.push(insight);
    }
  }

  private processFocusSession(event: AnalyticsEvent): void {
    // Check for focus session insights
    const sessions = this.events.filter(e => 
      e.type === 'focus_ended' && 
      e.userId === this.userId &&
      Date.now() - e.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    if (sessions.length >= 3) {
      const totalMinutes = sessions.reduce((sum, e) => sum + (e.data.actualMinutes || 0), 0);
      
      if (totalMinutes > 120) { // More than 2 hours
        const insight: AnalyticsInsight = {
          id: this.generateId(),
          type: 'POSITIVE',
          title: 'High Focus Activity',
          description: `You've completed ${sessions.length} focus sessions today`,
          data: { sessionCount: sessions.length, totalMinutes },
          recommendations: [
            'Great focus discipline today',
            'Ensure you\'re taking breaks',
            'Track your accomplishments',
          ],
          confidence: 80,
          priority: 'MEDIUM',
          createdAt: Date.now(),
          expiresAt: Date.now() + 12 * 60 * 60 * 1000, // Expires in 12 hours
        };

        this.insights.push(insight);
      }
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getTimeRange(period: UserMetrics['period']): { start: number; end: number } {
    const now = Date.now();
    const ranges = {
      'DAILY': { start: now - (24 * 60 * 60 * 1000), end: now },
      'WEEKLY': { start: now - (7 * 24 * 60 * 60 * 1000), end: now },
      'MONTHLY': { start: now - (30 * 24 * 60 * 60 * 1000), end: now },
      'YEARLY': { start: now - (365 * 24 * 60 * 60 * 1000), end: now },
    };

    return ranges[period];
  }

  private getPreviousPeriod(currentRange: { start: number; end: number }): { start: number; end: number } {
    const duration = currentRange.end - currentRange.start;
    return {
      start: currentRange.start - duration,
      end: currentRange.start,
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  async getInsights(period?: UserMetrics['period']): Promise<AnalyticsInsight[]> {
    if (period) {
      const metrics = await this.calculateUserMetrics(period);
      return metrics.insights;
    }

    return this.insights.filter(insight => 
      !insight.expiresAt || insight.expiresAt > Date.now()
    );
  }

  async getFunnelData(funnelName: string): Promise<FunnelData | null> {
    // This would typically query a dedicated funnel analytics table
    // For now, return a sample funnel
    if (funnelName === 'goal_completion') {
      return {
        name: 'Goal Completion Funnel',
        steps: [
          { step: 'Goals Created', count: 100, conversionRate: 100 },
          { step: 'Goals Started', count: 85, conversionRate: 85 },
          { step: '50% Progress', count: 60, conversionRate: 70.6 },
          { step: 'Goals Completed', count: 45, conversionRate: 75 },
        ],
        overallConversion: 45,
      };
    }

    return null;
  }

  async getCohortAnalysis(cohortName: string): Promise<CohortAnalysis | null> {
    // This would typically query a dedicated cohort analysis table
    // For now, return a sample cohort
    return {
      cohortName,
      cohortSize: 1000,
      metrics: [
        { period: 'Day 1', retentionRate: 100, engagementScore: 85, goalCompletionRate: 10, habitFormationRate: 5 },
        { period: 'Day 7', retentionRate: 75, engagementScore: 80, goalCompletionRate: 25, habitFormationRate: 15 },
        { period: 'Day 30', retentionRate: 50, engagementScore: 75, goalCompletionRate: 40, habitFormationRate: 25 },
        { period: 'Day 90', retentionRate: 35, engagementScore: 70, goalCompletionRate: 55, habitFormationRate: 35 },
      ],
    };
  }

  getEventSummary(timeRange?: { start: number; end: number }): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    mostActiveHour: number | null;
    averageEventsPerDay: number;
  } {
    const filteredEvents = timeRange 
      ? this.events.filter(e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end)
      : this.events;

    const eventsByType: Record<string, number> = {};
    filteredEvents.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });

    const hourCounts: Record<number, number> = {};
    filteredEvents.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const mostActiveHour = Object.entries(hourCounts).reduce((max, [hour, count]) => 
      count > max.count ? { hour: parseInt(hour), count } : max,
      { hour: null, count: 0 }
    ).hour;

    const days = timeRange 
      ? Math.ceil((timeRange.end - timeRange.start) / (24 * 60 * 60 * 1000))
      : Math.max(1, this.getDaysInPeriod(filteredEvents));

    return {
      totalEvents: filteredEvents.length,
      eventsByType,
      mostActiveHour,
      averageEventsPerDay: filteredEvents.length / days,
    };
  }

  setUserId(userId: string): void {
    this.userId = userId;
    debug.info('ProductivityAnalytics user set: %s', userId);
  }

  clearCache(): void {
    this.metrics.clear();
    this.insights = this.insights.filter(insight => 
      !insight.expiresAt || insight.expiresAt > Date.now()
    );
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let productivityAnalyticsInstance: ProductivityAnalytics | null = null;

export function getProductivityAnalytics(userId?: string): ProductivityAnalytics {
  if (!productivityAnalyticsInstance) {
    productivityAnalyticsInstance = new ProductivityAnalytics(userId);
  } else if (userId) {
    productivityAnalyticsInstance.setUserId(userId);
  }
  return productivityAnalyticsInstance;
}
