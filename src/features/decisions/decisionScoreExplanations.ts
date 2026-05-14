// Decision Score Explanations
// Human-readable explanations for AI-generated scores

import { DecisionScoreName } from './decisionTypes';

export interface ScoreExplanation {
  name: DecisionScoreName;
  label: string;
  description: string;
  highScoreMeaning: string;
  lowScoreMeaning: string;
  warningCopy: string;
  tooltipText: string;
}

// Score explanations for UI display
export const SCORE_EXPLANATIONS: Record<DecisionScoreName, ScoreExplanation> = {
  regret_risk: {
    name: 'regret_risk',
    label: 'Regret Risk',
    description: 'How likely you might look back and wish you had chosen differently.',
    highScoreMeaning: 'Lower regret risk — This option aligns well with your values and has clear, reversible outcomes.',
    lowScoreMeaning: 'Higher regret risk — This option may create lingering doubts or is hard to undo.',
    warningCopy: '⚠️ High regret risk detected. Consider what would make this choice easier to live with.',
    tooltipText: 'Measures potential for future regret based on values alignment and reversibility.',
  },
  confidence: {
    name: 'confidence',
    label: 'Confidence',
    description: 'Your gut feeling and logical certainty about this option working out.',
    highScoreMeaning: 'High confidence — You have good information and this feels right.',
    lowScoreMeaning: 'Low confidence — Uncertainty remains. More information or reflection may help.',
    warningCopy: '⚠️ Low confidence score. It may help to gather more information or sleep on it.',
    tooltipText: 'Reflects both emotional confidence and factual certainty.',
  },
  values_alignment: {
    name: 'values_alignment',
    label: 'Values Alignment',
    description: 'How well this option matches what matters most to you.',
    highScoreMeaning: 'Strong alignment — This option supports your core values and long-term goals.',
    lowScoreMeaning: 'Weak alignment — This option may conflict with what you truly care about.',
    warningCopy: '⚠️ Values misalignment detected. Consider if this tradeoff is truly worth it.',
    tooltipText: 'Measures alignment with your stated values and priorities.',
  },
  reversibility: {
    name: 'reversibility',
    label: 'Reversibility',
    description: 'How easily you can undo this decision if it doesn\'t work out.',
    highScoreMeaning: 'Highly reversible — Easy to change course with minimal cost or consequence.',
    lowScoreMeaning: 'Hard to reverse — Significant commitment with lasting consequences.',
    warningCopy: '⚠️ This decision is difficult to reverse. Make sure you\'re comfortable with that.',
    tooltipText: 'Higher scores mean easier to undo; lower scores mean more permanent commitment.',
  },
  risk: {
    name: 'risk',
    label: 'Risk Level',
    description: 'Potential downside if this option doesn\'t go as hoped.',
    highScoreMeaning: 'Lower risk — Worst-case scenario is manageable.',
    lowScoreMeaning: 'Higher risk — Significant downside potential if things go wrong.',
    warningCopy: '⚠️ Elevated risk detected. Consider mitigation strategies or a safer alternative.',
    tooltipText: 'Assesses potential negative outcomes and their severity.',
  },
};

// Get explanation for a specific score
export function getScoreExplanation(scoreName: DecisionScoreName): ScoreExplanation {
  return SCORE_EXPLANATIONS[scoreName];
}

// Interpret a score value (0-100)
export function interpretScore(scoreName: DecisionScoreName, value: number): string {
  const explanation = SCORE_EXPLANATIONS[scoreName];

  if (value >= 75) {
    return explanation.highScoreMeaning;
  }
  if (value >= 50) {
    return `${explanation.label} is moderate. ${explanation.description}`;
  }
  if (value >= 25) {
    return `${explanation.label} is below average. ${explanation.lowScoreMeaning}`;
  }
  return explanation.warningCopy;
}

// Get overall recommendation based on scores
export function getOverallRecommendation(scores: Record<DecisionScoreName, number>): string {
  const values: number[] = Object.keys(scores).map((k) => scores[k as DecisionScoreName]);
  const average = values.reduce((a: number, b: number) => a + b, 0) / values.length;

  if (average >= 75) {
    return 'This option scores very well across all dimensions. Strong candidate for your decision.';
  }
  if (average >= 60) {
    return 'This option has solid scores with some tradeoffs. Review the lower-scoring areas before deciding.';
  }
  if (average >= 40) {
    return 'This option has notable concerns. Consider whether the benefits outweigh the risks shown.';
  }
  return 'This option shows significant concerns across multiple dimensions. Strong consideration of alternatives recommended.';
}

// Format score for display (0-100 -> visual representation)
export function formatScore(value: number): { text: string; color: string } {
  if (value >= 80) {
    return { text: `${value}/100 — Excellent`, color: '#4ADE80' };
  }
  if (value >= 60) {
    return { text: `${value}/100 — Good`, color: '#60A5FA' };
  }
  if (value >= 40) {
    return { text: `${value}/100 — Fair`, color: '#FBBF24' };
  }
  return { text: `${value}/100 — Needs Attention`, color: '#F87171' };
}

// Score comparison helper
export function compareScores(
  scoreA: Record<DecisionScoreName, number>,
  scoreB: Record<DecisionScoreName, number>
): { winner: 'A' | 'B' | 'tie'; differences: Record<DecisionScoreName, number> } {
  const dimensions: DecisionScoreName[] = ['regret_risk', 'confidence', 'values_alignment', 'reversibility', 'risk'];
  const weights = [0.25, 0.25, 0.2, 0.15, 0.15];

  const weightedA = dimensions.reduce((sum, dim, i) => sum + (scoreA[dim] * weights[i]), 0);
  const weightedB = dimensions.reduce((sum, dim, i) => sum + (scoreB[dim] * weights[i]), 0);

  const differences = dimensions.reduce((diffs, dim) => ({
    ...diffs,
    [dim]: scoreA[dim] - scoreB[dim],
  }), {} as Record<DecisionScoreName, number>);

  if (Math.abs(weightedA - weightedB) < 5) {
    return { winner: 'tie', differences };
  }

  return {
    winner: weightedA > weightedB ? 'A' : 'B',
    differences,
  };
}
