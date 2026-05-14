// Check Usage Limit Edge Function
// Server-side enforcement of free tier analysis limits

declare global {
  namespace Deno {
    namespace env {
      function get(key: string): string | undefined;
    }
    function serve(handler: (req: Request) => Promise<Response>): void;
  }
}

// @ts-ignore - External module import for Deno edge function
import { createClient } from '@supabase/supabase-js';

// Usage limits — single source of truth
const FREE_MONTHLY_ANALYSES = 3;
const PLUS_MONTHLY_ANALYSES = 50;
const PRO_MONTHLY_ANALYSES = 200;

// Allowed origins
const ALLOWED_ORIGINS = [
  'https://decisionos.app',
  'https://www.decisionos.app',
  'capacitor://localhost',
  'http://localhost:8081',
  'http://localhost:19006',
  'exp://192.168.',
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && isOriginAllowed(origin) ? origin : 'https://decisionos.app';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

interface UsageCheckResponse {
  canAnalyze: boolean;
  tier: 'free' | 'plus' | 'pro';
  analysesUsed: number;
  analysesLimit: number;
  analysesRemaining: number;
  reason?: string;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication via JWT
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Derive userId from JWT — never trust request body for userId
    const userId = user.id;

    // Check user's subscription tier
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw new Error(`Failed to fetch profile: ${profileError.message}`);
    }

    const tier = profile?.subscription_tier || 'free';

    // Tier-based limits
    if (tier === 'plus') {
      const response: UsageCheckResponse = {
        canAnalyze: true,
        tier: 'plus',
        analysesUsed: 0,
        analysesLimit: PLUS_MONTHLY_ANALYSES,
        analysesRemaining: PLUS_MONTHLY_ANALYSES,
      };
      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (tier === 'pro') {
      const response: UsageCheckResponse = {
        canAnalyze: true,
        tier: 'pro',
        analysesUsed: 0,
        analysesLimit: PRO_MONTHLY_ANALYSES,
        analysesRemaining: PRO_MONTHLY_ANALYSES,
      };
      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Free users: count analyses this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setMilliseconds(-1);

    const { count, error: countError } = await supabaseAdmin
      .from('ai_usage_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('event_type', 'analysis')
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString());

    if (countError) {
      throw new Error(`Failed to count analyses: ${countError.message}`);
    }

    const analysesUsed = count || 0;
    const analysesRemaining = Math.max(0, FREE_MONTHLY_ANALYSES - analysesUsed);
    const canAnalyze = analysesUsed < FREE_MONTHLY_ANALYSES;

    const response: UsageCheckResponse = {
      canAnalyze,
      tier: 'free',
      analysesUsed,
      analysesLimit: FREE_MONTHLY_ANALYSES,
      analysesRemaining,
      reason: canAnalyze ? undefined : 'Free tier limited to 3 analyses per month. Upgrade to Plus for 50 analyses per month.',
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});