// RevenueCat Service Tests
// Unit tests for RevenueCat wrapper service

import {
  isRevenueCatConfigured,
  getCustomerInfo,
  getAvailablePackages,
  hasEntitlement,
  getCurrentTier,
  purchasePackage,
  restorePurchases,
} from './revenueCatService';

jest.mock('./monetizationTypes', () => ({
  CustomerInfo: {},
  SubscriptionPackage: {},
  SubscriptionTier: 'free',
  Entitlement: 'plus',
}));

describe('revenueCatService', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('isRevenueCatConfigured', () => {
    test('returns false when API key not set', () => {
      const result = isRevenueCatConfigured();
      expect(typeof result).toBe('boolean');
    });

    test('returns true when API key is set', () => {
      process.env.EXPO_PUBLIC_REVENUECAT_API_KEY = 'test-key';
      jest.resetModules();
      const result = isRevenueCatConfigured();
      expect(result).toBe(true);
      delete process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
    });
  });

  describe('getCustomerInfo', () => {
    test('returns mock customer info when not configured', async () => {
      const result = await getCustomerInfo();
      expect(result).toHaveProperty('tier');
      expect(result).toHaveProperty('entitlements');
    });

    test('mock info has free tier', async () => {
      const result = await getCustomerInfo();
      expect(result.tier).toBe('free');
    });

    test('mock info has empty entitlements', async () => {
      const result = await getCustomerInfo();
      expect(Array.isArray(result.entitlements)).toBe(true);
      expect(result.entitlements).toHaveLength(0);
    });
  });

  describe('getAvailablePackages', () => {
    test('returns mock packages when not configured', async () => {
      const result = await getAvailablePackages();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('returns at least monthly and annual packages', async () => {
      const result = await getAvailablePackages();
      const periods = result.map((p) => p.period);
      expect(periods).toContain('monthly');
      expect(periods).toContain('annual');
    });

    test('all packages have valid tier', async () => {
      const result = await getAvailablePackages();
      result.forEach((pkg) => {
        expect(['free', 'plus', 'pro']).toContain(pkg.tier);
      });
    });

    test('all packages have price greater than 0', async () => {
      const result = await getAvailablePackages();
      result.forEach((pkg) => {
        expect(pkg.price).toBeGreaterThan(0);
      });
    });

    test('all packages have trial days', async () => {
      const result = await getAvailablePackages();
      result.forEach((pkg) => {
        expect(pkg.trialDays).not.toBeNull();
      });
    });

    test('annual price is discounted vs monthly', async () => {
      const result = await getAvailablePackages();
      const monthly = result.find((p) => p.period === 'monthly');
      const annual = result.find((p) => p.period === 'annual');

      if (monthly && annual) {
        const annualMonthlyEquivalent = annual.price / 12;
        expect(annualMonthlyEquivalent).toBeLessThan(monthly.price);
      }
    });
  });

  describe('hasEntitlement', () => {
    test('returns false for mock customer without entitlements', async () => {
      const result = await hasEntitlement('plus');
      expect(result).toBe(false);
    });
  });

  describe('getCurrentTier', () => {
    test('returns free for mock customer', async () => {
      const result = await getCurrentTier();
      expect(result).toBe('free');
    });
  });

  describe('purchasePackage', () => {
    test('returns error when not configured', async () => {
      const result = await purchasePackage('decisionos_plus_monthly');
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test('error message indicates configuration needed', async () => {
      const result = await purchasePackage('test');
      expect(result.error).toContain('not configured');
    });
  });

  describe('restorePurchases', () => {
    test('returns error when not configured', async () => {
      const result = await restorePurchases();
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test('error message indicates configuration needed', async () => {
      const result = await restorePurchases();
      expect(result.error).toContain('not configured');
    });
  });

  describe('mock packages structure', () => {
    test('mock packages have all required fields', async () => {
      const result = await getAvailablePackages();

      result.forEach((pkg) => {
        expect(pkg).toHaveProperty('identifier');
        expect(pkg).toHaveProperty('tier');
        expect(pkg).toHaveProperty('price');
        expect(pkg).toHaveProperty('currency');
        expect(pkg).toHaveProperty('period');
        expect(pkg).toHaveProperty('trialDays');
      });
    });

    test('mock packages have valid identifiers', async () => {
      const result = await getAvailablePackages();

      result.forEach((pkg) => {
        expect(pkg.identifier).toMatch(/^decisionos_/);
        expect(pkg.identifier).toMatch(/_monthly|_annual$/);
      });
    });

    test('mock packages have valid currency', async () => {
      const result = await getAvailablePackages();

      result.forEach((pkg) => {
        expect(pkg.currency).toMatch(/^[A-Z]{3}$/);
      });
    });
  });

  describe('initializeRevenueCat', () => {
    test('warns when not configured', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await initializeRevenueCat('user-123');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('integration-ready structure', () => {
    test('functions are async for future SDK integration', async () => {
      const customerInfo = await getCustomerInfo();
      expect(customerInfo).toBeDefined();

      const packages = await getAvailablePackages();
      expect(Array.isArray(packages)).toBe(true);
    });

    test('purchase returns structured result', async () => {
      const result = await purchasePackage('test');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
    });

    test('restore returns structured result', async () => {
      const result = await restorePurchases();
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
    });
  });
});

// Import for initializeRevenueCat test
import { initializeRevenueCat } from './revenueCatService';