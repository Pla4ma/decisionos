import { supabase } from '@/lib/supabase';
import { BiasWarning } from './geminiSchemas';

export type BiasDetectionStatus = 'biases_found' | 'no_biases_found' | 'unavailable' | 'quota_exceeded' | 'input_too_short';

export interface BiasDetectionResult {
  biases: BiasWarning[];
  status: BiasDetectionStatus;
  reason?: string;
}

const INPUT_TOO_SHORT_THRESHOLD = 30;

export async function detectBiases(
  decisionTitle: string,
  draftContext: string,
  userAnswers: string,
): Promise<BiasDetectionResult> {
  const fullContext = `${decisionTitle} ${draftContext} ${userAnswers}`;
  if (fullContext.trim().length < INPUT_TOO_SHORT_THRESHOLD) {
    return { biases: [], status: 'input_too_short', reason: 'Add more context to detect thinking traps' };
  }

  const { data, error } = await supabase.functions.invoke('detect-bias', {
    body: { decisionTitle, draftContext, userAnswers },
  });

  if (error) {
    const msg = (error.message || '').toLowerCase();
    if (msg.includes('quota') || msg.includes('429') || msg.includes('rate limit')) {
      return { biases: [], status: 'quota_exceeded', reason: 'Monthly bias detection limit reached' };
    }
    return { biases: [], status: 'unavailable', reason: 'service_error' };
  }

  if (data?.status === 'unavailable') {
    return { biases: [], status: 'unavailable', reason: data?.reason || 'temporarily_unavailable' };
  }

  const biases = (data?.biases ?? []) as BiasWarning[];

  if (biases.length === 0) {
    return { biases: [], status: 'no_biases_found', reason: 'No thinking traps detected in current input' };
  }

  return {
    biases,
    status: 'biases_found',
  };
}
