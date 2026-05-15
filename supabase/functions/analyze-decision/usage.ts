// Usage limit checking — tier-based analysis limits
// Uses shared limits from _shared/limits.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getMonthlyLimit } from '../_shared/limits.ts';
import type { AiEventType } from '../_shared/limits.ts';

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
  const limit = getMonthlyLimit(tier, 'deep_analysis' as AiEventType);

  // Count usage this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count: usageCount, error: usageError } = await supabase
    .from('ai_usage_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', 'deep_analysis')
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
