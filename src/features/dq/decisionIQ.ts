export interface DecisionIQScore {
  overall: number;
  components: {
    analysisCompleteness: number;
    reviewConsistency: number;
    biasAwareness: number;
    decisionVelocity: number;
    streakConsistency: number;
    reflectionDepth: number;
  };
  level: string;
  nextLevelAt: number;
  percentile: number;
}

export interface UserStats {
  totalDecisions: number;
  analyzedDecisions: number;
  reviewedDecisions: number;
  quickReviews: number;
  biasEventsDetected: number;
  biasEventsMitigated: number;
  totalDecisionsMade: number;
  currentStreak: number;
  longestStreak: number;
  daysActive: number;
  reflectionEntries: number;
}

export function calculateDecisionIQ(stats: UserStats): DecisionIQScore {
  const analysisRate = stats.totalDecisions > 0 ? stats.analyzedDecisions / stats.totalDecisions : 0;
  const reviewRate = stats.analyzedDecisions > 0 ? stats.reviewedDecisions / stats.analyzedDecisions : 0;
  const biasRate = stats.biasEventsDetected > 0 ? stats.biasEventsMitigated / stats.biasEventsDetected : 0;
  const velocity = stats.daysActive > 0 ? stats.totalDecisionsMade / stats.daysActive : 0;
  const streakConsistency = stats.longestStreak > 0 ? stats.currentStreak / Math.max(stats.longestStreak, 1) : 0;
  const reflectionRate = stats.totalDecisions > 0 ? stats.reflectionEntries / stats.totalDecisions : 0;

  const analysisCompleteness = Math.round(clamp(analysisRate * 100, 0, 100));
  const reviewConsistency = Math.round(clamp(reviewRate * 100, 0, 100));
  const biasAwareness = Math.round(clamp(biasRate * 100, 0, 100));
  const decisionVelocity = Math.round(clamp(Math.min(velocity / 0.5, 1) * 100, 0, 100));
  const streakScore = Math.round(clamp(streakConsistency * 100, 0, 100));
  const reflectionDepth = Math.round(clamp(reflectionRate * 100, 0, 100));

  const overall = Math.round(
    analysisCompleteness * 0.20 +
    reviewConsistency * 0.25 +
    biasAwareness * 0.15 +
    decisionVelocity * 0.10 +
    streakScore * 0.15 +
    reflectionDepth * 0.15
  );

  return {
    overall,
    components: {
      analysisCompleteness,
      reviewConsistency,
      biasAwareness,
      decisionVelocity,
      streakConsistency: streakScore,
      reflectionDepth,
    },
    level: getLevel(overall),
    nextLevelAt: getNextLevelThreshold(overall),
    percentile: clamp((overall * 0.8 + 10), 1, 99),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const LEVELS = [
  { min: 0, name: 'Novice Decider' },
  { min: 20, name: 'Aware Decider' },
  { min: 40, name: 'Thoughtful Decider' },
  { min: 60, name: 'Strategic Decider' },
  { min: 75, name: 'Master Decider' },
  { min: 90, name: 'Grandmaster Decider' },
] as const;

function getLevel(score: number): string {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].min) return LEVELS[i].name;
  }
  return LEVELS[0].name;
}

function getNextLevelThreshold(score: number): number {
  for (const level of LEVELS) {
    if (score < level.min) return level.min;
  }
  return 100;
}

export const IQ_INSIGHTS = {
  analysisCompleteness: {
    high: 'You consistently analyze your decisions — a hallmark of clear thinking.',
    low: 'Try analyzing more decisions to uncover blind spots and improve outcomes.',
  },
  reviewConsistency: {
    high: 'Exceptional review habit. You learn from every outcome.',
    low: 'Reviews turn experience into wisdom. Schedule reviews for past decisions.',
  },
  biasAwareness: {
    high: 'You recognize cognitive biases in real-time — rare and powerful.',
    low: 'Biases shape every decision. Start by learning the most common ones.',
  },
  decisionVelocity: {
    high: 'You make decisions efficiently without rushing.',
    low: 'Slow decisions cost opportunities. Try the Quick Decision feature.',
  },
  streakConsistency: {
    high: 'Remarkable consistency. Your Decision IQ compounds daily.',
    low: 'Daily check-ins build momentum. Even 30 seconds counts.',
  },
  reflectionDepth: {
    high: 'Deep reflection separates good from great decision-makers.',
    low: 'Capture what you learn from each decision to accelerate growth.',
  },
} as const;
