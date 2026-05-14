// Edge Function: hindsight-comparison
// Generates AI-powered hindsight analysis comparing predictions to actual outcomes
// Called AFTER a user submits a decision review

declare global {
  namespace Deno {
    namespace env {
      function get(key: string): string | undefined;
    }
    function serve(handler: (req: Request) => Promise<Response>): void;
  }
}

// @ts-ignore - External module import for Deno edge function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Usage limits
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

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  error?: { message: string; code: number };
}

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

async function callGemini(prompt: string, apiKey: string): Promise<unknown> {
  const model = 'gemini-1.5-flash-latest';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as GeminiResponse;
  if (data.error) throw new Error(`Gemini error: ${data.error.message}`);

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON from Gemini');
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify JWT and get user
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { decisionId, input } = await req.json() as {
      decisionId: string;
      input: {
        decisionTitle: string;
        originalContext: string;
        chosenOptionTitle: string;
        rejectedOptions: string[];
        originalAnalysisSummary: string;
        outcomeNotes: string;
        satisfactionScore: number | null;
        wouldChooseSame: boolean | null;
      };
    };

    if (!decisionId) {
      return new Response(
        JSON.stringify({ error: 'decisionId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!input || !input.decisionTitle || !input.chosenOptionTitle || !input.outcomeNotes) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: decisionTitle, chosenOptionTitle, outcomeNotes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify decision ownership
    const { data: decision, error: decisionError } = await supabase
      .from('decisions')
      .select('id')
      .eq('id', decisionId)
      .eq('user_id', user.id)
      .single();

    if (decisionError || !decision) {
      return new Response(
        JSON.stringify({ error: 'Decision not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check usage quota
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const tier = profile?.subscription_tier || 'free';
    let limit: number;
    switch (tier) {
      case 'pro': limit = PRO_MONTHLY_ANALYSES; break;
      case 'plus': limit = PLUS_MONTHLY_ANALYSES; break;
      default: limit = FREE_MONTHLY_ANALYSES;
    }

    const { count: usageCount } = await supabase
      .from('ai_usage_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('event_type', 'analysis')
      .gte('created_at', startOfMonth);

    if ((usageCount ?? 0) >= limit) {
      return new Response(
        JSON.stringify({ error: 'Monthly analysis limit reached. Upgrade for unlimited analyses.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = buildPrompt(input);
    const comparison = await callGemini(prompt, geminiApiKey);

    // Log usage
    await supabase.from('ai_usage_events').insert({
      user_id: user.id,
      event_type: 'analysis',
      decision_id: decisionId,
      metadata: { function: 'hindsight-comparison' },
    }).catch(() => {});

    return new Response(
      JSON.stringify({ comparison, decisionId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('hindsight-comparison error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});