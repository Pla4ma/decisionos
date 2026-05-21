import { memo, useCallback } from 'react';
import { Text, View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { SkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Badge } from '@/components/ui/Badge';
import { getUserDecisions } from '@/features/decisions/decisionRepository';
import type { Decision } from '@/features/decisions/decisionTypes';
import { ROUTES } from '@/config/routes';

const STATUS_META: Record<string, { label: string; color: string; icon: string }> = {
  draft: { label: 'Draft', color: colors.text.tertiary, icon: '📄' },
  questions: { label: 'In Progress', color: colors.status.info, icon: '🔄' },
  ready_for_analysis: { label: 'Ready', color: colors.status.warning, icon: '🔍' },
  analyzed: { label: 'Analyzed', color: colors.status.success, icon: '📊' },
  chosen: { label: 'Decided', color: colors.accent.primary, icon: '✅' },
  review_scheduled: { label: 'Review Due', color: colors.status.warning, icon: '📅' },
  reviewed: { label: 'Completed', color: colors.text.disabled, icon: '✔️' },
  quick_reviewed: { label: 'Quick Check', color: colors.status.info, icon: '👀' },
  archived: { label: 'Archived', color: colors.text.disabled, icon: '📦' },
};

const DecisionRow = memo(function DecisionRow({ decision, onPress, index }: { decision: Decision; onPress: (id: string) => void; index: number }) {
  const meta = STATUS_META[decision.status as keyof typeof STATUS_META] || STATUS_META.draft;
  return (
    <Animated.View entering={FadeIn.duration(300).delay(index * 60)}>
      <TouchableOpacity
        style={s.decisionCard}
        onPress={() => onPress(decision.id)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${decision.title}, ${meta.label}`}
      >
        <View style={s.cardHeader}>
          <View style={s.cardIconWrap}>
            <Text style={s.cardIcon}>{meta.icon}</Text>
          </View>
          <View style={s.cardInfo}>
            <Text style={s.cardTitle} numberOfLines={1}>{decision.title}</Text>
            <Text style={s.cardDate}>
              {new Date(decision.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
          <Badge title={meta.label} variant={meta.color === colors.status.warning ? 'warning' : meta.color === colors.status.success ? 'success' : meta.color === colors.status.info ? 'info' : 'default'} size="small" />
        </View>
        {decision.context && (
          <Text style={s.cardDescription} numberOfLines={2}>{decision.context}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

export default function DecisionsScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: decisionsData, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['decisions'],
    queryFn: async () => {
      const result = await getUserDecisions({}, 50, 0);
      return result.decisions;
    },
    staleTime: 30000,
  });

  const decisions = decisionsData ?? [];

  const handleDecisionPress = useCallback((id: string) => {
    router.push(ROUTES.DECISION_DETAIL(id));
  }, [router]);

  const handleRefresh = useCallback(() => refetch(), [refetch]);

  const renderItem = useCallback(({ item, index }: { item: Decision; index: number }) => (
    <DecisionRow decision={item} onPress={handleDecisionPress} index={index} />
  ), [handleDecisionPress]);

  const keyExtractor = useCallback((item: Decision) => item.id, []);

  const ListHeader = useCallback(() => (
    <View style={s.header}>
      <Text style={s.title}>Decisions</Text>
      <Link href={ROUTES.DECISIONS_NEW} asChild>
        <Button title="New" variant="primary" size="small" haptic />
      </Link>
    </View>
  ), []);

  if (isLoading) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <ListHeader />
        <SkeletonList count={5} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <ListHeader />
        <ErrorState message="Failed to load decisions" onRetry={refetch} />
      </View>
    );
  }

  if (!decisions.length) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <ListHeader />
        <View style={s.emptyContainer}>
          <Text style={s.emptyIconCircle}>🧭</Text>
          <Text style={s.emptyTitle}>No decisions yet</Text>
          <Text style={s.emptyText}>The best decisions are intentional ones. Start here — you can analyze options, track outcomes, and build your decision intelligence over time.</Text>
          <Button title="Create Your First Decision" variant="primary" onPress={() => router.push(ROUTES.DECISIONS_NEW)} haptic />
        </View>
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <FlatList
        data={decisions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={colors.accent.primary} />}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={7}
        initialNumToRender={8}
        getItemLayout={(_, index) => ({ length: 100, offset: 100 * index, index })}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.primary },
  title: { fontSize: typography.size.xl, fontWeight: '700', color: colors.text.primary },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.sm },
  emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: spacing.lg },
  emptyIconCircle: { fontSize: 40, marginBottom: spacing.lg },
  emptyTitle: { fontSize: typography.size.xl, fontWeight: '700', color: colors.text.primary, marginBottom: spacing.sm },
  emptyText: { fontSize: typography.size.sm, color: colors.text.secondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  decisionCard: { backgroundColor: colors.background.secondary, borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.border.primary },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  cardIconWrap: { width: 28, alignItems: 'center' },
  cardIcon: { fontSize: 20 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: typography.size.md, fontWeight: '600', color: colors.text.primary },
  cardDate: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 1 },
  cardDescription: { fontSize: typography.size.sm, color: colors.text.secondary, lineHeight: 18, marginLeft: 36 },
});
