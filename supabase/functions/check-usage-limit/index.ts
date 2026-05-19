// Check Usage Limit Edge Function
// Server-side enforcement of free tier analysis limits

import { getCorsHeaders } from '../_shared/cors.ts';
import { verifyUser } from '../_shared/auth.ts';
import { checkUsageLimit } from '../_shared/usage.ts';
import { handleError } from '../_shared/errors.ts';
import type { AiEventType } from '../_shared/limits.ts';

interface UsageCheckResponse {
  canAnalyze: boolean;
  tier: 'free' | 'plus' | 'pro';
  deepAnalysesUsed: number;
  deepAnalysesLimit: number;
  deepAnalysesRemaining: number;
  biasChecksUsed: number;
  biasChecksLimit: number;
  biasChecksRemaining: number;
  reason?: string;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user, supabase } = await verifyUser(req);

    // Check deep analysis usage
    const deepUsage = await checkUsageLimit(supabase, user.id, 'deep_analysis' as AiEventType);
    const biasUsage = await checkUsageLimit(supabase, user.id, 'bias_detection' as AiEventType);

    // Determine tier from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const tier = (profile?.subscription_tier || 'free') as 'free' | 'plus' | 'pro';

    const response: UsageCheckResponse = {
      canAnalyze: deepUsage.allowed,
      tier,
      deepAnalysesUsed: deepUsage.used,
      deepAnalysesLimit: deepUsage.limit,
      deepAnalysesRemaining: deepUsage.remaining,
      biasChecksUsed: biasUsage.used,
      biasChecksLimit: biasUsage.limit,
      biasChecksRemaining: biasUsage.remaining,
      reason: deepUsage.allowed ? undefined : deepUsage.message,
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (error) {
    return handleError(error, corsHeaders);
  }
});
