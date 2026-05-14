// DQ Types — Decision Quotient: Unified intelligence metric
// Merges: CBMI + Calibration Accuracy + Decision Velocity + Review Consistency
// This is the ONE number the user cares about

export type DecisionArchetype =
  | 'gambler'       // DQ < 30: Impulsive, poor predictions
  | 'overthinker'   // DQ 30-49: Analysis paralysis
  | 'learner'       // DQ 50-69: Improving, learning from reviews
  | 'decisive'      // DQ 70-84: Balanced speed + accuracy
  | 'sage';         // DQ 85+: Exceptional judgment

export const ARCHETYPE_DEFINITIONS: Record<DecisionArchetype, {
  title: string;
  description: string;
  minDq: number;
  color: string;
  nextLevel: string;
}> = {
  gambler: {
    title: 'The Gambler',
    description: 'Decisions driven by impulse. Predictions miss the mark. Start by slowing down and using the bias detection tool.',
    minDq: 0,
    color: '#F87171',
    nextLevel: 'Review past decisions to spot patterns',
  },
  overthinker: {
    title: 'The Overthinker',
    description: 'You analyze thoroughly but struggle to commit. Speed is your growth lever.',
    minDq: 30,
    color: '#FBBF24',
    nextLevel: 'Trust your analysis and decide faster',
  },
  learner: {
    title: 'The Learner',
    description: 'You make solid decisions and learn from outcomes. Your prediction accuracy is improving.',
    minDq: 50,
    color: '#60A5FA',
    nextLevel: 'Focus on calibrating your predictions',
  },
  decisive: {
    title: 'The Decisive',
    description: 'Balanced speed, strong accuracy, consistent reviews. You know when to trust your gut.',
    minDq: 70,
    color: '#4ADE80',
    nextLevel: 'Aim for mastery — coach others',
  },
  sage: {
    title: 'The Sage',
    description: 'Exceptional judgment. Your predictions are almost always calibrated. You make complex decisions look effortless.',
    minDq: 85,
    color: '#5EE7D4',
    nextLevel: 'You\'ve reached the pinnacle',
  },
};

export interface DqScore {
  overall: number;               // 0-100, the ONE number
  calibrationAccuracy: number;   // 0-100: how well predictions match outcomes
  biasMitigationRate: number;    // 0-100: CBMI score
  velocityScore: number;         // 0-100: optimal speed score
  reviewConsistency: number;     // 0-100: % of decisions reviewed
  archetype: DecisionArchetype;
  trend: 'rising' | 'stable' | 'declining';
  updatedAt: string;
}

export interface PredictionCalibration {
  id: string;
  decisionId: string;
  predictedSatisfaction: number;     // 1-5
  predictedConfidence: number;       // 0-100%
  actualSatisfaction: number | null; // 1-5 (filled in on review)
  actualOutcome: number | null;      // 0-100 (filled in on review)
  calibrationError: number | null;   // |predicted - actual|
  isAccurate: boolean | null;        // within 1 point?
  createdAt: string;
}

export interface DecisionVelocityEntry {
  id: string;
  decisionId: string;
  dilemmaToDecisionHours: number;
  wasOptimal: boolean;          // Between optimal min/max for this decision type
  optimalMinHours: number;
  optimalMaxHours: number;
  createdAt: string;
}

export function getArchetype(dq: number): DecisionArchetype {
  if (dq >= 85) return 'sage';
  if (dq >= 70) return 'decisive';
  if (dq >= 50) return 'learner';
  if (dq >= 30) return 'overthinker';
  return 'gambler';
}
