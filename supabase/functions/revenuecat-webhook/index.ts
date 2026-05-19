import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface RevenueCatEvent {
  event: string;
  product_id: string;
  app_user_id: string;
  expiration_at_ms?: number;
  purchased_at_ms?: number;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const event: RevenueCatEvent = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Map RevenueCat product IDs to tiers
    const tierMap: Record<string, string> = {
      'decisionos_plus_monthly': 'plus',
      'decisionos_plus_annual': 'plus',
      'decisionos_pro_monthly': 'pro',
      'decisionos_pro_annual': 'pro',
    };

    const tier = tierMap[event.product_id] || 'free';
    const expiresAt = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;

    switch (event.event) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'PURCHASE':
        // Update profile with active subscription
        await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_expires_at: expiresAt,
          })
          .eq('id', event.app_user_id);

        // Upsert subscription record
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: event.app_user_id,
            revenuecat_customer_id: event.app_user_id,
            tier,
            expires_at: expiresAt,
          }, { onConflict: 'user_id' });
        break;

      case 'CANCELLATION':
      case 'EXPIRATION':
        // Downgrade to free upon cancellation/expiration
        await supabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_expires_at: null,
          })
          .eq('id', event.app_user_id);

        await supabase
          .from('subscriptions')
          .update({ tier: 'free', expires_at: null })
          .eq('user_id', event.app_user_id);
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Webhook processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
