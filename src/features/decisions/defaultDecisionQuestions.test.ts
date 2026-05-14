// Default Decision Questions Tests
// Unit tests for category-specific default questions

import { DEFAULT_QUESTIONS } from './decisionRules';
import type { DecisionCategory } from './decisionTypes';

describe('defaultDecisionQuestions', () => {
  describe('question count per category', () => {
    const categories: DecisionCategory[] = [
      'school', 'career', 'money', 'moving', 'business', 'personal_goals', 'other',
    ];

    test('each category has 5 questions', () => {
      categories.forEach((cat) => {
        expect(DEFAULT_QUESTIONS[cat].length).toBe(5);
      });
    });
  });

  describe('question quality', () => {
    test('all questions are non-empty', () => {
      Object.values(DEFAULT_QUESTIONS).forEach((questions) => {
        questions.forEach((q) => {
          expect(q.trim().length).toBeGreaterThan(0);
        });
      });
    });

    test('all questions are strings', () => {
      Object.values(DEFAULT_QUESTIONS).forEach((questions) => {
        questions.forEach((q) => {
          expect(typeof q).toBe('string');
        });
      });
    });

    test('questions are question format (end with ?)', () => {
      const allQuestions = Object.values(DEFAULT_QUESTIONS).flat();
      const nonQuestions = allQuestions.filter((q) => !q.includes('?'));
      expect(nonQuestions.length).toBe(0);
    });
  });

  describe('question themes by category', () => {
    test('school questions relate to education', () => {
      const schoolQuestions = DEFAULT_QUESTIONS.school.join(' ').toLowerCase();
      const hasEducationTheme = schoolQuestions.includes('school') ||
        schoolQuestions.includes('education') ||
        schoolQuestions.includes('degree') ||
        schoolQuestions.includes('college');
      expect(hasEducationTheme).toBe(true);
    });

    test('career questions relate to work/profession', () => {
      const careerQuestions = DEFAULT_QUESTIONS.career.join(' ').toLowerCase();
      const hasCareerTheme = careerQuestions.includes('career') ||
        careerQuestions.includes('job') ||
        careerQuestions.includes('work') ||
        careerQuestions.includes('promotion');
      expect(hasCareerTheme).toBe(true);
    });

    test('money questions relate to finance', () => {
      const moneyQuestions = DEFAULT_QUESTIONS.money.join(' ').toLowerCase();
      const hasMoneyTheme = moneyQuestions.includes('money') ||
        moneyQuestions.includes('financial') ||
        moneyQuestions.includes('cost') ||
        moneyQuestions.includes('budget');
      expect(hasMoneyTheme).toBe(true);
    });

    test('moving questions relate to location/relocation', () => {
      const movingQuestions = DEFAULT_QUESTIONS.moving.join(' ').toLowerCase();
      const hasMovingTheme = movingQuestions.includes('move') ||
        movingQuestions.includes('location') ||
        movingQuestions.includes('relocat') ||
        movingQuestions.includes('city');
      expect(hasMovingTheme).toBe(true);
    });

    test('business questions relate to business decisions', () => {
      const businessQuestions = DEFAULT_QUESTIONS.business.join(' ').toLowerCase();
      const hasBusinessTheme = businessQuestions.includes('business') ||
        businessQuestions.includes('risk') ||
        businessQuestions.includes('mentor') ||
        businessQuestions.includes('strategy');
      expect(hasBusinessTheme).toBe(true);
    });

    test('personal_goals questions relate to personal growth', () => {
      const goalsQuestions = DEFAULT_QUESTIONS.personal_goals.join(' ').toLowerCase();
      const hasGoalsTheme = goalsQuestions.includes('goal') ||
        goalsQuestions.includes('future') ||
        goalsQuestions.includes('matter') ||
        goalsQuestions.includes('holding');
      expect(hasGoalsTheme).toBe(true);
    });
  });

  describe('question depth', () => {
    test('questions ask about priorities', () => {
      const allQuestions = Object.values(DEFAULT_QUESTIONS).flat();
      const priorityQuestions = allQuestions.filter((q) =>
        q.toLowerCase().includes('priorit')
      );
      expect(priorityQuestions.length).toBeGreaterThan(0);
    });

    test('questions ask about constraints', () => {
      const allQuestions = Object.values(DEFAULT_QUESTIONS).flat();
      const constraintQuestions = allQuestions.filter((q) =>
        q.toLowerCase().includes('constraint')
      );
      expect(constraintQuestions.length).toBeGreaterThan(0);
    });

    test('questions ask about worst-case scenarios', () => {
      const allQuestions = Object.values(DEFAULT_QUESTIONS).flat();
      const worstCaseQuestions = allQuestions.filter((q) =>
        q.toLowerCase().includes('worst')
      );
      expect(worstCaseQuestions.length).toBeGreaterThan(0);
    });

    test('questions ask about regrets', () => {
      const allQuestions = Object.values(DEFAULT_QUESTIONS).flat();
      const regretQuestions = allQuestions.filter((q) =>
        q.toLowerCase().includes('regret')
      );
      expect(regretQuestions.length).toBeGreaterThan(0);
    });
  });

  describe('consistency across categories', () => {
    test('all categories start with priorities question', () => {
      const categories: DecisionCategory[] = [
        'school', 'career', 'money', 'moving', 'business', 'personal_goals', 'other',
      ];

      categories.forEach((cat) => {
        const firstQuestion = DEFAULT_QUESTIONS[cat][0];
        expect(firstQuestion.toLowerCase()).toContain('priorit');
      });
    });

    test('all categories ask about constraints', () => {
      const categories: DecisionCategory[] = [
        'school', 'career', 'money', 'moving', 'business', 'personal_goals', 'other',
      ];

      categories.forEach((cat) => {
        const secondQuestion = DEFAULT_QUESTIONS[cat][1];
        expect(secondQuestion.toLowerCase()).toContain('constraint');
      });
    });

    test('no category has duplicate questions', () => {
      Object.entries(DEFAULT_QUESTIONS).forEach(([cat, questions]) => {
        const unique = new Set(questions);
        expect(unique.size).toBe(questions.length);
      });
    });
  });
});