// app/social/benchmarks.tsx — Full social comparison view
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { BenchmarkCard } from '@/components/home/BenchmarkCard';
import { ImprovementScoreCard } from '@/components/home/ImprovementScoreCard';
import { useBenchmarks } from '@/features/social/useBenchmarks';
import { useAuth } from '@/features/auth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function BenchmarkDetailScreen(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const { benchmarks, improvementScore, isLoading } = useBenchmarks(user?.id ?? null);

  if (isLoading) return <Screen><Text>Loading...</Text></Screen>;

  return (
    <Screen title="Your Decision Performance" onBack={router.back}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {improvementScore?.ready && <ImprovementScoreCard score={improvementScore} />}
        {benchmarks?.eligible && <BenchmarkCard benchmark={benchmarks} />}
        <Text style={styles.footer}>
          Benchmarks are based on anonymous, aggregated data from all DecisionOS users.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: spacing.lg },
  footer: { fontSize: 12, color: colors.text.tertiary, marginTop: spacing.xl, textAlign: 'center' },
});
