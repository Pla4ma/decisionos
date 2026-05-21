import { isRevenueCatConfigured, purchasePackage, restorePurchases } from './revenueCatService';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

describe('paywall', () => {
  describe('purchase buttons hidden/disabled until RevenueCat real', () => {
    test('isRevenueCatConfigured returns false without API key', () => {
      delete process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
      expect(isRevenueCatConfigured()).toBe(false);
    });

    test('purchasePackage returns disabled message when not configured', async () => {
      const result = await purchasePackage('monthly_plus');
      expect(result.error).toBeTruthy();
      expect(result.success).toBe(false);
    });

    test('restorePurchases returns disabled message when not configured', async () => {
      const result = await restorePurchases();
      expect(result.error).toBeTruthy();
      expect(result.success).toBe(false);
    });
  });
});
