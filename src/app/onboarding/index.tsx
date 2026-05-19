import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { InstantInsightPrompt } from '@/components/home/InstantInsightPrompt';
import { ROUTES } from '@/config/routes';

export default function OnboardingScreen(): JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>🧭</Text>
        <Text style={styles.title}>Think clearly about your next big decision</Text>
        <Text style={styles.tagline}>Try it now — describe what you are deciding.</Text>

        <InstantInsightPrompt
          onInsightGenerated={() => {}}
          onStartFullAnalysis={() => {}}
        />

        <View style={styles.actions}>
          <Link href={ROUTES.ONBOARDING_PRIVACY} asChild>
            <Button title="Set up my account →" variant="primary" />
          </Link>
          <Link href={ROUTES.SIGN_IN} asChild>
            <Button title="I already have an account" variant="ghost" />
          </Link>
        </View>
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
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.xl,
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
  actions: {
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
});