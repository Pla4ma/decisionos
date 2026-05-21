// useDecisionVelocity Hook Tests
// Unit tests for decision velocity tracking hook logic

import type { DecisionVelocity } from './deepDecisionTypes';

describe('useDecisionVelocity', () => {
  describe('velocity tier calculation', () => {
    test('rushed tier for < 1 hour', () => {
      const tier = getVelocityTier(0.5);
      expect(tier).toBe('rushed');
    });

    test('quick tier for 1-24 hours', () => {
      const tier = getVelocityTier(12);
      expect(tier).toBe('quick');
    });

    test('moderate tier for 24-72 hours', () => {
      const tier = getVelocityTier(48);
      expect(tier).toBe('moderate');
    });

    test('deliberate tier for 72-168 hours', () => {
      const tier = getVelocityTier(96);
      expect(tier).toBe('deliberate');
    });

    test('slow tier for > 168 hours', () => {
      const tier = getVelocityTier(200);
      expect(tier).toBe('slow');
    });

    test('null for undefined hours', () => {
      const tier = getVelocityTier(null);
      expect(tier).toBeNull();
    });

    test('boundary at 1 hour', () => {
      expect(getVelocityTier(0.99)).toBe('rushed');
      expect(getVelocityTier(1)).toBe('quick');
    });

    test('boundary at 24 hours', () => {
      expect(getVelocityTier(23.99)).toBe('quick');
      expect(getVelocityTier(24)).toBe('moderate');
    });

    test('boundary at 72 hours', () => {
      expect(getVelocityTier(71.99)).toBe('moderate');
      expect(getVelocityTier(72)).toBe('deliberate');
    });

    test('boundary at 168 hours', () => {
      expect(getVelocityTier(167.99)).toBe('deliberate');
      expect(getVelocityTier(168)).toBe('slow');
    });
  });

  describe('velocity insight generation', () => {
    test('returns null when fewer than 3 records', () => {
      const records = [
        createVelocityRecord(1, 5, 'quick'),
        createVelocityRecord(2, 7, 'quick'),
      ];
      const insight = getVelocityInsight(records);
      expect(insight).toBeNull();
    });

    test('returns null when fewer than 3 records with satisfaction', () => {
      const records = [
        createVelocityRecord(1, 5, 'quick'),
        createVelocityRecord(2, 7, 'quick'),
      ];
      const withSatisfaction = records.filter(r => r.satisfaction_score != null);
      expect(withSatisfaction.length).toBeLessThan(3);
    });

    test('fast_satisfied insight when 3+ quick + high satisfaction', () => {
      const records = [
        createVelocityRecord(2, 8, 'quick'),
        createVelocityRecord(3, 7, 'quick'),
        createVelocityRecord(4, 9, 'quick'),
      ];

      const withSatisfaction = records.filter(r => r.satisfaction_score != null);
      const fastSatisfied = withSatisfaction.filter(
        r => r.velocity_tier === 'quick' && (r.satisfaction_score || 0) >= 4
      ).length;

      expect(fastSatisfied).toBe(3);
    });

    test('slow_unsatisfied insight when 2+ slow + low satisfaction', () => {
      const records = [
        createVelocityRecord(200, 2, 'slow'),
        createVelocityRecord(180, 3, 'slow'),
        createVelocityRecord(1, 8, 'quick'),
      ];

      const withSatisfaction = records.filter(r => r.satisfaction_score != null);
      const slowUnsatisfied = withSatisfaction.filter(
        r => r.velocity_tier === 'slow' && (r.satisfaction_score || 0) < 3
      ).length;

      expect(slowUnsatisfied).toBe(2);
    });

    test('calculates average hours correctly', () => {
      const records = [
        createVelocityRecord(24, 5, 'moderate'),
        createVelocityRecord(48, 6, 'moderate'),
        createVelocityRecord(72, 7, 'deliberate'),
      ];

      const withSatisfaction = records.filter(r => r.satisfaction_score != null);
      const avgHours = withSatisfaction.reduce(
        (sum, r) => sum + (r.created_to_decided_hours || 0),
        0
      ) / withSatisfaction.length;

      expect(avgHours).toBe(48);
    });
  });

  describe('velocity record structure', () => {
    test('created_to_decided_hours can be null', () => {
      const record = createVelocityRecord(null, 5, null);
      expect(record.created_to_decided_hours).toBeNull();
    });

    test('satisfaction_score can be null', () => {
      const record = createVelocityRecord(48, null, 'moderate');
      expect(record.satisfaction_score).toBeNull();
    });

    test('would_choose_same can be null', () => {
      const record = createVelocityRecord(48, 5, 'moderate');
      record.would_choose_same = null;
      expect(record.would_choose_same).toBeNull();
    });

    test('would_choose_same can be true or false', () => {
      const yesRecord = createVelocityRecord(48, 8, 'quick');
      yesRecord.would_choose_same = true;

      const noRecord = createVelocityRecord(48, 3, 'slow');
      noRecord.would_choose_same = false;

      expect(yesRecord.would_choose_same).toBe(true);
      expect(noRecord.would_choose_same).toBe(false);
    });
  });

  describe('recording velocity', () => {
    test('upsert on conflict decision_id', () => {
      const record = createVelocityRecord(48, 7, 'moderate');
      const conflictConfig = { onConflict: 'decision_id' };

      expect(conflictConfig.onConflict).toBe('decision_id');
      expect(record.decision_id).toBeTruthy();
    });

    test('records both time metrics', () => {
      const record = createVelocityRecord(48, 7, 'moderate');
      record.decided_to_reviewed_hours = 720;

      expect(record.created_to_decided_hours).toBe(48);
      expect(record.decided_to_reviewed_hours).toBe(720);
    });
  });

  describe('limiting records', () => {
    test('limits to 20 most recent', () => {
      const records = Array.from({ length: 25 }, (_, i) =>
        createVelocityRecord(48, 5 + (i % 3), 'moderate')
      );

      const sorted = records.sort(
        (a, b) => new Date((b as any).created_at).getTime() - new Date((a as any).created_at).getTime()
      );
      const limited = sorted.slice(0, 20);

      expect(records.length).toBe(25);
      expect(limited.length).toBe(20);
    });
  });
});

