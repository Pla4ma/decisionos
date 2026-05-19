// Decision Analysis Service — Client service for AI analysis
import { supabase } from '@/lib/supabase';
import { DecisionAnalysis } from './decisionTypes';
import { checkSafety } from '@/features/ai/aiSafety';
import type { SafetyCheckResult } from '@/features/ai/aiSafetyPatterns';

export interface AnalysisError {
  code: string;
  message: string;
  details?: string[];
}

export interface AnalysisResult {
  analysis: DecisionAnalysis;
  rawResponse?: unknown;
}

export interface SafetyPreCheckResult {
  allowed: boolean;
  warning?: SafetyCheckResult;
}


/**
 * Run client-side safety check on decision text before sending to AI.
 * Returns { allowed: false, warning } for crisis categories;
 * { allowed: true, warning } for non-crisis sensitive categories (user can proceed);
 * { allowed: true } for safe decisions.
 */
export function preCheckSafety(decisionText: string): SafetyPreCheckResult {
  const result = checkSafety(decisionText);
  if (result.isSafe) {
    return { allowed: true };
  }
  // Crisis-level categories block entirely
  if (['self_harm', 'abuse_crisis', 'mental_health_crisis', 'medical_emergency', 'legal_emergency'].includes(result.category)) {
    return { allowed: false, warning: result };
  }
  // Advisory categories (e.g. investment) warn but allow
  return { allowed: true, warning: result };
}

/**
 * Analyze a decision using the Gemini-powered Edge Function.
 * This is the ONLY way the client should trigger AI analysis.
 */
export async function analyzeDecision(decisionId: string): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke('analyze-decision', {
    body: { decisionId },
  });

  if (error) {
    throw new AnalysisServiceError(error.message, 'FUNCTION_ERROR');
  }

  if (!data || !data.analysis) {
    throw new AnalysisServiceError('Invalid response from analysis service', 'INVALID_RESPONSE');
  }

  return {
    analysis: data.analysis as DecisionAnalysis,
    rawResponse: data.geminiResult,
  };
}

/**
 * Get existing analysis for a decision from the service layer.
 * Note: For direct DB access, use decisionReadRepository.getDecisionAnalysis
 */
export async function fetchDecisionAnalysis(decisionId: string): Promise<DecisionAnalysis | null> {
  const { data, error } = await supabase
    .from('decision_analysis')
    .select('*')
    .eq('decision_id', decisionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No analysis found
      return null;
    }
    throw new AnalysisServiceError(error.message, 'DATABASE_ERROR');
  }

  return data as DecisionAnalysis;
}

/**
 * Check if user has remaining free analyses this month.
 * Uses ai_usage_events table directly for accurate real-time count.
 * NOTE: Backend Edge Functions are the single source of truth for enforcement.
 * Client-side checks are for UX only — backend always re-verifies.
 */
export async function checkAnalysisUsage(): Promise<{
  used: number;
  limit: number;
  remaining: number;
  hasRemaining: boolean;
}> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new AnalysisServiceError('Not authenticated', 'AUTH_ERROR');
  }

  const { count, error } = await supabase
    .from('ai_usage_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.user.id)
    .eq('event_type', 'deep_analysis')
    .gte('created_at', startOfMonth);

  if (error) {
    console.error('Failed to check analysis limit:', error);
    return { used: 0, limit: 10, remaining: 10, hasRemaining: true };
  }

  const used = count ?? 0;
  const limit = 10; // Free tier: 3 deep analyses/month (must match Edge Functions)
  const remaining = Math.max(0, limit - used);

  return {
    used,
    limit,
    remaining,
    hasRemaining: remaining > 0,
  };
}

/**
 * Custom error class for analysis service.
 */
export class AnalysisServiceError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'AnalysisServiceError';
  }
}

/**
 * Human-readable error messages for common analysis errors.
 */
export function getAnalysisErrorMessage(error: unknown): string {
  if (error instanceof AnalysisServiceError) {
    switch (error.code) {
      case 'AUTH_ERROR':
        return 'Please sign in to analyze decisions.';
      case 'FUNCTION_ERROR':
        return 'Analysis service temporarily unavailable. Please try again.';
      case 'INVALID_RESPONSE':
        return 'Received invalid analysis. Please try again.';
      case 'DATABASE_ERROR':
        return 'Failed to save analysis. Please try again.';
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    // Check for common HTTP status codes in message
    if (error.message.includes('429')) {
      return 'Monthly analysis limit reached. Upgrade for unlimited analyses.';
    }
    if (error.message.includes('404')) {
      return 'Decision not found.';
    }
    if (error.message.includes('403')) {
      return 'You do not have permission to analyze this decision.';
    }
    if (error.message.includes('400')) {
      return 'At least 2 options are required for analysis.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
