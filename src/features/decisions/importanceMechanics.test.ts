// Importance Mechanics Tests
// Unit tests for importance and urgency mechanics

import {
  getImportanceEffects,
  getAnalysisDepth,
  getRecommendedReviewDays,
  getDecisionPriority,
  getSleepOnItPrompt,
  getAnalysisConfidenceModifier,
  type ImportanceEffect,
} from './importanceMechanics';
import { Decision } from './decisionTypes';

describe('importanceMechanics', () => {
  describe('getImportanceEffects', () => {
    test('low importance (1-6) does not require more options or questions', () => {
      const effect = getImportanceEffects(3, 5);
      expect(effect.requiresMoreOptions).toBe(false);
      expect(effect.requiresMoreQuestions).toBe(false);
      expect(effect.suggestsSleepOnIt).toBe(false);
    });

    test('high importance (7+) requires more options', () => {
      const effect = getImportanceEffects(7, 5);
      expect(effect.requiresMoreOptions).toBe(true);
      expect(effect.requiresMoreQuestions).toBe(false);
    });

    test('very high importance (8+) requires more questions', () => {
      const effect = getImportanceEffects(8, 5);
      expect(effect.requiresMoreQuestions).toBe(true);
    });

    test('high importance + low urgency suggests sleeping on it', () => {
      const effect = getImportanceEffects(8, 2);
      expect(effect.suggestsSleepOnIt).toBe(true);
    });

    test('high importance + high urgency does not suggest sleeping', () => {
      const effect = getImportanceEffects(8, 8);
      expect(effect.suggestsSleepOnIt).toBe(false);
    });

    test('high importance unlocks deeper analysis', () => {
      const effect = getImportanceEffects(6, 5);
      expect(effect.unlocksDeeperAnalysis).toBe(true);
    });

    test('low importance does not unlock deeper analysis', () => {
      const effect = getImportanceEffects(5, 5);
      expect(effect.unlocksDeeperAnalysis).toBe(false);
    });

    test('review urgency is urgency / 3', () => {
      const effect = getImportanceEffects(5, 9);
      expect(effect.reviewUrgency).toBe(3);
    });

    test('review urgency minimum is 1', () => {
      const effect = getImportanceEffects(5, 1);
      expect(effect.reviewUrgency).toBe(1);
    });

    test('maximum importance effect', () => {
      const effect = getImportanceEffects(10, 10);
      expect(effect.requiresMoreOptions).toBe(true);
      expect(effect.requiresMoreQuestions).toBe(true);
      expect(effect.unlocksDeeperAnalysis).toBe(true);
    });
  });

  describe('getAnalysisDepth', () => {
    test('importance 1-3 returns quick', () => {
      expect(getAnalysisDepth(1)).toBe('quick');
      expect(getAnalysisDepth(2)).toBe('quick');
      expect(getAnalysisDepth(3)).toBe('quick');
    });

    test('importance 4-6 returns standard', () => {
      expect(getAnalysisDepth(4)).toBe('standard');
      expect(getAnalysisDepth(5)).toBe('standard');
      expect(getAnalysisDepth(6)).toBe('standard');
    });

    test('importance 7-10 returns deep', () => {
      expect(getAnalysisDepth(7)).toBe('deep');
      expect(getAnalysisDepth(8)).toBe('deep');
      expect(getAnalysisDepth(10)).toBe('deep');
    });

    test('boundary at 3-4', () => {
      expect(getAnalysisDepth(3)).toBe('quick');
      expect(getAnalysisDepth(4)).toBe('standard');
    });

    test('boundary at 6-7', () => {
      expect(getAnalysisDepth(6)).toBe('standard');
      expect(getAnalysisDepth(7)).toBe('deep');
    });
  });

  describe('getRecommendedReviewDays', () => {
    test('very high combined score (17+) returns 7 days', () => {
      const mockDecision = { importance: 9, urgency: 9 } as Pick<Decision, 'importance' | 'urgency'>;
      expect(getRecommendedReviewDays(mockDecision)).toBe(7);
    });

    test('high combined score (13-16) returns 30 days', () => {
      const mockDecision = { importance: 7, urgency: 7 } as Pick<Decision, 'importance' | 'urgency'>;
      expect(getRecommendedReviewDays(mockDecision)).toBe(30);
    });

    test('moderate combined score (9-12) returns 90 days', () => {
      const mockDecision = { importance: 5, urgency: 5 } as Pick<Decision, 'importance' | 'urgency'>;
      expect(getRecommendedReviewDays(mockDecision)).toBe(90);
    });

    test('low combined score (<9) returns 180 days', () => {
      const mockDecision = { importance: 3, urgency: 2 } as Pick<Decision, 'importance' | 'urgency'>;
      expect(getRecommendedReviewDays(mockDecision)).toBe(180);
    });

    test('boundary cases', () => {
      const highBoundary = { importance: 8, urgency: 9 } as Pick<Decision, 'importance' | 'urgency'>;
      const midBoundary = { importance: 6, urgency: 7 } as Pick<Decision, 'importance' | 'urgency'>;
      const lowBoundary = { importance: 5, urgency: 4 } as Pick<Decision, 'importance' | 'urgency'>;

      expect(getRecommendedReviewDays(highBoundary)).toBe(7);
      expect(getRecommendedReviewDays(midBoundary)).toBe(30);
      expect(getRecommendedReviewDays(lowBoundary)).toBe(90);
    });

    test('various urgency combinations', () => {
      expect(getRecommendedReviewDays({ importance: 8, urgency: 1 } as Pick<Decision, 'importance' | 'urgency'>)).toBe(7);
      expect(getRecommendedReviewDays({ importance: 5, urgency: 8 } as Pick<Decision, 'importance' | 'urgency'>)).toBe(30);
      expect(getRecommendedReviewDays({ importance: 2, urgency: 2 } as Pick<Decision, 'importance' | 'urgency'>)).toBe(180);
    });
  });

  describe('getDecisionPriority', () => {
    test('higher importance = higher priority', () => {
      const high = { id: '1', user_id: '1', title: 'a', context: null, category: 'other' as const, status: 'draft' as const, importance: 10, urgency: 5, created_at: '', updated_at: '', scheduled_review_at: null, completed_at: null };
      const low = { id: '2', user_id: '1', title: 'a', context: null, category: 'other' as const, status: 'draft' as const, importance: 3, urgency: 5, created_at: '', updated_at: '', scheduled_review_at: null, completed_at: null };

      expect(getDecisionPriority(high)).toBeGreaterThan(getDecisionPriority(low));
    });

    test('higher urgency = higher priority', () => {
      const high = { id: '1', user_id: '1', title: 'a', context: null, category: 'other' as const, status: 'draft' as const, importance: 5, urgency: 10, created_at: '', updated_at: '', scheduled_review_at: null, completed_at: null };
      const low = { id: '2', user_id: '1', title: 'a', context: null, category: 'other' as const, status: 'draft' as const, importance: 5, urgency: 3, created_at: '', updated_at: '', scheduled_review_at: null, completed_at: null };

      expect(getDecisionPriority(high)).toBeGreaterThan(getDecisionPriority(low));
    });

    test('overdue review gets massive priority boost', () => {
      const overdue = { id: '1', user_id: '1', title: 'a', context: null, category: 'other' as const, status: 'review_scheduled' as const, importance: 5, urgency: 5, created_at: '', updated_at: '', scheduled_review_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), completed_at: null };
      const notOverdue = { id: '2', user_id: '1', title: 'a', context: null, category: 'other' as const, status: 'review_scheduled' as const, importance: 5, urgency: 5, created_at: '', updated_at: '', scheduled_review_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), completed_at: null };

      expect(getDecisionPriority(overdue)).toBeGreaterThan(getDecisionPriority(notOverdue));
    });

    test('overdue priority caps at 500', () => {
      const veryOverdue = { id: '1', user_id: '1', title: 'a', context: null, category: 'other' as const, status: 'review_scheduled' as const, importance: 1, urgency: 1, created_at: '', updated_at: '', scheduled_review_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), completed_at: null };
      const priority = getDecisionPriority(veryOverdue);
      const basePriority = 1 * 10 + 1 * 5;
      const maxBonus = 500;
      expect(priority - basePriority).toBeLessThanOrEqual(maxBonus);
    });

    test('no review date = no bonus', () => {
      const noReview = { id: '1', user_id: '1', title: 'a', context: null, category: 'other' as const, status: 'draft' as const, importance: 5, urgency: 5, created_at: '', updated_at: '', scheduled_review_at: null, completed_at: null };
      const basePriority = 5 * 10 + 5 * 5;
      expect(getDecisionPriority(noReview)).toBe(basePriority);
    });

    test('importance weight is double urgency weight', () => {
      const highImportance = { id: '1', user_id: '1', title: 'a', context: null, category: 'other' as const, status: 'draft' as const, importance: 10, urgency: 1, created_at: '', updated_at: '', scheduled_review_at: null, completed_at: null };
      const highUrgency = { id: '2', user_id: '1', title: 'a', context: null, category: 'other' as const, status: 'draft' as const, importance: 1, urgency: 10, created_at: '', updated_at: '', scheduled_review_at: null, completed_at: null };

      expect(getDecisionPriority(highImportance)).toBeGreaterThan(getDecisionPriority(highUrgency));
    });
  });

  describe('getSleepOnItPrompt', () => {
    test('returns prompt for importance >= 8', () => {
      const prompt = getSleepOnItPrompt(8);
      expect(prompt).toBeTruthy();
      expect(prompt).toContain('high-stakes');
    });

    test('returns null for importance < 8', () => {
      const prompt = getSleepOnItPrompt(7);
      expect(prompt).toBeNull();
    });

    test('returns prompt for max importance', () => {
      const prompt = getSleepOnItPrompt(10);
      expect(prompt).toBeTruthy();
      expect(prompt).toContain('sleep');
    });

    test('boundary at 7-8', () => {
      expect(getSleepOnItPrompt(7)).toBeNull();
      expect(getSleepOnItPrompt(8)).toBeTruthy();
    });
  });

  describe('getAnalysisConfidenceModifier', () => {
    test('fewer options reduces confidence', () => {
      const twoOptions = getAnalysisConfidenceModifier(2, 5);
      expect(twoOptions).toBeLessThan(1.0);
    });

    test('more options increases confidence', () => {
      const fourOptions = getAnalysisConfidenceModifier(4, 5);
      expect(fourOptions).toBeGreaterThan(1.0);
    });

    test('more answers increases confidence', () => {
      const threeAnswers = getAnalysisConfidenceModifier(3, 3);
      const sixAnswers = getAnalysisConfidenceModifier(3, 6);
      expect(sixAnswers).toBeGreaterThan(threeAnswers);
    });

    test('fewer than 3 options gets -0.1', () => {
      const modifier = getAnalysisConfidenceModifier(2, 5);
      expect(modifier).toBe(0.9);
    });

    test('4+ options gets +0.05', () => {
      const modifier = getAnalysisConfidenceModifier(4, 5);
      expect(modifier).toBe(1.05);
    });

    test('6+ answers gets +0.1', () => {
      const modifier = getAnalysisConfidenceModifier(3, 6);
      expect(modifier).toBe(1.1);
    });

    test('4+ answers gets +0.05', () => {
      const modifier = getAnalysisConfidenceModifier(3, 4);
      expect(modifier).toBe(1.05);
    });

    test('modifier minimum is 0.5', () => {
      const modifier = getAnalysisConfidenceModifier(1, 1);
      expect(modifier).toBeGreaterThanOrEqual(0.5);
    });

    test('modifier maximum is 1.0', () => {
      const modifier = getAnalysisConfidenceModifier(5, 10);
      expect(modifier).toBeLessThanOrEqual(1.0);
    });

    test('combined effects', () => {
      const lowQuality = getAnalysisConfidenceModifier(2, 2);
      const highQuality = getAnalysisConfidenceModifier(5, 8);
      expect(highQuality).toBeGreaterThan(lowQuality);
    });
  });
});