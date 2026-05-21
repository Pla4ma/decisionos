import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getCorsHeaders } from '../_shared/cors.ts';
import { verifyUser } from '../_shared/auth.ts';
import { checkUsageLimit, logUsageEvent } from '../_shared/usage.ts';
import { validateAnalysisOutput, validateAnalysisQuality } from '../_shared/aiValidation.ts';
import { callGeminiJson } from '../_shared/gemini.ts';
import { checkSafetyBeforeAnalysis } from './safety.ts';
import { buildPrompt } from './prompt.ts';

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user, supabase } = await verifyUser(req);

    const { decisionId } = await req.json() as { decisionId?: string };
    if (!decisionId) {
      return new Response(
        JSON.stringify({ error: 'decisionId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

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

    const isPractice = (decision as any).is_practice === true;
    if (!isPractice) {
      const usage = await checkUsageLimit(supabase, user.id, 'deep_analysis');
      if (!usage.allowed) {
        return new Response(
          JSON.stringify({ error: usage.message }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

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

    const { data: answers, error: answersError } = await supabase
      .from('decision_answers')
      .select('*')
      .eq('decision_id', decisionId)
      .eq('user_id', user.id);

    if (answersError) console.error('Answers load error:', answersError);

    const safetyCheck = checkSafetyBeforeAnalysis(decision, options, answers || []);
    if (!safetyCheck.allowed) {
      const crisisCategories = ['self_harm', 'crisis', 'abuse'];
      if (crisisCategories.includes(safetyCheck.safetyCategory || '')) {
        return new Response(
          JSON.stringify({
            error: safetyCheck.message,
            safetyCategory: safetyCheck.safetyCategory,
            crisisResources: {
              crisisLine: '988 Suicide & Crisis Lifeline — Call or text 988',
              crisisTextLine: 'Crisis Text Line — Text HOME to 741741',
              domesticViolence: 'National DV Hotline — Call 1-800-799-7233 or text START to 88788',
            },
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      return new Response(
        JSON.stringify({ error: safetyCheck.message, safetyCategory: safetyCheck.safetyCategory }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const category = (decision as any).category || 'other';
    const isSensitiveCategory = ['medical', 'health', 'legal', 'money', 'business', 'investment'].includes(category);

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

    let prompt = buildPrompt(decision, options, answers || [], blindSpotContext);

    if (isSensitiveCategory) {
      const sensitivePrefix = `CATEGORY: ${category}\nNOTE: The user has categorized this as a ${category} decision. Your role is to provide reflection questions and considerations only. Do NOT make a recommendation. Avoid definitive language. Instead use reflective language: "consider", "reflect on", "one possible tradeoff could be". This analysis is a reflection aid and is not a substitute for professional ${category === 'medical' || category === 'health' ? 'medical' : category === 'legal' ? 'legal' : 'financial'} advice.\n\n`;
      prompt = sensitivePrefix + prompt;
    }

    const geminiResult = await callGeminiJson({ prompt, temperature: 0.3, maxOutputTokens: 4000 });
    const expectedOptionIds = options.map((o: Record<string, string>) => o.id);

    const validation = validateAnalysisOutput(
      geminiResult as Record<string, unknown>,
      expectedOptionIds,
      category,
    );

    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid analysis response', details: validation.errors }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const analysisData = geminiResult as {
      optionScores: Array<{
        optionId: string; optionTitle: string; overallScore: number;
        scores: { regretRisk: number; confidence: number; valuesAlignment: number; reversibility: number; risk: number };
        reasoning: string;
        regretForecast?: { regretLikelihood: number; regretRisk?: string; why: string; whatWouldCauseRegret: string; timeHorizon: string };
        futureSelf?: { letterText: string; perspective: string; biggestLesson: string };
      }>;
      summary: string; factorsConsidered: string[]; confidenceLevel: number;
      hiddenTradeoffs?: Array<{ description: string; affectsOptions: string[]; importance: string }>;
      reflectionPrompts?: string[];
    };

    if (isSensitiveCategory && !analysisData.summary.toLowerCase().includes('reflection') && !analysisData.summary.toLowerCase().includes('consider')) {
      analysisData.summary = `[Reflection Analysis — not professional advice]\n\n${analysisData.summary}`;
    }

    if ((category === 'money' || category === 'business') && !analysisData.summary.toLowerCase().includes('financial risk') && !analysisData.summary.toLowerCase().includes('financially')) {
      analysisData.summary += '\n\nNote: This is a financial decision. Consider consulting a financial advisor for personalized advice.';
    }

    analysisData.optionScores = analysisData.optionScores.filter((os: any) =>
      expectedOptionIds.includes(os.optionId)
    );

    const quality = validateAnalysisQuality(analysisData, {
      contextLength: (decision.context || '').length,
      optionsCount: options.length,
      answersCount: (answers || []).length,
      isSensitiveCategory,
      category,
    });

    if (quality.confidencePenalty > 0) {
      analysisData.confidenceLevel = Math.max(10, analysisData.confidenceLevel - quality.confidencePenalty);
    }

    if (quality.requiresSoftResponse) {
      analysisData.summary = `[Lower confidence analysis — more context would improve accuracy]\n\n${analysisData.summary}`;
      if (quality.missingContextRef) {
        analysisData.summary += `\n\nTip: Adding more specific context about your situation may help surface clearer insights.`;
      }
    }

    if (analysisData.confidenceLevel < 40) {
      analysisData.summary = `[Low confidence analysis — scores are uncertain]\n\n${analysisData.summary}`;
    }

    const { data: analysis, error: analysisError } = await supabase
      .from('decision_analysis')
      .upsert({
        decision_id: decisionId, user_id: user.id,
        option_scores: analysisData.optionScores,
        summary: analysisData.summary,
        factors_considered: analysisData.factorsConsidered,
        confidence_level: analysisData.confidenceLevel,
      }, { onConflict: 'decision_id' })
      .select()
      .single();

    if (analysisError) {
      console.error('Analysis save error:', analysisError);
      return new Response(
        JSON.stringify({ error: 'Failed to save analysis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

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

    if (!isPractice) {
      await logUsageEvent(supabase, user.id, 'deep_analysis', {
        decision_id: decisionId,
        decision_category: category,
        option_count: options.length,
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        success: true,
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
      JSON.stringify({ error: 'Analysis failed. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
