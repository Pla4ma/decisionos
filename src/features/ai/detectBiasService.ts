import { supabase } from '@/lib/supabase';
import { BiasWarning } from './geminiSchemas';

export interface BiasDetectionResult {
  biases: BiasWarning[];
  status: 'available' | 'unavailable';
  reason?: string;
}

export async function detectBiases(
  decisionTitle: string,
  draftContext: string,
  userAnswers: string,
): Promise<BiasDetectionResult> {
  if (draftContext.length < 30) {
    return { biases: [], status: 'available' };
  }

  const { data, error } = await supabase.functions.invoke('detect-bias', {
    body: { decisionTitle, draftContext, userAnswers },
  });

  if (error) {
    console.error('Bias detection error:', error);
    return { biases: [], status: 'unavailable', reason: 'service_error' };
  }

  if (data?.status === 'unavailable') {
    return { biases: [], status: 'unavailable', reason: data.reason || 'temporarily_unavailable' };
  }

  return {
    biases: (data?.biases ?? []) as BiasWarning[],
    status: data?.status || 'available',
  };
}
