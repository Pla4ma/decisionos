import { getCorsHeaders } from '../_shared/cors.ts';
import { getClient } from '../_shared/auth.ts';
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { encodeToString } from "https://deno.land/std@0.177.0/encoding/hex.ts";

interface RevenueCatEvent {
  event: string;
  product_id: string;
  app_user_id: string;
  expiration_at_ms?: number;
  purchased_at_ms?: number;
  type?: string;
  period_type?: string;
  store?: string;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('x-signature');
    const secret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');

    if (!signature || !secret) {
      return new Response('Missing signature or secret', { status: 401, headers: corsHeaders });
    }

    const body = await req.text();

    // HMAC-SHA256 verification
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    const expectedSigBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(body)
    );
    const expectedSig = encodeToString(new Uint8Array(expectedSigBytes));

    if (signature !== expectedSig) {
      return new Response('Invalid signature', { status: 401, headers: corsHeaders });
    }

    const event: RevenueCatEvent = JSON.parse(body);

    if (!event.event || !event.app_user_id) {
      return new Response('Invalid event payload', { status: 400, headers: corsHeaders });
    }

    const supabase = getClient();

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
      case 'PRODUCT_CHANGE':
        await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_expires_at: expiresAt,
          })
          .eq('id', event.app_user_id);

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

      case 'REFUND':
      case 'BILLING_ISSUE':
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

      case 'UNCANCELLATION':
        await supabase
          .from('subscriptions')
          .update({ tier, expires_at: expiresAt })
          .eq('user_id', event.app_user_id);
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
