import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ROUTES } from '@/config/routes';

const FEATURES_PLUS = [
  { icon: '🔬', text: '50 AI analyses per month (up from 10)' },
  { icon: '🧠', text: 'Deep bias detection on every decision' },
  { icon: '📜', text: 'Future Self letters with personalized insights' },
  { icon: '📊', text: 'Full decision pattern analytics & benchmarks' },
  { icon: '👥', text: 'Second opinions from the community' },
  { icon: '💾', text: 'Data export & backup' },
];

const FEATURES_PRO = [
  { icon: '♾️', text: '200 AI analyses per month' },
  { icon: '🤝', text: 'Accountability pacts with partners' },
  { icon: '📋', text: 'Custom decision playbooks' },
  { icon: '🏆', text: 'Priority support & early features' },
];

export default function PaywallScreen(): JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isAnnual, setIsAnnual] = useState(true);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (tier: string) => {
    // Billing integration coming — RevenueCat setup in progress
    Alert.alert(
      'Coming Soon',
      'Paid subscriptions are not yet available. You can continue using the free plan with 3 analyses per month. We will notify you when billing is ready.'
    );
  };

  const handleRestore = async () => {
    Alert.alert(
      'Coming Soon',
      'Purchase restoration is not yet available. Your subscription data will sync once billing is live.'
    );
  };

  // Pricing is display-only until billing is real
  const plusMonthly = { price: 9.99, period: '/month' } as const;
  const plusAnnual = { price: 59.99, period: '/year', perMonth: 4.99 } as const;
  const proMonthly = { price: 14.99, period: '/month' } as const;
  const proAnnual = { price: 119.99, period: '/year', perMonth: 9.99 } as const;

  type PlanPricing = { price: number; period: string; perMonth?: number };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.heroSection}>
          <Text style={styles.heroIcon}>🧭</Text>
          <Text style={styles.heroTitle}>Think clearly about every decision</Text>
          <Text style={styles.heroSubtitle}>
            The free plan is generous. Upgrade to unlock your full decision intelligence.
          </Text>
        </View>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, isAnnual && styles.toggleActive]}
            onPress={() => setIsAnnual(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, isAnnual && styles.toggleTextActive]}>Annual</Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>Save 40%</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, !isAnnual && styles.toggleActive]}
            onPress={() => setIsAnnual(false)}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, !isAnnual && styles.toggleTextActive]}>Monthly</Text>
          </TouchableOpacity>
        </View>

        <Card variant="elevated" style={styles.tierCard}>
          <View style={styles.tierHeader}>
            <View>
              <Text style={styles.tierName}>Plus</Text>
              {isAnnual ? (
                <View>
                  <Text style={styles.tierPrice}>
                    ${plusAnnual.perMonth}<Text style={styles.tierPeriod}>/month</Text>
                  </Text>
                  <Text style={styles.tierAnnualTotal}>${plusAnnual.price}{plusAnnual.period} — ${plusAnnual.perMonth}/mo</Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.tierPrice}>
                    ${plusMonthly.price}<Text style={styles.tierPeriod}>{plusMonthly.period}</Text>
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.tierBadge}>
              <Text style={styles.tierBadgeText}>Most popular</Text>
            </View>
          </View>
          <View style={styles.featureList}>
            {FEATURES_PLUS.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
          <Button
            title={isLoading === 'plus' ? 'Processing...' : 'Start Plus'}
            variant="primary"
            onPress={() => handleSubscribe('plus')}
            disabled={isLoading !== null}
            style={styles.subscribeBtn}
          />
          <Text style={styles.trialText}>7-day free trial. Cancel anytime.</Text>
        </Card>

        <Card variant="elevated" style={styles.tierCard}>
          <View style={styles.tierHeader}>
            <View>
              <Text style={styles.tierName}>Pro</Text>
              {isAnnual ? (
                <View>
                  <Text style={styles.tierPrice}>
                    ${proAnnual.perMonth}<Text style={styles.tierPeriod}>/month</Text>
                  </Text>
                  <Text style={styles.tierAnnualTotal}>${proAnnual.price}{proAnnual.period} — ${proAnnual.perMonth}/mo</Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.tierPrice}>
                    ${proMonthly.price}<Text style={styles.tierPeriod}>{proMonthly.period}</Text>
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.proIncludes}>Everything in Plus, plus:</Text>
          <View style={styles.featureList}>
            {FEATURES_PRO.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
          <Button
            title={isLoading === 'pro' ? 'Processing...' : 'Go Pro'}
            variant="primary"
            onPress={() => handleSubscribe('pro')}
            disabled={isLoading !== null}
            style={styles.subscribeBtn}
          />
          <Text style={styles.trialText}>7-day free trial. Cancel anytime.</Text>
        </Card>

        <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore} activeOpacity={0.7} disabled={isLoading !== null}>
          {isLoading === 'restore' ? (
            <ActivityIndicator size="small" color={colors.text.tertiary} />
          ) : (
            <Text style={styles.restoreText}>Restore purchases</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Your decisions are private. We do not sell your data. Cancel anytime.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scrollContent: { padding: spacing.md, paddingBottom: 60 },
  closeBtn: { alignSelf: 'flex-end', padding: spacing.sm, marginBottom: spacing.sm },
  closeText: { fontSize: 20, color: colors.text.secondary },
  heroSection: { alignItems: 'center', marginBottom: spacing.xl, paddingHorizontal: spacing.md },
  heroIcon: { fontSize: 56, marginBottom: spacing.md },
  heroTitle: { fontSize: typography.size.xxl, fontWeight: '700', color: colors.text.primary, textAlign: 'center', marginBottom: spacing.sm },
  heroSubtitle: { fontSize: typography.size.sm, color: colors.text.secondary, textAlign: 'center', lineHeight: 20 },
  toggleRow: { flexDirection: 'row', backgroundColor: colors.background.tertiary, borderRadius: 12, padding: 3, marginBottom: spacing.lg },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.sm, borderRadius: 10 },
  toggleActive: { backgroundColor: colors.background.elevated },
  toggleText: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.tertiary },
  toggleTextActive: { color: colors.text.primary },
  saveBadge: { backgroundColor: colors.status.success + '25', borderRadius: 9999, paddingHorizontal: spacing.sm, paddingVertical: 1 },
  saveText: { fontSize: 10, fontWeight: '700', color: colors.status.success },
  tierCard: { padding: spacing.lg, marginBottom: spacing.md },
  tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  tierName: { fontSize: typography.size.xl, fontWeight: '700', color: colors.text.primary },
  tierPrice: { fontSize: 28, fontWeight: '800', color: colors.accent.primary, marginTop: spacing.xs },
  tierPeriod: { fontSize: typography.size.sm, fontWeight: '400', color: colors.text.tertiary },
  tierAnnualTotal: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 2 },
  tierBadge: { backgroundColor: colors.accent.muted, borderRadius: 9999, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  tierBadgeText: { fontSize: typography.size.xs, fontWeight: '700', color: colors.accent.primary },
  featureList: { gap: spacing.sm, marginBottom: spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  featureIcon: { fontSize: 16, width: 24 },
  featureText: { flex: 1, fontSize: typography.size.sm, color: colors.text.secondary },
  subscribeBtn: { marginBottom: spacing.sm },
  trialText: { fontSize: typography.size.xs, color: colors.text.tertiary, textAlign: 'center' },
  proIncludes: { fontSize: typography.size.sm, color: colors.text.tertiary, marginBottom: spacing.md, fontStyle: 'italic' },
  restoreBtn: { alignItems: 'center', padding: spacing.md },
  restoreText: { fontSize: typography.size.sm, color: colors.text.tertiary },
  footerText: { fontSize: typography.size.xs, color: colors.text.disabled, textAlign: 'center', marginTop: spacing.md, lineHeight: 18 },
});