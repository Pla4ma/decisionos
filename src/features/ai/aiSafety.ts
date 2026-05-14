// AI Safety Detection
// Detect sensitive/crisis content and prevent inappropriate AI analysis

import {
  SafetyCategory,
  SafetyCheckResult,
  CRISIS_RESOURCES,
  MEDICAL_RESOURCES,
  LEGAL_RESOURCES,
  INVESTMENT_DISCLAIMER,
  SAFETY_PATTERNS,
} from './aiSafetyPatterns';

/**
 * Check if decision text contains safety concerns
 * Returns safety category and appropriate response
 *
 * NOTE: This is a heuristic pre-check. Backend also validates.
 * Never claim 100% detection accuracy.
 */
export function checkSafety(decisionText: string): SafetyCheckResult {
  const normalizedText = decisionText.toLowerCase();

  // Check each category
  for (const [category, keywords] of Object.entries(SAFETY_PATTERNS)) {
    const matchedKeyword = keywords.find((keyword) =>
      normalizedText.includes(keyword.toLowerCase())
    );

    if (matchedKeyword) {
      return createSafetyResult(category as SafetyCategory, matchedKeyword);
    }
  }

  // No concerns detected
  return {
    category: 'safe',
    isSafe: true,
    confidence: 'high',
    message: '',
  };
}

/**
 * Create safety result based on category
 */
function createSafetyResult(
  category: Exclude<SafetyCategory, 'safe'>,
  matchedKeyword: string
): SafetyCheckResult {
  switch (category) {
    case 'self_harm':
      return {
        category,
        isSafe: false,
        confidence: 'medium', // Heuristic, not perfect
        message:
          'It sounds like you might be going through something really difficult. ' +
          'DecisionOS is not equipped to help with crisis situations.',
        resources: CRISIS_RESOURCES,
      };

    case 'mental_health_crisis':
      return {
        category,
        isSafe: false,
        confidence: 'medium',
        message:
          'Mental health crises deserve professional support. ' +
          'DecisionOS cannot provide the help you need right now.',
        resources: CRISIS_RESOURCES,
      };

    case 'medical_emergency':
      return {
        category,
        isSafe: false,
        confidence: 'medium',
        message:
          'Medical emergencies require immediate professional attention. ' +
          'Do not rely on DecisionOS for medical advice.',
        resources: MEDICAL_RESOURCES,
      };

    case 'legal_emergency':
      return {
        category,
        isSafe: false,
        confidence: 'medium',
        message:
          'Legal emergencies require qualified legal counsel. ' +
          'DecisionOS cannot provide legal advice.',
        resources: LEGAL_RESOURCES,
      };

    case 'abuse_crisis':
      return {
        category,
        isSafe: false,
        confidence: 'medium',
        message:
          'If you are in an unsafe situation, please reach out for help. ' +
          'You are not alone.',
        resources: CRISIS_RESOURCES,
      };

    case 'investment_advice':
      return {
        category,
        isSafe: false,
        confidence: 'low', // Harder to detect, more false positives
        message: INVESTMENT_DISCLAIMER,
      };

    default:
      return {
        category: 'safe',
        isSafe: true,
        confidence: 'high',
        message: '',
      };
  }
}

/**
 * Validate that decision category is allowed
 * (Pre-check before AI analysis)
 */
export function isAllowedCategory(category: string): boolean {
  const blockedCategories = [
    'medical',
    'mental_health',
    'legal',
    'investment',
    'safety',
    'crisis',
  ];

  return !blockedCategories.includes(category.toLowerCase());
}

/**
 * Get safe fallback message for blocked decisions
 */
export function getSafetyFallbackMessage(category: SafetyCategory): string {
  const messages: Record<SafetyCategory, string> = {
    self_harm:
      'Your wellbeing is important. Please contact a crisis helpline or mental health professional.',
    medical_emergency:
      'For medical decisions, please consult a healthcare provider.',
    legal_emergency:
      'For legal matters, please consult a qualified attorney.',
    abuse_crisis:
      'Help is available. Please contact a crisis hotline or local support services.',
    mental_health_crisis:
      'Mental health support is available. Please reach out to a professional.',
    investment_advice:
      'For investment decisions, please consult a financial advisor.',
    safe: '',
  };

  return messages[category] || '';
}

/**
 * Sanitize decision content for logging (remove PII/sensitive text)
 */
export function sanitizeForLogging(text: string): string {
  if (!text) return '';

  // Truncate to prevent logging full content
  const truncated = text.substring(0, 50);

  // Replace potential PII with placeholders
  // Email
  let sanitized = truncated.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]');

  // Phone numbers (basic pattern)
  sanitized = sanitized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');

  // Add ellipsis if truncated
  if (text.length > 50) {
    sanitized += '...';
  }

  return sanitized;
}
