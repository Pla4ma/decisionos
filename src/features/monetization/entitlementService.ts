// Entitlement Service
// Centralized entitlement and usage limit checking

import { supabase } from '@/lib/supabase';
import { UsageLimitStatus, SubscriptionTier, Entitlement } from './monetizationTypes';
import { getCurrentTier, hasEntitlement } from './revenueCatService';

const FREE_MONTHLY_ANALYSES = 3;

// Check if user can perform an analysis
export async function canPerformAnalysis(userId: string): Promise<UsageLimitStatus> {
  // Get user's subscription tier
  const tier = await getCurrentTier();

  // Plus users have unlimited analyses
  if (tier === 'plus' || tier === 'pro') {
    return {
      tier,
      analysesUsed: 0,
      analysesLimit: Infinity,
      analysesRemaining: Infinity,
      periodStart: getMonthStart(),
      periodEnd: getMonthEnd(),
      canAnalyze: true,
    };
  }

  // Free users: check server-side usage count
  const usage = await getMonthlyAnalysisUsage(userId);

  return {
    tier: 'free',
    analysesUsed: usage.count,
    analysesLimit: FREE_MONTHLY_ANALYSES,
    analysesRemaining: Math.max(0, FREE_MONTHLY_ANALYSES - usage.count),
    periodStart: usage.periodStart,
    periodEnd: usage.periodEnd,
    canAnalyze: usage.count < FREE_MONTHLY_ANALYSES,
  };
}

// Check specific entitlement
export async function checkEntitlement(entitlement: Entitlement): Promise<boolean> {
  return hasEntitlement(entitlement);
}

// Get monthly analysis usage from database
async function getMonthlyAnalysisUsage(userId: string): Promise<{
  count: number;
  periodStart: string;
  periodEnd: string;
}> {
  const monthStart = getMonthStart();
  const monthEnd = getMonthEnd();

  try {
    // Count analyses this month from decision_analysis table
    const { count, error } = await supabase
      .from('decision_analysis')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd);

    if (error) throw error;

    return {
      count: count || 0,
      periodStart: monthStart,
      periodEnd: monthEnd,
    };
  } catch (error) {
    console.error('Failed to get usage:', error);
    // Default to allowing if we can't determine (graceful degradation)
    return {
      count: 0,
      periodStart: monthStart,
      periodEnd: monthEnd,
    };
  }
}

// Record an analysis being performed
export async function recordAnalysis(userId: string): Promise<void> {
  // This is implicitly tracked by the decision_analysis table records
  // No separate tracking needed — we count records in canPerformAnalysis
}

// Get month start date (ISO string)
function getMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

// Get month end date (ISO string)
function getMonthEnd(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
}

// Format remaining analyses for display
export function formatRemainingAnalyses(remaining: number): string {
  if (remaining === Infinity) return 'Unlimited';
  return `${remaining} remaining this month`;
}
