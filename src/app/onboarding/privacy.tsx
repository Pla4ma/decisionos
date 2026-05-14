// Onboarding Privacy — Privacy-first commitment
// Full implementation with privacy explanations
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function PrivacyScreen(): JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.title}>Your Decisions Are Private</Text>

        <Card variant="elevated" style={styles.card}>
          <View style={styles.row}>
            <Badge variant="success" title="Private" />
          </View>
          <Text style={styles.description}>
            Your decision text is never used for analytics or shared with third parties. Only you can see what you've written.
          </Text>
        </Card>

        <Card variant="elevated" style={styles.card}>
          <View style={styles.row}>
            <Badge variant="info" title="Secure" />
          </View>
          <Text style={styles.description}>
            AI analysis runs through secure backend functions. Your decision content is processed but not stored by the AI service.
          </Text>
        </Card>

        <Card variant="elevated" style={styles.card}>
          <View style={styles.row}>
            <Badge variant="default" title="Optional" />
          </View>
          <Text style={styles.description}>
            Memory is optional. You can choose whether DecisionOS learns from your past reviewed decisions to personalize future analysis.
          </Text>
        </Card>
      </View>

      <View style={styles.actions}>
        <Link href="/onboarding/values" asChild>
          <Button title="Continue" variant="primary" />
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
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
});