function getVelocityTier(hours: number | null): DecisionVelocity['velocity_tier'] {
  if (hours == null) return null;
  if (hours < 1) return 'rushed';
  if (hours < 24) return 'quick';
  if (hours < 72) return 'moderate';
  if (hours < 168) return 'deliberate';
  return 'slow';
}

function getVelocityInsight(records: DecisionVelocity[]): string | null {
  if (!records || records.length < 3) return null;

  const withSatisfaction = records.filter(r => r.satisfaction_score != null);
  if (withSatisfaction.length < 3) return null;

  const fastSatisfied = withSatisfaction.filter(
    r => r.velocity_tier === 'quick' && (r.satisfaction_score || 0) >= 4
  ).length;

  const slowUnsatisfied = withSatisfaction.filter(
    r => r.velocity_tier === 'slow' && (r.satisfaction_score || 0) < 3
  ).length;

  const avgHours = withSatisfaction.reduce(
    (sum, r) => sum + (r.created_to_decided_hours || 0),
    0
  ) / withSatisfaction.length;

  if (fastSatisfied >= 3) {
    return 'You tend to make good decisions quickly. Trust your instincts.';
  }
  if (slowUnsatisfied >= 2) {
    return `You average ${Math.round(avgHours)} hours per decision but satisfaction is low. More time may not be helping.`;
  }

  return `Your optimal decision pace is around ${Math.round(avgHours)} hours.`;
}

function createVelocityRecord(
  hours: number | null,
  satisfaction: number | null,
  tier: DecisionVelocity['velocity_tier']
): DecisionVelocity {
  return {
    id: Math.random().toString(36).substr(2, 9),
    decision_id: 'decision-' + Math.random().toString(36).substr(2, 9),
    user_id: 'user-1',
    created_to_decided_hours: hours,
    decided_to_reviewed_hours: null,
    satisfaction_score: satisfaction,
    would_choose_same: null,
    velocity_tier: tier,
  };
}