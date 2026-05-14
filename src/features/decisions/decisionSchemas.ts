// Decision Validation Schemas
// Zod schemas for decision domain validation

import { z } from 'zod';
import { DecisionCategory, DecisionStatus, DecisionScoreName } from './decisionTypes';
import { DECISION_RULES } from './decisionRules';

// Valid categories
const validCategories: DecisionCategory[] = [
  'school', 'career', 'money', 'moving', 'business', 'personal_goals', 'other',
];

// Valid statuses
const validStatuses: DecisionStatus[] = [
  'draft', 'questions', 'ready_for_analysis', 'analyzed', 'chosen', 'review_scheduled', 'reviewed', 'quick_reviewed', 'archived',
];

// Valid score names
const validScoreNames: DecisionScoreName[] = [
  'regret_risk', 'confidence', 'values_alignment', 'reversibility', 'risk',
];

// Decision category schema
export const decisionCategorySchema = z.enum(
  validCategories as [string, ...string[]],
  { message: 'Please select a valid category' }
);

// Decision status schema
export const decisionStatusSchema = z.enum(
  validStatuses as [string, ...string[]]
);

// Create decision input schema
export const createDecisionSchema = z.object({
  title: z
    .string()
    .min(DECISION_RULES.MIN_TITLE_LENGTH, `Title must be at least ${DECISION_RULES.MIN_TITLE_LENGTH} characters`)
    .max(DECISION_RULES.MAX_TITLE_LENGTH, `Title must be under ${DECISION_RULES.MAX_TITLE_LENGTH} characters`),
  context: z
    .string()
    .max(DECISION_RULES.MAX_CONTEXT_LENGTH, `Context must be under ${DECISION_RULES.MAX_CONTEXT_LENGTH} characters`)
    .optional(),
  category: decisionCategorySchema,
  importance: z
    .number()
    .min(1, 'Importance must be at least 1')
    .max(10, 'Importance must be 10 or less'),
  urgency: z
    .number()
    .min(1, 'Urgency must be at least 1')
    .max(10, 'Urgency must be 10 or less'),
  is_practice: z.boolean().optional(),
});

// Decision option schema
export const decisionOptionSchema = z.object({
  title: z
    .string()
    .min(DECISION_RULES.MIN_OPTION_TITLE_LENGTH, `Option title must be at least ${DECISION_RULES.MIN_OPTION_TITLE_LENGTH} characters`)
    .max(DECISION_RULES.MAX_OPTION_TITLE_LENGTH, `Option title must be under ${DECISION_RULES.MAX_OPTION_TITLE_LENGTH} characters`),
  description: z
    .string()
    .max(DECISION_RULES.MAX_OPTION_DESCRIPTION_LENGTH)
    .optional(),
  pros: z
    .array(z.string().max(200))
    .max(10, 'Maximum 10 pros allowed')
    .optional(),
  cons: z
    .array(z.string().max(200))
    .max(10, 'Maximum 10 cons allowed')
    .optional(),
});

// Decision options array schema with min/max validation
export const decisionOptionsArraySchema = z
  .array(decisionOptionSchema)
  .min(
    DECISION_RULES.MIN_OPTIONS,
    `Please add at least ${DECISION_RULES.MIN_OPTIONS} options to compare`
  )
  .max(
    DECISION_RULES.MAX_OPTIONS,
    `Please limit to ${DECISION_RULES.MAX_OPTIONS} options maximum for clarity`
  );

// Decision answer schema
export const decisionAnswerSchema = z.object({
  question_key: z.string().min(1, 'Question key is required'),
  answer: z
    .string()
    .min(1, 'Answer cannot be empty')
    .max(1000, 'Answer must be under 1000 characters'),
});

// Individual score schema (0-100)
export const scoreValueSchema = z
  .number()
  .min(0, 'Score must be at least 0')
  .max(100, 'Score must be 100 or less');

// Score record schema
export const scoresRecordSchema = z.record(
  z.enum(validScoreNames as [string, ...string[]]),
  scoreValueSchema
);

// Option score schema
export const optionScoreSchema = z.object({
  option_id: z.string().uuid(),
  option_title: z.string(),
  overall_score: scoreValueSchema,
  scores: scoresRecordSchema,
  reasoning: z.string().max(500),
});

// Decision analysis schema
export const decisionAnalysisSchema = z.object({
  option_scores: z.array(optionScoreSchema).min(1),
  summary: z.string().max(2000),
  factors_considered: z.array(z.string()).max(20),
  confidence_level: scoreValueSchema,
});

// Decision review schema
export const decisionReviewSchema = z.object({
  chosen_option_id: z.string().uuid('Please select a valid option'),
  outcome_notes: z
    .string()
    .min(10, 'Please provide at least a brief outcome summary')
    .max(2000, 'Outcome notes must be under 2000 characters'),
  satisfaction_score: z
    .number()
    .min(1)
    .max(10)
    .optional(),
  would_choose_same: z.boolean().optional(),
  lessons_learned: z
    .string()
    .max(1000)
    .optional(),
});

// Update decision schema (partial)
export const updateDecisionSchema = createDecisionSchema.partial();

// Decision filter schema
export const decisionFilterSchema = z.object({
  status: decisionStatusSchema.optional(),
  category: decisionCategorySchema.optional(),
  archived: z.boolean().optional(),
  is_practice: z.boolean().optional(),
  chapter_id: z.string().uuid().optional(),
});

// Type exports from schemas
export type CreateDecisionInput = z.infer<typeof createDecisionSchema>;
export type DecisionOptionInput = z.infer<typeof decisionOptionSchema>;
export type DecisionAnswerInput = z.infer<typeof decisionAnswerSchema>;
export type DecisionAnalysisInput = z.infer<typeof decisionAnalysisSchema>;
export type DecisionReviewInput = z.infer<typeof decisionReviewSchema>;
export type DecisionFilterInput = z.infer<typeof decisionFilterSchema>;
