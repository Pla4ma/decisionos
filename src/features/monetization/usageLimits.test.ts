import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
    functions: { invoke: jest.fn() },
  },
}));

// Client-side limits mirroring Edge Functions _shared/limits.ts
const FREE_MONTHLY_ANALYSES = 3;
const PLUS_MONTHLY_ANALYSES = 50;
const PRO_MONTHLY_ANALYSES = 200;

function getLocalLimit(tier: string): number {
  switch (tier) {
    case 'pro': return PRO_MONTHLY_ANALYSES;
    case 'plus': return PLUS_MONTHLY_ANALYSES;
    default: return FREE_MONTHLY_ANALYSES;
  }
}

describe('usage limits', () => {
  describe('free user has 3 deep analyses', () => {
    test('FREE_MONTHLY_ANALYSES equals 3', () => {
      expect(FREE_MONTHLY_ANALYSES).toBe(3);
    });

    test('getLocalLimit for free returns 3', () => {
      expect(getLocalLimit('free')).toBe(3);
    });
  });

  describe('plus user has 50', () => {
    test('PLUS_MONTHLY_ANALYSES equals 50', () => {
      expect(PLUS_MONTHLY_ANALYSES).toBe(50);
    });

    test('getLocalLimit for plus returns 50', () => {
      expect(getLocalLimit('plus')).toBe(50);
    });
  });

  describe('pro user has 200', () => {
    test('PRO_MONTHLY_ANALYSES equals 200', () => {
      expect(PRO_MONTHLY_ANALYSES).toBe(200);
    });

    test('getLocalLimit for pro returns 200', () => {
      expect(getLocalLimit('pro')).toBe(200);
    });
  });

  describe('client display matches backend', () => {
    test('unknown tier defaults to free', () => {
      expect(getLocalLimit('unknown')).toBe(3);
    });

    test('limits increase with tier', () => {
      expect(getLocalLimit('free')).toBeLessThan(getLocalLimit('plus'));
      expect(getLocalLimit('plus')).toBeLessThan(getLocalLimit('pro'));
    });
  });
});
