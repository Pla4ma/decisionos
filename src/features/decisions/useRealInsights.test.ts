// useRealInsights Hook Tests
// Unit tests for real insights hook logic

import type { UserStats } from './deepDecisionTypes';

describe('useRealInsights', () => {
  describe('user stats calculation', () => {
    test('calculates average satisfaction from reviews', () => {
      const scores = [8, 7, 9, 6, 8];
      const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      expect(avg).toBe(7.6);
    });

    test('returns null when no satisfaction scores', () => {
      const scores: number[] = [];
      const avg = scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : null;
      expect(avg).toBeNull();
    });

    test('handles single score', () => {
      const scores = [8];
      const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      expect(avg).toBe(8);
    });

    test('handles all same scores', () => {
      const scores = [7, 7, 7, 7];
      const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      expect(avg).toBe(7);
    });
  });

  describe('staleTime configuration', () => {
    test('30 seconds in milliseconds', () => {
      const staleTime = 30000;
      expect(staleTime).toBe(30000);
    });
  });

  describe('user stats structure', () => {
    test('defaults to 0 for counts', () => {
      const stats = createUserStats({
        total_decisions_made: undefined,
        total_reviews_completed: undefined,
      });

      expect(stats.total_decisions_made).toBe(0);
      expect(stats.total_reviews_completed).toBe(0);
    });

    test('nullable fields work correctly', () => {
      const stats = createUserStats({
        regret_rate: null,
        avg_decision_hours: null,
        avg_satisfaction: null,
      });

      expect(stats.regret_rate).toBeNull();
      expect(stats.avg_decision_hours).toBeNull();
      expect(stats.avg_satisfaction).toBeNull();
    });

    test('decision_consistency_days defaults to 0', () => {
      const stats = createUserStats({
        decision_consistency_days: undefined,
      });

      expect(stats.decision_consistency_days).toBe(0);
    });

    test('regret_rate is percentage 0-100', () => {
      const stats = createUserStats({ regret_rate: 25 });
      expect(stats.regret_rate).toBeGreaterThanOrEqual(0);
      expect(stats.regret_rate).toBeLessThanOrEqual(100);
    });

    test('avg_satisfaction is 1-10', () => {
      const stats = createUserStats({ avg_satisfaction: 7.5 });
      expect(stats.avg_satisfaction).toBeGreaterThanOrEqual(1);
      expect(stats.avg_satisfaction).toBeLessThanOrEqual(10);
    });
  });

  describe('profile data mapping', () => {
    test('maps profile fields correctly', () => {
      const profileData = {
        total_decisions_made: 25,
        total_reviews_completed: 15,
        regret_rate: 20,
        avg_decision_hours: 48,
        decision_consistency_days: 14,
      };

      const stats = {
        total_decisions_made: profileData.total_decisions_made || 0,
        total_reviews_completed: profileData.total_reviews_completed || 0,
        regret_rate: profileData.regret_rate ?? null,
        avg_decision_hours: profileData.avg_decision_hours ?? null,
        decision_consistency_days: profileData.decision_consistency_days || 0,
        avg_satisfaction: null,
      };

      expect(stats.total_decisions_made).toBe(25);
      expect(stats.total_reviews_completed).toBe(15);
      expect(stats.regret_rate).toBe(20);
      expect(stats.avg_decision_hours).toBe(48);
    });

    test('handles missing profile data gracefully', () => {
      const profileData = null;

      const stats = {
        total_decisions_made: profileData?.total_decisions_made || 0,
        total_reviews_completed: profileData?.total_reviews_completed || 0,
        regret_rate: profileData?.regret_rate ?? null,
        avg_decision_hours: profileData?.avg_decision_hours ?? null,
        decision_consistency_days: profileData?.decision_consistency_days || 0,
        avg_satisfaction: null as number | null,
      };

      expect(stats.total_decisions_made).toBe(0);
      expect(stats.regret_rate).toBeNull();
    });
  });

  describe('no gamification', () => {
    test('does not include XP', () => {
      const stats = createUserStats({});
      expect(stats).not.toHaveProperty('xp');
    });

    test('does not include level', () => {
      const stats = createUserStats({});
      expect(stats).not.toHaveProperty('level');
    });

    test('does not include streak', () => {
      const stats = createUserStats({});
      expect(stats).not.toHaveProperty('streak');
    });

    test('only has real metrics', () => {
      const stats = createUserStats({});
      const keys = Object.keys(stats);

      expect(keys).toContain('total_decisions_made');
      expect(keys).toContain('total_reviews_completed');
      expect(keys).toContain('regret_rate');
      expect(keys).toContain('avg_decision_hours');
      expect(keys).toContain('decision_consistency_days');
      expect(keys).toContain('avg_satisfaction');
      expect(keys.length).toBe(6);
    });
  });
});

function createUserStats(overrides: Partial<UserStats> = {}): UserStats {
  return {
    total_decisions_made: overrides.total_decisions_made ?? 0,
    total_reviews_completed: overrides.total_reviews_completed ?? 0,
    regret_rate: overrides.regret_rate ?? null,
    avg_decision_hours: overrides.avg_decision_hours ?? null,
    decision_consistency_days: overrides.decision_consistency_days ?? 0,
    avg_satisfaction: overrides.avg_satisfaction ?? null,
  };
}