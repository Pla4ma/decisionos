// Edge Function: analyze-decision
// Gemini-powered decision analysis with validation and safety

// Type declarations for Deno and modules
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

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Gemini API response interface
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  error?: {
    message: string;
    code: number;
  };
}

// Simple schema validation (manual since we can't import Zod in Edge Function)
function validateAnalysisOutput(data: unknown): { valid: boolean; errors?: string[] } {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Response must be an object'] };
  }

  const d = data as Record<string, unknown>;
  const errors: string[] = [];

  // Check required arrays
  if (!Array.isArray(d.optionScores) || d.optionScores.length < 2) {
    errors.push('optionScores must be an array with at least 2 items');
  }

  if (!Array.isArray(d.factorsConsidered) || d.factorsConsidered.length < 3) {
    errors.push('factorsConsidered must be an array with at least 3 items');
  }

  if (!Array.isArray(d.uncertaintyNotes) || d.uncertaintyNotes.length < 1) {
    errors.push('uncertaintyNotes must be an array with at least 1 item');
  }

  if (!Array.isArray(d.hiddenAssumptions) || d.hiddenAssumptions.length < 1) {
    errors.push('hiddenAssumptions must be an array with at least 1 item');
  }

  if (!Array.isArray(d.nextSteps) || d.nextSteps.length < 1) {
    errors.push('nextSteps must be an array with at least 1 item');
  }

  // Check string fields
  if (typeof d.summary !== 'string' || d.summary.length < 50) {
    errors.push('summary must be a string with at least 50 characters');
  }

  // Check confidence level
  if (typeof d.confidenceLevel !== 'number' || d.confidenceLevel < 0 || d.confidenceLevel > 100) {
    errors.push('confidenceLevel must be a number between 0 and 100');
  }

  // Validate each option score
  if (Array.isArray(d.optionScores)) {
    d.optionScores.forEach((opt: unknown, idx: number) => {
      if (!opt || typeof opt !== 'object') {
        errors.push(`optionScores[${idx}] must be an object`);
        return;
      }
      const o = opt as Record<string, unknown>;

      if (typeof o.optionId !== 'string') {
        errors.push(`optionScores[${idx}].optionId must be a string`);
      }
      if (typeof o.optionTitle !== 'string' || o.optionTitle.length < 1) {
        errors.push(`optionScores[${idx}].optionTitle must be a non-empty string`);
      }
      if (typeof o.overallScore !== 'number' || o.overallScore < 0 || o.overallScore > 100) {
        errors.push(`optionScores[${idx}].overallScore must be a number between 0 and 100`);
      }
      if (typeof o.reasoning !== 'string' || o.reasoning.length < 20) {
        errors.push(`optionScores[${idx}].reasoning must be a string with at least 20 characters`);
      }

      // Validate scores object
      if (!o.scores || typeof o.scores !== 'object') {
        errors.push(`optionScores[${idx}].scores must be an object`);
      } else {
        const s = o.scores as Record<string, number>;
        const scoreFields = ['regretRisk', 'confidence', 'valuesAlignment', 'reversibility', 'risk'];
        scoreFields.forEach((field) => {
          if (typeof s[field] !== 'number' || s[field] < 0 || s[field] > 100) {
            errors.push(`optionScores[${idx}].scores.${field} must be a number between 0 and 100`);
          }
        });
      }
    });
  }

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

