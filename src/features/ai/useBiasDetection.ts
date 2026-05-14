// useBiasDetection — Hook for real-time bias detection during drafting
// Implements debounced calling to avoid excessive API costs
import { useState, useEffect, useRef, useCallback } from 'react';
import { detectBiases } from './detectBiasService';
import { safeParseBiasDetection, BiasWarning } from './geminiSchemas';

interface UseBiasDetectionOptions {
  /** Debounce delay in ms before triggering AI detection. Default: 1500 */
  debounceMs?: number;
  /** Minimum text length before detection triggers. Default: 50 */
  minTextLength?: number;
  /** Enable/disable bias detection. Default: true */
  enabled?: boolean;
}

interface UseBiasDetectionReturn {
  /** Active bias warnings for the current draft text */
  warnings: BiasWarning[];
  /** Whether AI is currently analyzing text */
  isAnalyzing: boolean;
  /** Whether a bias detection has ever fired for this session */
  hasDetected: boolean;
  /** Total biases found this session */
  totalDetected: number;
  /** Manually trigger analysis (bypasses debounce) */
  forceAnalyze: () => void;
  /** Reset detection state (e.g. on decision submit) */
  reset: () => void;
}

export function useBiasDetection(
  decisionTitle: string,
  draftContext: string,
  userAnswers: Record<string, string>,
  options: UseBiasDetectionOptions = {},
): UseBiasDetectionReturn {
  const {
    debounceMs = 1500,
    minTextLength = 50,
    enabled = true,
  } = options;

  const [warnings, setWarnings] = useState<BiasWarning[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasDetected, setHasDetected] = useState(false);
  const [totalDetected, setTotalDetected] = useState(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAnalyzedRef = useRef<string>('');

  const runDetection = useCallback(async (context: string, answers: string) => {
    if (!enabled || context.length < minTextLength) return;
    if (context === lastAnalyzedRef.current) return;

    setIsAnalyzing(true);
    lastAnalyzedRef.current = context;

    try {
      const result = await detectBiases(decisionTitle, context, answers);
      const parsed = safeParseBiasDetection(result.biases);

      if (parsed.success && parsed.data && parsed.data.length > 0) {
        setWarnings(parsed.data);
        setHasDetected(true);
        setTotalDetected(prev => prev + parsed.data!.length);
      } else {
        // Clear warnings if no longer biased
        setWarnings([]);
      }
    } catch {
      // Silently fail — bias detection is a "nice to have" feature
    } finally {
      setIsAnalyzing(false);
    }
  }, [decisionTitle, enabled, minTextLength]);

  // Debounced effect on draft text changes
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const answersText = Object.entries(userAnswers)
      .filter(([, v]) => v.trim().length > 0)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    debounceTimerRef.current = setTimeout(() => {
      runDetection(draftContext, answersText);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [draftContext, userAnswers, debounceMs, runDetection]);

  const forceAnalyze = useCallback(() => {
    const answersText = Object.entries(userAnswers)
      .filter(([, v]) => v.trim().length > 0)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    runDetection(draftContext, answersText);
  }, [draftContext, userAnswers, runDetection]);

  const reset = useCallback(() => {
    setWarnings([]);
    setIsAnalyzing(false);
    setHasDetected(false);
    setTotalDetected(0);
    lastAnalyzedRef.current = '';
  }, []);

  return {
    warnings,
    isAnalyzing,
    hasDetected,
    totalDetected,
    forceAnalyze,
    reset,
  };
}
