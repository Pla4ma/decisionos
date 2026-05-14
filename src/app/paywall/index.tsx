// Paywall — Subscription and upgrade screen (Phase 13)
import { Text, View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { useEntitlements, getAvailablePackages, purchasePackage, restorePurchases } from '@/features/monetization';
import { useAuth } from '@/features/auth';
import { useState, useEffect } from 'react';

const PLUS_FEATURES = [
  'Unlimited AI analyses',
  'Advanced Gemini reasoning',
  'Full score breakdown (5 dimensions)',
  'Decision templates & frameworks',
  'Priority analysis speed',
  'Complete decision memory & insights',
  'Custom dimension weights',
  'Weekly decision digest',
];

const FREE_FEATURES = [
  '1 AI analysis per month',
  'Basic decision analysis',
  'Decision tracking',
  'Outcome reviews',
  'Basic achievements & streaks',
  'Daily dilemmas & quick decisions',
];

export default function PaywallScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { analysesRemaining, hasPlus, isLoading: entitlementLoading, refreshEntitlements } = useEntitlements(user?.id || null);

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [monthlyPrice, setMonthlyPrice] = useState('$9.99');
  const [annualPrice, setAnnualPrice] = useState('$99.99');

  // Load package prices on mount
  useEffect(() => {
    async function loadPrices() {
      const packages = await getAvailablePackages();
      const monthly = packages.find((p) => p.period === 'monthly');
      const annual = packages.find((p) => p.period === 'annual');
      if (monthly) setMonthlyPrice(`$${monthly.price}`);
      if (annual) setAnnualPrice(`$${annual.price}`);
    }
    loadPrices();
  }, []);

  const handleUpgrade = async () => {
    setIsPurchasing(true);
    try {
      const result = await purchasePackage('decisionos_plus_monthly');
      if (result.success) {
        await refreshEntitlements();
        Alert.alert('Success', 'You are now a Plus subscriber!', [
          { text: 'Continue', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Purchase Failed', result.error || 'Please try again later');
      }
    } catch (error) {
      Alert.alert('Error', 'Purchase system not fully configured. RevenueCat SDK integration required.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsPurchasing(true);
    try {
      const result = await restorePurchases();
      if (result.success) {
        await refreshEntitlements();
        Alert.alert('Restored', 'Your purchases have been restored.');
      } else {
        Alert.alert('Nothing to Restore', 'No previous purchases found.');
      }
    } catch (error) {
      Alert.alert('Error', 'Restore system not fully configured.');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (entitlementLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Link href="/decisions" asChild>
            <Button title="Close" variant="ghost" size="small" />
          </Link>
          <View style={styles.placeholder} />
        </View>
        <LoadingState message="Loading subscription info..." />
      </View>
    );
  }

  // If already Plus, show different message
  if (hasPlus) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Link href="/decisions" asChild>
            <Button title="Close" variant="ghost" size="small" />
          </Link>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.hero}>
            <Text style={styles.icon}>✨</Text>
            <Text style={styles.title}>You have Plus!</Text>
            <Text style={styles.subtitle}>Enjoy unlimited AI analysis and all premium features</Text>
          </View>

          <Card variant="elevated" style={styles.planCard}>
            <Badge title="Active" variant="success" size="small" style={styles.activeBadge} />
            <Text style={styles.planName}>Plus Subscription</Text>
            <View style={styles.features}>
              {PLUS_FEATURES.map((feature, index) => (
                <Text key={index} style={styles.feature}>✓ {feature}</Text>
              ))}
            </View>
          </Card>

          <Button title="Done" variant="primary" onPress={() => router.back()} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Link href="/decisions" asChild>
          <Button title="Close" variant="ghost" size="small" />
        </Link>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.icon}>💎</Text>
          <Text style={styles.title}>DecisionOS Plus</Text>
          <Text style={styles.subtitle}>Unlock unlimited AI analysis and advanced features</Text>
        </View>

        <Card variant="elevated" style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Plus Plan</Text>
            <Badge title="Popular" variant="accent" size="small" />
          </View>
          <Text style={styles.planPrice}>{monthlyPrice}<Text style={styles.planPeriod}>/month</Text></Text>

          <View style={styles.features}>
            {PLUS_FEATURES.map((feature, index) => (
              <Text key={index} style={styles.feature}>✓ {feature}</Text>
            ))}
          </View>

          <Button
            title={isPurchasing ? 'Processing...' : 'Upgrade to Plus'}
            variant="primary"
            onPress={handleUpgrade}
            disabled={isPurchasing}
            style={styles.upgradeButton}
          />

          <Button
            title="Restore Purchases"
            variant="ghost"
            size="small"
            onPress={handleRestore}
            disabled={isPurchasing}
          />
        </Card>

        <Card style={styles.freeCard}>
          <Text style={styles.freeTitle}>Free Plan</Text>
          <View style={styles.features}>
            {FREE_FEATURES.map((feature, index) => (
              <Text key={index} style={styles.featureDisabled}>○ {feature}</Text>
            ))}
          </View>
          <Text style={styles.usageText}>
            {analysesRemaining === Infinity ? 'Unlimited' : `${analysesRemaining} analyses remaining this month`}
          </Text>
        </Card>

        <Text style={styles.terms}>
          Subscriptions auto-renew. Cancel anytime. RevenueCat powers our secure payments.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  placeholder: {
    width: 60,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  planCard: {
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.accent.primary,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  planPrice: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.accent.primary,
    marginBottom: spacing.md,
  },
  planPeriod: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    fontWeight: typography.weight.regular,
  },
  features: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  feature: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
  },
  freeCard: {
    marginBottom: spacing.xl,
    opacity: 0.8,
  },
  freeTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  usageText: {
    fontSize: typography.size.sm,
    color: colors.accent.primary,
    fontWeight: typography.weight.medium,
  },
  terms: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  featureDisabled: {
    fontSize: typography.size.md,
    color: colors.text.tertiary,
  },
  upgradeButton: {
    marginBottom: spacing.sm,
  },
  activeBadge: {
    marginBottom: spacing.md,
  },
});
