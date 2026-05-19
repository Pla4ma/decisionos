// Shared usage-checking utilities for Edge Functions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getMonthlyLimit, getLimitExceededMessage, AiEventType } from './limits.ts';

export interface UsageResult {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  message: string;
}

export async function checkUsageLimit(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  eventType: AiEventType = 'deep_analysis',
): Promise<UsageResult> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  const tier = profile?.subscription_tier || 'free';
  const limit = getMonthlyLimit(tier, eventType);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count: usageCount } = await supabase
    .from('ai_usage_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', eventType)
    .gte('created_at', startOfMonth);

  const used = usageCount ?? 0;
  const allowed = used < limit;
  const remaining = Math.max(0, limit - used);

  return {
    allowed,
    used,
    limit,
    remaining,
    message: allowed ? `${remaining} ${eventType} uses remaining this month` : getLimitExceededMessage(eventType),
  };
}

export interface UsageEventMetadata {
  function?: string;
  provider?: string;
  model?: string;
  input_size?: number;
  output_size?: number;
  latency_ms?: number;
  success?: boolean;
  error_type?: string;
  was_fallback_used?: boolean;
  was_json_repaired?: boolean;
  decision_id?: string;
  decision_category?: string;
  biases_found?: number;
  option_count?: number;
  [key: string]: unknown;
}

export async function logUsageEvent(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  eventType: AiEventType,
  metadata: UsageEventMetadata = {},
): Promise<void> {
  await supabase.from('ai_usage_events').insert({
    user_id: userId,
    event_type: eventType,
    metadata: {
      provider: metadata.provider || 'gemini',
      model: metadata.model || 'gemini-1.5-flash',
      ...metadata,
    },
  }).catch(() => {});
}
