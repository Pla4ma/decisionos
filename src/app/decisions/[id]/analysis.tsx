// FLOW: /decisions/[id]/analysis — AI Analysis Report
// FROM: /decisions/[id] (tap "View Analysis")
// TO: /decisions/[id]/commit (tap "Choose Top Option")
//      /decisions/[id] (tap "Keep Thinking")
// STATE: decision.status must be "analyzed"
// See FLOW_ARCHITECTURE.md §2 — Complete Screen Map
import { useState, useCallback } from 'react';
import { Text, View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { analyzeDecision, fetchDecisionAnalysis, getAnalysisErrorMessage } from '@/features/decisions/decisionAnalysisService';
import { getDecision } from '@/features/decisions/decisionRepository';
import { useBlindSpots } from '@/features/decisions/useBlindSpots';
import { useEntitlements } from '@/features/monetization';
import { useAuth } from '@/features/auth/useAuth';
import { supabase } from '@/lib/supabase';
import type { DecisionForecast } from '@/features/decisions/deepDecisionTypes';
import {
  DecisionReportHeader,
  RecommendationCard,
  DecisionScoreCard,
  OptionComparisonCard,
  RegretForecastCard,
  FutureSelfNoteCard,
  BlindSpotContextCard,
} from '@/components/decisions';

export default function AnalysisScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<any>(null);

  const { canAnalyze, analysesRemaining, hasPlus, isLoading: entitlementLoading, refreshEntitlements } =
    useEntitlements(user?.id || null);
  const { blindSpots } = useBlindSpots(user?.id ?? null);
  const { data: decision } = useQuery({
    queryKey: ['decision', id],
    queryFn: () => getDecision(id),
    enabled: !!id,
  });

  // Load forecast data (regret predictions + future self letters)
  const { data: forecast } = useQuery({
    queryKey: ['decision-forecast', id],
    queryFn: async (): Promise<DecisionForecast | null> => {
      if (!id) return null;
      const { data } = await supabase
        .from('decision_forecasts')
        .select('*')
        .eq('decision_id', id)
        .single();
      return data as DecisionForecast | null;
    },
    enabled: !!id && !!analysis,
  });

  const { isLoading: analysisLoading } = useQuery({
    queryKey: ['decision-analysis', id],
    queryFn: async () => {
      const result = await fetchDecisionAnalysis(id);
      setAnalysis(result);
      return result;
    },
    enabled: !!id,
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      if (!canAnalyze) throw new Error('ANALYSIS_LIMIT_REACHED');
      return analyzeDecision(id);
    },
    onSuccess: (result) => {
      setAnalysis(result.analysis);
      refreshEntitlements();
    },
    onError: (error) => {
      if (error instanceof Error && error.message === 'ANALYSIS_LIMIT_REACHED') {
        Alert.alert(
          'Analysis Limit Reached',
          "You've used your 3 free analyses this month. Upgrade to Plus for 50 analyses per month.",
          [{ text: 'Not Now', style: 'cancel' }, { text: 'Upgrade', onPress: () => router.push('/paywall') }],
        );
      } else {
        Alert.alert('Analysis Failed', getAnalysisErrorMessage(error));
      }
    },
  });

  const handleChooseOption = useCallback(() => {
    if (!analysis?.option_scores?.[0]) return;
    const topOption = analysis.option_scores[0];
    router.push(`/decisions/${id}/commit?optionId=${topOption.optionId}`);
  }, [analysis, id, router]);

  const handleKeepThinking = useCallback(() => router.push(`/decisions/${id}`), [id, router]);

  // Loading
  if (analysisLoading || entitlementLoading) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <LoadingState message="Loading analysis..." />
      </View>
    );
  }

  if (!decision) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <ErrorState message="Decision not found" onRetry={() => router.back()} />
      </View>
    );
  }

  // No analysis yet
  if (!analysis) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <Link href={`/decisions/${id}`} asChild><Button title="Back" variant="ghost" size="small" /></Link>
          <Text style={s.headerTitle}>Analysis</Text>
          <View style={s.placeholder} />
        </View>
        <ScrollView style={s.scroll} contentContainerStyle={s.centerContent}>
          <Text style={s.noTitle}>Ready for AI Analysis</Text>
          <Text style={s.noText}>Get regret forecasts, future-self perspective, and blind spot-aware scoring of your options.</Text>
          <Button
            title={analyzeMutation.isPending ? 'Analyzing...' : 'Run Deep Analysis'}
            variant="primary"
            onPress={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending || !canAnalyze}
            style={s.analyzeBtn}
          />
          {!hasPlus && (
            <View style={s.limitRow}>
              <Badge title={`${analysesRemaining} remaining`} variant={analysesRemaining === 0 ? 'error' : 'warning'} size="small" />
              {analysesRemaining === 0 && (
                <Button title="Unlock Unlimited" variant="secondary" size="small" onPress={() => router.push('/paywall')} />
              )}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  const optionScores = Array.isArray(analysis.option_scores) ? analysis.option_scores : [];
  const sortedScores = [...optionScores].sort((a: any, b: any) => b.overallScore - a.overallScore);
  const topOption = sortedScores[0];

  // Find regret forecasts for each option
  const getRegretForecast = (optionId: string) => {
    const score = optionScores.find((s: any) => s.optionId === optionId);
    return score?.regretForecast || null;
  };

  const getFutureSelf = (optionId: string) => {
    const score = optionScores.find((s: any) => s.optionId === optionId);
    return score?.futureSelf || null;
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Link href={`/decisions/${id}`} asChild><Button title="Back" variant="ghost" size="small" /></Link>
        <Text style={s.headerTitle}>Analysis Report</Text>
        <View style={s.placeholder} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {/* Blind spot awareness */}
        <BlindSpotContextCard blindSpots={blindSpots || []} />

        {/* Report header */}
        <DecisionReportHeader
          title={decision.title}
          summary={analysis.summary}
          confidenceLevel={analysis.confidence_level}
          factorsConsidered={analysis.factors_considered || []}
        />

        {/* Top recommendation */}
        {topOption && (
          <RecommendationCard
            optionTitle={topOption.optionTitle}
            overallScore={topOption.overallScore}
            regretRisk={topOption.scores.regretRisk}
            reasoning={topOption.reasoning}
            onChoose={handleChooseOption}
          />
        )}

        {/* Regret Forecast — the killer feature */}
        {topOption && getRegretForecast(topOption.optionId) && (
          <RegretForecastCard optionTitle={topOption.optionTitle} forecast={getRegretForecast(topOption.optionId)!} />
        )}

        {/* Future Self Letter */}
        {topOption && getFutureSelf(topOption.optionId) && (
          <FutureSelfNoteCard optionTitle={topOption.optionTitle} futureSelf={getFutureSelf(topOption.optionId)!} />
        )}

        {/* Option comparison */}
        <OptionComparisonCard
          options={optionScores.map((sc: any) => ({
            optionId: sc.optionId,
            optionTitle: sc.optionTitle,
            overallScore: sc.overallScore,
          }))}
        />

        {/* Detailed scores with regret forecast for each */}
        <Text style={s.sectionTitle}>Detailed Scores & Regret Forecasts</Text>
        {sortedScores.map((score: any, index: number) => (
          <View key={score.optionId}>
            <DecisionScoreCard score={score} rank={index + 1} />
            {getRegretForecast(score.optionId) && index > 0 && (
              <View style={s.inlineRegret}>
                <Text style={s.inlineRegretLabel}>🔮 Regret: {getRegretForecast(score.optionId)!.regretLikelihood}%</Text>
                <Text style={s.inlineRegretText}>{getRegretForecast(score.optionId)!.why}</Text>
              </View>
            )}
          </View>
        ))}

        {/* Score disclaimer */}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            All scores are structured reflection aids, not predictions or guarantees.
            The highest-scoring option is not necessarily the right choice for you.
            Use these insights as part of your own thinking, not as a replacement for it.
          </Text>
          <Text style={s.disclaimerText}>
            This tool does not provide medical, legal, financial, or therapeutic advice.
          </Text>
        </View>

        {/* Actions */}
        <View style={s.actions}>
          <Button title="Choose Top Option" variant="primary" onPress={handleChooseOption} style={s.actionBtn} />
          <Button title="Keep Thinking" variant="secondary" onPress={handleKeepThinking} style={s.actionBtn} />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.primary },
  headerTitle: { fontSize: typography.size.lg, fontWeight: '600', color: colors.text.primary },
  placeholder: { width: 60 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  noTitle: { fontSize: 24, fontWeight: '700', color: colors.text.primary, textAlign: 'center', marginBottom: spacing.md },
  noText: { fontSize: 14, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22 },
  analyzeBtn: { minWidth: 200 },
  limitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm },
  inlineRegret: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  inlineRegretLabel: { fontSize: 12, fontWeight: '600', color: colors.accent.warning, marginBottom: 2 },
  inlineRegretText: { fontSize: 12, color: colors.text.secondary, fontStyle: 'italic' },
  disclaimer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.primary,
  },
  disclaimerText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    lineHeight: typography.lineHeight.normal * typography.size.sm,
    marginBottom: spacing.xs,
  },
  actions: { marginTop: spacing.xl, gap: spacing.md },
  actionBtn: { width: '100%' },
});
