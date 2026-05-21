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

export interface QualityValidationOptions {
  contextLength: number;
  optionsCount: number;
  answersCount: number;
  isSensitiveCategory: boolean;
  category: string;
}

export interface QualityValidationResult {
  confidencePenalty: number;
  requiresSoftResponse: boolean;
  missingContextRef: boolean;
}

export function validateAnalysisQuality(
  analysis: Record<string, unknown>,
  options: QualityValidationOptions,
): QualityValidationResult {
  let confidencePenalty = 0;
  let requiresSoftResponse = false;
  let missingContextRef = false;

  const summary = (analysis.summary as string || '').toLowerCase();
  const optionScores = analysis.optionScores as Array<Record<string, unknown>> | undefined;
  const reflectionPrompts = analysis.reflectionPrompts as string[] | undefined;

  // Penalize low-context decisions
  if (options.contextLength < 100) {
    confidencePenalty += 20;
    requiresSoftResponse = true;
  } else if (options.contextLength < 300) {
    confidencePenalty += 10;
  }

  // Penalize few options
  if (options.optionsCount < 3) {
    confidencePenalty += 5;
  }

  // Penalize few answers
  if (options.answersCount < 3) {
    confidencePenalty += 5;
  }

  if (options.isSensitiveCategory) {
    confidencePenalty += 10;
  }

  // Check if summary references the user's actual context
  if (summary.length < 50) {
    missingContextRef = true;
    requiresSoftResponse = true;
  }

  // Check for absolute recommendation language
  const absolutePhrases = ['definitely choose', 'absolutely', 'without question', 'guaranteed', 'best option', 'you should'];
  for (const phrase of absolutePhrases) {
    if (summary.includes(phrase)) {
      requiresSoftResponse = true;
      break;
    }
  }

  // Check if each option's reasoning references that option
  if (optionScores) {
    for (const score of optionScores) {
      const reasoning = (score.reasoning as string || '').toLowerCase();
      const optionTitle = (score.optionTitle as string || '').toLowerCase();
      if (optionTitle && !reasoning.includes(optionTitle.substring(0, 5))) {
        confidencePenalty += 3;
      }
    }
  }

  // Check reflection prompts are specific
  if (reflectionPrompts && reflectionPrompts.length > 0) {
    const vaguePrompts = reflectionPrompts.filter(p => {
      const lower = p.toLowerCase();
      return lower.length < 20 || lower.includes('think about') || lower.includes('consider your options');
    });
    if (vaguePrompts.length > reflectionPrompts.length / 2) {
      confidencePenalty += 5;
    }
  }

  return {
    confidencePenalty: Math.min(confidencePenalty, 50),
    requiresSoftResponse,
    missingContextRef,
  };
}

export function validateBiasOutput(
  biases: unknown[],
): AnalysisValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const diagnosingPhrases = [
    'you are', 'you have', 'you tend to', 'you always', 'you never', 'you suffer from',
  ];
  const emotionalTriggers = ['triggered', 'defensive', 'emotional', 'irrational', 'biased'];

  for (const bias of biases as Array<Record<string, unknown>>) {
    const description = (bias.description as string || '').toLowerCase();
    const mitigation = (bias.mitigation_strategy as string || '').toLowerCase();
    const contextExcerpt = (bias.context_in_decision as string || '').toLowerCase();

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
