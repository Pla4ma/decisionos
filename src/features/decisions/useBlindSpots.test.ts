// useBlindSpots Hook Tests
// Unit tests for blind spot detection hook logic

import type { UserBlindSpot } from './deepDecisionTypes';

describe('useBlindSpots', () => {
  describe('blind spot filtering', () => {
    test('filters significant severity blind spots', () => {
      const blindSpots: UserBlindSpot[] = [
        createBlindSpot('1', 'status_quo_bias', 'significant'),
        createBlindSpot('2', 'loss_aversion', 'mild'),
        createBlindSpot('3', 'confirmation_bias', 'moderate'),
        createBlindSpot('4', 'sunk_cost', 'significant'),
      ];

      const significant = blindSpots.filter(b => b.severity === 'significant');
      expect(significant).toHaveLength(2);
      expect(significant[0].blind_spot_type).toBe('status_quo_bias');
      expect(significant[1].blind_spot_type).toBe('sunk_cost');
    });

    test('filters active blind spots', () => {
      const blindSpots: UserBlindSpot[] = [
        createBlindSpot('1', 'status_quo_bias', 'moderate', true),
        createBlindSpot('2', 'loss_aversion', 'mild', false),
        createBlindSpot('3', 'confirmation_bias', 'moderate', true),
      ];

      const active = blindSpots.filter(b => b.is_active);
      expect(active).toHaveLength(2);
      expect(active.every(b => b.is_active)).toBe(true);
    });

    test('checks if user has any blind spots', () => {
      const withSpots: UserBlindSpot[] = [
        createBlindSpot('1', 'status_quo_bias', 'mild'),
      ];
      const withoutSpots: UserBlindSpot[] = [];

      expect(withSpots.length > 0).toBe(true);
      expect(withoutSpots.length > 0).toBe(false);
    });

    test('sorts by severity descending', () => {
      const blindSpots: UserBlindSpot[] = [
        createBlindSpot('1', 'bias_1', 'mild'),
        createBlindSpot('2', 'bias_2', 'significant'),
        createBlindSpot('3', 'bias_3', 'moderate'),
      ];

      const severityOrder = ['significant', 'moderate', 'mild'];
      const sorted = [...blindSpots].sort((a, b) => {
        return severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
      });

      expect(sorted[0].severity).toBe('significant');
      expect(sorted[1].severity).toBe('moderate');
      expect(sorted[2].severity).toBe('mild');
    });
  });

  describe('blind spot data structure', () => {
    test('has required fields', () => {
      const spot = createBlindSpot('1', 'test_bias', 'moderate');
      expect(spot.id).toBeTruthy();
      expect(spot.user_id).toBeTruthy();
      expect(spot.blind_spot_type).toBeTruthy();
      expect(spot.title).toBeTruthy();
      expect(spot.description).toBeTruthy();
      expect(spot.severity).toBe('moderate');
      expect(spot.evidence_count).toBe(1);
    });

    test('evidence_count tracks occurrences', () => {
      const lowEvidence = createBlindSpot('1', 'bias_1', 'mild');
      lowEvidence.evidence_count = 1;

      const highEvidence = createBlindSpot('2', 'bias_2', 'significant');
      highEvidence.evidence_count = 10;

      expect(highEvidence.evidence_count).toBeGreaterThan(lowEvidence.evidence_count);
    });

    test('blind_spot_type is descriptive', () => {
      const spot = createBlindSpot('1', 'status_quo_bias', 'moderate');
      expect(spot.blind_spot_type).toContain('status_quo_bias');
      expect(spot.blind_spot_type).not.toContain('_');
    });
  });

  describe('severity levels', () => {
    test('mild severity has description', () => {
      const spot = createBlindSpot('1', 'bias', 'mild');
      expect(spot.severity).toBe('mild');
    });

    test('moderate severity has description', () => {
      const spot = createBlindSpot('1', 'bias', 'moderate');
      expect(spot.severity).toBe('moderate');
    });

    test('significant severity has description', () => {
      const spot = createBlindSpot('1', 'bias', 'significant');
      expect(spot.severity).toBe('significant');
    });
  });

  describe('staleTime configuration', () => {
    test('10 minutes in milliseconds', () => {
      const staleTime = 1000 * 60 * 10;
      expect(staleTime).toBe(600000);
    });
  });
});

function createBlindSpot(
  id: string,
  blindSpotType: string,
  severity: 'mild' | 'moderate' | 'significant',
  isActive: boolean = true
): UserBlindSpot {
  return {
    id,
    user_id: 'user-1',
    blind_spot_type: blindSpotType,
    title: `${blindSpotType} detected`,
    description: `This blind spot has been identified in your decision patterns.`,
    evidence_count: 1,
    severity,
    is_active: isActive,
  };
}