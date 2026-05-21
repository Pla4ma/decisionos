import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useHomeDecisionRecommendation } from '@/features/decisions/useHomeDecisionRecommendation';
import { useAuth } from '@/features/auth/useAuth';
import { getExampleDecisions } from '@/app/homeScreenHelpers';
import { ROUTES } from '@/config/routes';
import { InstantInsightPrompt } from './InstantInsightPrompt';

export function NewUserHome(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const { pendingDecisions } = useHomeDecisionRecommendation(user?.id ?? null);
  const exampleDecisions = getExampleDecisions();
  const hasDecisions = pendingDecisions.length > 0;

  if (hasDecisions) return <></>;

  return (
    <View style={styles.container}>
      <View style={styles.welcomeSection}>
        <Text style={styles.title}>Welcome to DecisionOS</Text>
        <Text style={styles.subtitle}>
          Think clearly before choices you might regret. Start with a quick insight or a full analysis.
        </Text>
      </View>
      <InstantInsightPrompt
        onInsightGenerated={() => {}}
        onStartFullAnalysis={(text) => router.push(ROUTES.DECISIONS_NEW_QUICK_TITLE(text))}
      />
      <View style={styles.orDivider}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>or try an example</Text>
        <View style={styles.orLine} />
      </View>
      <View style={styles.examples}>
        {exampleDecisions.slice(0, 4).map((example, i) => (
          <TouchableOpacity
            key={i}
            style={styles.exampleChip}
            onPress={() => router.push(ROUTES.DECISIONS_NEW_QUICK_TITLE(example))}
            activeOpacity={0.7}
          >
            <Text style={styles.exampleChipText}>{example}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.fullAnalysisBtn} onPress={() => router.push(ROUTES.DECISIONS_NEW)} activeOpacity={0.7}>
        <Text style={styles.fullAnalysisLabel}>Skip insight — go straight to structured analysis</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: spacing.sm },
  welcomeSection: { marginBottom: spacing.lg, paddingHorizontal: spacing.sm },
  title: { fontSize: typography.size.xxl, fontWeight: '800', color: colors.text.primary, marginBottom: spacing.xs },
  subtitle: { fontSize: typography.size.md, color: colors.text.secondary, lineHeight: 22 },
  orDivider: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, paddingHorizontal: spacing.md },
  orLine: { flex: 1, height: 1, backgroundColor: colors.border.primary },
  orText: { fontSize: typography.size.xs, color: colors.text.disabled, marginHorizontal: spacing.md, textTransform: 'uppercase', letterSpacing: 1 },
  examples: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  exampleChip: { backgroundColor: colors.background.secondary, borderRadius: 9999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border.primary },
  exampleChipText: { fontSize: typography.size.sm, color: colors.accent.primary },
  fullAnalysisBtn: { alignItems: 'center', padding: spacing.sm, marginBottom: spacing.lg },
  fullAnalysisLabel: { fontSize: typography.size.sm, color: colors.text.tertiary },
});
