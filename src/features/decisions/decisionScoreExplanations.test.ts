// Decision Score Explanations Tests
// Unit tests for score interpretation and formatting

import {
  SCORE_EXPLANATIONS,
  getScoreExplanation,
  interpretScore,
  getOverallRecommendation,
  formatScore,
  compareScores,
} from './decisionScoreExplanations';
import { DecisionScoreName } from './decisionTypes';

describe('decisionScoreExplanations', () => {
  describe('SCORE_EXPLANATIONS', () => {
    test('has all 5 score dimensions', () => {
      const dimensions: DecisionScoreName[] = [
        'regret_risk',
        'confidence',
        'values_alignment',
        'reversibility',
        'risk',
      ];
      dimensions.forEach((dim) => {
        expect(SCORE_EXPLANATIONS[dim]).toBeDefined();
      });
    });

    test('each explanation has required fields', () => {
      Object.values(SCORE_EXPLANATIONS).forEach((exp) => {
        expect(exp.name).toBeTruthy();
        expect(exp.label).toBeTruthy();
        expect(exp.description).toBeTruthy();
        expect(exp.highScoreMeaning).toBeTruthy();
        expect(exp.lowScoreMeaning).toBeTruthy();
        expect(exp.warningCopy).toBeTruthy();
        expect(exp.tooltipText).toBeTruthy();
      });
    });

    test('regret_risk explanation is meaningful', () => {
      const exp = SCORE_EXPLANATIONS.regret_risk;
      expect(exp.label).toBe('Regret Risk');
      expect(exp.highScoreMeaning).toContain('Lower');
      expect(exp.lowScoreMeaning).toContain('Higher');
      expect(exp.warningCopy).toContain('High regret risk');
    });

    test('confidence explanation is meaningful', () => {
      const exp = SCORE_EXPLANATIONS.confidence;
      expect(exp.label).toBe('Confidence');
      expect(exp.highScoreMeaning).toContain('High confidence');
      expect(exp.lowScoreMeaning).toContain('Low confidence');
    });

    test('values_alignment explanation is meaningful', () => {
      const exp = SCORE_EXPLANATIONS.values_alignment;
      expect(exp.label).toBe('Values Alignment');
      expect(exp.highScoreMeaning).toContain('alignment');
      expect(exp.lowScoreMeaning).toContain('misalignment');
    });

    test('reversibility explanation references undoing', () => {
      const exp = SCORE_EXPLANATIONS.reversibility;
      expect(exp.label).toBe('Reversibility');
      expect(exp.highScoreMeaning).toContain('reversible');
      expect(exp.lowScoreMeaning).toContain('undo');
    });

    test('risk explanation references downside', () => {
      const exp = SCORE_EXPLANATIONS.risk;
      expect(exp.label).toBe('Risk Level');
      expect(exp.highScoreMeaning).toContain('risk');
      expect(exp.lowScoreMeaning).toContain('downside');
    });
  });

  describe('getScoreExplanation', () => {
    test('returns explanation for valid score name', () => {
      const exp = getScoreExplanation('confidence');
      expect(exp.label).toBe('Confidence');
    });

    test('returns full explanation object', () => {
      const exp = getScoreExplanation('regret_risk');
      expect(exp).toHaveProperty('name');
      expect(exp).toHaveProperty('description');
      expect(exp).toHaveProperty('warningCopy');
    });
  });

  describe('interpretScore', () => {
    test('returns high meaning for scores >= 75', () => {
      const result = interpretScore('confidence', 80);
      expect(result).toContain('High confidence');
    });

    test('returns moderate message for scores 50-74', () => {
      const result = interpretScore('confidence', 60);
      expect(result).toContain('moderate');
    });

    test('returns below average for scores 25-49', () => {
      const result = interpretScore('confidence', 35);
      expect(result).toContain('below average');
    });

    test('returns warning copy for scores < 25', () => {
      const result = interpretScore('regret_risk', 20);
      expect(result).toContain('High regret risk');
    });

    test('handles edge cases at boundaries', () => {
      expect(interpretScore('confidence', 75)).toContain('High confidence');
      expect(interpretScore('confidence', 74)).toContain('moderate');
      expect(interpretScore('confidence', 50)).toContain('moderate');
      expect(interpretScore('confidence', 49)).toContain('below average');
      expect(interpretScore('confidence', 25)).toContain('below average');
      expect(interpretScore('confidence', 24)).toContain('Low confidence');
    });

    test('works for all score dimensions', () => {
      const dimensions: DecisionScoreName[] = [
        'regret_risk',
        'confidence',
        'values_alignment',
        'reversibility',
        'risk',
      ];
      dimensions.forEach((dim) => {
        const result = interpretScore(dim, 80);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getOverallRecommendation', () => {
    test('returns very well for scores >= 75 average', () => {
      const scores: Record<DecisionScoreName, number> = {
        regret_risk: 80,
        confidence: 80,
        values_alignment: 75,
        reversibility: 80,
        risk: 80,
      };
      const result = getOverallRecommendation(scores);
      expect(result).toContain('very well');
    });

    test('returns solid for scores 60-74 average', () => {
      const scores: Record<DecisionScoreName, number> = {
        regret_risk: 65,
        confidence: 60,
        values_alignment: 60,
        reversibility: 70,
        risk: 65,
      };
      const result = getOverallRecommendation(scores);
      expect(result).toContain('solid');
    });

    test('returns notable concerns for scores 40-59 average', () => {
      const scores: Record<DecisionScoreName, number> = {
        regret_risk: 50,
        confidence: 45,
        values_alignment: 40,
        reversibility: 50,
        risk: 45,
      };
      const result = getOverallRecommendation(scores);
      expect(result).toContain('notable concerns');
    });

    test('returns significant concerns for scores < 40 average', () => {
      const scores: Record<DecisionScoreName, number> = {
        regret_risk: 30,
        confidence: 35,
        values_alignment: 25,
        reversibility: 40,
        risk: 30,
      };
      const result = getOverallRecommendation(scores);
      expect(result).toContain('significant concerns');
    });

    test('handles perfect scores', () => {
      const scores: Record<DecisionScoreName, number> = {
        regret_risk: 100,
        confidence: 100,
        values_alignment: 100,
        reversibility: 100,
        risk: 100,
      };
      const result = getOverallRecommendation(scores);
      expect(result).toContain('very well');
    });

    test('handles all zero scores', () => {
      const scores: Record<DecisionScoreName, number> = {
        regret_risk: 0,
        confidence: 0,
        values_alignment: 0,
        reversibility: 0,
        risk: 0,
      };
      const result = getOverallRecommendation(scores);
      expect(result).toContain('significant concerns');
    });
  });

  describe('formatScore', () => {
    test('returns excellent for scores >= 80', () => {
      const result = formatScore(85);
      expect(result.text).toContain('85/100');
      expect(result.text).toContain('Excellent');
      expect(result.color).toBe('#4ADE80');
    });

    test('returns good for scores 60-79', () => {
      const result = formatScore(70);
      expect(result.text).toContain('70/100');
      expect(result.text).toContain('Good');
      expect(result.color).toBe('#60A5FA');
    });

    test('returns fair for scores 40-59', () => {
      const result = formatScore(50);
      expect(result.text).toContain('50/100');
      expect(result.text).toContain('Fair');
      expect(result.color).toBe('#FBBF24');
    });

    test('returns needs attention for scores < 40', () => {
      const result = formatScore(30);
      expect(result.text).toContain('30/100');
      expect(result.text).toContain('Needs Attention');
      expect(result.color).toBe('#F87171');
    });

    test('handles edge cases', () => {
      expect(formatScore(0).text).toContain('Needs Attention');
      expect(formatScore(40).text).toContain('Fair');
      expect(formatScore(41).text).toContain('Fair');
      expect(formatScore(79).text).toContain('Good');
      expect(formatScore(80).text).toContain('Excellent');
    });

    test('colors are valid hex codes', () => {
      const colors = Object.values(SCORE_EXPLANATIONS).map((_, i) => {
        if (i === 0) return formatScore(85).color;
        if (i === 1) return formatScore(70).color;
        if (i === 2) return formatScore(50).color;
        return formatScore(30).color;
      });
      colors.forEach((color) => {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe('compareScores', () => {
    test('returns A winner when A has higher weighted score', () => {
      const scoreA: Record<DecisionScoreName, number> = {
        regret_risk: 80,
        confidence: 80,
        values_alignment: 80,
        reversibility: 80,
        risk: 80,
      };
      const scoreB: Record<DecisionScoreName, number> = {
        regret_risk: 60,
        confidence: 60,
        values_alignment: 60,
        reversibility: 60,
        risk: 60,
      };
      const result = compareScores(scoreA, scoreB);
      expect(result.winner).toBe('A');
    });

    test('returns B winner when B has higher weighted score', () => {
      const scoreA: Record<DecisionScoreName, number> = {
        regret_risk: 50,
        confidence: 50,
        values_alignment: 50,
        reversibility: 50,
        risk: 50,
      };
      const scoreB: Record<DecisionScoreName, number> = {
        regret_risk: 80,
        confidence: 80,
        values_alignment: 80,
        reversibility: 80,
        risk: 80,
      };
      const result = compareScores(scoreA, scoreB);
      expect(result.winner).toBe('B');
    });

    test('returns tie when difference is less than 5', () => {
      const scoreA: Record<DecisionScoreName, number> = {
        regret_risk: 65,
        confidence: 65,
        values_alignment: 65,
        reversibility: 65,
        risk: 65,
      };
      const scoreB: Record<DecisionScoreName, number> = {
        regret_risk: 68,
        confidence: 68,
        values_alignment: 68,
        reversibility: 68,
        risk: 68,
      };
      const result = compareScores(scoreA, scoreB);
      expect(result.winner).toBe('tie');
    });

    test('returns differences for each dimension', () => {
      const scoreA: Record<DecisionScoreName, number> = {
        regret_risk: 70,
        confidence: 80,
        values_alignment: 60,
        reversibility: 90,
        risk: 50,
      };
      const scoreB: Record<DecisionScoreName, number> = {
        regret_risk: 60,
        confidence: 70,
        values_alignment: 80,
        reversibility: 50,
        risk: 90,
      };
      const result = compareScores(scoreA, scoreB);
      expect(result.differences.regret_risk).toBe(10);
      expect(result.differences.confidence).toBe(10);
      expect(result.differences.values_alignment).toBe(-20);
      expect(result.differences.reversibility).toBe(40);
      expect(result.differences.risk).toBe(-40);
    });

    test('handles identical scores as tie', () => {
      const scoreA: Record<DecisionScoreName, number> = {
        regret_risk: 70,
        confidence: 70,
        values_alignment: 70,
        reversibility: 70,
        risk: 70,
      };
      const scoreB: Record<DecisionScoreName, number> = {
        regret_risk: 70,
        confidence: 70,
        values_alignment: 70,
        reversibility: 70,
        risk: 70,
      };
      const result = compareScores(scoreA, scoreB);
      expect(result.winner).toBe('tie');
    });
  });
});