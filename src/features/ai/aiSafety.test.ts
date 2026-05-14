// AI Safety Tests
// Tests for safety detection and content filtering

import { checkSafety, isAllowedCategory, getSafetyFallbackMessage, sanitizeForLogging } from './aiSafety';

describe('checkSafety', () => {
  describe('self-harm detection', () => {
    test('detects suicide keywords', () => {
      const result = checkSafety('I am thinking about suicide');
      expect(result.isSafe).toBe(false);
      expect(result.category).toBe('self_harm');
      expect(result.resources).toBeDefined();
    });

    test('detects self-harm variations', () => {
      const result = checkSafety('I want to hurt myself');
      expect(result.isSafe).toBe(false);
      expect(result.category).toBe('self_harm');
    });

    test('detects "end my life"', () => {
      const result = checkSafety('I want to end my life');
      expect(result.isSafe).toBe(false);
      expect(result.category).toBe('self_harm');
    });
  });

  describe('medical emergency detection', () => {
    test('detects chest pain', () => {
      const result = checkSafety('I have severe chest pain, should I go to ER?');
      expect(result.isSafe).toBe(false);
      expect(result.category).toBe('medical_emergency');
    });

    test('detects breathing issues', () => {
      const result = checkSafety('I can\'t breathe properly');
      expect(result.isSafe).toBe(false);
      expect(result.category).toBe('medical_emergency');
    });

    test('detects heart attack', () => {
      const result = checkSafety('I think I\'m having a heart attack');
      expect(result.isSafe).toBe(false);
      expect(result.category).toBe('medical_emergency');
    });
  });

  describe('legal emergency detection', () => {
    test('detects arrest', () => {
      const result = checkSafety('I was arrested and need a lawyer now');
      expect(result.isSafe).toBe(false);
      expect(result.category).toBe('legal_emergency');
    });

    test('detects court urgency', () => {
      const result = checkSafety('I have court tomorrow and need legal help');
      expect(result.isSafe).toBe(false);
      expect(result.category).toBe('legal_emergency');
    });
  });

  describe('investment advice detection', () => {
    test('detects stock questions', () => {
      const result = checkSafety('Should I invest in Tesla stock?');
      expect(result.isSafe).toBe(false);
      expect(result.category).toBe('investment_advice');
    });

    test('detects crypto questions', () => {
      const result = checkSafety('Should I buy Bitcoin now?');
      expect(result.isSafe).toBe(false);
      expect(result.category).toBe('investment_advice');
    });

    test('detects portfolio questions', () => {
      const result = checkSafety('How should I allocate my retirement portfolio?');
      expect(result.isSafe).toBe(false);
      expect(result.category).toBe('investment_advice');
    });
  });

  describe('safe content', () => {
    test('allows career decisions', () => {
      const result = checkSafety('Should I take the new job offer or stay at my current company?');
      expect(result.isSafe).toBe(true);
      expect(result.category).toBe('safe');
    });

    test('allows relationship decisions', () => {
      const result = checkSafety('Should I move in with my partner?');
      expect(result.isSafe).toBe(true);
      expect(result.category).toBe('safe');
    });

    test('allows lifestyle decisions', () => {
      const result = checkSafety('Should I buy a house or continue renting?');
      expect(result.isSafe).toBe(true);
      expect(result.category).toBe('safe');
    });

    test('allows education decisions', () => {
      const result = checkSafety('Should I go to grad school or start working?');
      expect(result.isSafe).toBe(true);
      expect(result.category).toBe('safe');
    });
  });

  describe('edge cases', () => {
    test('handles empty string', () => {
      const result = checkSafety('');
      expect(result.isSafe).toBe(true);
      expect(result.category).toBe('safe');
    });

    test('handles very short text', () => {
      const result = checkSafety('Hi');
      expect(result.isSafe).toBe(true);
      expect(result.category).toBe('safe');
    });

    test('is case insensitive', () => {
      const result = checkSafety('I Want To HURT MYSELF');
      expect(result.isSafe).toBe(false);
      expect(result.category).toBe('self_harm');
    });
  });
});

describe('isAllowedCategory', () => {
  test('allows safe categories', () => {
    expect(isAllowedCategory('career')).toBe(true);
    expect(isAllowedCategory('money')).toBe(true);
    expect(isAllowedCategory('relationship')).toBe(true);
    expect(isAllowedCategory('lifestyle')).toBe(true);
    expect(isAllowedCategory('education')).toBe(true);
  });

  test('blocks medical category', () => {
    expect(isAllowedCategory('medical')).toBe(false);
    expect(isAllowedCategory('health')).toBe(true); // Not blocked
  });

  test('blocks mental_health category', () => {
    expect(isAllowedCategory('mental_health')).toBe(false);
  });

  test('blocks legal category', () => {
    expect(isAllowedCategory('legal')).toBe(false);
  });

  test('blocks investment category', () => {
    expect(isAllowedCategory('investment')).toBe(false);
  });

  test('is case insensitive', () => {
    expect(isAllowedCategory('MEDICAL')).toBe(false);
    expect(isAllowedCategory('CAREER')).toBe(true);
  });
});

describe('getSafetyFallbackMessage', () => {
  test('returns message for self_harm', () => {
    const message = getSafetyFallbackMessage('self_harm');
    expect(message).toContain('wellbeing');
    expect(message.length).toBeGreaterThan(0);
  });

  test('returns message for medical_emergency', () => {
    const message = getSafetyFallbackMessage('medical_emergency');
    expect(message).toContain('healthcare provider');
  });

  test('returns message for legal_emergency', () => {
    const message = getSafetyFallbackMessage('legal_emergency');
    expect(message).toContain('attorney');
  });

  test('returns empty string for safe', () => {
    const message = getSafetyFallbackMessage('safe');
    expect(message).toBe('');
  });
});

describe('sanitizeForLogging', () => {
  test('truncates long text', () => {
    const longText = 'a'.repeat(200);
    const sanitized = sanitizeForLogging(longText);
    expect(sanitized.length).toBeLessThanOrEqual(53); // 50 + "..."
    expect(sanitized.endsWith('...')).toBe(true);
  });

  test('removes email addresses', () => {
    const text = 'Contact me at john@example.com for help';
    const sanitized = sanitizeForLogging(text);
    expect(sanitized).not.toContain('john@example.com');
    expect(sanitized).toContain('[EMAIL]');
  });

  test('removes phone numbers', () => {
    const text = 'Call me at 555-123-4567';
    const sanitized = sanitizeForLogging(text);
    expect(sanitized).not.toContain('555-123-4567');
    expect(sanitized).toContain('[PHONE]');
  });

  test('handles empty string', () => {
    const sanitized = sanitizeForLogging('');
    expect(sanitized).toBe('');
  });

  test('preserves short safe text', () => {
    const text = 'Career decision about promotion';
    const sanitized = sanitizeForLogging(text);
    expect(sanitized).toBe(text);
  });
});
