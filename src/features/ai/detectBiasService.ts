// Detect Bias Service — Client service for real-time bias detection
// Calls the detect-bias Edge Function during decision drafting
import { supabase } from '@/lib/supabase';
import { BiasWarning } from './geminiSchemas';

export interface BiasDetectionResult {
  biases: BiasWarning[];
}

/**
 * Detect cognitive biases in draft text in real-time.
 * Returns empty array if no biases detected or if text is too short.
 * Debounced calling is expected from the consumer hook.
 */
export async function detectBiases(
  decisionTitle: string,
  draftContext: string,
  userAnswers: string,
): Promise<BiasDetectionResult> {
  if (draftContext.length < 30) {
    return { biases: [] };
  }

  const { data, error } = await supabase.functions.invoke('detect-bias', {
    body: { decisionTitle, draftContext, userAnswers },
  });

  if (error) {
    console.error('Bias detection error:', error);
    return { biases: [] };
  }

  return {
    biases: (data?.biases ?? []) as BiasWarning[],
  };
}
