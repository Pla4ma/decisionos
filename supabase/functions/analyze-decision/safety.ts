// Safety pre-check — layered blocking of harmful content before AI analysis
// Layer 1: Keyword matching (client-side + backend)
// Layer 2: Combination detection (distress signals)
// Layer 3: AI prompt-level safety instruction

export const SAFETY_KEYWORDS: Record<string, string[]> = {
  self_harm: [
    'kill myself', 'suicide', 'end my life', 'hurt myself', 'self harm',
    'want to die', 'better off dead', 'not want to live', 'end it all',
    'take my own life', 'suicidal', 'self-injure', 'self injure',
    'cutting myself', 'don\'t want to be here anymore',
  ],
  medical: [
    'chest pain', 'trouble breathing', 'emergency room', 'medical emergency',
    'heart attack', 'stroke', 'seizure', 'overdose', 'poisoning',
    'severe bleeding', 'head injury', 'broken bone',
  ],
  health: [
    'health concern', 'medical condition', 'diagnosed with', 'treatment option',
    'symptom', 'chronic illness', 'medication', 'surgery decision',
    'therapy choice', 'healthcare', 'doctor appointment', 'prescription',
  ],
  legal: [
    'arrested', 'going to jail', 'legal trouble', 'court date',
    'criminal charges', 'sued', 'lawyer needed', 'attorney',
    'plead guilty', 'criminal defense', 'lawsuit',
  ],
  abuse: [
    'domestic violence', 'abusive relationship', 'being abused',
    'sexual assault', 'stalking', 'physical abuse', 'emotional abuse',
    'partner hurts me', 'afraid of partner', 'my partner scares me',
    'forced to', 'coerced',
  ],
  relationship_abuse: [
    'controlling partner', 'toxic relationship', 'jealous partner',
    'gaslighting', 'manipulative partner', 'emotionally draining partner',
    'verbal abuse', 'screaming partner', 'isolating me', 'checks my phone',
    'limits my friends', 'threatens me', 'relationship control',
  ],
  investment: [
    'stock advice', 'investment recommendation', 'buy stock', 'sell stock',
    'crypto investment', 'financial advice', 'day trading', 'options trading',
  ],
  crisis: [
    'crisis', 'emergency', 'urgent help', 'need help now',
    'i can\'t do this', 'i give up', 'no way out',
    'feeling trapped', 'can\'t take it anymore',
  ],
};

// Distress signal combinations — catches patterns that keywords alone might miss
const DISTRESS_PATTERNS = [
  { words: ['scared', 'partner', 'leave'], category: 'abuse' },
  { words: ['pills', 'should i take'], category: 'medical' },
  { words: ['can\'t', 'continue', 'life'], category: 'self_harm' },
  { words: ['hopeless', 'nothing', 'matters'], category: 'crisis' },
  { words: ['afraid', 'go home', 'partner'], category: 'abuse' },
  { words: ['ending', 'relationship', 'scared'], category: 'abuse' },
  { words: ['controlling', 'partner', 'friends'], category: 'relationship_abuse' },
  { words: ['health', 'condition', 'treatment'], category: 'health' },
  { words: ['should i', 'stop', 'medication'], category: 'health' },
];

