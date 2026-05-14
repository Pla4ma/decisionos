// Usage limit checking — tier-based analysis limits

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export const FREE_MONTHLY_ANALYSES = 3;
export const PLUS_MONTHLY_ANALYSES = 50;
export const PRO_MONTHLY_ANALYSES = 200;

function getLimitForTier(tier: string): number {
  switch (tier) {
    case 'pro': return PRO_MONTHLY_ANALYSES;
    case 'plus': return PLUS_MONTHLY_ANALYSES;
    default: return FREE_MONTHLY_ANALYSES;
  }
}

export async function checkUsageLimit(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<{ allowed: boolean; limit: number; usage: number; message?: string }> {
  // Determine user's tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  const tier = profile?.subscription_tier || 'free';
  const limit = getLimitForTier(tier);

  // Count usage this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count: usageCount, error: usageError } = await supabase
    .from('ai_usage_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', 'analysis')
    .gte('created_at', startOfMonth);

  if (usageError) {
    console.error('Usage check error:', usageError);
  }

  const usage = usageCount ?? 0;

  if (usage >= limit) {
    return {
      allowed: false,
      limit,
      usage,
      message: 'Monthly analysis limit reached. Upgrade for more analyses.',
    };
  }

  return { allowed: true, limit, usage };
}
