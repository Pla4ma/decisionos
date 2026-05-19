export interface AnalysisValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateAnalysisOutput(
  analysis: Record<string, unknown>,
  optionIds: string[],
  decisionCategory?: string,
): AnalysisValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const optionScores = analysis.optionScores as Array<Record<string, unknown>> | undefined;

  if (!optionScores || optionScores.length < 2) {
    errors.push('Must have at least 2 option scores');
    return { valid: false, errors, warnings };
  }

  const safetyCategories = ['medical', 'legal', 'financial_investment', 'health'];
  if (decisionCategory && safetyCategories.includes(decisionCategory)) {
    warnings.push('Decision involves a sensitive area — analysis should include disclaimer');
  }

  for (const score of optionScores) {
    const optionId = score.optionId as string | undefined;
    if (!optionId || !optionIds.includes(optionId)) {
      errors.push(`Option ID "${optionId || '(missing)'}" does not match any real option`);
    }

    const overallScore = score.overallScore as number | undefined;
    if (overallScore === undefined || overallScore < 0 || overallScore > 100) {
      errors.push(`Overall score for "${score.optionTitle}" must be 0-100`);
    }
  }

  const summary = analysis.summary as string | undefined;
  if (!summary || summary.length < 30) {
    errors.push('Summary is too short or missing');
  }

  const confidenceLevel = analysis.confidenceLevel as number | undefined;
  if (confidenceLevel !== undefined) {
    if (confidenceLevel > 90) {
      warnings.push('High confidence level — ensure analysis is not overconfident');
    }
    if (optionScores.length <= 2 && confidenceLevel > 70) {
      warnings.push('Confidence should be lower when few options are evaluated');
    }
  }

  if (analysis.recommendation && typeof analysis.recommendation === 'string') {
    const rec = analysis.recommendation as string;
    const absolutePhrases = ['definitely', 'absolutely', 'without question', 'guaranteed', 'always choose'];
    for (const phrase of absolutePhrases) {
      if (rec.toLowerCase().includes(phrase)) {
        warnings.push(`Recommendation uses absolute language: "${phrase}"`);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateBiasOutput(
  biases: Array<Record<string, unknown>>,
): AnalysisValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const diagnosingPhrases = ['you are', 'you have', 'you suffer from', 'you tend to'];
  const emotionalTriggers = ['stupid', 'irrational', 'foolish', 'wrong'];

  for (const bias of biases) {
    const description = (bias.description as string || '').toLowerCase();
    const mitigation = (bias.mitigation_strategy as string || '').toLowerCase();
    const contextExcerpt = (bias.context_in_decision as string || '').toLowerCase();

    if (!bias.bias_name || typeof bias.bias_name !== 'string') {
      errors.push('Bias must have a name');
    }
    if (!bias.context_in_decision || (bias.context_in_decision as string).length < 10) {
      warnings.push('Bias should cite specific text evidence');
    }

    for (const phrase of diagnosingPhrases) {
      if (description.includes(phrase) || mitigation.includes(phrase) || contextExcerpt.includes(phrase)) {
        warnings.push(`Bias description uses diagnosing language: "${phrase}"`);
      }
    }
    for (const trigger of emotionalTriggers) {
      if (description.includes(trigger) || mitigation.includes(trigger)) {
        warnings.push(`Avoid labeling language: "${trigger}"`);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateHindsightOutput(
  comparison: Record<string, unknown>,
): AnalysisValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const pathNotTaken = comparison.path_not_taken as Record<string, unknown> | undefined;
  if (pathNotTaken) {
    const predictedOutcome = (pathNotTaken.predicted_alternative_outcome as string || '').toLowerCase();
    const absolutePhrases = ['would have', 'definitely', 'certainly', 'without a doubt'];
    for (const phrase of absolutePhrases) {
      if (predictedOutcome.includes(phrase)) {
        warnings.push(`Path-not-taken uses absolute language: "${phrase}" — must acknowledge uncertainty`);
      }
    }
  }

  const lessons = comparison.lessons as string[] | undefined;
  if (!lessons || lessons.length === 0) {
    errors.push('Must include at least one lesson tied to the review');
  }

  const growthInsight = comparison.growth_insight as string | undefined;
  if (growthInsight) {
    const shamingPhrases = ['you should have', 'you failed', 'you messed up', 'you were wrong'];
    for (const phrase of shamingPhrases) {
      if (growthInsight.toLowerCase().includes(phrase)) {
        warnings.push(`Growth insight uses shaming language: "${phrase}"`);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
