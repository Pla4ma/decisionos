// RevenueCat Service
// Wrapper for RevenueCat SDK integration
// NOTE: Actual RevenueCat SDK integration requires react-native-purchases package

import { CustomerInfo, SubscriptionPackage, SubscriptionTier, Entitlement } from './monetizationTypes';

// RevenueCat API keys would come from environment config
const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '';

// Mock customer info for development (until RevenueCat SDK is integrated)
const MOCK_CUSTOMER_INFO: CustomerInfo = {
  userId: 'mock-user',
  tier: 'free',
  entitlements: [],
  latestExpirationDate: null,
  originalPurchaseDate: null,
};

// Check if RevenueCat is configured
export function isRevenueCatConfigured(): boolean {
  return !!REVENUECAT_API_KEY;
}

// Initialize RevenueCat (placeholder for actual SDK initialization)
export async function initializeRevenueCat(userId: string): Promise<void> {
  if (!isRevenueCatConfigured()) {
    console.warn('RevenueCat not configured — running in free tier mode');
    return;
  }

  // TODO: Initialize react-native-purchases SDK
  // await Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId });
}

// Get customer info (mock until SDK integrated)
export async function getCustomerInfo(): Promise<CustomerInfo> {
  if (!isRevenueCatConfigured()) {
    return MOCK_CUSTOMER_INFO;
  }

  // TODO: Fetch from RevenueCat SDK
  // const customerInfo = await Purchases.getCustomerInfo();
  // return mapRevenueCatToCustomerInfo(customerInfo);

  return MOCK_CUSTOMER_INFO;
}

// Get available packages (mock until SDK integrated)
export async function getAvailablePackages(): Promise<SubscriptionPackage[]> {
  if (!isRevenueCatConfigured()) {
    return getMockPackages();
  }

  // TODO: Fetch from RevenueCat SDK
  // const offerings = await Purchases.getOfferings();
  // return mapRevenueCatPackages(offerings);

  return getMockPackages();
}

// Purchase package (mock until SDK integrated)
export async function purchasePackage(packageIdentifier: string): Promise<{ success: boolean; error?: string }> {
  if (!isRevenueCatConfigured()) {
    return { success: false, error: 'RevenueCat not configured' };
  }

  // TODO: Implement actual purchase
  // const result = await Purchases.purchasePackage(pkg);
  // return { success: true };

  return { success: false, error: 'Purchase not implemented — RevenueCat SDK required' };
}

// Restore purchases
export async function restorePurchases(): Promise<{ success: boolean; error?: string }> {
  if (!isRevenueCatConfigured()) {
    return { success: false, error: 'RevenueCat not configured' };
  }

  // TODO: Implement restore
  // await Purchases.restorePurchases();

  return { success: false, error: 'Restore not implemented — RevenueCat SDK required' };
}

// Check specific entitlement
export async function hasEntitlement(entitlement: Entitlement): Promise<boolean> {
  const customerInfo = await getCustomerInfo();
  return customerInfo.entitlements.includes(entitlement);
}

// Get current tier
export async function getCurrentTier(): Promise<SubscriptionTier> {
  const customerInfo = await getCustomerInfo();
  return customerInfo.tier;
}

// Mock packages for development
function getMockPackages(): SubscriptionPackage[] {
  return [
    {
      identifier: 'decisionos_plus_monthly',
      tier: 'plus',
      price: 9.99,
      currency: 'USD',
      period: 'monthly',
      trialDays: 7,
    },
    {
      identifier: 'decisionos_plus_annual',
      tier: 'plus',
      price: 99.99,
      currency: 'USD',
      period: 'annual',
      trialDays: 7,
    },
  ];
}
