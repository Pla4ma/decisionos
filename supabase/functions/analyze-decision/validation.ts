// Output validation — validates Gemini's JSON response structure

export function validateAnalysisOutput(data: unknown): { valid: boolean; errors?: string[] } {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Response must be an object'] };
  }

  const d = data as Record<string, unknown>;
  const errors: string[] = [];

  if (!Array.isArray(d.optionScores) || d.optionScores.length < 2) {
    errors.push('optionScores must be an array with at least 2 items');
  }

  if (!Array.isArray(d.factorsConsidered) || d.factorsConsidered.length < 3) {
    errors.push('factorsConsidered must be an array with at least 3 items');
  }

  if (!Array.isArray(d.uncertaintyNotes) || d.uncertaintyNotes.length < 1) {
    errors.push('uncertaintyNotes must be an array with at least 1 item');
  }

  if (!Array.isArray(d.hiddenAssumptions) || d.hiddenAssumptions.length < 1) {
    errors.push('hiddenAssumptions must be an array with at least 1 item');
  }

  if (!Array.isArray(d.nextSteps) || d.nextSteps.length < 1) {
    errors.push('nextSteps must be an array with at least 1 item');
  }

  if (typeof d.summary !== 'string' || d.summary.length < 50) {
    errors.push('summary must be a string with at least 50 characters');
  }

  if (typeof d.confidenceLevel !== 'number' || d.confidenceLevel < 0 || d.confidenceLevel > 100) {
    errors.push('confidenceLevel must be a number between 0 and 100');
  }

  if (Array.isArray(d.optionScores)) {
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
  }

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}