// Build deep prompt for Gemini — includes Regret Forecast + Future Self
function buildPrompt(
  decision: unknown,
  options: unknown[],
  answers: unknown[],
  blindSpotContext: string,
): string {
  const d = decision as Record<string, unknown>;

  const answersText = answers.length > 0
    ? (answers as Record<string, string>[]).map((a) => `Q: ${a.question_key}\nA: ${a.answer}`).join('\n\n')
    : 'No guided answers provided.';

  const optionsText = (options as Record<string, unknown>[]).map((opt, index: number) => {
    const pros = Array.isArray(opt.pros) && opt.pros.length > 0 ? `Pros: ${(opt.pros as string[]).join(', ')}` : '';
    const cons = Array.isArray(opt.cons) && opt.cons.length > 0 ? `Cons: ${(opt.cons as string[]).join(', ')}` : '';
    return `Option ${index + 1} (ID: ${opt.id}): ${opt.title}\n${opt.description || ''}\n${pros}\n${cons}`.trim();
  }).join('\n\n---\n\n');

  return `You are DecisionOS, an advanced decision intelligence system. Your role is not just to analyze — but to help users see what they cannot see themselves.

OUTPUT FORMAT: Return ONLY valid JSON. No markdown outside JSON.

TONE: Direct, insightful, occasionally uncomfortable. Tell the truth with compassion. Use "might" and "could" — never "will."

CRITICAL CONSTRAINTS:
- Never give medical, legal, therapeutic, or investment advice
- Never present scores as guarantees or certainty
- Always acknowledge uncertainty
- If you detect self-harm, crisis, or abuse content, respond ONLY with professional resources

${blindSpotContext}

DECISION TO ANALYZE:
Title: ${d.title}
Category: ${d.category}
Context: ${d.context || 'Not provided'}
Importance (1-10): ${d.importance}
Urgency (1-10): ${d.urgency}

OPTIONS (${options.length}):
${optionsText}

USER'S REFLECTIONS:
${answersText}

YOUR TASKS:

1. SCORE EACH OPTION (0-100): regretRisk, confidence, valuesAlignment, reversibility, risk

2. REGRET FORECAST: For EACH option, predict regretLikelihood (0-100), why they might regret it, whatWouldCauseRegret, and timeHorizon (short_term/medium_term/long_term). Be honest — don't sugarcoat.

3. FUTURE SELF LETTER: For EACH option, write what future-you would say looking back. Start "Dear me, looking back..." Include what they'd be glad about and what they'd wish they considered.

4. HIDDEN TRADEOFFS: What does the user gain AND lose with each option that they haven't mentioned? Identify blind spots in their thinking.

5. REFLECTION PROMPTS: 2-3 deep questions to help the user think beyond what they've already considered.

REQUIRED JSON STRUCTURE:
{
  "optionScores": [
    {
      "optionId": "uuid",
      "optionTitle": "string",
      "overallScore": 0-100,
      "scores": { "regretRisk": 0-100, "confidence": 0-100, "valuesAlignment": 0-100, "reversibility": 0-100, "risk": 0-100 },
      "reasoning": "string (20-1000 chars)",
      "regretForecast": { "regretLikelihood": 0-100, "why": "string", "whatWouldCauseRegret": "string", "timeHorizon": "short_term|medium_term|long_term" },
      "futureSelf": { "letterText": "string", "perspective": "string", "biggestLesson": "string" }
    }
  ],
  "summary": "string (50-2000 chars)",
  "factorsConsidered": ["string"],
  "confidenceLevel": 0-100,
  "uncertaintyNotes": ["string"],
  "hiddenAssumptions": ["string"],
  "hiddenTradeoffs": [{ "description": "string", "affectsOptions": ["uuid"], "importance": "low|medium|high" }],
  "missingInformation": ["string"],
  "nextSteps": ["string"],
  "reflectionPrompts": ["string"]
}`;
}

