import { useCallback } from 'react';
import { Text, View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
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
import { ROUTES } from '@/config/routes';

const STATUS_META: Record<string, { label: string; color: string; icon: string }> = {
  draft: { label: 'Draft', color: colors.text.tertiary, icon: '📄' },
  questions: { label: 'In Progress', color: colors.status.info, icon: '🔄' },
  ready_for_analysis: { label: 'Ready', color: colors.status.warning, icon: '🔍' },
  analyzed: { label: 'Analyzed', color: colors.status.success, icon: '📊' },
  chosen: { label: 'Decided', color: colors.accent.primary, icon: '✅' },
  review_scheduled: { label: 'Review Due', color: colors.status.warning, icon: '📅' },
  reviewed: { label: 'Completed', color: colors.text.disabled, icon: '✔️' },
  archived: { label: 'Archived', color: colors.text.disabled, icon: '📦' },
};

export default function DecisionsScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: decisions, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['decisions'],
    queryFn: async () => [] as any[],
  });

  const handleDecisionPress = useCallback((id: string) => {
    router.push(ROUTES.DECISION_DETAIL(id));
  }, [router]);

  const handleRefresh = useCallback(() => refetch(), [refetch]);

  if (isLoading) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <Text style={s.title}>Decisions</Text>
          <Link href={ROUTES.DECISIONS_NEW} asChild><Button title="New" variant="primary" size="small" /></Link>
        </View>
        <LoadingState message="Loading decisions..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <Text style={s.title}>Decisions</Text>
          <Link href={ROUTES.DECISIONS_NEW} asChild><Button title="New" variant="primary" size="small" /></Link>
        </View>
        <ErrorState message="Failed to load decisions" onRetry={refetch} />
      </View>
    );
  }

  const hasDecisions = decisions && (decisions as any[]).length > 0;

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.title}>Decisions</Text>
        <Link href={ROUTES.DECISIONS_NEW} asChild><Button title="New Decision" variant="primary" size="small" /></Link>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={colors.accent.primary} />}
      >
        {!hasDecisions && (
          <View style={s.emptyContainer}>
            <View style={s.emptyIconCircle}>
              <Text style={s.emptyIcon}>🧭</Text>
            </View>
            <Text style={s.emptyTitle}>No decisions yet</Text>
            <Text style={s.emptyText}>
              The best decisions are intentional ones. Start here — you can analyze options, track outcomes, and build your decision intelligence over time.
            </Text>
            <View style={s.emptySteps}>
              <View style={s.stepRow}>
                <Text style={s.stepIcon}>1️⃣</Text>
                <Text style={s.stepText}>Name your decision and options</Text>
              </View>
              <View style={s.stepRow}>
                <Text style={s.stepIcon}>2️⃣</Text>
                <Text style={s.stepText}>Get AI-powered analysis with scores</Text>
              </View>
              <View style={s.stepRow}>
                <Text style={s.stepIcon}>3️⃣</Text>
                <Text style={s.stepText}>Commit and schedule a review</Text>
              </View>
            </View>
            <Button title="Create Your First Decision" variant="primary" onPress={() => router.push(ROUTES.DECISIONS_NEW)} />
          </View>
        )}

        {hasDecisions && (
          <View style={s.list}>
            {(decisions as any[]).map((decision) => {
              const meta = STATUS_META[decision.status] || STATUS_META.draft;
              return (
                <TouchableOpacity
                  key={decision.id}
                  style={s.decisionCard}
                  onPress={() => handleDecisionPress(decision.id)}
                  activeOpacity={0.7}
                >
                  <View style={s.cardHeader}>
                    <Text style={s.cardIcon}>{meta.icon}</Text>
                    <View style={s.cardInfo}>
                      <Text style={s.cardTitle} numberOfLines={1}>{decision.title}</Text>
                      <Text style={s.cardDate}>
                        {new Date(decision.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </View>
                    <View style={[s.cardStatus, { backgroundColor: meta.color + '20' }]}>
                      <Text style={[s.cardStatusText, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                  </View>
                  {decision.description && (
                    <Text style={s.cardDescription} numberOfLines={2}>{decision.description}</Text>
                  )}
                  <View style={s.cardFooter}>
                    <Text style={s.cardFooterAction}>View Details →</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.primary },
  title: { fontSize: typography.size.xl, fontWeight: '700', color: colors.text.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: spacing.lg },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontSize: typography.size.xl, fontWeight: '700', color: colors.text.primary, marginBottom: spacing.sm },
  emptyText: { fontSize: typography.size.sm, color: colors.text.secondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  emptySteps: { alignSelf: 'stretch', gap: spacing.md, marginBottom: spacing.xl },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: colors.background.secondary, borderRadius: 10, borderWidth: 1, borderColor: colors.border.primary },
  stepIcon: { fontSize: 18, width: 28 },
  stepText: { fontSize: typography.size.sm, color: colors.text.primary, flex: 1 },
  list: { gap: spacing.sm },
  decisionCard: { backgroundColor: colors.background.secondary, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.border.primary },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  cardIcon: { fontSize: 20, width: 28 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary },
  cardDate: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 1 },
  cardStatus: { borderRadius: 9999, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  cardStatusText: { fontSize: typography.size.xs, fontWeight: '600' },
  cardDescription: { fontSize: typography.size.sm, color: colors.text.secondary, lineHeight: 18, marginBottom: spacing.sm, marginLeft: 36 },
  cardFooter: { marginLeft: 36 },
  cardFooterAction: { fontSize: typography.size.xs, fontWeight: '600', color: colors.accent.primary },
});