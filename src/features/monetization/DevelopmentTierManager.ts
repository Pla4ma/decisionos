// DevelopmentTierManager — Truly functional dev tier storage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionTier } from './monetizationTypes';

const DEV_TIER_KEY = '@decisionos_dev_tier';

export async function setDevTier(tier: SubscriptionTier): Promise<void> {
  await AsyncStorage.setItem(DEV_TIER_KEY, tier);
}

export async function getDevTier(): Promise<SubscriptionTier> {
  const tier = await AsyncStorage.getItem(DEV_TIER_KEY);
  return (tier as SubscriptionTier) || 'free';
}
