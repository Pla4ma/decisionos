// Monetization Types
// Type definitions for DecisionOS monetization system

// Subscription tiers
export type SubscriptionTier = 'free' | 'plus' | 'pro';

// RevenueCat entitlements
export type Entitlement = 'plus' | 'analysis_unlimited' | 'pro_features';

// Product identifiers
export type ProductIdentifier =
  | 'decisionos_plus_monthly'
  | 'decisionos_plus_annual'
  | 'decisionos_pro_monthly'
  | 'decisionos_pro_annual';

// Usage limit status
export interface UsageLimitStatus {
  tier: SubscriptionTier;
  analysesUsed: number;
  analysesLimit: number;
  analysesRemaining: number;
  periodStart: string;
  periodEnd: string;
  canAnalyze: boolean;
  isBackendVerified?: boolean;
}

// Customer info from RevenueCat
export interface CustomerInfo {
  userId: string;
  tier: SubscriptionTier;
  entitlements: Entitlement[];
  latestExpirationDate: string | null;
  originalPurchaseDate: string | null;
}

// Subscription package
export interface SubscriptionPackage {
  identifier: ProductIdentifier;
  tier: SubscriptionTier;
  price: number;
  currency: string;
  period: 'monthly' | 'annual';
  trialDays: number | null;
}

// Paywall configuration
export interface PaywallConfig {
  title: string;
  subtitle: string;
  features: string[];
  primaryPackage: SubscriptionPackage;
  secondaryPackage: SubscriptionPackage | null;
}
