// Gemini Schemas — Zod schemas for validating AI output
import { z } from 'zod';

// Individual score dimensions for an option
const geminiScoreSchema = z.object({
  regretRisk: z.number().int().min(0).max(100).describe('Risk of future regret (0-100, lower is better)'),
  confidence: z.number().int().min(0).max(100).describe('Confidence in outcome (0-100)'),
  valuesAlignment: z.number().int().min(0).max(100).describe('Alignment with stated values (0-100)'),
  reversibility: z.number().int().min(0).max(100).describe('How reversible is this choice (0-100)'),
  risk: z.number().int().min(0).max(100).describe('Overall risk level (0-100, lower is better)'),
});

// Single option score from Gemini
const geminiOptionScoreSchema = z.object({
  optionId: z.string().uuid().describe('UUID of the option'),
  optionTitle: z.string().min(1).max(200).describe('Title of the option'),
  overallScore: z.number().int().min(0).max(100).describe('Weighted overall score (0-100)'),
  scores: geminiScoreSchema,
  reasoning: z.string().min(20).max(1000).describe('Detailed reasoning for the scores'),
});

// Main analysis output schema
export const geminiDecisionAnalysisSchema = z.object({
  optionScores: z.array(geminiOptionScoreSchema).min(2).max(5).describe('Scores for each option'),
  summary: z.string().min(50).max(2000).describe('Executive summary of the analysis'),
  factorsConsidered: z.array(z.string().min(5).max(200)).min(3).max(10).describe('Key factors considered'),
  confidenceLevel: z.number().int().min(0).max(100).describe('Overall confidence in analysis (0-100)'),
  uncertaintyNotes: z.array(z.string().min(10).max(300)).min(1).max(5).describe('What remains uncertain'),
  hiddenAssumptions: z.array(z.string().min(10).max(200)).min(1).max(5).describe('Unstated assumptions identified'),
  missingInformation: z.array(z.string().min(10).max(200)).min(0).max(5).describe('Information that would improve analysis'),
  nextSteps: z.array(z.string().min(10).max(300)).min(1).max(5).describe('Recommended next actions'),
});

// Clarifying questions schema
export const geminiClarifyingQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().min(10).max(200).describe('The clarifying question'),
      whyItMatters: z.string().min(20).max(300).describe('Why this information is important'),
    })
  ).min(1).max(5),
  missingContext: z.string().min(20).max(500).describe('Summary of what context is missing'),
});

// Decision review schema (for post-decision analysis)
export const geminiDecisionReviewSchema = z.object({
  outcomePrediction: z.string().min(30).max(1000).describe('What was expected to happen vs likely actual outcome'),
  lessonsIdentified: z.array(z.string().min(10).max(300)).min(1).max(5).describe('Key lessons from this decision'),
  patternsDetected: z.array(z.string().min(10).max(200)).min(0).max(3).describe('Recurring patterns in user\'s decision making'),
  futureRecommendations: z.array(z.string().min(10).max(300)).min(1).max(3).describe('How to apply lessons to future decisions'),
  accuracyEstimate: z.number().int().min(0).max(100).describe('How accurate the original analysis was (0-100)'),
});

// Bias detection schema
export const biasWarningSchema = z.object({
  bias_name: z.string().min(2).describe('The cognitive bias name'),
  description: z.string().min(10).describe('Why this bias is manifesting'),
  context_in_decision: z.string().min(10).describe('Where in the text this appears'),
  mitigation_strategy: z.string().min(20).describe('Actionable step to counteract this bias'),
});

export const biasDetectionArraySchema = z.array(biasWarningSchema).max(3);

// Type exports for TypeScript usage
export type GeminiDecisionAnalysis = z.infer<typeof geminiDecisionAnalysisSchema>;
export type GeminiClarifyingQuestions = z.infer<typeof geminiClarifyingQuestionsSchema>;
export type GeminiDecisionReview = z.infer<typeof geminiDecisionReviewSchema>;
export type GeminiOptionScore = z.infer<typeof geminiOptionScoreSchema>;
export type BiasWarning = z.infer<typeof biasWarningSchema>;

// Safe parser that returns structured error info
export function safeParseGeminiAnalysis(data: unknown): {
  success: boolean;
  data?: GeminiDecisionAnalysis;
  errors?: string[];
} {
  const result = geminiDecisionAnalysisSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
  return { success: false, errors };
}

export function safeParseBiasDetection(data: unknown): {
  success: boolean;
  data?: BiasWarning[];
  errors?: string[];
} {
  const result = biasDetectionArraySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
  return { success: false, errors };
}