// Call Gemini API
async function callGemini(prompt: string, apiKey: string): Promise<unknown> {
  const model = 'gemini-1.5-flash-latest';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4000,
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
    throw new Error('Empty response from Gemini');
  }

  // Parse JSON response
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON response from Gemini');
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get JWT from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { decisionId } = await req.json() as { decisionId?: string };

    if (!decisionId) {
      return new Response(
        JSON.stringify({ error: 'decisionId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check usage limit (3 free analyses per month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: usageCount, error: usageError } = await supabase
      .from('ai_usage_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('event_type', 'analysis')
      .gte('created_at', startOfMonth);

    if (usageError) {
      console.error('Usage check error:', usageError);
    }

    const currentUsage = usageCount ?? 0;
    const ANALYSIS_LIMIT = 1; // Free tier: 1 analysis per month

    if (currentUsage >= ANALYSIS_LIMIT) {
      return new Response(
        JSON.stringify({ error: 'Monthly analysis limit reached. Upgrade for unlimited analyses.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Load options
    const { data: options, error: optionsError } = await supabase
      .from('decision_options')
      .select('*')
      .eq('decision_id', decisionId)
      .eq('user_id', user.id);

    if (optionsError) {
      console.error('Options load error:', optionsError);
    }

    if (!options || options.length < 2) {
      return new Response(
        JSON.stringify({ error: 'At least 2 options required for analysis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Load answers
    const { data: answers, error: answersError } = await supabase
      .from('decision_answers')
      .select('*')
      .eq('decision_id', decisionId)
      .eq('user_id', user.id);

    if (answersError) {
      console.error('Answers load error:', answersError);
    }

    // Load user's blind spots for context
    const { data: blindSpots } = await supabase
      .from('user_blind_spots')
      .select('title, description, severity')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .in('severity', ['significant', 'moderate']);

    const blindSpotContext = blindSpots && blindSpots.length > 0
      ? `\n\nUSER'S KNOWN BLIND SPOTS (from their decision history):\n${blindSpots.map((b: Record<string, string>) => `- ${b.title}: ${b.description} (Severity: ${b.severity})`).join('\n')}\n\nIMPORTANT: Use these to help the user see what they might be missing. Point out when an option might trigger one of their blind spots.`
      : '';

    // Build prompt and call Gemini
    const prompt = buildPrompt(decision, options, answers || [], blindSpotContext);
    const geminiResult = await callGemini(prompt, geminiApiKey);

    // Validate response
    const validation = validateAnalysisOutput(geminiResult);
    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid analysis response', details: validation.errors }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract the validated data
    const analysisData = geminiResult as {
      optionScores: Array<{
        optionId: string;
        optionTitle: string;
        overallScore: number;
        scores: {
          regretRisk: number;
          confidence: number;
          valuesAlignment: number;
          reversibility: number;
          risk: number;
        };
        reasoning: string;
        regretForecast?: {
          regretLikelihood: number;
          why: string;
          whatWouldCauseRegret: string;
          timeHorizon: string;
        };
        futureSelf?: {
          letterText: string;
          perspective: string;
          biggestLesson: string;
        };
      }>;
      summary: string;
      factorsConsidered: string[];
      confidenceLevel: number;
      hiddenTradeoffs?: Array<{
        description: string;
        affectsOptions: string[];
        importance: string;
      }>;
      reflectionPrompts?: string[];
    };

    // Save analysis to database
    const { data: analysis, error: analysisError } = await supabase
      .from('decision_analysis')
      .insert({
        decision_id: decisionId,
        user_id: user.id,
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
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save forecast data (regret predictions + future self letters)
    const regretForecasts = analysisData.optionScores
      .filter(os => os.regretForecast)
      .map(os => ({
        option_id: os.optionId,
        option_title: os.optionTitle,
        regret_likelihood: os.regretForecast!.regretLikelihood,
        why: os.regretForecast!.why,
        what_would_cause_regret: os.regretForecast!.whatWouldCauseRegret,
        time_horizon: os.regretForecast!.timeHorizon,
      }));

    const futureSelfLetters = analysisData.optionScores
      .filter(os => os.futureSelf)
      .map(os => ({
        option_id: os.optionId,
        option_title: os.optionTitle,
        letter_text: os.futureSelf!.letterText,
        perspective: os.futureSelf!.perspective,
        biggest_lesson: os.futureSelf!.biggestLesson,
      }));

    if (regretForecasts.length > 0 || futureSelfLetters.length > 0) {
      await supabase.from('decision_forecasts').insert({
        decision_id: decisionId,
        user_id: user.id,
        regret_forecast: regretForecasts,
        future_self_letters: futureSelfLetters,
      });
    }

    // Record usage event
    await supabase.from('ai_usage_events').insert({
      user_id: user.id,
      event_type: 'analysis',
      decision_id: decisionId,
    });

    // Update decision status and profile counters
    await supabase
      .from('decisions')
      .update({ status: 'analyzed' })
      .eq('id', decisionId);

    await supabase.rpc('increment_profile_counter', {
      p_user_id: user.id,
      p_counter: 'total_decisions_made',
    });

    // Return analysis
    return new Response(
      JSON.stringify({
        analysis,
        geminiResult,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
