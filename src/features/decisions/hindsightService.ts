// Hindsight Service — Generates AI-powered hindsight comparison after review
// This is the "path not taken" analysis that creates the intellectual dopamine hit
import { supabase } from '@/lib/supabase';
import { HindsightComparison, HindsightReviewInput } from './hindsightTypes';

/**
 * Generate a hindsight comparison by calling the edge function.
 * This runs AFTER a user submits a decision review.
 */
export async function generateHindsightComparison(
  decisionId: string,
  input: HindsightReviewInput,
): Promise<HindsightComparison | null> {
  const { data, error } = await supabase.functions.invoke('hindsight-comparison', {
    body: { decisionId, input },
  });

  if (error || !data?.comparison) {
    if (!error) {
      console.error('Hindsight generation failed: no comparison returned');
    }
    return null;
  }

  return data.comparison as HindsightComparison;
}

/**
 * Save a hindsight report to the database.
 */
export async function saveHindsightReport(
  decisionId: string,
  comparison: HindsightComparison,
): Promise<void> {
  const { error } = await supabase
    .from('hindsight_reports')
    .upsert({
      decision_id: decisionId,
      comparison,
    }, { onConflict: 'decision_id' });

  if (error) {
    console.error('Failed to save hindsight report:', error);
  }
}

/**
 * Fetch an existing hindsight report for a decision.
 */
export async function fetchHindsightReport(decisionId: string): Promise<HindsightComparison | null> {
  const { data, error } = await supabase
    .from('hindsight_reports')
    .select('comparison')
    .eq('decision_id', decisionId)
    .single();

  if (error || !data) {
    return null;
  }

  return (data as { comparison: HindsightComparison }).comparison;
}
