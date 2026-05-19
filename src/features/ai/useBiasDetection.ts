import { useState, useRef, useCallback } from 'react';
import { detectBiases } from './detectBiasService';
import { safeParseBiasDetection, BiasWarning } from './geminiSchemas';

interface UseBiasDetectionOptions {
  enabled?: boolean;
}

interface UseBiasDetectionReturn {
  warnings: BiasWarning[];
  isAnalyzing: boolean;
  hasDetected: boolean;
  isUnavailable: boolean;
  totalDetected: number;
  analyze: () => Promise<void>;
  reset: () => void;
}

export function useBiasDetection(
  decisionTitle: string,
  draftContext: string,
  userAnswers: Record<string, string>,
  options: UseBiasDetectionOptions = {},
): UseBiasDetectionReturn {
  const { enabled = true } = options;

  const [warnings, setWarnings] = useState<BiasWarning[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasDetected, setHasDetected] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [totalDetected, setTotalDetected] = useState(0);
  const lastAnalyzedRef = useRef<string>('');

  const analyze = useCallback(async () => {
    if (!enabled) return;

    const answersText = Object.entries(userAnswers)
      .filter(([, v]) => v.trim().length > 0)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    const fullContext = `${draftContext}\n${answersText}`.trim();
    if (fullContext.length < 50) return;
    if (fullContext === lastAnalyzedRef.current) return;

    setIsAnalyzing(true);
    lastAnalyzedRef.current = fullContext;

    try {
      const result = await detectBiases(decisionTitle, draftContext, answersText);
      if (result.status === 'unavailable') {
        setIsUnavailable(true);
        setWarnings([]);
        return;
      }
      setIsUnavailable(false);
      const parsed = safeParseBiasDetection(result.biases);

      if (parsed.success && parsed.data && parsed.data.length > 0) {
        setWarnings(parsed.data);
        setHasDetected(true);
        setTotalDetected(prev => prev + parsed.data!.length);
      } else {
        setWarnings([]);
      }
    } catch {
    } finally {
      setIsAnalyzing(false);
    }
  }, [decisionTitle, draftContext, userAnswers, enabled]);

  const reset = useCallback(() => {
    setWarnings([]);
    setIsAnalyzing(false);
    setHasDetected(false);
    setIsUnavailable(false);
    setTotalDetected(0);
    lastAnalyzedRef.current = '';
  }, []);

  return {
    warnings,
    isAnalyzing,
    hasDetected,
    isUnavailable,
    totalDetected,
    analyze,
    reset,
  };
}
