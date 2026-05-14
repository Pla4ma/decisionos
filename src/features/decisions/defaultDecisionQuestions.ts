// Default Decision Questions
// Category-agnostic guided questions for all decisions

export interface DecisionQuestion {
  key: string;
  question: string;
  hint?: string;
  required: boolean;
  order: number;
}

export const DEFAULT_DECISION_QUESTIONS: DecisionQuestion[] = [
  {
    key: 'what_matters_most',
    question: 'What matters most in this decision?',
    hint: 'If you could only optimize for one thing, what would it be?',
    required: true,
    order: 1,
  },
  {
    key: 'biggest_fear',
    question: 'What are you afraid might happen?',
    hint: 'What\'s the worst-case scenario you\'re trying to avoid?',
    required: true,
    order: 2,
  },
  {
    key: 'future_self',
    question: 'What would future-you thank you for?',
    hint: 'Imagine yourself 1 year from now looking back...',
    required: true,
    order: 3,
  },
  {
    key: 'cost_of_waiting',
    question: 'What is the cost of waiting?',
    hint: 'What happens if you delay this decision?',
    required: true,
    order: 4,
  },
  {
    key: 'easiest_option',
    question: 'Which option feels easiest right now?',
    hint: 'Don\'t overthink it — what\'s your gut saying?',
    required: false,
    order: 5,
  },
  {
    key: 'best_long_term',
    question: 'Which option seems best long-term?',
    hint: 'Looking at the next year or more, what stands out?',
    required: false,
    order: 6,
  },
  {
    key: 'missing_info',
    question: 'What information are you missing?',
    hint: 'Is there something you need to know before choosing?',
    required: false,
    order: 7,
  },
];

export function getRequiredQuestions(): DecisionQuestion[] {
  return DEFAULT_DECISION_QUESTIONS.filter(q => q.required);
}

export function getOptionalQuestions(): DecisionQuestion[] {
  return DEFAULT_DECISION_QUESTIONS.filter(q => !q.required);
}

export function getAllQuestions(): DecisionQuestion[] {
  return [...DEFAULT_DECISION_QUESTIONS].sort((a, b) => a.order - b.order);
}