export function checkSafetyBeforeAnalysis(
  decision: Record<string, unknown>,
  options: unknown[],
  answers: unknown[],
): { allowed: boolean; message: string; safetyCategory?: string } {
  const textsToCheck = [
    String(decision.title || ''),
    String(decision.context || ''),
    String(decision.desiredOutcome || ''),
    String(decision.biggestFear || ''),
    String(decision.inactionOutcome || ''),
    ...(options as Record<string, unknown>[]).map(o =>
      String(o.title || '') + ' ' + String(o.description || '') + ' ' +
      String((o as any).pros?.join(' ') || '') + ' ' +
      String((o as any).cons?.join(' ') || '')
    ),
    ...(answers as Record<string, string>[]).map(a => String(a.answer || '')),
  ].join(' ').toLowerCase();

  // Layer 1: Direct keyword matching (highest priority)
  for (const keyword of SAFETY_KEYWORDS.self_harm) {
    if (textsToCheck.includes(keyword)) {
      return {
        allowed: false,
        safetyCategory: 'self_harm',
        message: 'If you are going through a crisis, please reach out for support. DecisionOS is not the right tool for this situation. Contact the National Suicide Prevention Lifeline at 988 or text HOME to 741741.',
      };
    }
  }

  for (const keyword of SAFETY_KEYWORDS.medical) {
    if (textsToCheck.includes(keyword)) {
      return {
        allowed: false,
        safetyCategory: 'medical',
        message: 'For medical decisions, please consult a healthcare professional. DecisionOS cannot provide medical advice or analysis.',
      };
    }
  }

  for (const keyword of SAFETY_KEYWORDS.legal) {
    if (textsToCheck.includes(keyword)) {
      return {
        allowed: false,
        safetyCategory: 'legal',
        message: 'For legal matters, please consult a qualified attorney. DecisionOS cannot provide legal advice.',
      };
    }
  }

  for (const keyword of SAFETY_KEYWORDS.abuse) {
    if (textsToCheck.includes(keyword)) {
      return {
        allowed: false,
        safetyCategory: 'abuse',
        message: 'If you are in an unsafe situation, please reach out for help. Contact the National Domestic Violence Hotline at 1-800-799-7233.',
      };
    }
  }

  for (const keyword of SAFETY_KEYWORDS.relationship_abuse) {
    if (textsToCheck.includes(keyword)) {
      return {
        allowed: false,
        safetyCategory: 'relationship_abuse',
        message: 'If you are in an unhealthy or unsafe relationship, please reach out for support. Contact the National Domestic Violence Hotline at 1-800-799-7233 or visit thehotline.org.',
      };
    }
  }

  for (const keyword of SAFETY_KEYWORDS.health) {
    if (textsToCheck.includes(keyword)) {
      return {
        allowed: false,
        safetyCategory: 'health',
        message: 'Health decisions should involve professional medical advice. Please consult a healthcare provider for personalized guidance.',
      };
    }
  }

  for (const keyword of SAFETY_KEYWORDS.investment) {
    if (textsToCheck.includes(keyword)) {
      return {
        allowed: false,
        safetyCategory: 'investment',
        message: 'For investment decisions, please consult a qualified financial advisor. DecisionOS is not a financial advisory tool.',
      };
    }
  }

  // Layer 2: Distress pattern matching (combination-based detection)
  for (const pattern of DISTRESS_PATTERNS) {
    const matchesAll = pattern.words.every(word => textsToCheck.includes(word));
    if (matchesAll) {
      if (pattern.category === 'abuse') {
        return {
          allowed: false,
          safetyCategory: 'abuse',
          message: 'If you are in an unsafe situation, please reach out for help. Contact the National Domestic Violence Hotline at 1-800-799-7233.',
        };
      }
      if (pattern.category === 'relationship_abuse') {
        return {
          allowed: false,
          safetyCategory: 'relationship_abuse',
          message: 'If you are in an unhealthy or unsafe relationship, please reach out for support. Contact the National Domestic Violence Hotline at 1-800-799-7233.',
        };
      }
      if (pattern.category === 'self_harm' || pattern.category === 'crisis') {
        return {
          allowed: false,
          safetyCategory: 'self_harm',
          message: 'If you are going through a crisis, please reach out for support. Contact the National Suicide Prevention Lifeline at 988 or text HOME to 741741.',
        };
      }
      if (pattern.category === 'medical' || pattern.category === 'health') {
        return {
          allowed: false,
          safetyCategory: pattern.category,
          message: pattern.category === 'health'
            ? 'Health decisions should involve professional medical advice. Please consult a healthcare provider.'
            : 'For medical decisions, please consult a healthcare professional.',
        };
      }
    }
  }

  // Layer 3: Crisis keyword match (lower threshold, same message)
  for (const keyword of SAFETY_KEYWORDS.crisis) {
    if (textsToCheck.includes(keyword)) {
      return {
        allowed: false,
        safetyCategory: 'crisis',
        message: 'If you are going through a crisis, please reach out for support. DecisionOS is not the right tool for this situation. Contact the National Suicide Prevention Lifeline at 988 or text HOME to 741741.',
      };
    }
  }

  return { allowed: true, message: '' };
}
