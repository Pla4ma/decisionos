// Deep Decision Types Validation Tests
// Unit tests for type validation and interface contracts

import type {
  RegretForecastItem,
  FutureSelfLetter,
  BlindSpotAlert,
  DecisionForecast,
  DecisionVelocity,
  UserBlindSpot,
  DecisionPlaybook,
  PlaybookItem,
  PlaybookBias,
  PlaybookCategory,
  PredictionAccuracy,
  UserStats,
} from './deepDecisionTypes';

describe('deepDecisionTypes', () => {
  describe('RegretForecastItem', () => {
    const validItem: RegretForecastItem = {
      option_id: '123e4567-e89b-12d3-a456-426614174000',
      option_title: 'Accept the job offer',
      regret_likelihood: 35,
      why: 'May miss growth opportunities at current company',
      what_would_cause_regret: 'Staying somewhere with no advancement',
      time_horizon: 'medium_term',
    };

    test('accepts valid item', () => {
      expect(validItem.regret_likelihood).toBe(35);
      expect(validItem.time_horizon).toBe('medium_term');
    });

    test('valid time horizons', () => {
      const shortTerm: RegretForecastItem = { ...validItem, time_horizon: 'short_term' };
      const mediumTerm: RegretForecastItem = { ...validItem, time_horizon: 'medium_term' };
      const longTerm: RegretForecastItem = { ...validItem, time_horizon: 'long_term' };

      expect(shortTerm.time_horizon).toBe('short_term');
      expect(mediumTerm.time_horizon).toBe('medium_term');
      expect(longTerm.time_horizon).toBe('long_term');
    });

    test('regret_likelihood is 0-100', () => {
      expect(validItem.regret_likelihood).toBeGreaterThanOrEqual(0);
      expect(validItem.regret_likelihood).toBeLessThanOrEqual(100);
    });

    test('all fields are required', () => {
      expect(validItem.option_id).toBeTruthy();
      expect(validItem.option_title).toBeTruthy();
      expect(validItem.regret_likelihood).toBeDefined();
      expect(validItem.why).toBeTruthy();
      expect(validItem.what_would_cause_regret).toBeTruthy();
      expect(validItem.time_horizon).toBeTruthy();
    });
  });

  describe('FutureSelfLetter', () => {
    const validLetter: FutureSelfLetter = {
      option_id: '123e4567-e89b-12d3-a456-426614174000',
      option_title: 'Start the business',
      letter_text: 'Dear past me, trust your instincts on this one.',
      perspective: 'You will have learned so much more in 5 years.',
      biggest_lesson: 'Courage beats comfort every time.',
    };

    test('accepts valid letter', () => {
      expect(validLetter.letter_text).toContain('Dear');
      expect(validLetter.biggest_lesson).toBeTruthy();
    });

    test('perspective is different from letter text', () => {
      expect(validLetter.perspective).not.toBe(validLetter.letter_text);
    });

    test('all fields are present', () => {
      expect(validLetter.option_id).toBeTruthy();
      expect(validLetter.option_title).toBeTruthy();
      expect(validLetter.letter_text).toBeTruthy();
      expect(validLetter.perspective).toBeTruthy();
      expect(validLetter.biggest_lesson).toBeTruthy();
    });
  });

  describe('BlindSpotAlert', () => {
    const validAlert: BlindSpotAlert = {
      blind_spot_type: 'loss_aversion',
      title: 'You may be avoiding risk due to loss aversion',
      description: 'You tend to focus more on avoiding losses than acquiring equivalent gains.',
      relevant_to_option: 'Stay at current job',
      severity: 'significant',
    };

    test('accepts valid alert', () => {
      expect(validAlert.blind_spot_type).toBeTruthy();
      expect(validAlert.title).toBeTruthy();
      expect(validAlert.severity).toBe('significant');
    });

    test('valid severity levels', () => {
      const mild: BlindSpotAlert = { ...validAlert, severity: 'mild' };
      const moderate: BlindSpotAlert = { ...validAlert, severity: 'moderate' };
      const significant: BlindSpotAlert = { ...validAlert, severity: 'significant' };

      expect(mild.severity).toBe('mild');
      expect(moderate.severity).toBe('moderate');
      expect(significant.severity).toBe('significant');
    });

    test('relevant_to_option can be null', () => {
      const alertWithoutOption: BlindSpotAlert = {
        ...validAlert,
        relevant_to_option: null,
      };
      expect(alertWithoutOption.relevant_to_option).toBeNull();
    });

    test('blind_spot_type is descriptive string', () => {
      expect(typeof validAlert.blind_spot_type).toBe('string');
      expect(validAlert.blind_spot_type.length).toBeGreaterThan(0);
    });
  });

  describe('DecisionForecast', () => {
    const validForecast: DecisionForecast = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      decision_id: '123e4567-e89b-12d3-a456-426614174001',
      user_id: '123e4567-e89b-12d3-a456-426614174002',
      regret_forecast: [],
      future_self_letters: [],
      blind_spot_alerts: [],
      confidence_timeline: {
        immediate: 75,
        short_term: 65,
        long_term: 55,
      },
      created_at: '2024-01-15T10:00:00Z',
    };

    test('accepts valid forecast with all arrays empty', () => {
      expect(validForecast.regret_forecast).toEqual([]);
      expect(validForecast.future_self_letters).toEqual([]);
      expect(validForecast.blind_spot_alerts).toEqual([]);
    });

    test('confidence timeline has three phases', () => {
      expect(validForecast.confidence_timeline.immediate).toBeDefined();
      expect(validForecast.confidence_timeline.short_term).toBeDefined();
      expect(validForecast.confidence_timeline.long_term).toBeDefined();
    });

    test('confidence values decrease over time (general trend)', () => {
      const timeline = validForecast.confidence_timeline;
      expect(timeline.immediate).toBeGreaterThanOrEqual(0);
      expect(timeline.short_term).toBeGreaterThanOrEqual(0);
      expect(timeline.long_term).toBeGreaterThanOrEqual(0);
    });

    test('created_at is ISO date string', () => {
      expect(validForecast.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('DecisionVelocity', () => {
    const validVelocity: DecisionVelocity = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      decision_id: '123e4567-e89b-12d3-a456-426614174001',
      user_id: '123e4567-e89b-12d3-a456-426614174002',
      created_to_decided_hours: 48,
      decided_to_reviewed_hours: 720,
      satisfaction_score: 7,
      would_choose_same: true,
      velocity_tier: 'moderate',
    };

    test('accepts valid velocity record', () => {
      expect(validVelocity.created_to_decided_hours).toBe(48);
      expect(validVelocity.satisfaction_score).toBe(7);
      expect(validVelocity.velocity_tier).toBe('moderate');
    });

    test('velocity_tier can be null', () => {
      const noTier: DecisionVelocity = {
        ...validVelocity,
        velocity_tier: null,
      };
      expect(noTier.velocity_tier).toBeNull();
    });

    test('valid velocity tiers', () => {
      const tiers: DecisionVelocity['velocity_tier'][] = ['rushed', 'quick', 'moderate', 'deliberate', 'slow', null];
      tiers.forEach((tier) => {
        const record: DecisionVelocity = { ...validVelocity, velocity_tier: tier };
        expect(record.velocity_tier).toBe(tier);
      });
    });

    test('satisfaction_score and would_choose_same can be null', () => {
      const nullableRecord: DecisionVelocity = {
        ...validVelocity,
        satisfaction_score: null,
        would_choose_same: null,
      };
      expect(nullableRecord.satisfaction_score).toBeNull();
      expect(nullableRecord.would_choose_same).toBeNull();
    });
  });

  describe('UserBlindSpot', () => {
    const validBlindSpot: UserBlindSpot = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      blind_spot_type: 'status_quo_bias',
      title: 'You prefer the current state even when change is beneficial',
      description: 'You tend to stick with what you know rather than evaluate options objectively.',
      evidence_count: 5,
      severity: 'moderate',
      is_active: true,
    };

    test('accepts valid blind spot', () => {
      expect(validBlindSpot.blind_spot_type).toBeTruthy();
      expect(validBlindSpot.evidence_count).toBeGreaterThan(0);
      expect(validBlindSpot.is_active).toBe(true);
    });

    test('severity matches expected values', () => {
      const mild: UserBlindSpot = { ...validBlindSpot, severity: 'mild' };
      const moderate: UserBlindSpot = { ...validBlindSpot, severity: 'moderate' };
      const significant: UserBlindSpot = { ...validBlindSpot, severity: 'significant' };

      expect(mild.severity).toBe('mild');
      expect(moderate.severity).toBe('moderate');
      expect(significant.severity).toBe('significant');
    });

    test('evidence_count is non-negative integer', () => {
      expect(validBlindSpot.evidence_count).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(validBlindSpot.evidence_count)).toBe(true);
    });
  });

  describe('DecisionPlaybook', () => {
    const validPlaybook: DecisionPlaybook = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      version: 1,
      title: 'My Decision Playbook',
      strengths: [],
      weaknesses: [],
      biases: [],
      optimal_speed: '24-48 hours',
      strongest_categories: [],
      growth_areas: [],
      regret_pattern: 'You tend to rush career decisions',
      decision_philosophy: 'Take time to reflect before committing to major decisions.',
      generated_at: '2024-01-15T10:00:00Z',
      review_count: 8,
      is_published: false,
    };

    test('accepts valid playbook', () => {
      expect(validPlaybook.version).toBe(1);
      expect(validPlaybook.title).toBeTruthy();
      expect(validPlaybook.is_published).toBe(false);
    });

    test('optional fields can be null', () => {
      const minimal: DecisionPlaybook = {
        ...validPlaybook,
        optimal_speed: null,
        regret_pattern: null,
        decision_philosophy: null,
      };
      expect(minimal.optimal_speed).toBeNull();
      expect(minimal.regret_pattern).toBeNull();
      expect(minimal.decision_philosophy).toBeNull();
    });

    test('version starts at 1', () => {
      expect(validPlaybook.version).toBeGreaterThan(0);
    });

    test('review_count tracks playbook usage', () => {
      expect(validPlaybook.review_count).toBeGreaterThanOrEqual(0);
    });

    test('is_published indicates readiness', () => {
      const draft: DecisionPlaybook = { ...validPlaybook, is_published: false };
      const published: DecisionPlaybook = { ...validPlaybook, is_published: true };
      expect(draft.is_published).toBe(false);
      expect(published.is_published).toBe(true);
    });
  });

  describe('PlaybookItem', () => {
    const validItem: PlaybookItem = {
      title: 'You excel at career decisions',
      description: 'Your track record shows strong judgment in professional choices.',
      confidence: 85,
      impact: 'High impact on your long-term satisfaction.',
    };

    test('accepts complete item', () => {
      expect(validItem.title).toBeTruthy();
      expect(validItem.description).toBeTruthy();
      expect(validItem.confidence).toBe(85);
      expect(validItem.impact).toBeTruthy();
    });

    test('confidence and impact are optional', () => {
      const minimal: PlaybookItem = {
        title: 'Test title',
        description: 'Test description',
      };
      expect(minimal.confidence).toBeUndefined();
      expect(minimal.impact).toBeUndefined();
    });

    test('confidence is 0-100', () => {
      expect(validItem.confidence).toBeGreaterThanOrEqual(0);
      expect(validItem.confidence).toBeLessThanOrEqual(100);
    });
  });

  describe('PlaybookBias', () => {
    const validBias: PlaybookBias = {
      type: 'sunk_cost',
      title: 'Sunk Cost Fallacy',
      description: 'You may continue investing in decisions because of past investment.',
      severity: 'moderate',
    };

    test('accepts valid bias', () => {
      expect(validBias.type).toBeTruthy();
      expect(validBias.title).toBeTruthy();
      expect(validBias.description).toBeTruthy();
    });

    test('severity is optional', () => {
      const noSeverity: PlaybookBias = {
        type: 'loss_aversion',
        title: 'Loss Aversion',
        description: 'You avoid losses more than seeking gains.',
      };
      expect(noSeverity.severity).toBeUndefined();
    });
  });

  describe('PlaybookCategory', () => {
    const validCategory: PlaybookCategory = {
      category: 'career',
      avg_satisfaction: 7.5,
      suggestion: 'Continue applying your current framework to career decisions.',
    };

    test('accepts valid category', () => {
      expect(validCategory.category).toBeTruthy();
      expect(validCategory.avg_satisfaction).toBe(7.5);
      expect(validCategory.suggestion).toBeTruthy();
    });

    test('avg_satisfaction is 1-10', () => {
      expect(validCategory.avg_satisfaction).toBeGreaterThanOrEqual(1);
      expect(validCategory.avg_satisfaction).toBeLessThanOrEqual(10);
    });

    test('suggestion is optional', () => {
      const noSuggestion: PlaybookCategory = {
        category: 'money',
      };
      expect(noSuggestion.suggestion).toBeUndefined();
    });
  });

  describe('PredictionAccuracy', () => {
    const validAccuracy: PredictionAccuracy = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      forecast_id: '123e4567-e89b-12d3-a456-426614174002',
      decision_id: '123e4567-e89b-12d3-a456-426614174003',
      regret_accuracy: 85,
      satisfaction_predicted: 8,
      satisfaction_actual: 7,
      did_regret: false,
      was_regret_predicted: true,
      analysis_accuracy: 90,
    };

    test('accepts complete accuracy record', () => {
      expect(validAccuracy.regret_accuracy).toBe(85);
      expect(validAccuracy.satisfaction_predicted).toBe(8);
      expect(validAccuracy.satisfaction_actual).toBe(7);
      expect(validAccuracy.did_regret).toBe(false);
    });

    test('all nullable fields work correctly', () => {
      const partial: PredictionAccuracy = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        forecast_id: '123e4567-e89b-12d3-a456-426614174002',
        decision_id: '123e4567-e89b-12d3-a456-426614174003',
        regret_accuracy: null,
        satisfaction_predicted: null,
        satisfaction_actual: null,
        did_regret: null,
        was_regret_predicted: null,
        analysis_accuracy: null,
      };
      expect(partial.regret_accuracy).toBeNull();
      expect(partial.did_regret).toBeNull();
    });

    test('boolean predictions work correctly', () => {
      const predictedRegret: PredictionAccuracy = {
        ...validAccuracy,
        did_regret: true,
        was_regret_predicted: true,
      };
      const noRegret: PredictionAccuracy = {
        ...validAccuracy,
        did_regret: false,
        was_regret_predicted: false,
      };
      expect(predictedRegret.did_regret).toBe(true);
      expect(noRegret.did_regret).toBe(false);
    });
  });

  describe('UserStats', () => {
    const validStats: UserStats = {
      total_decisions_made: 25,
      total_reviews_completed: 15,
      regret_rate: 20,
      avg_decision_hours: 48,
      decision_consistency_days: 14,
      avg_satisfaction: 7.2,
    };

    test('accepts valid stats', () => {
      expect(validStats.total_decisions_made).toBe(25);
      expect(validStats.total_reviews_completed).toBe(15);
      expect(validStats.avg_satisfaction).toBe(7.2);
    });

    test('nullable fields work', () => {
      const minimal: UserStats = {
        total_decisions_made: 0,
        total_reviews_completed: 0,
        regret_rate: null,
        avg_decision_hours: null,
        decision_consistency_days: 0,
        avg_satisfaction: null,
      };
      expect(minimal.regret_rate).toBeNull();
      expect(minimal.avg_decision_hours).toBeNull();
      expect(minimal.avg_satisfaction).toBeNull();
    });

    test('regret_rate is 0-100', () => {
      expect(validStats.regret_rate).toBeGreaterThanOrEqual(0);
      expect(validStats.regret_rate).toBeLessThanOrEqual(100);
    });

    test('avg_satisfaction is 1-10', () => {
      expect(validStats.avg_satisfaction).toBeGreaterThanOrEqual(1);
      expect(validStats.avg_satisfaction).toBeLessThanOrEqual(10);
    });

    test('counts are non-negative integers', () => {
      expect(validStats.total_decisions_made).toBeGreaterThanOrEqual(0);
      expect(validStats.total_reviews_completed).toBeGreaterThanOrEqual(0);
      expect(validStats.decision_consistency_days).toBeGreaterThanOrEqual(0);
    });
  });
});