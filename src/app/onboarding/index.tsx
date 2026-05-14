// Onboarding — Welcome and value proposition
// Full implementation with boundary explanations
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
        <Text style={styles.title}>Make Better Decisions</Text>

        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>What DecisionOS Does</Text>
          <Text style={styles.description}>
            DecisionOS helps you think clearly through important decisions. It guides you through structured reflection, analyzes options with AI, and saves your decisions so you can review outcomes later.
          </Text>
        </Card>

        <Card variant="outlined" style={styles.boundaryCard}>
          <Text style={styles.boundaryTitle}>What DecisionOS Is Not</Text>
          <Text style={styles.boundaryText}>
            DecisionOS is not a doctor, lawyer, therapist, emergency resource, or investment advisor.{'\n\n'}
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
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal * typography.size.md,
  },
  card: {
    marginBottom: spacing.md,
    alignSelf: 'stretch',
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
