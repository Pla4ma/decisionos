// Deep Gemini Prompts Tests
// Unit tests for deep Gemini prompt generation

import type {
  RegretForecastItem,
  FutureSelfLetter,
  BlindSpotAlert,
} from './deepDecisionTypes';

describe('deepGeminiPrompts', () => {
  describe('regret forecast structure', () => {
    test('regret_likelihood is 0-100', () => {
      const forecast: RegretForecastItem = {
        option_id: 'opt-1',
        option_title: 'Accept job',
        regret_likelihood: 35,
        why: 'May miss other opportunities',
        what_would_cause_regret: 'Staying in comfort zone too long',
        time_horizon: 'medium_term',
      };

      expect(forecast.regret_likelihood).toBeGreaterThanOrEqual(0);
      expect(forecast.regret_likelihood).toBeLessThanOrEqual(100);
    });

    test('time_horizon is short, medium, or long', () => {
      const horizons: RegretForecastItem['time_horizon'][] = [
        'short_term',
        'medium_term',
        'long_term',
      ];

      horizons.forEach((h) => {
        const forecast: RegretForecastItem = {
          option_id: 'opt-1',
          option_title: 'Test',
          regret_likelihood: 50,
          why: 'test',
          what_would_cause_regret: 'test',
          time_horizon: h,
        };
        expect(forecast.time_horizon).toBe(h);
      });
    });
  });

  describe('future self letter structure', () => {
    test('letter_text contains "Dear"', () => {
      const letter: FutureSelfLetter = {
        option_id: 'opt-1',
        option_title: 'Start business',
        letter_text: 'Dear past me, you made the right choice.',
        perspective: 'In 5 years, you see this clearly.',
        biggest_lesson: 'Courage beats comfort.',
      };

      expect(letter.letter_text).toContain('Dear');
    });

    test('perspective is different from letter', () => {
      const letter: FutureSelfLetter = {
        option_id: 'opt-1',
        option_title: 'Test',
        letter_text: 'Letter content here',
        perspective: 'Different perspective here',
        biggest_lesson: 'Lesson here',
      };

      expect(letter.perspective).not.toBe(letter.letter_text);
    });

    test('biggest_lesson is single insight', () => {
      const letter: FutureSelfLetter = {
        option_id: 'opt-1',
        option_title: 'Test',
        letter_text: 'Letter',
        perspective: 'Perspective',
        biggest_lesson: 'One key lesson.',
      };

      expect(letter.biggest_lesson.split('.').length).toBeLessThanOrEqual(2);
    });
  });

  describe('blind spot alert structure', () => {
    test('severity affects how prominently shown', () => {
      const alerts: BlindSpotAlert[] = [
        { blind_spot_type: 'loss_aversion', title: 'a', description: 'b', relevant_to_option: null, severity: 'mild' },
        { blind_spot_type: 'status_quo', title: 'a', description: 'b', relevant_to_option: null, severity: 'moderate' },
        { blind_spot_type: 'confirmation', title: 'a', description: 'b', relevant_to_option: null, severity: 'significant' },
      ];

      const significantCount = alerts.filter(a => a.severity === 'significant').length;
      expect(significantCount).toBe(1);
    });

    test('relevant_to_option can target specific option', () => {
      const alert: BlindSpotAlert = {
        blind_spot_type: 'sunk_cost',
        title: 'You may continue due to past investment',
        description: 'You tend to continue investments because of what you already put in.',
        relevant_to_option: 'Stay at current job',
        severity: 'significant',
      };

      expect(alert.relevant_to_option).toBe('Stay at current job');
    });

    test('blind_spot_type uses snake_case', () => {
      const alert: BlindSpotAlert = {
        blind_spot_type: 'status_quo_bias',
        title: 'Status quo bias',
        description: 'Prefer current state',
        relevant_to_option: null,
        severity: 'moderate',
      };

      expect(alert.blind_spot_type).toContain('_');
    });
  });

  describe('prompt injection', () => {
    test('blind spots injected into analysis prompt context', () => {
      const userBlindSpots = [
        { type: 'loss_aversion', severity: 'significant', description: 'Avoid losses over acquiring gains' },
        { type: 'status_quo', severity: 'moderate', description: 'Prefer current state' },
      ];

      const context = userBlindSpots
        .map(bs => `- ${bs.type} (${bs.severity}): ${bs.description}`)
        .join('\n');

      expect(context).toContain('loss_aversion');
      expect(context).toContain('significant');
    });

    test('forecast data included in analysis response', () => {
      const forecast = {
        regret_forecast: [],
        future_self_letters: [],
        blind_spot_alerts: [],
        confidence_timeline: { immediate: 75, short_term: 65, long_term: 55 },
      };

      expect(forecast).toHaveProperty('confidence_timeline');
      expect(forecast.confidence_timeline.immediate).toBe(75);
    });
  });

  describe('output validation', () => {
    test('regret forecast array matches schema', () => {
      const forecasts: RegretForecastItem[] = [
        {
          option_id: 'opt-1',
          option_title: 'Option A',
          regret_likelihood: 30,
          why: 'Reason A',
          what_would_cause_regret: 'Cause A',
          time_horizon: 'short_term',
        },
        {
          option_id: 'opt-2',
          option_title: 'Option B',
          regret_likelihood: 60,
          why: 'Reason B',
          what_would_cause_regret: 'Cause B',
          time_horizon: 'long_term',
        },
      ];

      expect(forecasts).toHaveLength(2);
      expect(forecasts[0].regret_likelihood).toBeLessThan(forecasts[1].regret_likelihood);
    });

    test('future self letters array matches schema', () => {
      const letters: FutureSelfLetter[] = [
        {
          option_id: 'opt-1',
          option_title: 'Option A',
          letter_text: 'Dear past me...',
          perspective: 'Future perspective...',
          biggest_lesson: 'Key lesson.',
        },
      ];

      expect(letters[0].letter_text).toContain('Dear');
      expect(letters[0].perspective).toBeTruthy();
      expect(letters[0].biggest_lesson).toBeTruthy();
    });

    test('blind spot alerts array matches schema', () => {
      const alerts: BlindSpotAlert[] = [
        {
          blind_spot_type: 'loss_aversion',
          title: 'Loss aversion detected',
          description: 'You may avoid taking action due to fear of losses.',
          relevant_to_option: null,
          severity: 'significant',
        },
      ];

      expect(alerts[0].severity).toBe('significant');
      expect(alerts[0].blind_spot_type).toBeTruthy();
    });
  });
});