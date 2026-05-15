// Edge Function: analyze-decision
// Gemini-powered decision analysis with modular structure

declare global {
  namespace Deno {
    namespace env {
      function get(key: string): string | undefined;
    }
    function serve(handler: (req: Request) => Promise<Response>): void;
  }
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getCorsHeaders } from './cors.ts';
import { checkSafetyBeforeAnalysis } from './safety.ts';
import { buildPrompt } from './prompt.ts';
import { callGemini } from './gemini.ts';
import { validateAnalysisOutput } from './validation.ts';
import { checkUsageLimit } from './usage.ts';

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { decisionId } = await req.json() as { decisionId?: string };

    if (!decisionId) {
      return new Response(
        JSON.stringify({ error: 'decisionId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Load decision with ownership check
    const { data: decision, error: decisionError } = await supabase
      .from('decisions')
      .select('*')
      .eq('id', decisionId)
      .eq('user_id', user.id)
      .single();

    if (decisionError || !decision) {
      return new Response(
        JSON.stringify({ error: 'Decision not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Check usage limit (skip for practice decisions)
    const isPractice = (decision as any).is_practice === true;
    if (!isPractice) {
      const usage = await checkUsageLimit(supabase, user.id);
      if (!usage.allowed) {
        return new Response(
          JSON.stringify({ error: usage.message }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    // Load options
    const { data: options, error: optionsError } = await supabase
      .from('decision_options')
      .select('*')
      .eq('decision_id', decisionId)
      .eq('user_id', user.id);

    if (optionsError) console.error('Options load error:', optionsError);

    if (!options || options.length < 2) {
      return new Response(
        JSON.stringify({ error: 'At least 2 options required for analysis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Load answers
    const { data: answers, error: answersError } = await supabase
      .from('decision_answers')
      .select('*')
      .eq('decision_id', decisionId)
      .eq('user_id', user.id);

    if (answersError) console.error('Answers load error:', answersError);

    // Run client-side safety pre-check before sending to Gemini
    const safetyCheck = checkSafetyBeforeAnalysis(decision, options, answers || []);
    if (!safetyCheck.allowed) {
      return new Response(
        JSON.stringify({ error: safetyCheck.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Load user's blind spots for context
    const { data: blindSpots } = await supabase
      .from('user_blind_spots')
      .select('title, description, severity')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .in('severity', ['significant', 'moderate']);

    const blindSpotContext = blindSpots && blindSpots.length > 0
      ? `\n\nUSER'S KNOWN BLIND SPOTS (from their decision history):\n${
          blindSpots.map((b: Record<string, string>) => `- ${b.title}: ${b.description} (Severity: ${b.severity})`).join('\n')
        }\n\nIMPORTANT: Use these to help the user see what they might be missing. Point out when an option might trigger one of their blind spots.`
      : '';

    // Build prompt and call Gemini
    const prompt = buildPrompt(decision, options, answers || [], blindSpotContext);
    const geminiResult = await callGemini(prompt, geminiApiKey);

    // Validate response with option ID matching
    const expectedOptionIds = options.map((o: Record<string, string>) => o.id);
    const validation = validateAnalysisOutput(geminiResult, {
      expectedOptionIds,
      category: decision.category,
    });
    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid analysis response', details: validation.errors }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Post-processing: verify scores are between 0-100 (already done in validate, but double-check)
    const analysisData = geminiResult as {
      optionScores: Array<{
        optionId: string; optionTitle: string; overallScore: number;
        scores: { regretRisk: number; confidence: number; valuesAlignment: number; reversibility: number; risk: number };
        reasoning: string;
        regretForecast?: { regretLikelihood: number; why: string; whatWouldCauseRegret: string; timeHorizon: string };
        futureSelf?: { letterText: string; perspective: string; biggestLesson: string };
      }>;
      summary: string; factorsConsidered: string[]; confidenceLevel: number;
      hiddenTradeoffs?: Array<{ description: string; affectsOptions: string[]; importance: string }>;
      reflectionPrompts?: string[];
    };

    // Post-processing: add caution language for money/business decisions
    const isFinancialCategory = decision.category === 'money' || decision.category === 'business';
    if (isFinancialCategory && !analysisData.summary.toLowerCase().includes('financial risk') && !analysisData.summary.toLowerCase().includes('financially')) {
      analysisData.summary += '\n\nNote: This is a financial decision. Consider consulting a financial advisor for personalized advice.';
    }

    // Post-processing: ensure all option score IDs exist in the actual options
    analysisData.optionScores = analysisData.optionScores.filter((os: any) =>
      expectedOptionIds.includes(os.optionId)
    );

    // Post-processing: if confidence is low, flag it in the summary
    if (analysisData.confidenceLevel < 40) {
      analysisData.summary = `[Low confidence analysis — scores are uncertain]\n\n${analysisData.summary}`;
    }

    // Save analysis to database
    const { data: analysis, error: analysisError } = await supabase
      .from('decision_analysis')
      .insert({
        decision_id: decisionId, user_id: user.id,
        option_scores: analysisData.optionScores,
        summary: analysisData.summary,
        factors_considered: analysisData.factorsConsidered,
        confidence_level: analysisData.confidenceLevel,
      })
      .select()
      .single();

    if (analysisError) {
      console.error('Analysis save error:', analysisError);
      return new Response(
        JSON.stringify({ error: 'Failed to save analysis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Save forecast data
    const regretForecasts = analysisData.optionScores
      .filter(os => os.regretForecast)
      .map(os => ({
        option_id: os.optionId, option_title: os.optionTitle,
        regret_likelihood: os.regretForecast!.regretLikelihood, why: os.regretForecast!.why,
        what_would_cause_regret: os.regretForecast!.whatWouldCauseRegret, time_horizon: os.regretForecast!.timeHorizon,
      }));

    const futureSelfLetters = analysisData.optionScores
      .filter(os => os.futureSelf)
      .map(os => ({
        option_id: os.optionId, option_title: os.optionTitle,
        letter_text: os.futureSelf!.letterText, perspective: os.futureSelf!.perspective,
        biggest_lesson: os.futureSelf!.biggestLesson,
      }));

    if (regretForecasts.length > 0 || futureSelfLetters.length > 0) {
      await supabase.from('decision_forecasts').insert({
        decision_id: decisionId, user_id: user.id,
        regret_forecast: regretForecasts, future_self_letters: futureSelfLetters,
      });
    }

    // Record usage event (skip for practice)
    if (!isPractice) {
      await supabase.from('ai_usage_events').insert({
        user_id: user.id, event_type: 'deep_analysis', decision_id: decisionId,
      });
    }

    await supabase.from('decisions').update({ status: 'analyzed' }).eq('id', decisionId);
    await supabase.rpc('increment_profile_counter', {
      p_user_id: user.id, p_counter: 'total_decisions_made',
    });

    return new Response(
      JSON.stringify({ analysis, geminiResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});