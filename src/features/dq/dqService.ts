// DQ Service — Decision Quotient computation and persistence
// Unifies: Calibration Accuracy + Bias Mitigation + Decision Velocity + Review Consistency
import { supabase } from '@/lib/supabase';
import { DqScore, DecisionArchetype, PredictionCalibration, DecisionVelocityEntry, getArchetype } from './dqTypes';

/**
 * Compute full DQ score from all sub-scores.
 * DQ = (Calibration × 0.4) + (BiasMitigation × 0.3) + (Velocity × 0.2) + (ReviewRate × 0.1)
 */
export function computeDqScore(
  calibrationAccuracy: number,
  biasMitigationRate: number,
  velocityScore: number,
  reviewConsistency: number,
): number {
  return Math.round(
    (calibrationAccuracy * 0.4) +
    (biasMitigationRate * 0.3) +
    (velocityScore * 0.2) +
    (reviewConsistency * 0.1)
  );
}

/**
 * Compute calibration accuracy from prediction history.
 * Lower calibration error = higher accuracy.
 */
export function computeCalibrationAccuracy(predictions: Array<{
  calibrationError: number | null;
  isAccurate: boolean | null;
}>): number {
  const resolved = predictions.filter(p => p.isAccurate !== null);
  if (resolved.length === 0) return 50; // Neutral start

  const accurate = resolved.filter(p => p.isAccurate).length;
  return Math.round((accurate / resolved.length) * 100);
}

/**
 * Compute velocity score based on optimal speed ranges.
 * Scores higher when decisions are made within optimal time windows.
 */
export function computeVelocityScore(entries: DecisionVelocityEntry[]): number {
  if (entries.length === 0) return 50; // Neutral start

  const optimal = entries.filter(e => e.wasOptimal).length;
  return Math.round((optimal / entries.length) * 100);
}

/**
 * Compute review consistency.
 */
export function computeReviewConsistency(totalDecisions: number, totalReviews: number): number {
  if (totalDecisions === 0) return 0;
  return Math.round((totalReviews / totalDecisions) * 100);
}

/**
 * Fetch all data needed for DQ computation.
 */
export async function fetchDqData(userId: string): Promise<{
  predictions: PredictionCalibration[];
  velocities: DecisionVelocityEntry[];
  biasMitigationRate: number;
  totalDecisions: number;
  totalReviews: number;
  previousDq: number | null;
}> {
  // Fetch predictions
  const { data: predictions } = await supabase
    .from('prediction_calibrations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Fetch velocity entries
  const { data: velocities } = await supabase
    .from('decision_velocity_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Fetch CBMI from bias profile
  const { data: biasProfile } = await supabase
    .from('user_bias_profiles')
    .select('current_cbmi, total_bias_mitigations, total_decisions_with_bias_checks')
    .eq('user_id', userId)
    .single();

  // Get counts from user stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_decisions_made, total_reviews_completed, total_quick_reviews')
    .eq('id', userId)
    .single();

  // Also count quick reviews
  const { count: quickReviewCount } = await supabase
    .from('quick_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Get previous DQ score
  const { data: prevDq } = await supabase
    .from('dq_scores')
    .select('overall')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const totalReviews = ((profile as any)?.total_reviews_completed ?? 0) + (quickReviewCount ?? 0);

  return {
    predictions: (predictions as PredictionCalibration[]) || [],
    velocities: (velocities as DecisionVelocityEntry[]) || [],
    biasMitigationRate: (biasProfile as any)?.current_cbmi ?? 0,
    totalDecisions: (profile as any)?.total_decisions_made ?? 0,
    totalReviews,
    previousDq: (prevDq as any)?.overall ?? null,
  };
}

/**
 * Save DQ score to database.
 */
export async function saveDqScore(userId: string, dq: DqScore): Promise<void> {
  await supabase.from('dq_scores').insert({
    user_id: userId,
    overall: dq.overall,
    calibration_accuracy: dq.calibrationAccuracy,
    bias_mitigation_rate: dq.biasMitigationRate,
    velocity_score: dq.velocityScore,
    review_consistency: dq.reviewConsistency,
    archetype: dq.archetype,
    trend: dq.trend,
  });
}

/**
 * Save a prediction calibration entry.
 */
export async function savePredictionCalibration(
  userId: string,
  decisionId: string,
  predictedSatisfaction: number,
  predictedConfidence: number,
): Promise<void> {
  await supabase.from('prediction_calibrations').insert({
    user_id: userId,
    decision_id: decisionId,
    predicted_satisfaction: predictedSatisfaction,
    predicted_confidence: predictedConfidence,
  });
}

/**
 * Update prediction with actual outcome (on review).
 */
export async function resolvePredictionCalibration(
  decisionId: string,
  actualSatisfaction: number,
): Promise<void> {
  const { data: prediction } = await supabase
    .from('prediction_calibrations')
    .select('*')
    .eq('decision_id', decisionId)
    .single();

  if (!prediction) return;

  const predicted = (prediction as any).predicted_satisfaction;
  const calibrationError = Math.abs(predicted - actualSatisfaction);
  const isAccurate = calibrationError <= 1;

  await supabase
    .from('prediction_calibrations')
    .update({
      actual_satisfaction: actualSatisfaction,
      calibration_error: calibrationError,
      is_accurate: isAccurate,
    })
    .eq('id', (prediction as any).id);
}

/**
 * Log a decision velocity entry.
 */
export async function logDecisionVelocity(
  userId: string,
  decisionId: string,
  dilemmaToDecisionHours: number,
  importance: number,
): Promise<void> {
  // Optimal speed varies by importance:
  // Low importance (1-3): 0-24 hours
  // Medium importance (4-7): 24-168 hours (1-7 days)
  // High importance (8-10): 168-720 hours (1-30 days)
  let optimalMinHours: number;
  let optimalMaxHours: number;

  if (importance <= 3) {
    optimalMinHours = 0;
    optimalMaxHours = 24;
  } else if (importance <= 7) {
    optimalMinHours = 24;
    optimalMaxHours = 168;
  } else {
    optimalMinHours = 168;
    optimalMaxHours = 720;
  }

  const wasOptimal = dilemmaToDecisionHours >= optimalMinHours && dilemmaToDecisionHours <= optimalMaxHours;

  await supabase.from('decision_velocity_log').insert({
    user_id: userId,
    decision_id: decisionId,
    dilemma_to_decision_hours: dilemmaToDecisionHours,
    was_optimal: wasOptimal,
    optimal_min_hours: optimalMinHours,
    optimal_max_hours: optimalMaxHours,
  });
}
