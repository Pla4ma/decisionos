// AI Safety Patterns - Extracted from aiSafety.ts to meet 200-line limit

export type SafetyCategory =
  | 'self_harm'
  | 'medical_emergency'
  | 'legal_emergency'
  | 'abuse_crisis'
  | 'mental_health_crisis'
  | 'investment_advice'
  | 'safe';

export interface SafetyCheckResult {
  category: SafetyCategory;
  isSafe: boolean;
  confidence: 'high' | 'medium' | 'low';
  message: string;
  resources?: string[];
}

// Crisis resources to display when needed
export const CRISIS_RESOURCES = [
  'National Suicide Prevention Lifeline: 988',
  'Crisis Text Line: Text HOME to 741741',
  'National Domestic Violence Hotline: 1-800-799-7233',
  'SAMHSA National Helpline: 1-800-662-4357',
];

// Medical resources
export const MEDICAL_RESOURCES = [
  'For medical emergencies, call 911 or visit your nearest emergency room.',
  'Nurse hotline: Contact your insurance provider or local hospital.',
];

// Legal resources
export const LEGAL_RESOURCES = [
  'Legal aid societies provide free/low-cost legal help.',
  'State bar association: Find qualified attorneys in your area.',
];

// Investment disclaimer
export const INVESTMENT_DISCLAIMER =
  'Investment decisions should involve a qualified financial advisor. This app cannot provide investment advice.';

// Keyword patterns for detection (simple heuristic approach)
// NOTE: This is not foolproof. Backend also validates. Never claim 100% detection.
export const SAFETY_PATTERNS: Record<Exclude<SafetyCategory, 'safe'>, string[]> = {
  self_harm: [
    'kill myself', 'suicide', 'end my life', 'hurt myself', 'self harm',
    'cutting myself', 'overdose', 'jump off', 'not worth living',
    'want to die', 'better off dead', 'no reason to live',
    'don\'t want to be here', 'end it all', 'take my own life',
    'suicidal', 'not want to live', 'can\'t go on',
  ],
  
  medical_emergency: [
    'chest pain', 'trouble breathing', 'emergency room', '911 medical',
    'heart attack', 'stroke symptoms', 'severe bleeding', 'unconscious',
    'broken bone', 'head injury', 'severe pain', 'medical emergency'
  ],
  
  legal_emergency: [
    'arrested', 'going to jail', 'legal trouble', 'court date',
    'lawyer needed', 'criminal charges', 'sued', 'legal emergency',
    'police custody', 'warrant', 'legal help urgent'
  ],
  
  abuse_crisis: [
    'domestic violence', 'abusive relationship', 'being abused',
    'child abuse', 'elder abuse', 'sexual assault', 'stalking',
    'harassment', 'abuse help', 'crisis abuse'
  ],
  
  mental_health_crisis: [
    'mental breakdown', 'panic attack', 'severe depression',
    'psychiatric emergency', 'mental health crisis', 'suicidal thoughts',
    'self harm thoughts', 'crisis mental health'
  ],
  
  investment_advice: [
    'stock advice', 'investment recommendation', 'buy stock',
    'sell stock', 'portfolio advice', 'crypto investment',
    'financial advice', 'investment strategy', 'market prediction',
    'stock tips', 'investment advice'
  ]
};
