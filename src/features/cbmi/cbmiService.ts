// CBMIService — Client service for CBMI operations
import { supabase } from '@/lib/supabase';
import { UserBiasProfile, CbmiScoreSnapshot } from './cbmiTypes';

/**
 * Log a bias detection event to the database.
 * Called after the user completes a draft with bias warnings shown.
 */
export async function logBiasDetection(params: {
  decisionId: string;
  biasName: string;
  description?: string;
  contextExcerpt?: string;
  mitigationStrategy?: string;
}): Promise<void> {
  const { error } = await supabase
    .from('bias_detection_events')
    .insert({
      decision_id: params.decisionId,
      bias_name: params.biasName,
      description: params.description || null,
      context_excerpt: params.contextExcerpt || null,
      mitigation_strategy: params.mitigationStrategy || null,
      was_acknowledged: true,
    });

  if (error) {
    console.error('Failed to log bias detection:', error);
  }
}

/**
 * Mark a bias event as mitigated (user took action).
 */
export async function markBiasMitigated(eventId: string): Promise<void> {
  await supabase
    .from('bias_detection_events')
    .update({ was_mitigated: true, mitigated_at: new Date().toISOString() })
    .eq('id', eventId);
}

/**
 * Get the user's current bias profile (includes CBMI score and persona).
 */
export async function fetchUserBiasProfile(userId: string): Promise<UserBiasProfile | null> {
  const { data } = await supabase
    .from('user_bias_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  return data as UserBiasProfile | null;
}

/**
 * Get CBMI score history (weekly snapshots) for charting.
 */
export async function fetchCbmiHistory(userId: string, limit = 12): Promise<CbmiScoreSnapshot[]> {
  const { data } = await supabase
    .from('user_cbmi_scores')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })
    .limit(limit);

  return (data as CbmiScoreSnapshot[]) || [];
}

/**
 * Trigger CBMI recalculation on the server.
 */
export async function triggerCbmiRecalculation(userId: string): Promise<void> {
  await supabase.rpc('update_user_bias_profile', { p_user_id: userId });
}
