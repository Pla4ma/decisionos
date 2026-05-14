// Safety pre-check — blocks harmful content before AI analysis

export const SAFETY_KEYWORDS: Record<string, string[]> = {
  self_harm: ['kill myself', 'suicide', 'end my life', 'hurt myself', 'self harm', 'want to die', 'better off dead'],
  medical: ['chest pain', 'trouble breathing', 'emergency room', 'medical emergency', 'heart attack', 'stroke'],
  legal: ['arrested', 'going to jail', 'legal trouble', 'court date', 'criminal charges', 'sued', 'lawyer needed'],
  abuse: ['domestic violence', 'abusive relationship', 'being abused', 'sexual assault', 'stalking'],
  investment: ['stock advice', 'investment recommendation', 'buy stock', 'sell stock', 'crypto investment', 'financial advice'],
};

export function checkSafetyBeforeAnalysis(
  decision: Record<string, unknown>,
  options: unknown[],
  answers: unknown[],
): { allowed: boolean; message: string } {
  const textsToCheck = [
    String(decision.title || ''),
    String(decision.context || ''),
    ...(options as Record<string, unknown>[]).map(o => String(o.title || '') + ' ' + String(o.description || '')),
    ...(answers as Record<string, string>[]).map(a => String(a.answer || '')),
  ].join(' ').toLowerCase();

  for (const keyword of SAFETY_KEYWORDS.self_harm) {
    if (textsToCheck.includes(keyword)) {
      return {
        allowed: false,
        message: 'If you are going through a crisis, please reach out for support. DecisionOS is not the right tool for this situation. Contact the National Suicide Prevention Lifeline at 988 or text HOME to 741741.',
      };
    }
  }

  for (const keyword of SAFETY_KEYWORDS.medical) {
    if (textsToCheck.includes(keyword)) {
      return {
        allowed: false,
        message: 'For medical decisions, please consult a healthcare professional. DecisionOS cannot provide medical advice or analysis.',
      };
    }
  }

  for (const keyword of SAFETY_KEYWORDS.legal) {
    if (textsToCheck.includes(keyword)) {
      return {
        allowed: false,
        message: 'For legal matters, please consult a qualified attorney. DecisionOS cannot provide legal advice.',
      };
    }
  }

  for (const keyword of SAFETY_KEYWORDS.abuse) {
    if (textsToCheck.includes(keyword)) {
      return {
        allowed: false,
        message: 'If you are in an unsafe situation, please reach out for help. Contact the National Domestic Violence Hotline at 1-800-799-7233.',
      };
    }
  }

  for (const keyword of SAFETY_KEYWORDS.investment) {
    if (textsToCheck.includes(keyword)) {
      return {
        allowed: false,
        message: 'For investment decisions, please consult a qualified financial advisor. DecisionOS is not a financial advisory tool.',
      };
    }
  }

  return { allowed: true, message: '' };
}
