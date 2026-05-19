// Deep Gemini Prompts — Industry-shaking decision intelligence
// Includes: Regret Forecast, Future Self Letters, Blind Spot Awareness
// These prompts are used by the analyze-decision Edge Function

import { Decision, DecisionOption, DecisionAnswer } from '@/features/decisions/decisionTypes';
import type { BlindSpotAlert } from '@/features/decisions/deepDecisionTypes';

interface BuildDeepAnalysisPromptInput {
  decision: Decision;
  options: DecisionOption[];
  answers: DecisionAnswer[];
  userContext?: string;
  activeBlindSpots?: BlindSpotAlert[];
}

const SAFETY = `CRITICAL CONSTRAINTS:
- Never give medical, legal, therapeutic, or investment advice
- Never present scores as guarantees or certainty
- Always acknowledge uncertainty explicitly
- Use "might" and "could" — never "will"
- If you detect self-harm, crisis, or abuse content, respond ONLY with professional resources`;

export function buildDeepDecisionAnalysisPrompt(input: BuildDeepAnalysisPromptInput): string {
  const { decision, options, answers, userContext, activeBlindSpots } = input;

  const answersText = answers.length > 0
    ? answers.map((a) => `Q: ${a.question_key}\nA: ${a.answer}`).join('\n\n')
    : 'No guided answers provided.';

  const optionsText = options.map((opt, index) => {
    const pros = opt.pros?.length ? `Pros: ${opt.pros.join(', ')}` : '';
    const cons = opt.cons?.length ? `Cons: ${opt.cons.join(', ')}` : '';
    return `Option ${index + 1} (ID: ${opt.id}): ${opt.title}\n${opt.description || ''}\n${pros}\n${cons}`.trim();
  }).join('\n\n---\n\n');

  const blindSpotContext = activeBlindSpots && activeBlindSpots.length > 0
    ? `\n\nUSER'S KNOWN BLIND SPOTS (from their decision history):\n${activeBlindSpots.map(b => `- ${b.title}: ${b.description} (Severity: ${b.severity})`).join('\n')}\n\nIMPORTANT: Use these to help the user see what they might be missing. Point out when an option might trigger one of their blind spots.`
    : '';

  const userInsightContext = userContext ? `\n\nWHAT WE KNOW ABOUT THIS USER:\n${userContext}\n` : '';

  return `You are DecisionOS, an advanced decision intelligence system. Your role is not just to analyze — but to help users see what they cannot see themselves.

OUTPUT FORMAT: Return ONLY valid JSON matching the schema below. No markdown, no explanatory text outside JSON.

TONE: Direct, insightful, occasionally uncomfortable. Tell the truth with compassion. Avoid hype. Use "might" and "could" — never "will."

${SAFETY}
${userInsightContext}
${blindSpotContext}

DECISION TO ANALYZE:
Title: ${decision.title}
Category: ${decision.category}
Context: ${decision.context || 'Not provided'}
Importance (1-10): ${decision.importance}
Urgency (1-10): ${decision.urgency}

OPTIONS (${options.length}):
${optionsText}

USER'S REFLECTIONS:
${answersText}

YOUR TASKS:

1. SCORE EACH OPTION (standard analysis):
Score on 5 dimensions (0-100). Calculate overallScore as weighted combination.

2. REGRET FORECAST (the killer feature):
For EACH option, describe:
- regretRisk: "low", "medium", or "high" — how much regret is possible
- why: The core reason they might regret it
- whatWouldCauseRegret: The specific scenario that would trigger regret
- timeHorizon: When regret would most likely surface (short_term, medium_term, long_term)
Be honest. If Option A looks great now but has hidden long-term regret potential, say so clearly.

3. FUTURE SELF PERSPECTIVE:
For EACH option, write what "future-you" would say looking back:
- letterText: A short note from future-you to present-you. Start with "Dear me, looking back on this decision..." Make it personal, honest, grounded in the specific option.
- perspective: What future-you sees that present-you cannot (the benefit of hindsight)
- biggestLesson: The single most important thing future-you learned from this path

4. BLIND SPOT AWARENESS:
Identify what the user might be missing based on their answers and blind spots. What assumptions are they making? What are they not considering? Frame these as questions for reflection, not accusations.

5. HIDDEN TRADEOFFS:
What does the user gain AND lose with each option that they haven't mentioned? The best analysis reveals tradeoffs the user hasn't considered.

SCORING GUIDANCE:
- regretRisk (0=unlikely, 100=very likely to regret)
- confidence (0=total uncertainty, 100=near certainty in outcomes)
- valuesAlignment (0=contradicts values, 100=perfectly aligned)
- reversibility (0=irreversible, 100=easy to undo)
- risk (0=harmless outcome, 100=catastrophic worst case)

REQUIRED JSON STRUCTURE:
{
  "optionScores": [
    {
      "optionId": "uuid",
      "optionTitle": "string",
      "overallScore": 0-100,
      "scores": {
        "regretRisk": 0-100,
        "confidence": 0-100,
        "valuesAlignment": 0-100,
        "reversibility": 0-100,
        "risk": 0-100
      },
      "reasoning": "string (20-1000 chars)",
      "regretForecast": {
        "regretRisk": "low | medium | high",
        "why": "string",
        "whatWouldCauseRegret": "string",
        "timeHorizon": "short_term | medium_term | long_term"
      },
      "futureSelf": {
        "letterText": "string (starting with 'Dear me,')",
        "perspective": "string",
        "biggestLesson": "string"
      }
    }
  ],
  "summary": "string (concise overview, 50-2000 chars)",
  "factorsConsidered": ["string"],
  "confidenceLevel": 0-100,
  "uncertaintyNotes": ["string"],
  "hiddenAssumptions": ["string"],
  "hiddenTradeoffs": [
    {
      "description": "string",
      "affectsOptions": ["uuid"],
      "importance": "low | medium | high"
    }
  ],
  "missingInformation": ["string"],
  "nextSteps": ["string"],
  "reflectionPrompts": ["string (questions to help the user reflect deeper)"]
}`;
}

