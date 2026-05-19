import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { verifyUser } from '../_shared/auth.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user, supabase } = await verifyUser(req);

    // Fetch all user-owned data in parallel
    const [
      { data: decisions },
      { data: options },
      { data: answers },
      { data: analysis },
      { data: reviews },
      { data: insights },
      { data: forecasts },
      { data: reflections },
      { data: journal },
      { data: profile },
    ] = await Promise.all([
      supabase.from('decisions').select('*').eq('user_id', user.id),
      supabase.from('decision_options').select('*').eq('user_id', user.id),
      supabase.from('decision_answers').select('*').eq('user_id', user.id),
      supabase.from('decision_analysis').select('*').eq('user_id', user.id),
      supabase.from('decision_reviews').select('*').eq('user_id', user.id),
      supabase.from('pattern_insights').select('*').eq('user_id', user.id),
      supabase.from('decision_forecasts').select('*').eq('user_id', user.id),
      supabase.from('decision_reflections').select('*').eq('user_id', user.id),
      supabase.from('decision_journal').select('*').eq('user_id', user.id),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      profile: profile || null,
      decisions: decisions || [],
      decision_options: options || [],
      decision_answers: answers || [],
      decision_analysis: analysis || [],
      decision_reviews: reviews || [],
      pattern_insights: insights || [],
      decision_forecasts: forecasts || [],
      decision_reflections: reflections || [],
      decision_journal: journal || [],
    };

    return new Response(
      JSON.stringify(exportData, null, 2),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="decisionos-export-${user.id.slice(0, 8)}.json"`,
        },
      },
    );
  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Export failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
