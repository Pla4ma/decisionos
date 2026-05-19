// Edge Function: hindsight-comparison
// Generates AI-powered hindsight analysis comparing predictions to actual outcomes
// Called AFTER a user submits a decision review

import { getCorsHeaders } from '../_shared/cors.ts';
import { verifyUser, AuthError } from '../_shared/auth.ts';
import { checkUsageLimit, logUsageEvent } from '../_shared/usage.ts';
import { callGeminiJson } from '../_shared/gemini.ts';
import { handleError } from '../_shared/errors.ts';
import { validateHindsightOutput } from '../_shared/aiValidation.ts';
import type { AiEventType } from '../_shared/limits.ts';

function buildPrompt(input: {
  decisionTitle: string;
  originalContext: string;
  chosenOptionTitle: string;
  rejectedOptions: string[];
  originalAnalysisSummary: string;
  outcomeNotes: string;
  satisfactionScore: number | null;
  wouldChooseSame: boolean | null;
}): string {
  const rejectedText = input.rejectedOptions.length > 0
    ? `REJECTED OPTIONS:\n${input.rejectedOptions.map(o => `- ${o}`).join('\n')}`
    : '';

  return `You are DecisionOS Hindsight, an AI that generates "path not taken" analyses. Your role is to help users learn from completed decisions by comparing what they predicted to what actually happened.

OUTPUT FORMAT: Return ONLY valid JSON. No markdown outside JSON.

CRITICAL — SCORE FRAMING:
All scores are REFLECTION TOOLS, not guarantees.
- Never present lessons as absolute truths
- Frame the "path not taken" as speculation, not fact
- Remind that hindsight analysis identifies patterns, not certainties

TONE: Honest, insightful, and direct. This is a LEARNING tool, not a judgment tool.

DECISION REVIEW:
Title: "${input.decisionTitle}"
Original Context: ${input.originalContext}

CHOSEN OPTION: ${input.chosenOptionTitle}
${rejectedText}

ORIGINAL ANALYSIS (summary): ${input.originalAnalysisSummary.substring(0, 1000)}

ACTUAL OUTCOME: ${input.outcomeNotes}
User Satisfaction: ${input.satisfactionScore !== null ? `${input.satisfactionScore}/10` : 'Not rated'}
Would Choose Same Again: ${input.wouldChooseSame !== null ? (input.wouldChooseSame ? 'Yes' : 'No') : 'Not indicated'}

YOUR TASK:
1. Compare the original analysis expectations to the actual outcome. Be specific about what was accurate and what was wrong.
2. Identify 1-3 cognitive biases that were present in the ORIGINAL decision-making process (based on how the user thought about it vs what actually happened).
3. Generate the "path not taken" analysis — what would likely have happened if the user chose the rejected alternative.
4. Provide a growth insight — what has this user learned that they can apply next time.

REQUIRED JSON STRUCTURE:
{
  "prediction_accuracy": "string (50-500 chars — what was expected vs what happened)",
  "biases_exhibited": [
    {
      "bias_name": "string",
      "how_it_manifested": "string (20-200 chars)",
      "would_have_changed_outcome": "likely|possibly|unlikely"
    }
  ],
  "lessons": ["string (20-200 chars each)"],
  "path_not_taken": {
    "alternative_option": "string",
    "predicted_alternative_outcome": "string (30-300 chars)",
    "why_it_was_rejected_originally": "string (20-200 chars)"
  },
  "growth_insight": "string (30-300 chars — what the user can apply next time)"
}`;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user, supabase } = await verifyUser(req);

    const { decisionId } = await req.json() as {
      decisionId: string;
    };

    if (!decisionId) {
      return new Response(
        JSON.stringify({ error: 'decisionId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Fetch canonical decision data from backend (never trust client input)
    const { data: decision, error: decisionError } = await supabase
      .from('decisions')
      .select('id, title, context')
      .eq('id', decisionId)
      .eq('user_id', user.id)
      .single();

    if (decisionError || !decision) {
      return new Response(
        JSON.stringify({ error: 'Decision not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Fetch options
    const { data: options } = await supabase
      .from('decision_options')
      .select('title, is_chosen')
      .eq('decision_id', decisionId);

    // Fetch analysis summary
    const { data: analysis } = await supabase
      .from('decision_analysis')
      .select('summary')
      .eq('decision_id', decisionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch review data
    const { data: review } = await supabase
      .from('decision_reviews')
      .select('outcome_notes, satisfaction_score, would_choose_same, lessons_learned')
      .eq('decision_id', decisionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const chosenOption = (options || []).find(o => o.is_chosen);
    const rejectedOptions = (options || []).filter(o => !o.is_chosen).map(o => o.title);

    if (!chosenOption || !review) {
      return new Response(
        JSON.stringify({ error: 'Decision has not been reviewed yet' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Check usage quota for hindsight comparisons
    const usage = await checkUsageLimit(supabase, user.id, 'hindsight_comparison' as AiEventType);
    if (!usage.allowed) {
      return new Response(
        JSON.stringify({ error: usage.message }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const prompt = buildPrompt({
      decisionTitle: decision.title,
      originalContext: decision.context || '',
      chosenOptionTitle: chosenOption.title,
      rejectedOptions,
      originalAnalysisSummary: analysis?.summary || '',
      outcomeNotes: review.outcome_notes || '',
      satisfactionScore: review.satisfaction_score,
      wouldChooseSame: review.would_choose_same,
    });

    const comparison = await callGeminiJson({
      prompt,
      temperature: 0.4,
      maxOutputTokens: 2000,
    });

    // Validate hindsight output
    const validation = validateHindsightOutput(comparison as Record<string, unknown>);
    if (!validation.valid) {
      console.warn('Hindsight validation warnings:', validation.warnings);
    }
    const comparison = await callGeminiJson({
      prompt,
      temperature: 0.4,
      maxOutputTokens: 2000,
    });

    // Log usage with separate event type
    await logUsageEvent(supabase, user.id, 'hindsight_comparison' as AiEventType, {
      function: 'hindsight-comparison',
      decision_id: decisionId,
    });

    return new Response(
      JSON.stringify({ comparison, decisionId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (error) {
    console.error('hindsight-comparison error:', error);
    return handleError(error, corsHeaders);
  }
});