// Review with prediction comparison
interface BuildDeepReviewPromptInput {
  decision: Decision;
  originalAnalysis: string; // full analysis JSON string
  chosenOptionId: string;
  outcomeNotes: string;
  satisfactionScore?: number;
  wouldChooseSame?: boolean;
}

export function buildDeepDecisionReviewPrompt(input: BuildDeepReviewPromptInput): string {
  const { decision, originalAnalysis, chosenOptionId, outcomeNotes, satisfactionScore, wouldChooseSame } = input;

  return `You are DecisionOS, reviewing a completed decision to close the learning loop.

OUTPUT FORMAT: Return ONLY valid JSON.

TONE: Honest and constructive. Compare prediction to reality without judgment. Focus on what the user can learn.

DECISION UNDER REVIEW:
Title: ${decision.title}
Category: ${decision.category}
Importance: ${decision.importance}/10
Urgency: ${decision.urgency}/10

ORIGINAL ANALYSIS (what you predicted):
${originalAnalysis.substring(0, 2000)}

CHOSEN OPTION ID: ${chosenOptionId}

WHAT ACTUALLY HAPPENED:
${outcomeNotes}
${satisfactionScore ? `Satisfaction: ${satisfactionScore}/5` : ''}
${wouldChooseSame !== undefined ? `Would choose same: ${wouldChooseSame ? 'Yes' : 'No'}` : ''}

YOUR TASKS:

1. PREDICTION ACCURACY:
Compare what the analysis predicted against what actually happened. How accurate was the forecast? Rate 0-100.

2. REGRET CHECK:
Compare the regret forecast to reality. Did the predicted regret materialize? If not, what was missed?

3. LESSONS IDENTIFIED:
Extract 1-5 specific, actionable lessons. Make them personal to THIS user's pattern. "You tend to..." is better than "People often..."

4. BLIND SPOT EVOLUTION:
Did this decision reveal a new blind spot, or confirm an existing one? What pattern is emerging?

5. VELOCITY INSIGHT:
Based on timing and outcome, should this user decide faster or slower in similar situations?

6. GROWTH TRAJECTORY:
How is this user's decision-making evolving? What's getting better? What needs work?

REQUIRED JSON STRUCTURE:
{
  "accuracyEstimate": 0-100,
  "wasRegretAccurate": true/false,
  "regretComparison": "string (how the forecast compared to reality)",
  "lessonsIdentified": [
    {
      "lesson": "string",
      "applicability": "specific | general",
      "category": "string"
    }
  ],
  "blindSpotUpdate": {
    "detected": true/false,
    "blindSpotType": "string | null",
    "title": "string | null",
    "description": "string | null",
    "severity": "mild | moderate | significant | null"
  },
  "velocityRecommendation": {
    "currentPace": "too_fast | too_slow | about_right",
    "recommendation": "string"
  },
  "growthAssessment": "string (how their decision-making is evolving)",
  "futureRecommendations": ["string (applied to future similar decisions)"],
  "reflectionPrompt": "string (one deep question to sit with)"
}`;
}
