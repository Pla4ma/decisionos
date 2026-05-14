// Decision Rules Tests
// Unit tests for decision business rules

import {
  ALLOWED_CATEGORIES,
  UNSAFE_CATEGORIES,
  STATUS_FLOW,
  SCORE_DIMENSIONS,
  DEFAULT_QUESTIONS,
  CATEGORY_LABELS,
  isUnsafeCategory,
  getUnsafeCategoryMessage,
} from './decisionRules';
import { DecisionCategory } from './decisionTypes';

describe('decisionRules', () => {
  describe('ALLOWED_CATEGORIES', () => {
    test('contains expected categories', () => {
      expect(ALLOWED_CATEGORIES).toContain('career');
      expect(ALLOWED_CATEGORIES).toContain('money');
      expect(ALLOWED_CATEGORIES).toContain('relationship');
      expect(ALLOWED_CATEGORIES).toContain('school');
      expect(ALLOWED_CATEGORIES).toContain('moving');
      expect(ALLOWED_CATEGORIES).toContain('business');
      expect(ALLOWED_CATEGORIES).toContain('personal_goals');
      expect(ALLOWED_CATEGORIES).toContain('other');
    });

    test('does not contain unsafe categories', () => {
      expect(ALLOWED_CATEGORIES).not.toContain('medical');
      expect(ALLOWED_CATEGORIES).not.toContain('mental_health');
      expect(ALLOWED_CATEGORIES).not.toContain('legal');
      expect(ALLOWED_CATEGORIES).not.toContain('investment');
      expect(ALLOWED_CATEGORIES).not.toContain('safety');
    });

    test('has 8 categories total', () => {
      expect(ALLOWED_CATEGORIES).toHaveLength(8);
    });
  });

  describe('UNSAFE_CATEGORIES', () => {
    test('contains all blocked categories', () => {
      expect(UNSAFE_CATEGORIES).toContain('medical');
      expect(UNSAFE_CATEGORIES).toContain('mental_health');
      expect(UNSAFE_CATEGORIES).toContain('legal');
      expect(UNSAFE_CATEGORIES).toContain('investment');
      expect(UNSAFE_CATEGORIES).toContain('safety');
      expect(UNSAFE_CATEGORIES).toContain('crisis');
    });

    test('has 6 categories', () => {
      expect(UNSAFE_CATEGORIES).toHaveLength(6);
    });

    test('is read-only array', () => {
      expect(Object.isFrozen(UNSAFE_CATEGORIES)).toBe(true);
    });
  });

  describe('STATUS_FLOW', () => {
    test('draft can transition to questions or ready_for_analysis', () => {
      expect(STATUS_FLOW.draft).toContain('questions');
      expect(STATUS_FLOW.draft).toContain('ready_for_analysis');
    });

    test('questions can go back to draft or forward to ready_for_analysis', () => {
      expect(STATUS_FLOW.questions).toContain('draft');
      expect(STATUS_FLOW.questions).toContain('ready_for_analysis');
    });

    test('ready_for_analysis only goes to analyzed', () => {
      expect(STATUS_FLOW.ready_for_analysis).toEqual(['analyzed']);
    });

    test('analyzed only goes to chosen', () => {
      expect(STATUS_FLOW.analyzed).toEqual(['chosen']);
    });

    test('reviewed is terminal state', () => {
      expect(STATUS_FLOW.reviewed).toEqual([]);
    });

    test('has all 7 status states', () => {
      const states = Object.keys(STATUS_FLOW);
      expect(states).toHaveLength(7);
      expect(states).toContain('draft');
      expect(states).toContain('questions');
      expect(states).toContain('ready_for_analysis');
      expect(states).toContain('analyzed');
      expect(states).toContain('chosen');
      expect(states).toContain('review_scheduled');
      expect(states).toContain('reviewed');
    });
  });

  describe('SCORE_DIMENSIONS', () => {
    test('has all 5 score dimensions', () => {
      const dimensions = Object.keys(SCORE_DIMENSIONS);
      expect(dimensions).toHaveLength(5);
      expect(dimensions).toContain('regret_risk');
      expect(dimensions).toContain('confidence');
      expect(dimensions).toContain('values_alignment');
      expect(dimensions).toContain('reversibility');
      expect(dimensions).toContain('risk');
    });

    test('weights sum to 1.0', () => {
      const totalWeight = Object.values(SCORE_DIMENSIONS).reduce(
        (sum, dim) => sum + dim.weight,
        0
      );
      expect(totalWeight).toBeCloseTo(1.0, 5);
    });

    test('regret_risk and confidence have highest weights', () => {
      expect(SCORE_DIMENSIONS.regret_risk.weight).toBe(0.25);
      expect(SCORE_DIMENSIONS.confidence.weight).toBe(0.25);
    });

    test('all dimensions have labels', () => {
      Object.values(SCORE_DIMENSIONS).forEach((dim) => {
        expect(dim.label).toBeTruthy();
        expect(typeof dim.label).toBe('string');
      });
    });

    test('is frozen', () => {
      expect(Object.isFrozen(SCORE_DIMENSIONS)).toBe(true);
    });
  });

  describe('DEFAULT_QUESTIONS', () => {
    test('has questions for all allowed categories', () => {
      ALLOWED_CATEGORIES.forEach((category) => {
        expect(DEFAULT_QUESTIONS[category as DecisionCategory]).toBeDefined();
        expect(Array.isArray(DEFAULT_QUESTIONS[category as DecisionCategory])).toBe(true);
      });
    });

    test('each category has 5 questions', () => {
      ALLOWED_CATEGORIES.forEach((category) => {
        const questions = DEFAULT_QUESTIONS[category as DecisionCategory];
        expect(questions).toHaveLength(5);
      });
    });

    test('all questions are non-empty strings', () => {
      Object.values(DEFAULT_QUESTIONS).forEach((questions) => {
        questions.forEach((q) => {
          expect(typeof q).toBe('string');
          expect(q.trim().length).toBeGreaterThan(0);
        });
      });
    });

    test('career questions are relevant to career decisions', () => {
      const careerQuestions = DEFAULT_QUESTIONS.career;
      expect(careerQuestions.some(q => q.toLowerCase().includes('career') || q.toLowerCase().includes('job') || q.toLowerCase().includes('goal'))).toBe(true);
    });

    test('money questions relate to financial decisions', () => {
      const moneyQuestions = DEFAULT_QUESTIONS.money;
      expect(moneyQuestions.some(q => q.toLowerCase().includes('financial') || q.toLowerCase().includes('money') || q.toLowerCase().includes('cost'))).toBe(true);
    });
  });

  describe('CATEGORY_LABELS', () => {
    test('has labels for all allowed categories', () => {
      ALLOWED_CATEGORIES.forEach((category) => {
        expect(CATEGORY_LABELS[category as DecisionCategory]).toBeDefined();
      });
    });

    test('all labels are non-empty strings', () => {
      Object.values(CATEGORY_LABELS).forEach((label) => {
        expect(typeof label).toBe('string');
        expect(label.trim().length).toBeGreaterThan(0);
      });
    });

    test('career label is descriptive', () => {
      expect(CATEGORY_LABELS.career).toBe('Career & Work');
    });

    test('other label is generic', () => {
      expect(CATEGORY_LABELS.other).toBe('Other');
    });
  });

  describe('isUnsafeCategory', () => {
    test('returns true for blocked categories', () => {
      expect(isUnsafeCategory('medical')).toBe(true);
      expect(isUnsafeCategory('mental_health')).toBe(true);
      expect(isUnsafeCategory('legal')).toBe(true);
      expect(isUnsafeCategory('investment')).toBe(true);
      expect(isUnsafeCategory('safety')).toBe(true);
      expect(isUnsafeCategory('crisis')).toBe(true);
    });

    test('returns false for allowed categories', () => {
      expect(isUnsafeCategory('career')).toBe(false);
      expect(isUnsafeCategory('money')).toBe(false);
      expect(isUnsafeCategory('relationship')).toBe(false);
      expect(isUnsafeCategory('school')).toBe(false);
    });

    test('is case insensitive', () => {
      expect(isUnsafeCategory('MEDICAL')).toBe(true);
      expect(isUnsafeCategory('Medical')).toBe(true);
      expect(isUnsafeCategory('CAREER')).toBe(false);
    });

    test('returns false for unknown categories', () => {
      expect(isUnsafeCategory('unknown')).toBe(false);
      expect(isUnsafeCategory('')).toBe(false);
    });
  });

  describe('getUnsafeCategoryMessage', () => {
    test('returns message for medical', () => {
      const message = getUnsafeCategoryMessage('medical');
      expect(message).toContain('professional');
      expect(message.toLowerCase()).toContain('health');
    });

    test('returns message for mental_health', () => {
      const message = getUnsafeCategoryMessage('mental_health');
      expect(message).toContain('professional');
      expect(message.toLowerCase()).toContain('mental');
    });

    test('returns message for legal', () => {
      const message = getUnsafeCategoryMessage('legal');
      expect(message.toLowerCase()).toContain('attorney');
    });

    test('returns message for investment', () => {
      const message = getUnsafeCategoryMessage('investment');
      expect(message.toLowerCase()).toContain('advisor');
    });

    test('returns generic message for unknown categories', () => {
      const message = getUnsafeCategoryMessage('unknown_category');
      expect(message).toContain('professional guidance');
    });

    test('is case insensitive', () => {
      const medicalMsg = getUnsafeCategoryMessage('MEDICAL');
      const medicalMsgUpper = getUnsafeCategoryMessage('medical');
      expect(medicalMsg).toBe(medicalMsgUpper);
    });
  });
});