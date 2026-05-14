// Monetization Types Tests
// Unit tests for monetization type definitions

import type {
  SubscriptionTier,
  Entitlement,
  ProductIdentifier,
  UsageLimitStatus,
  CustomerInfo,
  SubscriptionPackage,
  PaywallConfig,
} from './monetizationTypes';

describe('monetizationTypes', () => {
  describe('SubscriptionTier', () => {
    test('has free tier', () => {
      const tier: SubscriptionTier = 'free';
      expect(tier).toBe('free');
    });

    test('has plus tier', () => {
      const tier: SubscriptionTier = 'plus';
      expect(tier).toBe('plus');
    });

    test('has pro tier', () => {
      const tier: SubscriptionTier = 'pro';
      expect(tier).toBe('pro');
    });

    test('three tiers total', () => {
      const tiers: SubscriptionTier[] = ['free', 'plus', 'pro'];
      expect(tiers).toHaveLength(3);
    });
  });

  describe('Entitlement', () => {
    test('has plus entitlement', () => {
      const entitlement: Entitlement = 'plus';
      expect(entitlement).toBe('plus');
    });

    test('has analysis_unlimited entitlement', () => {
      const entitlement: Entitlement = 'analysis_unlimited';
      expect(entitlement).toBe('analysis_unlimited');
    });

    test('has pro_features entitlement', () => {
      const entitlement: Entitlement = 'pro_features';
      expect(entitlement).toBe('pro_features');
    });

    test('three entitlements total', () => {
      const entitlements: Entitlement[] = ['plus', 'analysis_unlimited', 'pro_features'];
      expect(entitlements).toHaveLength(3);
    });
  });

  describe('ProductIdentifier', () => {
    test('has plus monthly', () => {
      const id: ProductIdentifier = 'decisionos_plus_monthly';
      expect(id).toBe('decisionos_plus_monthly');
    });

    test('has plus annual', () => {
      const id: ProductIdentifier = 'decisionos_plus_annual';
      expect(id).toBe('decisionos_plus_annual');
    });

    test('has pro monthly', () => {
      const id: ProductIdentifier = 'decisionos_pro_monthly';
      expect(id).toBe('decisionos_pro_monthly');
    });

    test('has pro annual', () => {
      const id: ProductIdentifier = 'decisionos_pro_annual';
      expect(id).toBe('decisionos_pro_annual');
    });

    test('four products total', () => {
      const ids: ProductIdentifier[] = [
        'decisionos_plus_monthly',
        'decisionos_plus_annual',
        'decisionos_pro_monthly',
        'decisionos_pro_annual',
      ];
      expect(ids).toHaveLength(4);
    });
  });

  describe('UsageLimitStatus', () => {
    const validStatus: UsageLimitStatus = {
      tier: 'free',
      analysesUsed: 2,
      analysesLimit: 3,
      analysesRemaining: 1,
      periodStart: '2024-01-01T00:00:00Z',
      periodEnd: '2024-01-31T23:59:59Z',
      canAnalyze: true,
    };

    test('accepts valid status', () => {
      expect(validStatus.tier).toBe('free');
      expect(validStatus.analysesUsed).toBe(2);
      expect(validStatus.analysesRemaining).toBe(1);
      expect(validStatus.canAnalyze).toBe(true);
    });

    test('analysesUsed is non-negative', () => {
      expect(validStatus.analysesUsed).toBeGreaterThanOrEqual(0);
    });

    test('analysesRemaining is non-negative', () => {
      expect(validStatus.analysesRemaining).toBeGreaterThanOrEqual(0);
    });

    test('period dates are ISO strings', () => {
      expect(validStatus.periodStart).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(validStatus.periodEnd).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    test('canAnalyze reflects remaining analyses', () => {
      const hasRemaining: UsageLimitStatus = { ...validStatus, analysesRemaining: 1 };
      const noRemaining: UsageLimitStatus = { ...validStatus, analysesRemaining: 0 };
      expect(hasRemaining.canAnalyze).toBe(true);
      expect(noRemaining.canAnalyze).toBe(false);
    });

    test('infinity for unlimited', () => {
      const unlimited: UsageLimitStatus = {
        ...validStatus,
        tier: 'plus',
        analysesLimit: Infinity,
        analysesRemaining: Infinity,
        canAnalyze: true,
      };
      expect(unlimited.analysesLimit).toBe(Infinity);
      expect(unlimited.analysesRemaining).toBe(Infinity);
    });
  });

  describe('CustomerInfo', () => {
    const validInfo: CustomerInfo = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      tier: 'plus',
      entitlements: ['plus', 'analysis_unlimited'],
      latestExpirationDate: '2024-12-31T23:59:59Z',
      originalPurchaseDate: '2024-01-01T00:00:00Z',
    };

    test('accepts valid info', () => {
      expect(validInfo.userId).toBeTruthy();
      expect(validInfo.tier).toBe('plus');
    });

    test('entitlements is non-empty array', () => {
      expect(Array.isArray(validInfo.entitlements)).toBe(true);
      expect(validInfo.entitlements.length).toBeGreaterThan(0);
    });

    test('dates can be null for free tier', () => {
      const freeUser: CustomerInfo = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        tier: 'free',
        entitlements: [],
        latestExpirationDate: null,
        originalPurchaseDate: null,
      };
      expect(freeUser.latestExpirationDate).toBeNull();
      expect(freeUser.originalPurchaseDate).toBeNull();
    });

    test('userId is UUID', () => {
      expect(validInfo.userId).toMatch(/^[0-9a-f-]{36}$/);
    });
  });

  describe('SubscriptionPackage', () => {
    const validPackage: SubscriptionPackage = {
      identifier: 'decisionos_plus_monthly',
      tier: 'plus',
      price: 9.99,
      currency: 'USD',
      period: 'monthly',
      trialDays: 7,
    };

    test('accepts valid package', () => {
      expect(validPackage.identifier).toBe('decisionos_plus_monthly');
      expect(validPackage.price).toBe(9.99);
      expect(validPackage.period).toBe('monthly');
    });

    test('price is positive number', () => {
      expect(validPackage.price).toBeGreaterThan(0);
    });

    test('trialDays can be null for no trial', () => {
      const noTrial: SubscriptionPackage = {
        ...validPackage,
        trialDays: null,
      };
      expect(noTrial.trialDays).toBeNull();
    });

    test('trialDays is positive when present', () => {
      expect(validPackage.trialDays).toBeGreaterThan(0);
    });

    test('currency is valid format', () => {
      expect(validPackage.currency).toMatch(/^[A-Z]{3}$/);
    });

    test('period is monthly or annual', () => {
      const monthly: SubscriptionPackage = { ...validPackage, period: 'monthly' };
      const annual: SubscriptionPackage = { ...validPackage, period: 'annual' };
      expect(monthly.period).toBe('monthly');
      expect(annual.period).toBe('annual');
    });

    test('annual price is roughly 10x monthly price', () => {
      const monthly: SubscriptionPackage = {
        identifier: 'decisionos_plus_monthly',
        tier: 'plus',
        price: 9.99,
        currency: 'USD',
        period: 'monthly',
        trialDays: 7,
      };
      const annual: SubscriptionPackage = {
        identifier: 'decisionos_plus_annual',
        tier: 'plus',
        price: 99.99,
        currency: 'USD',
        period: 'annual',
        trialDays: 7,
      };
      expect(annual.price / monthly.price).toBeCloseTo(10, 0);
    });
  });

  describe('PaywallConfig', () => {
    const validConfig: PaywallConfig = {
      title: 'Unlock Your Decision Intelligence',
      subtitle: 'Get unlimited AI analysis and deeper insights',
      features: [
        'Unlimited AI analyses',
        'Decision playbook generation',
        'Blind spot detection',
        'Prediction accuracy tracking',
      ],
      primaryPackage: {
        identifier: 'decisionos_plus_monthly',
        tier: 'plus',
        price: 9.99,
        currency: 'USD',
        period: 'monthly',
        trialDays: 7,
      },
      secondaryPackage: {
        identifier: 'decisionos_plus_annual',
        tier: 'plus',
        price: 99.99,
        currency: 'USD',
        period: 'annual',
        trialDays: 7,
      },
    };

    test('accepts valid config', () => {
      expect(validConfig.title).toBeTruthy();
      expect(validConfig.features.length).toBeGreaterThan(0);
    });

    test('features is non-empty array', () => {
      expect(Array.isArray(validConfig.features)).toBe(true);
      expect(validConfig.features.length).toBeGreaterThan(0);
    });

    test('all features are non-empty strings', () => {
      validConfig.features.forEach((f) => {
        expect(typeof f).toBe('string');
        expect(f.trim().length).toBeGreaterThan(0);
      });
    });

    test('primaryPackage is required', () => {
      expect(validConfig.primaryPackage).toBeTruthy();
    });

    test('secondaryPackage can be null', () => {
      const noSecondary: PaywallConfig = {
        ...validConfig,
        secondaryPackage: null,
      };
      expect(noSecondary.secondaryPackage).toBeNull();
    });

    test('title and subtitle are descriptive', () => {
      expect(validConfig.title.length).toBeGreaterThan(5);
      expect(validConfig.subtitle.length).toBeGreaterThan(10);
    });
  });

  describe('relationship between types', () => {
    test('Package tier matches identifier tier', () => {
      const plus: SubscriptionPackage = {
        identifier: 'decisionos_plus_monthly',
        tier: 'plus',
        price: 9.99,
        currency: 'USD',
        period: 'monthly',
        trialDays: 7,
      };
      const pro: SubscriptionPackage = {
        identifier: 'decisionos_pro_monthly',
        tier: 'pro',
        price: 19.99,
        currency: 'USD',
        period: 'monthly',
        trialDays: 7,
      };
      expect(plus.identifier).toContain(plus.tier);
      expect(pro.identifier).toContain(pro.tier);
    });

    test('CustomerInfo entitlements match Entitlement type', () => {
      const plusCustomer: CustomerInfo = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        tier: 'plus',
        entitlements: ['plus'],
        latestExpirationDate: null,
        originalPurchaseDate: null,
      };
      expect(plusCustomer.entitlements[0]).toBe('plus');
    });

    test('UsageLimitStatus tier matches SubscriptionTier', () => {
      const freeStatus: UsageLimitStatus = {
        tier: 'free',
        analysesUsed: 0,
        analysesLimit: 3,
        analysesRemaining: 3,
        periodStart: '2024-01-01T00:00:00Z',
        periodEnd: '2024-01-31T23:59:59Z',
        canAnalyze: true,
      };
      const plusStatus: UsageLimitStatus = {
        ...freeStatus,
        tier: 'plus',
        analysesLimit: Infinity,
        analysesRemaining: Infinity,
      };
      expect(freeStatus.tier).toBe('free');
      expect(plusStatus.tier).toBe('plus');
    });
  });
});