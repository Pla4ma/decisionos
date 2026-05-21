// Decision Business Rules
// Centralized constants and business logic for decisions

import { DecisionCategory } from './decisionTypes';

// Re-export for components
export type { DecisionCategory };

// Decision content limits
export const DECISION_RULES = {
  // Title
  MIN_TITLE_LENGTH: 5,
  MAX_TITLE_LENGTH: 200,

  // Context/description
  MAX_CONTEXT_LENGTH: 2000,

  // Options
  MIN_OPTIONS: 2,
  MAX_OPTIONS: 5,
  MIN_OPTION_TITLE_LENGTH: 2,
  MAX_OPTION_TITLE_LENGTH: 100,
  MAX_OPTION_DESCRIPTION_LENGTH: 500,
  MAX_PROS_CONS: 10,
  MAX_PRO_CON_LENGTH: 200,

  // Analysis
  FREE_MONTHLY_ANALYSES: 3,
  PRACTICE_ANALYSES_UNLIMITED: true,
  MIN_SCORE: 0,
  MAX_SCORE: 100,

  // Importance/Urgency
  MIN_IMPORTANCE: 1,
  MAX_IMPORTANCE: 10,
  MIN_URGENCY: 1,
  MAX_URGENCY: 10,

  // Review scheduling
  REVIEW_OPTIONS_DAYS: [7, 30, 90] as const,
  MAX_REVIEW_NOTES_LENGTH: 2000,
  MAX_LESSONS_LENGTH: 1000,

  // Answers
  MAX_ANSWER_LENGTH: 1000,
} as const;

// Allowed categories for MVP (no medical/legal/investment)
export const ALLOWED_CATEGORIES: DecisionCategory[] = [
  'school',
  'career',
  'money',
  'moving',
  'business',
  'personal_goals',
  'other',
];

// Unsafe categories (redirect to professionals)
export const UNSAFE_CATEGORIES = [
  'medical',
  'health',
  'mental_health',
  'legal',
  'investment',
  'safety',
  'crisis',
  'self_harm',
  'relationship_abuse',
] as const;

// Decision status flow (valid transitions)
export const STATUS_FLOW: Record<string, string[]> = {
  draft: ['questions', 'ready_for_analysis', 'archived'],
  questions: ['draft', 'ready_for_analysis', 'archived'],
  ready_for_analysis: ['analyzed', 'archived'],
  analyzed: ['chosen', 'archived'],
  chosen: ['review_scheduled', 'quick_reviewed', 'archived'],
  quick_reviewed: ['review_scheduled', 'reviewed', 'archived'],
  review_scheduled: ['reviewed', 'archived'],
  reviewed: ['archived'],
  archived: [],
};

// Score dimensions with weights for overall calculation
export const SCORE_DIMENSIONS = {
  regret_risk: { weight: 0.25, label: 'Regret Risk' },
  confidence: { weight: 0.25, label: 'Confidence' },
  values_alignment: { weight: 0.2, label: 'Values Alignment' },
  reversibility: { weight: 0.15, label: 'Reversibility' },
  risk: { weight: 0.15, label: 'Risk Level' },
} as const;

// Default guided questions by category
export const DEFAULT_QUESTIONS: Record<DecisionCategory, string[]> = {
  school: [
    'What are your top priorities for this decision?',
    'What constraints (time, money, location) are you working with?',
    'Who else is affected by this decision?',
    'What\'s the worst-case scenario for each option?',
    'What would you choose if you weren\'t worried about others\' opinions?',
  ],
  career: [
    'What are your top priorities for this decision?',
    'What constraints (time, money, location) are you working with?',
    'How does this align with your 5-year goals?',
    'What would make you regret each option in 10 years?',
    'What does your gut say when you imagine each outcome?',
  ],
  money: [
    'What are your top priorities for this decision?',
    'What constraints (time, money, location) are you working with?',
    'How does this impact your financial security?',
    'What\'s the opportunity cost of each option?',
    'Can you reverse this decision if needed?',
  ],
  moving: [
    'What are your top priorities for this decision?',
    'What constraints (time, money, location) are you working with?',
    'How will this affect your daily life?',
    'What are you leaving behind vs gaining?',
    'Can you test this decision before committing fully?',
  ],
  business: [
    'What are your top priorities for this decision?',
    'What constraints (time, money, location) are you working with?',
    'What\'s the risk/reward balance?',
    'How does this align with your business values?',
    'What would a mentor advise?',
  ],
  personal_goals: [
    'What are your top priorities for this decision?',
    'What constraints (time, money, location) are you working with?',
    'Why does this goal matter to you?',
    'What\'s holding you back from deciding?',
    'What would future-you thank you for?',
  ],
  other: [
    'What are your top priorities for this decision?',
    'What constraints (time, money, location) are you working with?',
    'What\'s the core dilemma?',
    'What are you afraid of with each option?',
    'What would you advise a friend in this situation?',
  ],
};

// Category display names
export const CATEGORY_LABELS: Record<DecisionCategory, string> = {
  school: 'Education & School',
  career: 'Career & Work',
  money: 'Financial',
  moving: 'Moving & Location',
  business: 'Business',
  personal_goals: 'Personal Goals',
  other: 'Other',
};

// Check if a category is unsafe for AI advice
export function isUnsafeCategory(category: string): boolean {
  return (UNSAFE_CATEGORIES as readonly string[]).indexOf(category) >= 0;
}

// Get appropriate redirect message for unsafe category
export function getUnsafeCategoryMessage(category: string): string {
  const messages: Record<string, string> = {
    medical: 'Medical decisions require professional healthcare advice. Please consult a qualified medical professional.',
    health: 'Health decisions require professional medical advice. Please consult a healthcare provider.',
    mental_health: 'Mental health decisions deserve professional support. Please reach out to a mental health professional or crisis line.',
    legal: 'Legal matters require professional legal counsel. Please consult a qualified attorney.',
    investment: 'Investment decisions should involve a qualified financial advisor. Please consult a professional.',
    safety: 'Safety decisions may require immediate professional help. Please contact appropriate emergency services.',
    crisis: 'If you are in crisis, please contact emergency services or a crisis helpline immediately.',
    self_harm: 'Your wellbeing is important. Please contact a crisis helpline or mental health professional.',
    relationship_abuse: 'If you are in an unhealthy relationship, support is available. Contact the National Domestic Violence Hotline at 1-800-799-7233.',
  };
  return messages[category] || 'This type of decision requires professional guidance.';
}
