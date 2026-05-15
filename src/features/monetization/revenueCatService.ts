// RevenueCat Service
// Wrapper for RevenueCat SDK integration
// BETA STATUS: RevenueCat SDK integration is planned. During beta,
// all users get free tier with basic limits. The paywall UI shows plans
// but purchase flow is disabled until RevenueCat is fully integrated.
// When ready: install react-native-purchases, configure SDK, wire up webhooks.

import { CustomerInfo, SubscriptionPackage, SubscriptionTier, Entitlement } from './monetizationTypes';

// RevenueCat API keys — only used when SDK is installed
const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '';

// Beta customer info — all users are free tier during beta
const BETA_CUSTOMER_INFO: CustomerInfo = {
  userId: 'beta-user',
  tier: 'free',
  entitlements: [],
  latestExpirationDate: null,
  originalPurchaseDate: null,
};

// Check if RevenueCat is configured
export function isRevenueCatConfigured(): boolean {
  return !!REVENUECAT_API_KEY;
}

// Initialize RevenueCat
export async function initializeRevenueCat(userId: string): Promise<void> {
  if (!isRevenueCatConfigured()) {
    console.warn('[Beta] RevenueCat not configured — all users run in free tier mode');
    return;
  }
  // When react-native-purchases is installed:
  // await Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId });
}

// Get customer info
export async function getCustomerInfo(): Promise<CustomerInfo> {
  if (!isRevenueCatConfigured()) {
    return BETA_CUSTOMER_INFO;
  }
  // TODO: Fetch from RevenueCat SDK
  // const customerInfo = await Purchases.getCustomerInfo();
  // return mapRevenueCatToCustomerInfo(customerInfo);
  return BETA_CUSTOMER_INFO;
}

// Get available packages
export async function getAvailablePackages(): Promise<SubscriptionPackage[]> {
  if (!isRevenueCatConfigured()) {
    return getMockPackages();
  }
  // TODO: Fetch from RevenueCat SDK
  // const offerings = await Purchases.getOfferings();
  // return mapRevenueCatPackages(offerings);
  return getMockPackages();
}

// Purchase package — disabled during beta until RevenueCat SDK is installed
export async function purchasePackage(_packageIdentifier: string): Promise<{ success: boolean; error?: string }> {
  console.warn('[Beta] Purchase attempted but RevenueCat SDK is not yet installed.');
  console.warn('[Beta] To enable: npm install react-native-purchases, configure SDK, test on iOS sandbox.');
  return { success: false, error: 'Purchases are not yet available in beta. You will be notified when billing is ready.' };
}

// Restore purchases — disabled during beta
export async function restorePurchases(): Promise<{ success: boolean; error?: string }> {
  console.warn('[Beta] Restore attempted but RevenueCat SDK is not yet installed.');
  return { success: false, error: 'Purchase restoration is not yet available in beta.' };
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
