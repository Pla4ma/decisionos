// Output validation — validates Gemini's JSON response structure
// Includes deterministic post-processing checks for reliability

export interface ValidationContext {
  expectedOptionIds: string[];
  category?: string;
}

export function validateAnalysisOutput(data: unknown, context?: ValidationContext): { valid: boolean; errors?: string[] } {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Response must be an object'] };
  }

  const d = data as Record<string, unknown>;
  const errors: string[] = [];

  if (!Array.isArray(d.optionScores) || d.optionScores.length < 2) {
    errors.push('optionScores must be an array with at least 2 items');
  } else {
    // Validate each option score
    d.optionScores.forEach((opt: unknown, idx: number) => {
      if (!opt || typeof opt !== 'object') {
        errors.push(`optionScores[${idx}] must be an object`);
        return;
      }
      const o = opt as Record<string, unknown>;

      if (typeof o.optionId !== 'string') errors.push(`optionScores[${idx}].optionId must be a string`);
      if (typeof o.optionTitle !== 'string' || o.optionTitle.length < 1) errors.push(`optionScores[${idx}].optionTitle must be a non-empty string`);
      if (typeof o.overallScore !== 'number' || o.overallScore < 0 || o.overallScore > 100) errors.push(`optionScores[${idx}].overallScore must be between 0 and 100`);
      if (typeof o.reasoning !== 'string' || o.reasoning.length < 20) errors.push(`optionScores[${idx}].reasoning must be at least 20 characters`);

      if (!o.scores || typeof o.scores !== 'object') {
        errors.push(`optionScores[${idx}].scores must be an object`);
      } else {
        const s = o.scores as Record<string, number>;
        ['regretRisk', 'confidence', 'valuesAlignment', 'reversibility', 'risk'].forEach((field) => {
          if (typeof s[field] !== 'number' || s[field] < 0 || s[field] > 100) {
            errors.push(`optionScores[${idx}].scores.${field} must be a number between 0 and 100`);
          }
        });
      }
    });

    // Check for hallucinated option IDs
    if (context?.expectedOptionIds && context.expectedOptionIds.length > 0) {
      d.optionScores.forEach((opt: unknown, idx: number) => {
        if (opt && typeof opt === 'object') {
          const o = opt as Record<string, string>;
          if (o.optionId && !context.expectedOptionIds!.includes(o.optionId)) {
            errors.push(`optionScores[${idx}].optionId "${o.optionId}" does not match any actual option. Expected: ${context.expectedOptionIds.join(', ')}`);
          }
        }
      });
    }

    // Check for duplicate option IDs
    const seenIds = new Set<string>();
    d.optionScores.forEach((opt: unknown, idx: number) => {
      if (opt && typeof opt === 'object') {
        const o = opt as Record<string, string>;
        if (o.optionId) {
          if (seenIds.has(o.optionId)) {
            errors.push(`Duplicate optionId "${o.optionId}" at optionScores[${idx}]`);
          }
          seenIds.add(o.optionId);
        }
      }
    });
  }

  if (typeof d.confidenceLevel !== 'number' || d.confidenceLevel < 0 || d.confidenceLevel > 100) {
    errors.push('confidenceLevel must be a number between 0 and 100');
  }

  if (typeof d.summary !== 'string' || d.summary.length < 50) {
    errors.push('summary must be a string with at least 50 characters');
  }

  // Check that factorsConsidered is present (even if it changed from the old format)
  if (d.factorsConsidered !== undefined && (!Array.isArray(d.factorsConsidered) || d.factorsConsidered.length < 1)) {
    errors.push('factorsConsidered must be a non-empty array if provided');
  }

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}
