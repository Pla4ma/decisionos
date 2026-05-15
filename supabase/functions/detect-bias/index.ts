// Edge Function: detect-bias
// Real-time cognitive bias detection during decision drafting
// Called as user types — must be FAST (< 2s response)

import { getCorsHeaders } from '../_shared/cors.ts';
import { verifyUser, AuthError } from '../_shared/auth.ts';
import { checkUsageLimit, logUsageEvent } from '../_shared/usage.ts';
import { callGeminiJson } from '../_shared/gemini.ts';
import { handleError } from '../_shared/errors.ts';
import type { AiEventType } from '../_shared/limits.ts';

const BIAS_DEFINITIONS = [
  'Confirmation Bias — Favoring information that confirms existing beliefs',
  'Sunk Cost Fallacy — Continuing a path because of past investment',
  'Loss Aversion — Overweighting potential losses vs equivalent gains',
  'Anchoring — Over-relying on the first piece of information',
  'Availability Heuristic — Overestimating memorable or recent events',
  'Overconfidence Effect — Overestimating own judgment or abilities',
  'Status Quo Bias — Preferring things to stay the same',
  'Hindsight Bias — Seeing past events as more predictable than they were',
  'Optimism Bias — Underestimating probability of negative outcomes',
  'Social Proof — Following what others are doing without analysis',
  'Framing Effect — Being swayed by how information is presented',
  'Escalation of Commitment — Doubling down on failing course of action',
  'Planning Fallacy — Underestimating time, costs, risks of future actions',
  'Affect Heuristic — Making decisions based on current emotions',
  'Dunning-Kruger Effect — Overestimating competence in unfamiliar areas',
];

function buildPrompt(decisionTitle: string, draftContext: string, userAnswers: string): string {
  return `You are DecisionOS BiasDetect, a cognitive bias detection system. Your ONLY job is to identify cognitive biases actively manifesting in the user's current decision-making text.

OUTPUT FORMAT: Return ONLY valid JSON as an array of BiasWarning objects.

CONTEXT:
Decision Title: "${decisionTitle}"

USER'S CURRENT INPUT:
${draftContext}

USER'S ANSWERS:
${userAnswers}

AVAILABLE BIASES (you may identify others not listed):
${BIAS_DEFINITIONS.join('\n')}

YOUR TASK:
Analyze ONLY what the user has written — not hypotheticals. Identify 1-3 biases actively present.
Every bias warning MUST include a concrete, actionable mitigation strategy specific to this user's situation — not generic advice like "be aware."
The mitigation strategy must be something the user can DO right now to counteract the bias.

If NO biases are detectable, return an empty array [].

REQUIRED JSON STRUCTURE:
[
  {
    "bias_name": "string (the bias name)",
    "description": "string (30-100 chars — why this is happening)",
    "context_in_decision": "string (30-100 chars — where in their text this appears)",
    "mitigation_strategy": "string (40-150 chars — specific action they can take NOW)"
  }
]`;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user, supabase } = await verifyUser(req);

    // Check usage quota separately for bias detection
    const usage = await checkUsageLimit(supabase, user.id, 'bias_detection' as AiEventType);
    if (!usage.allowed) {
      return new Response(
        JSON.stringify({ error: usage.message }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { decisionTitle, draftContext, userAnswers } = await req.json() as {
      decisionTitle?: string;
      draftContext?: string;
      userAnswers?: string;
    };

    if (!draftContext || draftContext.length < 30) {
      return new Response(
        JSON.stringify({ biases: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const prompt = buildPrompt(decisionTitle || 'Untitled Decision', draftContext, userAnswers || '');
    const geminiResult = await callGeminiJson({
      prompt,
      temperature: 0.2,
      maxOutputTokens: 1000,
    });

    let biases: Array<Record<string, string>> = [];
    if (Array.isArray(geminiResult)) {
      biases = geminiResult.slice(0, 3);
    }

    // Log usage with separate event type
    await logUsageEvent(supabase, user.id, 'bias_detection' as AiEventType, {
      function: 'detect-bias',
      biases_found: biases.length,
    });

    return new Response(
      JSON.stringify({ biases }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (error) {
    // On error, return empty biases gracefully for UX
    if (error instanceof AuthError) {
      return handleError(error, corsHeaders);
    }
    console.error('detect-bias error:', error);
    return new Response(
      JSON.stringify({ biases: [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
