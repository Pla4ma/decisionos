import { useState, useRef, useCallback } from 'react';
import { detectBiases, BiasDetectionStatus } from './detectBiasService';
import { safeParseBiasDetection, BiasWarning } from './geminiSchemas';

export type BiasAnalysisStatus = 'idle' | 'checking' | BiasDetectionStatus;

interface UseBiasDetectionReturn {
  warnings: BiasWarning[];
  status: BiasAnalysisStatus;
  totalDetected: number;
  reasoning: string;
  analyze: () => Promise<void>;
  reset: () => void;
}

export function useBiasDetection(
  decisionTitle: string,
  draftContext: string,
  userAnswers: Record<string, string>,
): UseBiasDetectionReturn {
  const [warnings, setWarnings] = useState<BiasWarning[]>([]);
  const [status, setStatus] = useState<BiasAnalysisStatus>('idle');
  const [totalDetected, setTotalDetected] = useState(0);
  const [reasoning, setReasoning] = useState('');
  const lastAnalyzedRef = useRef<string>('');

  const analyze = useCallback(async () => {
    const answersText = Object.entries(userAnswers)
      .filter(([, v]) => v.trim().length > 0)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    const fullContext = `${draftContext}\n${answersText}`.trim();
    if (fullContext === lastAnalyzedRef.current) return;
    if (fullContext.length < 30) {
      setStatus('input_too_short');
      setReasoning('Write more about your decision to detect thinking traps.');
      return;
    }

    setStatus('checking');
    lastAnalyzedRef.current = fullContext;

    try {
      const result = await detectBiases(decisionTitle, draftContext, answersText);

      setStatus(result.status);

      if (result.status === 'biases_found') {
        const parsed = safeParseBiasDetection(result.biases);
        if (parsed.success && parsed.data && parsed.data.length > 0) {
          setWarnings(parsed.data);
          setTotalDetected(prev => prev + parsed.data!.length);
          setReasoning(`Found ${parsed.data.length} potential thinking trap${parsed.data.length > 1 ? 's' : ''}. These are common patterns — the goal is awareness, not judgment.`);
        } else {
          setWarnings([]);
          setReasoning('');
        }
      } else if (result.status === 'no_biases_found') {
        setWarnings([]);
        setReasoning('No clear thinking traps detected. Your reasoning looks balanced.');
      } else if (result.status === 'quota_exceeded') {
        setWarnings([]);
        setReasoning('Monthly bias check limit reached. Upgrade to continue using this feature.');
      } else if (result.status === 'unavailable') {
        setWarnings([]);
        setReasoning('Bias detection is temporarily unavailable. Please try again later.');
      } else if (result.status === 'input_too_short') {
        setWarnings([]);
        setReasoning('Add more detail to your answers for a meaningful bias check.');
      }
    } catch {
      setStatus('unavailable');
      setReasoning('Something went wrong. Please try again.');
    }
  }, [decisionTitle, draftContext, userAnswers]);

  const reset = useCallback(() => {
    setWarnings([]);
    setStatus('idle');
    setTotalDetected(0);
    setReasoning('');
    lastAnalyzedRef.current = '';
  }, []);

  return { warnings, status, totalDetected, reasoning, analyze, reset };
}
