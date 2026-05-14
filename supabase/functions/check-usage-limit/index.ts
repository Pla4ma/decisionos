// Check Usage Limit Edge Function
// Server-side enforcement of free tier analysis limits

// Type declarations for Deno
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

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Free tier limit
const FREE_MONTHLY_ANALYSES = 3;

interface UsageCheckRequest {
  userId: string;
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const { userId }: UsageCheckRequest = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Check user's subscription tier from profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw new Error(`Failed to fetch profile: ${profileError.message}`);
    }

    const tier = profile?.subscription_tier || 'free';

    // Plus/Pro users have unlimited access
    if (tier === 'plus' || tier === 'pro') {
      const response: UsageCheckResponse = {
        canAnalyze: true,
        tier,
        analysesUsed: 0,
        analysesLimit: Infinity,
        analysesRemaining: Infinity,
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
      .from('decision_analysis')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
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
      reason: canAnalyze ? undefined : 'Free tier limited to 3 analyses per month. Upgrade to Plus for unlimited.',
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
