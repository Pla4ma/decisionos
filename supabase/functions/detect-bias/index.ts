// Edge Function: detect-bias
// Real-time cognitive bias detection during decision drafting
// Called as user types — must be FAST (< 2s response)

declare global {
  namespace Deno {
    namespace env {
      function get(key: string): string | undefined;
    }
    function serve(handler: (req: Request) => Promise<Response>): void;
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  error?: { message: string; code: number };
}

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

async function callGemini(prompt: string, apiKey: string): Promise<unknown> {
  const model = 'gemini-1.5-flash-latest'; // Flash is faster for real-time
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1000,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as GeminiResponse;

  if (data.error) {
    throw new Error(`Gemini error: ${data.error.message}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return []; // No biases detected = empty
  }

  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
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

    const { decisionTitle, draftContext, userAnswers } = await req.json() as {
      decisionTitle?: string;
      draftContext?: string;
      userAnswers?: string;
    };

    if (!draftContext || draftContext.length < 30) {
      return new Response(
        JSON.stringify({ biases: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = buildPrompt(decisionTitle || 'Untitled Decision', draftContext, userAnswers || '');
    const geminiResult = await callGemini(prompt, geminiApiKey);

    let biases: Array<Record<string, string>> = [];
    if (Array.isArray(geminiResult)) {
      biases = geminiResult.slice(0, 3);
    }

    return new Response(
      JSON.stringify({ biases }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('detect-bias error:', error);
    return new Response(
      JSON.stringify({ biases: [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
