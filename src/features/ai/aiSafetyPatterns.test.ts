// AI Safety Patterns Tests
// Unit tests for safety pattern detection

import { SAFETY_PATTERNS, CRISIS_RESOURCES, MEDICAL_RESOURCES, LEGAL_RESOURCES, INVESTMENT_DISCLAIMER } from './aiSafetyPatterns';

describe('aiSafetyPatterns', () => {
  describe('SAFETY_PATTERNS', () => {
    test('has all expected categories', () => {
      expect(SAFETY_PATTERNS.self_harm).toBeDefined();
      expect(SAFETY_PATTERNS.medical_emergency).toBeDefined();
      expect(SAFETY_PATTERNS.legal_emergency).toBeDefined();
      expect(SAFETY_PATTERNS.abuse_crisis).toBeDefined();
      expect(SAFETY_PATTERNS.mental_health_crisis).toBeDefined();
      expect(SAFETY_PATTERNS.investment_advice).toBeDefined();
    });

    test('self_harm patterns are comprehensive', () => {
      const patterns = SAFETY_PATTERNS.self_harm;
      expect(patterns.length).toBeGreaterThan(5);
      expect(patterns).toContain('suicide');
      expect(patterns).toContain('kill myself');
      expect(patterns).toContain('end my life');
    });

    test('medical_emergency patterns cover urgency', () => {
      const patterns = SAFETY_PATTERNS.medical_emergency;
      expect(patterns.length).toBeGreaterThan(5);
      expect(patterns).toContain('chest pain');
      expect(patterns).toContain('heart attack');
      expect(patterns).toContain('emergency room');
    });

    test('legal_emergency patterns cover urgency', () => {
      const patterns = SAFETY_PATTERNS.legal_emergency;
      expect(patterns.length).toBeGreaterThan(5);
      expect(patterns).toContain('arrested');
      expect(patterns).toContain('lawyer needed');
      expect(patterns).toContain('court date');
    });

    test('abuse_crisis patterns are sensitive', () => {
      const patterns = SAFETY_PATTERNS.abuse_crisis;
      expect(patterns.length).toBeGreaterThan(5);
      expect(patterns.some(p => p.includes('abuse') || p.includes('violence'))).toBe(true);
    });

    test('mental_health_crisis patterns cover crisis', () => {
      const patterns = SAFETY_PATTERNS.mental_health_crisis;
      expect(patterns.length).toBeGreaterThan(5);
      expect(patterns.some(p => p.includes('breakdown') || p.includes('depression'))).toBe(true);
    });

    test('investment_advice patterns cover financial', () => {
      const patterns = SAFETY_PATTERNS.investment_advice;
      expect(patterns.length).toBeGreaterThan(5);
      expect(patterns.some(p => p.includes('stock') || p.includes('investment'))).toBe(true);
    });

    test('all patterns are lowercase strings', () => {
      Object.values(SAFETY_PATTERNS).forEach((patterns) => {
        patterns.forEach((p) => {
          expect(typeof p).toBe('string');
          expect(p).toBe(p.toLowerCase());
        });
      });
    });

    test('no duplicate patterns within category', () => {
      Object.entries(SAFETY_PATTERNS).forEach(([category, patterns]) => {
        const unique = new Set(patterns);
        expect(unique.size).toBe(patterns.length);
      });
    });

    test('self_harm patterns are truly dangerous keywords', () => {
      const patterns = SAFETY_PATTERNS.self_harm;
      patterns.forEach((p) => {
        expect(p.length).toBeGreaterThan(3);
        expect(['suicide', 'kill', 'die', 'hurt', 'cutting', 'overdose', 'jump', 'living'].some(k => p.includes(k))).toBe(true);
      });
    });

    test('medical patterns are actual symptoms', () => {
      const patterns = SAFETY_PATTERNS.medical_emergency;
      patterns.forEach((p) => {
        expect(p.split(' ').length).toBeLessThanOrEqual(3);
      });
    });

    test('abuse patterns include relationship context', () => {
      const patterns = SAFETY_PATTERNS.abuse_crisis;
      expect(patterns.some(p => p.includes('relationship') || p.includes('domestic'))).toBe(true);
    });

    test('investment patterns cover specific products', () => {
      const patterns = SAFETY_PATTERNS.investment_advice;
      expect(patterns.some(p => p.includes('stock') || p.includes('crypto'))).toBe(true);
    });
  });

  describe('CRISIS_RESOURCES', () => {
    test('contains suicide prevention lifeline', () => {
      const has988 = CRISIS_RESOURCES.some(r => r.includes('988'));
      expect(has988).toBe(true);
    });

    test('contains crisis text line', () => {
      const hasTextLine = CRISIS_RESOURCES.some(r => r.includes('741741') || r.includes('Text'));
      expect(hasTextLine).toBe(true);
    });

    test('contains domestic violence hotline', () => {
      const hasDV = CRISIS_RESOURCES.some(r => r.includes('Domestic') || r.includes('7233'));
      expect(hasDV).toBe(true);
    });

    test('all resources are non-empty strings', () => {
      CRISIS_RESOURCES.forEach((r) => {
        expect(typeof r).toBe('string');
        expect(r.trim().length).toBeGreaterThan(0);
      });
    });

    test('all resources contain contact information', () => {
      CRISIS_RESOURCES.forEach((r) => {
        expect(r.match(/\d{3}|hotline|line|service/i)).toBeTruthy();
      });
    });
  });

  describe('MEDICAL_RESOURCES', () => {
    test('contains emergency guidance', () => {
      const hasEmergency = MEDICAL_RESOURCES.some(r => r.includes('911') || r.includes('emergency'));
      expect(hasEmergency).toBe(true);
    });

    test('contains nurse hotline guidance', () => {
      const hasNurse = MEDICAL_RESOURCES.some(r => r.includes('nurse') || r.includes('hotline'));
      expect(hasNurse).toBe(true);
    });

    test('all resources are actionable', () => {
      MEDICAL_RESOURCES.forEach((r) => {
        expect(r.includes('call') || r.includes('Contact') || r.includes('visit')).toBe(true);
      });
    });
  });

  describe('LEGAL_RESOURCES', () => {
    test('contains legal aid reference', () => {
      const hasLegalAid = LEGAL_RESOURCES.some(r => r.includes('legal aid'));
      expect(hasLegalAid).toBe(true);
    });

    test('contains attorney reference', () => {
      const hasAttorney = LEGAL_RESOURCES.some(r => r.includes('attorney') || r.includes('lawyer'));
      expect(hasAttorney).toBe(true);
    });

    test('mentions free/low-cost options', () => {
      const hasFreeOptions = LEGAL_RESOURCES.some(r => r.includes('free') || r.includes('low-cost'));
      expect(hasFreeOptions).toBe(true);
    });
  });

  describe('INVESTMENT_DISCLAIMER', () => {
    test('is non-empty string', () => {
      expect(typeof INVESTMENT_DISCLAIMER).toBe('string');
      expect(INVESTMENT_DISCLAIMER.length).toBeGreaterThan(0);
    });

    test('mentions financial advisor', () => {
      expect(INVESTMENT_DISCLAIMER.toLowerCase()).toContain('financial advisor');
    });

    test('includes warning about not providing advice', () => {
      expect(INVESTMENT_DISCLAIMER.toLowerCase()).toContain('cannot');
    });

    test('is professional in tone', () => {
      expect(INVESTMENT_DISCLAIMER).not.toMatch(/!/);
      expect(INVESTMENT_DISCLAIMER.split('.').length).toBeGreaterThan(1);
    });
  });

  describe('overall pattern coverage', () => {
    test('has at least 5 patterns per category', () => {
      Object.entries(SAFETY_PATTERNS).forEach(([category, patterns]) => {
        expect(patterns.length).toBeGreaterThanOrEqual(5);
      });
    });

    test('no empty categories', () => {
      Object.entries(SAFETY_PATTERNS).forEach(([category, patterns]) => {
        expect(patterns.length).toBeGreaterThan(0);
      });
    });
  });
});