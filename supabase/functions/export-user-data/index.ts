import { getCorsHeaders } from '../_shared/cors.ts';
import { verifyUser } from '../_shared/auth.ts';

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user, supabase } = await verifyUser(req);

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

      { data: aiUsageEvents },
      { data: subscriptions },
      { data: dqScores },
      { data: blindSpots },
      { data: cbmiScores },
      { data: biasProfiles },
      { data: calibrations },
      { data: velocityLog },
      { data: futureSelfMessages },
      { data: dailyPractices },
      { data: inbox },
      { data: lifeChapters },
      { data: graveyard },
      { data: velocity },
      { data: predictionAccuracy },
      { data: hindsightReports },
      { data: biasDetectionEvents },
      { data: notificationTokens },
      { data: earnedAnalyses },
      { data: microReviews },
      { data: quickReviews },
      { data: userStreaks },
      { data: dailyStreaks },
      { data: playbooks },
      { data: challengeResponses },
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

      supabase.from('ai_usage_events').select('*').eq('user_id', user.id),
      supabase.from('subscriptions').select('*').eq('user_id', user.id),
      supabase.from('dq_scores').select('*').eq('user_id', user.id),
      supabase.from('user_blind_spots').select('*').eq('user_id', user.id),
      supabase.from('user_cbmi_scores').select('*').eq('user_id', user.id),
      supabase.from('user_bias_profiles').select('*').eq('user_id', user.id),
      supabase.from('prediction_calibrations').select('*').eq('user_id', user.id),
      supabase.from('decision_velocity_log').select('*').eq('user_id', user.id),
      supabase.from('future_self_messages').select('*').eq('user_id', user.id),
      supabase.from('daily_practices').select('*').eq('user_id', user.id),
      supabase.from('decision_inbox').select('*').eq('user_id', user.id),
      supabase.from('life_chapters').select('*').eq('user_id', user.id),
      supabase.from('decision_graveyard').select('*').eq('user_id', user.id),
      supabase.from('decision_velocity').select('*').eq('user_id', user.id),
      supabase.from('prediction_accuracy').select('*').eq('user_id', user.id),
      supabase.from('hindsight_reports').select('*').eq('user_id', user.id),
      supabase.from('bias_detection_events').select('*').eq('user_id', user.id),
      supabase.from('notification_tokens').select('*').eq('user_id', user.id),
      supabase.from('earned_analyses').select('*').eq('user_id', user.id),
      supabase.from('micro_reviews').select('*').eq('user_id', user.id),
      supabase.from('quick_reviews').select('*').eq('user_id', user.id),
      supabase.from('user_streaks').select('*').eq('user_id', user.id),
      supabase.from('daily_streaks').select('*').eq('user_id', user.id),
      supabase.from('decision_playbooks').select('*').eq('user_id', user.id),
      supabase.from('user_challenge_responses').select('*').eq('user_id', user.id),
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

      ai_usage_events: aiUsageEvents || [],
      subscriptions: subscriptions || [],
      dq_scores: dqScores || [],
      user_blind_spots: blindSpots || [],
      user_cbmi_scores: cbmiScores || [],
      user_bias_profiles: biasProfiles || [],
      prediction_calibrations: calibrations || [],
      decision_velocity_log: velocityLog || [],
      future_self_messages: futureSelfMessages || [],
      daily_practices: dailyPractices || [],
      decision_inbox: inbox || [],
      life_chapters: lifeChapters || [],
      decision_graveyard: graveyard || [],
      decision_velocity: velocity || [],
      prediction_accuracy: predictionAccuracy || [],
      hindsight_reports: hindsightReports || [],
      bias_detection_events: biasDetectionEvents || [],
      notification_tokens: notificationTokens || [],
      earned_analyses: earnedAnalyses || [],
      micro_reviews: microReviews || [],
      quick_reviews: quickReviews || [],
      user_streaks: userStreaks || [],
      daily_streaks: dailyStreaks || [],
      decision_playbooks: playbooks || [],
      user_challenge_responses: challengeResponses || [],
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
