// FLOW: /onboarding — First-Time User Onboarding
// FROM: /auth/sign-up (after registration)
// TO: /onboarding/privacy → /onboarding/values → / (home)
// This is a ONE-TIME flow. After completion, user goes directly to home.
// Sets values_profile in profiles table (used by Daily Clarity Practice).
// See FLOW_ARCHITECTURE.md §2
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function OnboardingScreen(): JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>🧭</Text>
        <Text style={styles.title}>Think clearly before big life decisions</Text>
        <Text style={styles.tagline}>Use DecisionOS before decisions you might regret.</Text>

        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>How it works</Text>
          <Text style={styles.description}>
            Create a decision → add your options → answer guided questions → analyze tradeoffs → choose with clarity → review the outcome later.
          </Text>
          <Text style={styles.description}>
            DecisionOS helps you reflect. It does not make decisions for you.
          </Text>
        </Card>

        <Card variant="elevated" style={styles.useCasesCard}>
          <Text style={styles.cardTitle}>Build for decisions like</Text>
          <Text style={styles.useCaseText}>• Should I quit my job?</Text>
          <Text style={styles.useCaseText}>• Should I move to a new city?</Text>
          <Text style={styles.useCaseText}>• Should I start this business?</Text>
          <Text style={styles.useCaseText}>• Should I go back to school?</Text>
          <Text style={styles.useCaseText}>• Should I choose this major?</Text>
        </Card>

        <Card variant="outlined" style={styles.boundaryCard}>
          <Text style={styles.boundaryTitle}>Important — What this app is not</Text>
          <Text style={styles.boundaryText}>
            DecisionOS is a reflection tool, not a doctor, lawyer, therapist, or financial advisor.{'\n\n'}
            All scores are thinking aids, not predictions or guarantees.{'\n'}
            For medical decisions, consult a healthcare professional.{'\n'}
            For legal matters, consult an attorney.{'\n'}
            For mental health support, reach out to a professional.{'\n'}
            For investment advice, consult a financial advisor.
          </Text>
        </Card>
      </View>

      <View style={styles.actions}>
        <Link href="/onboarding/privacy" asChild>
          <Button title="Get Started" variant="primary" />
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: typography.size.md,
    color: colors.accent.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  description: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal * typography.size.md,
    marginBottom: spacing.sm,
  },
  card: {
    marginBottom: spacing.md,
    alignSelf: 'stretch',
  },
  useCasesCard: {
    marginBottom: spacing.md,
    alignSelf: 'stretch',
  },
  useCaseText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.accent.primary,
    marginBottom: spacing.sm,
  },
  boundaryCard: {
    alignSelf: 'stretch',
    borderColor: colors.status.warning,
  },
  boundaryTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.status.warning,
    marginBottom: spacing.sm,
  },
  boundaryText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.size.sm,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
});
