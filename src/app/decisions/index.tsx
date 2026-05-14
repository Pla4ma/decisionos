// Decisions List — Decision history with pull-to-refresh
import { useCallback } from 'react';
import { Text, View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { DecisionCard } from '@/components/decisions';
// import { listDecisions } from '@/features/decisions/decisionRepository';

export default function DecisionsScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: decisions, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['decisions'],
    queryFn: async () => {
      // Mock implementation for now
      return [];
    },
  });

  const handleDecisionPress = useCallback((id: string) => {
    router.push(`/decisions/${id}`);
  }, [router]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Decisions</Text>
          <Link href="/decisions/new" asChild>
            <Button title="New" variant="primary" size="small" />
          </Link>
        </View>
        <LoadingState message="Loading decisions..." />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Decisions</Text>
          <Link href="/decisions/new" asChild>
            <Button title="New" variant="primary" size="small" />
          </Link>
        </View>
        <ErrorState message="Failed to load decisions" onRetry={refetch} />
      </View>
    );
  }

  const hasDecisions = decisions && (decisions as any[]).length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Decisions</Text>
        <Link href="/decisions/new" asChild>
          <Button title="New Decision" variant="primary" size="small" />
        </Link>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={colors.accent.primary} />}
      >
        {!hasDecisions && (
          <EmptyState
            icon="📝"
            title="No Decisions Yet"
            message="Start by creating your first decision. DecisionOS will help you analyze options and track outcomes."
            actionLabel="Create Decision"
            onAction={() => router.push('/decisions/new')}
            fullScreen={false}
          />
        )}

        {hasDecisions && (
          <View style={styles.list}>
            {(decisions as any[]).map((decision) => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                onPress={() => handleDecisionPress(decision.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.primary },
  title: { fontSize: typography.size.xl, fontWeight: typography.weight.bold, color: colors.text.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  list: {},
});
